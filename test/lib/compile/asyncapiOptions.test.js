const toAsyncAPI = require('../../../lib/compile');
require('../../../').registerAsyncapiCompileTarget();
const cds = require('@sap/cds');
const { readdir, read, path: { resolve } } = cds.utils;
const { join } = require('path');

describe('asyncapi export: options', () => {
  const baseInputPath = join(__dirname, 'input');
  const baseOutputPath = join(__dirname, 'output');

  beforeEach(() => {
    cds.env.export = {};
    cds.env.export.asyncapi = {
      application_namespace: 'com.sap.test'
    };
  });

  test('Positive case for valid cds without any options', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'base.cds'));
    const csn = cds.compile.to.csn(inputCDS);
    const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'base.json')));
    const generatedAsyncAPI = toAsyncAPI(csn);
    expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
  });

  test('Service flag with an invalid service', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'base.cds'));
    const csn = cds.compile.to.csn(inputCDS);

    // throws error if service doesn't exist
    expect(() => toAsyncAPI(csn, { service: 'foo' })).toThrowError(/not found/si);
  });

  test('Service flag with a valid service name', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'));
    const csn = cds.compile.to.csn(inputCDS);
    const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'BookStore.json')));

    // only generates one output if a service name is mentioned
    const generatedAsyncAPI = toAsyncAPI(csn, { service: 'com.sap.bookstore.BookStore' });
    expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
  });

  test('Service flag set to all', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'));
    const expectedBookStoreServiceOutput = JSON.stringify(await read(join(baseOutputPath, 'BookStore.json')));
    const expectedAuthorServiceOutput = JSON.stringify(await read(join(baseOutputPath, 'AuthorService.json')));
    const csn = cds.compile.to.csn(inputCDS);

    // generates two files for services set to all
    const asyncapi = toAsyncAPI(csn, { service: 'all' });
    const filesFound = new Set();
    for (const [content, metadata] of asyncapi) {
      const expectedAsyncAPI = metadata.file.split('.')[3] === 'BookStore' ? expectedBookStoreServiceOutput : expectedAuthorServiceOutput;
      expect(content).toEqual(JSON.parse(expectedAsyncAPI));
      filesFound.add(metadata.file);
    }
    expect(filesFound).toEqual(new Set(['com.sap.bookstore.BookStore', 'com.sap.bookstore.AuthorService']));
  });

  test('Service flag set to all with directory', async () => {
    const inputCDS = await readdir(join(baseInputPath, 'valid'));
    const fileList = inputCDS.map((fileName) => {
      return resolve(baseInputPath, 'valid', fileName);
    });

    // generates two files for services set to all
    const generatedAsyncAPI = await cds.compile(fileList).to.asyncapi({ service: 'all' });
    const filesFound = new Set();
    for (const [, metadata] of generatedAsyncAPI) {
      filesFound.add(metadata.file);
    }
    expect(filesFound).toEqual(new Set(['com.sap.bookstore.BookStore', 'com.sap.bookstore.AuthorService', 'com.sap.base.Base', 'com.sap.presets.S', 'com.sap.annotations.S']));
  });

  test('Merged flag throws an error if title and version are not specified', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'));
    const csn = cds.compile.to.csn(inputCDS);

    expect(() => toAsyncAPI(csn, { service: 'all', "asyncapi:merged": true })).toThrowError("Preset for Title and Version info needs to be added when merged flag is used.");
  });

  test('Merged flag', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'));
    const csn = cds.compile.to.csn(inputCDS);
    const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'merged.json')));
    cds.env.export.asyncapi = {
      application_namespace: 'com.sap.test',
      merged: {
        title: "My Title",
        version: "1.0.0"
      }
    };

    // only generates one output if merged flag is mentioned
    const generatedAsyncAPI = toAsyncAPI(csn, { service: 'all', "asyncapi:merged": true });
    expect(generatedAsyncAPI).toEqual(JSON.parse(expectedAsyncAPI));
  });

});
