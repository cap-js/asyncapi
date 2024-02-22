const { getEventName } = require('../../utils');

const annotationMapping = {
    'EventSpecVersion': 'x-sap-event-spec-version',
    'EventSource': 'x-sap-event-source',
    'EventSourceParams': 'x-sap-event-source-parameters',
    'EventCharacteristics': 'x-sap-event-characteristics',
    'EventStateInfo': 'x-sap-stateInfo',
    'EventSchemaVersion': 'x-sap-event-version'
};

/**
 * Get header properties from definition.
 */
function getHeaderProperties(name) {
    return { type: { const: name } };
}

function nestedAnnotation(resObj, asyncapiProperty, keys, value) {
    if (resObj[asyncapiProperty] === undefined) {
        resObj[asyncapiProperty] = {};
    }

    let node = resObj[asyncapiProperty];

    // traverse the annotation property and define the objects if they're not defined
    for (let nestedIndex = 1; nestedIndex < keys.length - 1; nestedIndex++) {
        const nestedElement = keys[nestedIndex];
        if (node[nestedElement] === undefined) {
            node[nestedElement] = {};
        }
        node = node[nestedElement];
    }

    // set value annotation property
    node[keys[keys.length - 1]] = value;
}

function readAnnotations(definition, presets) {
    let resObj = {};

    for (const [key, value] of Object.entries(definition)) {
        if (key.startsWith('@AsyncAPI') && !key.startsWith('@AsyncAPI.Extensions')) {
            // get annotation value after @AsyncAPI
            const annotationProperties = key.split('@AsyncAPI.')[1];
            const keys = annotationProperties.split('.');

            // convert annotation property (ex: EventSource) to asyncapi property (ex: x-sap-event-source)
            // if annotation property isn't present in map then ignore the property
            if (annotationMapping[keys[0]] === undefined) continue;

            const asyncapiProperty = annotationMapping[keys[0]];

            // if there's no nesting then just set the value
            if (keys.length === 1) {
                resObj[asyncapiProperty] = value;
            } else {
                nestedAnnotation(resObj, asyncapiProperty, keys, value)
            }
        }

        else if (key.startsWith('@AsyncAPI.Extensions')) {
            const annotationProperties = key.split('@AsyncAPI.Extensions.')[1];
            const keys = annotationProperties.split('.');
            keys[0] = "x-" + keys[0];

            if (keys.length === 1) {
                // if the key is already present, that means, Annotations have already been considered
                if (resObj[keys[0]]) continue;
                // else we populate
                resObj[keys[0]] = value;
            } else {
                nestedAnnotation(resObj, keys[0], keys, value);
            }
        }
    }

    for (const [key, value] of Object.entries(presets)) {
        if (resObj[key] === undefined) {
            resObj[key] = value;
        }
    }

    addDefaults(resObj);
    return resObj;
}

function addDefaults(obj) {
    const defaults = {
        'x-sap-event-source': '/{region}/{applicationNamespace}/{instanceId}',
        'x-sap-event-source-parameters': {
            "region": {
                "description": "The regional context of the application.",
                "schema": {
                    "type": "string"
                }
            },
            "applicationNamespace": {
                "description": "The registered namespace of the application.",
                "schema": {
                    "type": "string"
                }
            },
            "instanceId": {
                "description": "The instance id (tenant, installation, ...) of the application.",
                "schema": {
                    "type": "string"
                }
            }
        }
    }

    for (const [key, value] of Object.entries(defaults)) {
        if (!obj[key]) {
            obj[key] = value;
        }
    }
}

/**
 * Get message for the event definition.
 */
function eventToMessage(definition, name, presets) {
    let obj = readAnnotations(definition, presets);

    let messageObj = {
        name,
        headers: {
            type: 'object',
            properties: getHeaderProperties(name)
        },
        payload: {
            $ref: `#/components/schemas/${name}`
        },
        traits: [
            {
                $ref: '#/components/messageTraits/CloudEventsContext.v1'
            }
        ]
    }

    const message = { ...obj, ...messageObj};

    return message;
}

/**
 * Event definitions of one CSN to messages.
 */
function entriesToMessages(definitions, events, presets) {
    const messages = {};

    events.forEach(event => {
        let name = getEventName(event, definitions[event]);
        messages[name] = eventToMessage(definitions[event], name, presets);
    });

    return messages;
}

/**
 * Combining the definition objects from CSN into one schema
 */
function definitionsToMessages(definitions, events, presets) {
    const messages = {};
    Object.assign(messages, entriesToMessages(definitions, events, presets));
    return messages;
}

module.exports = {
    definitionsToMessages,
    nestedAnnotation
}
