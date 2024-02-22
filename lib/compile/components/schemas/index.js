const { definitionToSchema } = require('./definition');
const { getEventName } = require('../../utils');

module.exports = function csnToJSONSchema(definitions, events) {
    let schemaCache = {};
    let schema = {};

    events.forEach(event => {
        const eventName = getEventName(event, definitions[event]);
        schema[eventName] = definitionToSchema(event, definitions, schemaCache);
    });

    return schema;
}
