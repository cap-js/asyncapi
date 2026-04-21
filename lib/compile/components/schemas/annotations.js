
const odmAnnotationsMapping = Object.freeze({
    '@ODM.entityName': 'x-sap-odm-entity-name',
    '@ODM.oid': 'x-sap-odm-oid'
})

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

    // Match {i18n>KEY} pattern
    const match = text.match(/\{i18n>([^}]+)\}/)
    if (!match) {
        return text
    }
    return i18nBundle?.at(match[1]) ?? text
}

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
