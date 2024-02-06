const { getEventName } = require('./utils');

function getChannel(eventName) {
    return {
        subscribe: {
            message: {
                $ref: "#/components/messages/" + eventName
            }
        }
    }
}

module.exports = function getChannels(definitions, events) {
    let channels = {};

    events.forEach(event => {
        let eventName = getEventName(event, definitions[event]);
        channels[eventName] = getChannel(eventName);
    });

    return channels;
}
