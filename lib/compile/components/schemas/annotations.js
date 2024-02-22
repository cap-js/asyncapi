
const odmAnnotationsMapping = Object.freeze({
    '@ODM.entityName': 'x-sap-odm-entity-name',
    '@ODM.oid': 'x-sap-odm-oid'
});

function addOdmExtensions(definition, object) {
    for (const [annotation, asyncApiExtension] of Object.entries(odmAnnotationsMapping)) {
        if (definition[annotation]) {
            object[asyncApiExtension] = definition[annotation];
        }
    }
}

module.exports = function addAnnotations(definition, object) {
    if (typeof (definition['@title']) === 'string') {
        object.title = definition['@title'];
    }

    if (typeof (definition['@description']) === 'string') {
        object.description = definition['@description'];
    } else if (typeof definition.doc === 'string') {
        object.description = definition.doc.replace(/\n/g, ' ');
    }

    if (definition['@ODM.root']) {
        object['x-sap-root-entity'] = definition['@ODM.root']
    }

    addOdmExtensions(definition, object);

    return object;
}
