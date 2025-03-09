const toAsyncAPI = require('../../../lib/compile');
const cds = require('@sap/cds');
const { read } = cds.utils;
const { join } = require('path');

describe('asyncapi export: presets and annotations', () => {
    const baseInputPath = join(__dirname, 'input');
    const baseOutputPath = join(__dirname, 'output');

    beforeEach(() => {
        cds.env.export = {};
        cds.env.export.asyncapi = {
            application_namespace: 'com.sap.test'
        };
    });

    test('Only presets', async () => {
        const inputCDS = await read(join(baseInputPath, 'valid', 'presets.cds'));
        cds.env.export.asyncapi = {
            "event_spec_version": "2.0",                          // x-sap-event-spec-version
            "event_source": "/{region}/sap.app/{instanceId}",     // x-sap-event-source
            "event_source_params": {                              // x-sap-event-source-parameters
                "region": {
                    "description": "The regional context of the application.",
                    "schema": {
                        "type": "string",
                        "enum": ["eu", "us"]
                    }
                },
                "instanceId": {
                    "description": "The instance id (tenant, installation, ...) of the application.",
                    "schema": {
                        "type": "string"
                    }
                }
            },
            "event_characteristics": {                             // x-sap-event-characteristics
                "instance-identification": "key-subject",
                "state-transfer": "full-after-image"
            },
            "application_namespace": "com.sap.test"                 // x-sap-application-namespace
        };
        const csn = cds.compile.to.csn(inputCDS);
        const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'presets.json')));
        const generatedAsyncAPI = toAsyncAPI(csn);
        expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
    });

    test('Only annotations', async () => {
        const inputCDS = await read(join(baseInputPath, 'valid', 'base.cds'));
        const csn = cds.compile.to.csn(inputCDS);
        const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'base.json')));
        const generatedAsyncAPI = toAsyncAPI(csn);
        expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
    });

    test('Only ODM annotations', async () => {
        const inputCDS = await read(join(baseInputPath, 'valid', 'annotations.cds'));
        const csn = cds.compile.to.csn(inputCDS);
        const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'annotations.json')));
        const generatedAsyncAPI = toAsyncAPI(csn);
        expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
    });

    test('Presets and annotations precedence', async () => {
        const inputCDS = await read(join(baseInputPath, 'valid', 'base.cds'));
        cds.env.export.asyncapi = {
            "application_namespace": "com.sap.test",
            "event_spec_version": "2.0"
        }
        const csn = cds.compile.to.csn(inputCDS);
        const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'base.json')));
        const generatedAsyncAPI = toAsyncAPI(csn);
        expect(generatedAsyncAPI.components.messages["com.sap.base.MyName.v1"]["x-sap-event-spec-version"]).toEqual('1.0.0');
        expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
    });

    test('Error is thrown if no service is present', async () => {
        const inputCDS = await read(join(baseInputPath, 'invalid', 'serviceLess.cds'));
        const csn = cds.compile.to.csn(inputCDS);
        expect(() => toAsyncAPI(csn)).toThrowError("There are no service definitions found in the given model(s).");
    });

    test('Negative test for version', async () => {
        const inputCDS = await read(join(baseInputPath, 'invalid', 'noTitle.cds'));
        const csn = cds.compile.to.csn(inputCDS);
        expect(() => toAsyncAPI(csn)).toThrowError("Title and Version info annotations needs to be added to the service(s).");
    });

    test('Test for application namespace', async () => {
        const inputCDS = await read(join(baseInputPath, 'valid', 'presets.cds'));
        cds.env.export.asyncapi = {};
        const csn = cds.compile.to.csn(inputCDS);
        const generatedAsyncAPI = toAsyncAPI(csn);
        expect(generatedAsyncAPI).toHaveProperty('x-sap-application-namespace','customer.cap-js-asyncapi')
    });

    test('Console warnings and errors are not used', async () => {
        const inputCDS = await read(join(baseInputPath, 'valid', 'presets.cds'));
        const csn = cds.compile.to.csn(inputCDS);
        const generatedAsyncAPI = toAsyncAPI(csn);
    
        expect(generatedAsyncAPI).not.toHaveProperty('console.warn');
        expect(generatedAsyncAPI).not.toHaveProperty('console.error');
    });
    
    
});
