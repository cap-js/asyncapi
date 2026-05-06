const { getEventName, getChannelName } = require('./utils')

function getChannel(eventName) {
    return {
        subscribe: {
            message: {
                $ref: '#/components/messages/' + eventName
            }
        }
    }
}

module.exports = function getChannels(definitions, events) {
    let channels = {}

    events.forEach(event => {
        let eventName = getEventName(event, definitions[event])
        let channelName = getChannelName(event, definitions[event]) || eventName
        channels[channelName] = getChannel(eventName)
    })

    return channels
}
