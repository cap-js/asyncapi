const csnToJSONSchema = require('./components/schemas');
const getMessageTraits = require('./components/messageTraits');
const { definitionsToMessages, nestedAnnotation } = require('./components/messages');
const getChannels = require('./channels');
const cds = require('@sap/cds/lib');
const { join } = require('path');
const messages = require("./message");
const presetMapping = {
    'event_spec_version': 'x-sap-event-spec-version',
    'event_source': 'x-sap-event-source',
    'event_source_params': 'x-sap-event-source-parameters',
    'event_characteristics': 'x-sap-event-characteristics'
};

module.exports = function processor(csn, options = {}) {

    let envConf = {};
    if (cds.env?.export?.asyncapi) {
        envConf = cds.env.export.asyncapi;
    } 
    if (!cds.env?.export?.asyncapi?.application_namespace) {
        const packageJson = require(join(cds.root,'package.json'));
        const appName = packageJson.name.replace(/^[@]/, "").replace(/[@/]/g, "-");
        envConf["application_namespace"] = `customer.${appName}`
        console.info(messages.APPLICATION_NAMESPACE);
    }

    if (cds.env.ord?.namespace) {
        const ordNamespace = _getNamespace(cds.env.ord.namespace);
        const asyncapiNamespace = _getNamespace(envConf.application_namespace);
        if (ordNamespace !== asyncapiNamespace) {
            console.warn(messages.NAMESPACE_MISMATCH)
        }
    }

    _serviceErrorHandling(csn, options);

    const applicationNamespace = envConf.application_namespace;

    const presets = getPresets(envConf);

    if (options.service === 'all') {
        if (options["asyncapi:merged"]) {
            if (!envConf?.merged?.title || !envConf.merged?.version ) {
                throw new Error(messages.TITLE_VERSION_MERGED);
            }

            const infoObject = getInfoObject({}, envConf.merged);
            // verify version follows the required pattern
            isVersionValid(infoObject.version);
            const shortTextObj = getShortText({}, envConf.merged.short_text);

            const events = getEvents(csn.definitions);

            return {
                asyncapi: '2.0.0',
                'x-sap-catalog-spec-version': '1.2',
                'x-sap-application-namespace': applicationNamespace,
                ...Object.keys(shortTextObj).length && { 'x-sap-shortText': shortTextObj },
                info: infoObject,
                defaultContentType: 'application/json',
                channels: getChannels(csn.definitions, events),
                components: getComponents(csn.definitions, events, presets)
            }
        } else {
            const services  = getServicesWithEvents(csn.definitions);
            return _iterate(services, csn, applicationNamespace, presets);
        }
    } else {
        const events = getEvents(csn.definitions, options.service);

        if (events.length === 0) {
            throw new Error(messages.NO_EVENTS);
        }

        return _getAsyncApi(csn, events, options.service, applicationNamespace, presets);
    }
}

function getPresets(envConf) {
    let projectPresets = {};
    for (const [key, value] of Object.entries(envConf)) {
        if (presetMapping[key]) projectPresets[presetMapping[key]] = value;
    }
    return projectPresets;
}

function _getAsyncApi(csn, events, serviceName, applicationNamespace, presets) {

    const infoObject = getInfoObject(csn.definitions[serviceName]);
    const stateObj = getStateInfo(csn.definitions[serviceName]);
    const shortTextObj = getShortText(csn.definitions[serviceName]);
    const extensionAnnotationObj = getExtensions(csn.definitions[serviceName], shortTextObj, stateObj);
    return {
        asyncapi: '2.0.0',
        'x-sap-catalog-spec-version': '1.2',
        'x-sap-application-namespace': applicationNamespace,
        ...Object.keys(stateObj).length && { 'x-sap-stateInfo': stateObj },
        ...Object.keys(shortTextObj).length && { 'x-sap-shortText': shortTextObj },
        ...Object.keys(extensionAnnotationObj).length && extensionAnnotationObj,
        info: infoObject,
        defaultContentType: 'application/json',
        channels: getChannels(csn.definitions, events),
        components: getComponents(csn.definitions, events, presets)
    };
}

