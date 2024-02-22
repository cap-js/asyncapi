/**
 * Returns value of EventType Annotation if it is present. Otherwise it returns the definition name only.
 */
function getEventName(eventName, eventDefinition) {

    if (eventDefinition["@AsyncAPI.EventType"]) {
        eventName = eventDefinition["@AsyncAPI.EventType"];
    }

    return eventName;
}

/**
 * Gets the property value from the entry if it is defined otherwise returns undefined.
 */
function getOwnValue(entry, key) {
    if (Object.prototype.hasOwnProperty.call(entry, key)) {
        return entry[key];
    }

    return;
}

module.exports = {
    getEventName,
    getOwnValue
}
