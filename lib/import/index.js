const { importAsyncAPI } = require('./importAsyncAPI')
const { validateAsyncAPI } = require('./utils')

/**
 * The starting function for conversion of AsyncAPI document to csn
 * @returns AsyncAPI document
 */
function asyncapi2csn(source) {
    // validate asyncapi document
    const content = JSON.parse(source)
    validateAsyncAPI(content)

    return importAsyncAPI(content)
}

module.exports = {
    asyncapi2csn
}
