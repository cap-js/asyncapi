const schemaUtils = require('./utils')

function addEnum(entry, schema) {
    if (entry.kind === 'type') {
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
