const messages = require('./message')

function validateAsyncAPI(content) {
    if ('channels' in content && 'components' in content && 'messages' in content.components) {
        return
    }

    throw new Error(messages.INVALID_ASYNCAPI_FILE)
}

/**
 * Accepted scenarios:
 * * with version info : <namespace>.<businessObject>.<operation>.<version>
 * * without version info : <namespace>.<businessObject>.<operation>
 *
 * ? Is it mandatory for <namespace> to always follow small case notation?
 * ? Is it mandatory for <businessObject> to follow Camel Case or Upper Came Case notation?
 *
 * ToDo: Can we support `-` in operations?
 */
const regExp = new RegExp(
    '^(?<namespace>(?:[a-z][a-z0-9]*)(?:[.][a-z][a-z0-9]*)+)[.](?<businessObject>[a-zA-Z0-9]+)[.](?<operation>[a-zA-Z0-9]+)[.]?(?<version>v(?:[0-9]|[1-9][0-9]*))?$'
)

/**
 * Validates the messages' `key` with the regExp and returns the regEx groups.
 * @returns regexGroups
 */
function getRegExpGroups(key) {
    /**
     * Result format:
     * index 0: key
     * index 1: <namespace> value
     * index 2: <businessObject> value
     * index 3: <operation> value
     * index 4: <version> value; undefined if <version> is optional
     */
    const regExpGroups = regExp.exec(key)

    if (regExpGroups == null) {
        throw new Error(messages.INVALID_MESSAGE_NAME)
    }
    return regExpGroups
}

module.exports = {
    validateAsyncAPI,
    getRegExpGroups
}
