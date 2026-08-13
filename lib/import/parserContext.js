const { getRegExpGroups } = require('./utils')
const messages = require('./message')

module.exports = class ParserContext {
    /**
     * @constructor
     */
    constructor(content) {
        this.services = this.getServicesFromContent(content)
    }

    getTopicName(eventName) {
        return eventName.startsWith('ce/') ? eventName.substring(3) : eventName
    }

    /**
     * Returns services from the asyncapi json object along with the events and annotations.
     * @returns an object with all the services.
     */
    getServicesFromContent(content) {
        const services = {}
        const serviceAnnotations = this.getServiceAnnotations(content)

        Object.entries(content.components.messages).forEach(([, value]) => {
            let eventName
            // Message name should be used to capture the event name
            if (value.name) {
                eventName = value.name
            } else {
                throw new Error(messages.INVALID_ASYNCAPI_FILE)
            }
            // uses regex to break event name in different components
            const regExpGroups = getRegExpGroups(eventName)
            const service = regExpGroups[1] + '.' + regExpGroups[2]
            const event = regExpGroups[0]

            // add service to services entry if not present
            if (!(service in services)) {
                services[service] = { 'kind': 'service', '@cds.external': 'true', ...serviceAnnotations, 'events': {}, 'types': {} }
            }

            // add event entry to service
            const eventAnnotations = this.getEventAnnotations(value)

            // add topic annotation
            eventAnnotations['@topic'] = this.getTopicName(eventName)
            let properties = {}
            let types = {}

            if (value.payload) {
                // gets the schema being referred to in the event
                const eventSchema = this.resolveRef(content, value.payload)
                ;[properties, types] = this.getPropertiesAndTypes(event, eventSchema)
            }
            services[service].types = types
            services[service].events[event] = { 'kind': 'event', '@cds.external': 'true', ...eventAnnotations, elements: properties }
        })

        return services
    }

    /**
     * Returns annotations of a particular service.
     * @returns an object with all the annotations as key value pairs.
     */
    getServiceAnnotations(content) {
        const serviceAnnotationsMapping = {
            'x-sap-stateInfo': 'StateInfo', // expected: object
            'x-sap-shortText': 'ShortText' // expected: string
        }

        const infoAnnotationsMapping = {
            'title': 'Title', // expected: string
            'version': 'SchemaVersion', // expected: string
            'description': 'Description' // expected: string
        }

        const annotations = this.getAnnotations(content, serviceAnnotationsMapping)

        if (content.info) {
            for (const [key, value] of Object.entries(infoAnnotationsMapping)) {
                if (content.info[key] && !(content.info[key] instanceof Object)) {
                    // info values will always be in string format
                    annotations['@AsyncAPI.' + value] = content.info[key]
                }
            }
        }

        return annotations
    }

    /**
     * Returns annotations of a particular event. Here the parameter content is event content.
     * @returns an object with all the annotations as key value pairs.
     */
    getEventAnnotations(content) {
        const eventLevelAnnotationsMapping = {
            'x-sap-event-spec-version': 'EventSpecVersion', // expected: string
            'x-sap-event-source': 'EventSource', // expected: string
            'x-sap-event-version': 'EventSchemaVersion', // expected: string
            'x-sap-event-source-parameters': 'EventSourceParams', // expected: object
            'x-sap-event-characteristics': 'EventCharacteristics', // expected: object
            'x-sap-stateInfo': 'EventStateInfo' // expected: object
        }

        const annotations = this.getAnnotations(content, eventLevelAnnotationsMapping)

        return annotations
    }

    /**
     * Returns validity of the annotation value. Here the parameter
     * content is the annotation name and value of the annotation.
     * @returns true/false depending on the annotation value.
     */
    isValidAnnotationValue(annotation, value) {
        const objectTypeAnnotations = ['StateInfo', 'EventSourceParams', 'EventCharacteristics', 'EventStateInfo']
        // if the value is an array or null
        if (Array.isArray(value) || value === null) return false

        if (objectTypeAnnotations.includes(annotation) && (value instanceof Object)) {
            return true
        } else if ((!objectTypeAnnotations.includes(annotation)) && (typeof value === 'string')) {
            return true
        } else {
            console.warn('WARNING: Annotations which are not following the expected type are omitted.')
            return false
        }
    }

    /**
     * Returns annotations for an event/service. Here the parameter content
     * is event/service content along with the corresponding mapping.
     * @returns an object with the annotations as key value pairs.
     */
    getAnnotations(content, annotationsMapping) {
        const annotations = {}

        for (const [key, value] of Object.entries(content)) {
            // case: known annotation
            if (annotationsMapping[key] && this.isValidAnnotationValue(annotationsMapping[key], value)) {
                annotations['@AsyncAPI.' + annotationsMapping[key]] = value
            }
            // case: unkown annotation
            else if (key.startsWith('x-')) {
                if (!annotations['@AsyncAPI.Extensions']) {
                    annotations['@AsyncAPI.Extensions'] = {}
                }
                // removes x- from the element
                annotations['@AsyncAPI.Extensions'][key.substring(2)] = value
            }
        }

        return annotations
    }

    /**
     * Returns the referred schema. Here the content is the asyncapi
     * document and payloadObject is the reference path
     * @returns an object with the referred schema.
     */
    resolveRef(content, payloadObject) {
        let schema = {}

        if (payloadObject['$ref']) {
            const pathArray = payloadObject['$ref'].split('/')
            pathArray.forEach((value) => {
                if (value === '#') schema = content
                else if (schema[value]) schema = schema[value]
                // in case path doesn't exist in the file
                else schema = {}
            })

            if (!Object.keys(schema).length) {
                console.warn('WARNING: Unable to resolve ref path: ' + payloadObject['$ref'])
            }
        }
        else if (payloadObject instanceof Object) {
            // in case ref is not there and schema object is there
            schema = payloadObject
        }

        return schema
    }

    /**
     * Returns the properties and types generated, related to an event.
     * @returns a properties object and a types object.
     */
    getPropertiesAndTypes(eventName, content) {
        const properties = {}
        let types = {}

        if (content.properties) {
            for (const [key, value] of Object.entries(content.properties)) {
                // will contain type objects generated for a property
                let referredTypes
                let isRequired = false
                if (content['required']?.includes(key)) isRequired = true
                ;[properties[key], referredTypes] = this.parseProperty(eventName, key, value, isRequired)
                // collecting all the types
                types = { ...types, ...referredTypes }
            }
        }
        return [properties, types]
    }

    /**
     * Returns the processed objects for property and type.
     * @returns property object and type object.
     */
    parseProperty(eventName, propertyName, propertyContent, isRequired) {
        let property = {}
        let propertyAttributes
        let types = {}

        if (isRequired === true) {
            property['@mandatory'] = true
        }

        let type = this.getTypeFromArray(propertyContent.type)

        // case where type is defined
        if (type && (type === 'object' || type === 'array')) {
            // for generation of type: event name + property name
            propertyName = propertyName[0].toUpperCase() + propertyName.substring(1)
            let typeName = eventName + '.' + propertyName
            // generate object for the introduced type
            const elements = this.getTypeElements(propertyContent)
            types[typeName] = { 'kind': 'type', '@cds.external': 'true', ...elements }
            // referring to the generated type from the property
            propertyAttributes = { 'type': typeName }
        } else {
            propertyAttributes = this.getPropertyObject(propertyContent)
        }
        property = { ...property, ...propertyAttributes }

        return [property, types]
    }

    /**
     * Returns generated type for the property.
     * @returns an object for a type.
     */
    getTypeElements(propertyContent) {
        let properties = {}
        let type = this.getTypeFromArray(propertyContent.type)

        // for nested object
        if (type === 'object') {
            for (const [key, value] of Object.entries(propertyContent.properties)) {
                properties[key] = this.getTypeElements(value)
            }
        }
        // for nested array
        else if (type === 'array') {
            properties.items = this.getTypeElements(propertyContent.items)
            return properties
        }
        // base data type mapping
        else {
            return this.getPropertyObject(propertyContent)
        }

        return { elements: properties }
    }

    /**
     * Returns type for the property from the AsyncAPI Document.
     * @returns the value of type.
     */
    getTypeFromArray(typeValue) {
        let type
        // if type is an array
        if (Array.isArray(typeValue)) {
            // one of the value will be null
            type = typeValue[0] === 'null' ? typeValue[1] : typeValue[0]
        } else {
            type = typeValue
        }

        return type
    }

    /**
     * Returns generated object for a single property.
     * @returns an object for a property.
     */
    getPropertyObject(propertyContent) {
        const property = {}
        if ('$ref' in propertyContent) {
            const refPathParts = propertyContent['$ref'].split('/')
            const propertyName = refPathParts[refPathParts.length - 1]
            property['type'] = { 'ref': [refPathParts[3], propertyName] }
            return property
        }
        const inputType = this.getTypeFromArray(propertyContent.type)
        const cdsType = this.getDataType(inputType, propertyContent.format)

        property['type'] = cdsType

        // case: cds type is decimal
        if (cdsType === 'cds.Decimal') {
            if (propertyContent['x-sap-precision']) property.precision = propertyContent['x-sap-precision']
            if (propertyContent['x-sap-scale']) property.scale = propertyContent['x-sap-scale']
        }

        if (propertyContent['default']) {
            property['default'] = { 'val': propertyContent['default'] }
        }

        if (propertyContent['enum']) {
            property['enum'] = this.getEnumObject(propertyContent['enum'])
        }

        return property
    }

    /**
     * Takes the enums from the AsyncAPI Document.
     * @returns the property object of enums.
     */
    getEnumObject(enumArray) {
        const enumProperty = {}

        enumArray.forEach(val => {
            enumProperty[val] = {}
        })

        return enumProperty
    }

    /**
     * Takes the type and format from the document and returns the corresponding cds type.
     * @returns the corresponding cds type.
     */
    getDataType(type, format = null) {
        const asyncapiToCdsMapping = {
            'number': 'cds.Double',
            'boolean': 'cds.Boolean',
            'integer': 'cds.Integer'
        }

        if (type === 'string') {
            switch (format) {
                case 'int64':
                    return 'cds.Integer64'
                case 'decimal':
                    return 'cds.Decimal'
                case 'uuid':
                    return 'cds.UUID'
                case 'date':
                    return 'cds.Date'
                case 'partial-time':
                    return 'cds.Time'
                case 'date-time':
                    return 'cds.Timestamp'
                default:
                    return 'cds.LargeString'
            }
        } else if (asyncapiToCdsMapping[type]) {
            return asyncapiToCdsMapping[type]
        } else {
            throw new Error(messages.UNRESOLVED_TYPE + `'${type}'`)
        }
    }
}
