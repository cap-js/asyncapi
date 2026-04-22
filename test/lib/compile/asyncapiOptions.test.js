const { describe, test, beforeEach } = require('node:test')
const assert = require('node:assert')
const toAsyncAPI = require('../../../lib/compile')
const cds = require('@sap/cds')
const { readdir, read, path: { resolve } } = cds.utils
const { join } = require('path')

describe('asyncapi export: options', () => {
  const baseInputPath = join(__dirname, 'input')
  const baseOutputPath = join(__dirname, 'output')

  beforeEach(() => {
    cds.env.export = {}
    cds.env.export.asyncapi = {
      application_namespace: 'com.sap.test'
    }
  })

  test('Positive case for valid cds without any options', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'base.cds'))
    const csn = cds.compile.to.csn(inputCDS)
    const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'base.json')))
    const generatedAsyncAPI = toAsyncAPI(csn)
    assert.deepStrictEqual(generatedAsyncAPI, JSON.parse(expectedAsyncAPI))
  })

  test('Service flag with an invalid service', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'base.cds'))
    const csn = cds.compile.to.csn(inputCDS)

    // throws error if service doesn't exist
    assert.throws(() => toAsyncAPI(csn, { service: 'foo' }), /not found/i)
  })

  test('Service flag with a valid service name', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'))
    const csn = cds.compile.to.csn(inputCDS)
    const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'BookStore.json')))

    // only generates one output if a service name is mentioned
    const generatedAsyncAPI = toAsyncAPI(csn, { service: 'com.sap.bookstore.BookStore' })
    assert.deepStrictEqual(generatedAsyncAPI, JSON.parse(expectedAsyncAPI))
  })

  test('Service flag set to all', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'))
    const expectedBookStoreServiceOutput = JSON.stringify(await read(join(baseOutputPath, 'BookStore.json')))
    const expectedAuthorServiceOutput = JSON.stringify(await read(join(baseOutputPath, 'AuthorService.json')))
    const csn = cds.compile.to.csn(inputCDS)

    // generates two files for services set to all
    const asyncapi = toAsyncAPI(csn, { service: 'all' })
    const filesFound = new Set()
    for (const [content, metadata] of asyncapi) {
      const expectedAsyncAPI = metadata.file.split('.')[3] === 'BookStore' ? expectedBookStoreServiceOutput : expectedAuthorServiceOutput
      assert.deepStrictEqual(content, JSON.parse(expectedAsyncAPI))
      filesFound.add(metadata.file)
    }
    assert.deepStrictEqual(filesFound, new Set(['com.sap.bookstore.BookStore', 'com.sap.bookstore.AuthorService']))
  })

  test('Service flag set to all with directory', async () => {
    const inputCDS = await readdir(join(baseInputPath, 'valid'))
    const fileList = inputCDS.map((fileName) => {
      return resolve(baseInputPath, 'valid', fileName)
    })

    // generates two files for services set to all
    const csn = await cds.compile(fileList).to.csn()
    const generatedAsyncAPI = toAsyncAPI(csn, { service: 'all' })
    const filesFound = new Set()
    for (const [, metadata] of generatedAsyncAPI) {
      filesFound.add(metadata.file)
    }
    assert.deepStrictEqual(filesFound, new Set(['com.sap.bookstore.BookStore', 'com.sap.bookstore.AuthorService', 'com.sap.base.Base', 'com.sap.presets.S', 'com.sap.annotations.S', 'com.example.project.ProjectService']))
  })

  test('Merged flag throws an error if title and version are not specified', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'))
    const csn = cds.compile.to.csn(inputCDS)

    assert.throws(() => toAsyncAPI(csn, { service: 'all', 'asyncapi:merged': true }), /Preset for Title and Version info needs to be added when merged flag is used\./)
  })

  test('Merged flag', async () => {
    const inputCDS = await read(join(baseInputPath, 'valid', 'multipleService.cds'))
    const csn = cds.compile.to.csn(inputCDS)
    const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, 'merged.json')))
    cds.env.export.asyncapi = {
      application_namespace: 'com.sap.test',
      merged: {
        title: 'My Title',
        version: '1.0.0'
      }
    }

    // only generates one output if merged flag is mentioned
    const generatedAsyncAPI = toAsyncAPI(csn, { service: 'all', 'asyncapi:merged': true })
    assert.deepStrictEqual(generatedAsyncAPI, JSON.parse(expectedAsyncAPI))
  })

})
