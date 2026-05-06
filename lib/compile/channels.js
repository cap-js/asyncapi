const { getEventName, getChannelName } = require('./utils')

const getChannel = eventName => ({
    subscribe: {
        message: {
            $ref: '#/components/messages/' + eventName
        }
    }
})

const getChannels = (definitions, events) => events.reduce((channels, event) => {
    const eventName = getEventName(event, definitions[event])
    const channelName = getChannelName(definitions[event]) ?? eventName
    channels[channelName] = getChannel(eventName)
    return channels
}, {})

module.exports = getChannels
