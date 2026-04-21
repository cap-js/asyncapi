
const cds = require('@sap/cds/lib')
const { resolveI18n } = require('../../utils')

const odmAnnotationsMapping = Object.freeze({
    '@ODM.entityName': 'x-sap-odm-entity-name',
    '@ODM.oid': 'x-sap-odm-oid'
})

function addOdmExtensions(definition, object) {
    for (const [annotation, asyncApiExtension] of Object.entries(odmAnnotationsMapping)) {
        if (definition[annotation]) {
            object[asyncApiExtension] = definition[annotation]
        }
    }
}

module.exports = function addAnnotations(definition, object, i18nBundle) {
    if (typeof (definition['@title']) === 'string') {
        object.title = resolveI18n(definition['@title'], i18nBundle)
    }

    if (typeof (definition['@description']) === 'string') {
        object.description = resolveI18n(definition['@description'], i18nBundle)
    } else if (typeof (definition['@Core.Description']) === 'string') {
        object.description = resolveI18n(definition['@Core.Description'], i18nBundle)
    } else if (typeof definition.doc === 'string') {
        object.description = definition.doc.replace(/\n/g, ' ')
    }

    if (definition['@ODM.root']) {
        object['x-sap-root-entity'] = definition['@ODM.root']
    }

    addOdmExtensions(definition, object)

    return object
}
