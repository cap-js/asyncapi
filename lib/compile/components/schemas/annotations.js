
const { resolveI18n, getDescription } = require('../../utils')

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

    const description = getDescription(definition, i18nBundle)
    if (description) {
        object.description = description
    }

    if (definition['@ODM.root']) {
        object['x-sap-root-entity'] = definition['@ODM.root']
    }

    addOdmExtensions(definition, object)

    return object
}
