/**
 * Returns value of EventType Annotation if it is present. Otherwise it returns the definition name only.
 */
function getEventName(eventName, eventDefinition) {

    if (eventDefinition['@AsyncAPI.EventType']) {
        eventName = eventDefinition['@AsyncAPI.EventType']
    }

    return eventName
}

/**
 * Gets the property value from the entry if it is defined otherwise returns undefined.
 */
function getOwnValue(entry, key) {
    if (Object.prototype.hasOwnProperty.call(entry, key)) {
        return entry[key]
    }

    return
}

/**
 * Resolves i18n markers in a string like '{i18n>KEY}' using the provided i18n bundle
 * @param {string} text
 * @param {object} i18nBundle - CDS i18n bundle from cds.i18n.bundle4(csn)
 * @return {string} Resolved text if it contained an i18n marker, otherwise the original text
 */
function resolveI18n(text, i18nBundle) {
    if (typeof text !== 'string' || !text.includes('{i18n>')) {
        return text
    }
    const match = text.match(/\{i18n>([^}]+)\}/)
    if (!match) {
        return text
    }
    return i18nBundle?.at(match[1]) ?? text
}

module.exports = {
    getEventName,
    getOwnValue,
    resolveI18n
}
