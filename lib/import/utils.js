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
 * Parses a message name into an index-compatible array [fullName, serviceName, ...rest].
 *
 * Two formats are supported:
 *
 * 1. SAP event-catalog format: `<namespace>.<BusinessObject>.<Operation>[.v<n>]`
 *    where <namespace> is ≥2 lowercase dot-separated segments (e.g. `sap.s4.beh`).
 *    Detected by matching the strict regex; service key = namespace + '.' + businessObject.
 *
 * 2. CAP-produced format: `<ServiceName>.<EventName>` (optionally nested, e.g.
 *    `AdminService.Books.texts`), where the first segment is always the PascalCase CDS
 *    service name and the remainder is the event definition key.
 *    Detected by the presence of `x-sap-application-namespace` in the AsyncAPI document —
 *    the CAP exporter always sets this field, while SAP catalog documents use the
 *    namespace-qualified message name format instead.
 *
 * Both paths return the same index shape so callers need no branching:
 *   [0] full name  [1] service name  [2..] remaining segments
 *
 * @param {string} key - The message name to parse
 * @param {string|undefined} applicationNamespace - Value of `x-sap-application-namespace`
 *   from the AsyncAPI document, or undefined if the field is absent
 * @returns {Array} Parsed segments array compatible with getRegExpGroups result shape
 */
function parseMessageName(key, applicationNamespace) {
    const regExpGroups = regExp.exec(key)
    if (regExpGroups != null) {
        // SAP catalog format: service key = namespace + '.' + businessObject
        const serviceKey = regExpGroups[1] + '.' + regExpGroups[2]
        return [regExpGroups[0], serviceKey]
    }

    if (applicationNamespace) {
        const segments = key.split('.')
        if (segments.length >= 2) {
            // CAP-produced format: first segment is the PascalCase CDS service name
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
