const schemaUtils = require('./utils')

function addEnum(entry, schema) {
    if (entry.kind === 'type') {
        // eslint-disable-next-line no-unused-vars
        schema.enum = Object.entries(entry.enum).map(([key, value]) => {
            return (schemaUtils.isVal(value) ? value.val : key)
        })
    } else {
        schema.enum = Object.keys(entry.enum)
    }
}

module.exports = {
    addEnum
}
