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

/**
 * Parses a message name into a [fullName, serviceName] pair.
 *
 * Two formats are supported:
 *
 * 1. SAP event-catalog format: `<namespace>.<BusinessObject>.<Operation>[.v<n>]`
 *    where <namespace> is ≥2 lowercase dot-separated segments (e.g. `sap.s4.beh`).
 *    Detected by matching the strict regex; service key = namespace + '.' + businessObject.
 *
 * 2. CAP-produced format: `<ServiceName>.<EventName>` (optionally nested), where the
 *    first segment is always the PascalCase CDS service name.
 *    Detected by the presence of `x-sap-application-namespace` in the AsyncAPI document.
 *
 * @param {string} key - The message name to parse
 * @param {string|undefined} applicationNamespace - Value of `x-sap-application-namespace`
 *   from the AsyncAPI document, or undefined if absent
 * @returns {Array} [fullName, serviceName]
 */
function parseMessageName(key, applicationNamespace) {
    const regExpGroups = regExp.exec(key)
    if (regExpGroups != null) {
        const serviceKey = regExpGroups[1] + '.' + regExpGroups[2]
        return [regExpGroups[0], serviceKey]
    }

    if (applicationNamespace) {
        const segments = key.split('.')
        if (segments.length >= 2) {
            return [key, segments[0]]
        }
    }

    throw new Error(messages.INVALID_MESSAGE_NAME)
}

module.exports = {
    validateAsyncAPI,
    getRegExpGroups,
    parseMessageName
}