function getExtensions(serviceCsn, shortTextObj, stateObj) {
    let extensionObj = {};
    for (const [key, value] of Object.entries(serviceCsn)) {
        if (key.startsWith('@AsyncAPI.Extensions')) {
            const annotationProperties = key.split('@AsyncAPI.Extensions.')[1];
            const keys = annotationProperties.split('.');
            keys[0] = "x-" + keys[0];
            if ((keys[0] === 'x-sap-shortText' && Object.keys(shortTextObj).length > 0) ||
                (keys[0] === 'x-sap-stateInfo' && Object.keys(stateObj).length > 0)
            ) continue;
            if (keys.length === 1) {
                extensionObj[keys[0]] = value;
            } else {
                nestedAnnotation(extensionObj, keys[0], keys, value);
            }
        }
    }
    return extensionObj;
}

function getShortText(serviceCsn, presetValue = undefined) {
    let shortTextValue = presetValue || serviceCsn["@AsyncAPI.ShortText"];
    if (shortTextValue) {
        return shortTextValue;
    }
    return {};
}

function getStateInfo(serviceCsn) {
    const stateProperties = ['state', 'deprecationDate', 'decomissionedDate', 'link'];
    const stateObj = {};

    stateProperties.forEach(function (item) {
        if (serviceCsn['@AsyncAPI.StateInfo.' + item]) {
            stateObj[item] = serviceCsn['@AsyncAPI.StateInfo.' + item];
        }
    });

    return stateObj;
}

function getInfoObject(serviceCsn, mergedPresetObject = undefined) {
    const info = {};

    if (mergedPresetObject) {
        Object.keys(mergedPresetObject).forEach(key => {
            if (key !== "short_text")  info[key] = mergedPresetObject[key];
        });
        return info;
    }

    if (!serviceCsn['@AsyncAPI.SchemaVersion'] || !serviceCsn['@AsyncAPI.Title']) {
        throw new Error(messages.TITLE_VERSION_ANNOTATIONS);
    }

    isVersionValid(serviceCsn['@AsyncAPI.SchemaVersion']);

    info.version = serviceCsn['@AsyncAPI.SchemaVersion'];
    info.title = serviceCsn['@AsyncAPI.Title'];

    if (serviceCsn['@AsyncAPI.Description']) {
        info.description = serviceCsn['@AsyncAPI.Description'];
    }

    return info;
}

function isVersionValid(version) {
    version.split('.').forEach(element => {
        if (isNaN(element)) {
            throw new Error(messages.UNSUPPORTED_VERSION);
        }
    });
    return true;
}

function getEvents(definitions, service = '') {
    let events = [];
    for (const [key, value] of Object.entries(definitions)) {
        if (value.kind === 'event' && value._service !== undefined) {
            if (service === '' || value._service.name === service) {
                events.push(key);
            }
        }
    }
    return events;
}

function getServicesWithEvents(definitions) {
    const services = {};

    // traverse the definitions list and extract services
    for (const [key, value] of Object.entries(definitions)) {
        if (value.kind === 'service') {
            services[key] = {
                events: []
            };
        }
    }

    // traverse the definitions list and map events to services
    for (const [key, value] of Object.entries(definitions)) {
        if (value.kind === 'event' && value._service) {
            services[value._service.name].events.push(key);
        }
    }

    // traverse the services list and remove service with no events
    for (const [key, value] of Object.entries(services)) {
        if (value.events.length === 0) {
            delete services[key];
        }
    }

    return services;
}

function getComponents(definitions, events, presets) {

    return {
        messageTraits: getMessageTraits(),
        messages: definitionsToMessages(definitions, events, presets),
        schemas: csnToJSONSchema(definitions, events)
    }
}

function _serviceErrorHandling(csn, options) {
    const services = cds.linked(csn).services;

    if (services.length < 1) throw new Error(messages.NO_SERVICES);

    if (!options.service && services.length > 1) throw new Error(`\n
      Found multiple service definitions in given model(s).
      Please choose by adding one of... \n
      -s all ${services.map(s => `\n      -s ${s.name}`).join('')}
    `);

    if (!options.service) {
      options.service = services[0].name;
    } else if (options.service !== 'all') {
      const srv = services.find(s => s.name === options.service);
      if (!srv) throw new Error(`Service definition with given ${options.service} not found in the model(s).`);
    }

    if (options["asyncapi:merged"] && options.service !== 'all') {
        throw new Error(messages.MERGED_FLAG);
    }
}

function* _iterate(services, csn, applicationNamespace, presets) {
    for (const [key, value] of Object.entries(services)) {
        const generatedAsyncAPI = _getAsyncApi(csn, value.events, key, applicationNamespace, presets);
        yield [generatedAsyncAPI, { file: key }];
    }
}

function _getNamespace(fullNamespace) {
    return fullNamespace.split('.').slice(0, 2).join('.');
}