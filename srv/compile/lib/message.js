"use strict";

const errorMessages = {
    APPLICATION_NAMESPACE: 'Preset for application namespace needs to be added.',
    TITLE_VERSION_MERGED: 'Preset for Title and Version info needs to be added when merged flag is used.',
    NO_EVENTS: 'No events found in the service.',
    TITLE_VERSION_ANNOTATIONS: 'Title and Version info annotations needs to be added to the service(s).',
    UNSUPPORTED_VERSION: 'The version value provided is unsupported.',
    NO_SERVICES: 'There are no service definitions found in the given model(s).',
    MERGED_FLAG: 'Merged flag cannot be used with single service definition.',
};

module.exports = errorMessages;