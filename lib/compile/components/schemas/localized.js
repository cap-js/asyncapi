const primitiveElementToSchema = require('./primitiveElement');
const { getBaseTypeStructure } = require('./utils');

function getPatternStructure(pattern, example) {
    var schema = getBaseTypeStructure('string');
    schema.pattern = pattern;
    if (example) {
        schema.examples = [example];
    }
    return schema;
}

function toLocalizedArray(localizedElement) {
    return {
        type: "array",
        items: {
            type: "object",
            properties: {
                lang: getPatternStructure('^[a-z]{2}(?:-[A-z]{2})?$'),
                content: primitiveElementToSchema(localizedElement)
            },
            required: ['lang', 'content']
        }
    }
}

module.exports = {
    toLocalizedArray
}
