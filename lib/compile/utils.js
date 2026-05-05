/**
 * Returns value of EventType Annotation if it is present. Otherwise it returns the definition name only.
 */
function getEventName(eventName, eventDefinition) {

    if (eventDefinition['@AsyncAPI.EventType']) {
        eventName = eventDefinition['@AsyncAPI.EventType']
    }

    return eventName
}

/**
 * Gets the property value from the entry if it is defined otherwise returns undefined.
 */
function getOwnValue(entry, key) {
    if (Object.prototype.hasOwnProperty.call(entry, key)) {
        return entry[key]
    }

    return
}

/**
 * Resolves i18n markers in a string like '{i18n>KEY}' using the provided i18n bundle
 * @param {string} text
 * @param {object} i18nBundle - CDS i18n bundle from cds.i18n.bundle4(csn)
 * @return {string} Resolved text if it contained an i18n marker, otherwise the original text
 */
function resolveI18n(text, i18nBundle) {
    if (typeof text !== 'string' || !text.includes('{i18n>')) {
        return text
    }
    const match = text.match(/\{i18n>([^}]+)\}/)
    if (!match) {
        return text
    }
    return i18nBundle?.at(match[1]) ?? text
}

/**
 * Extracts description from definition with fallback chain:
 * 1. @description annotation (with i18n resolution)
 * 2. @Core.Description annotation (with i18n resolution)
 * 3. doc comment (plain text)
 * @param {object} definition - Event or element definition from CSN
 * @param {object} i18nBundle - CDS i18n bundle from cds.i18n.bundle4(csn)
 * @return {string|undefined} Description text or undefined if none found
 */
function getDescription(definition, i18nBundle) {
    if (typeof definition['@description'] === 'string') {
        return resolveI18n(definition['@description'], i18nBundle)
    } else if (typeof definition['@Core.Description'] === 'string') {
        return resolveI18n(definition['@Core.Description'], i18nBundle)
    } else if (typeof definition.doc === 'string') {
        return definition.doc.replace(/\n/g, ' ')
    }
    return undefined
}

module.exports = {
    getEventName,
    getOwnValue,
    resolveI18n,
    getDescription
}
