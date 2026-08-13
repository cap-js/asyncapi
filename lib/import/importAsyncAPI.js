const ParserContext = require('./parserContext')
const { join } = require('path')
const version = require(join(__dirname, '..', '..', 'package.json')).version

function importAsyncAPI(input) {
    const context = new ParserContext(input)
    return convertToCSN(context)
}

function convertToCSN(context) {
    const csn = {
        meta: {
            creator: `@cap-js/asyncapi ${version}`
        },
        $version: '2.0',
        definitions: {}
    }

    Object.entries(context.services).forEach(([key, value]) => {
        const events = value.events
        const types = value.types
        delete value.events
        delete value.types

        csn.definitions[key] = value
        Object.assign(csn.definitions, events, types)
    })

    return csn
}

module.exports = {
    importAsyncAPI
}
