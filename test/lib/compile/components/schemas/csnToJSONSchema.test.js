const { describe, test, beforeEach } = require('node:test')
const assert = require('node:assert')
const cds = require('@sap/cds')
const toAsyncAPI = require('../../../../../lib/compile')
const { read } = cds.utils
const { join } = require('path')
const baseInputPath = join(__dirname, 'input')
const baseOutputPath = join(__dirname, 'output')

async function compileAndCheck(inputFile, outputFile) {
  const inputCDS = await read(join(baseInputPath, inputFile))
  const expectedAsyncAPI = JSON.stringify(await read(join(baseOutputPath, outputFile)))
  const csn = cds.compile.to.csn(inputCDS)
  const generatedAsyncAPI = toAsyncAPI(csn)
  assert.deepStrictEqual(generatedAsyncAPI, JSON.parse(expectedAsyncAPI))
}

describe('asyncapi export: to json schema', () => {

  beforeEach(() => {
    cds.env.export = {}
    cds.env.export.asyncapi = {
      application_namespace: 'com.sap.test'
    }
  })

  test('Test for Array Types', async () => {
    await compileAndCheck('array-types.cds', 'array-types.json')
  })

  test('Test for Compositions', async () => {
    await compileAndCheck('compositions.cds', 'compositions.json')
  })

  test('Test for Constraints', async () => {
    await compileAndCheck('constraints.cds', 'constraints.json')
  })

  test('Test for Types Reuse', async () => {
    await compileAndCheck('types-reuse.cds', 'types-reuse.json')
  })

  test('Test for Enum Type', async () => {
    await compileAndCheck('enum.cds', 'enum.json')
  })

  test('Test for Managed Association', async () => {
    await compileAndCheck('managedAssociation.cds', 'managedAssociation.json')
  })

  test('Test for Managed Composition', async () => {
    await compileAndCheck('managedComposition.cds', 'managedComposition.json')
  })

  test('Test for Many to Many Association', async () => {
    await compileAndCheck('manyToManyAssociation.cds', 'manyToManyAssociation.json')
  })

  test('Test for One to One Association', async () => {
    await compileAndCheck('oneToManyAssociation.cds', 'oneToManyAssociation.json')
  })

  test('Test for Structured Type', async () => {
    await compileAndCheck('structures.cds', 'structures.json')
  })

  test('Test for Type Definition', async () => {
    await compileAndCheck('typeDefinition.cds', 'typeDefinition.json')
  })

  test('Test for Unmanaged Association', async () => {
    await compileAndCheck('unmanagedAssociation.cds', 'unmanagedAssociation.json')
  })

  test('Test for Unmanaged Composition', async () => {
    await compileAndCheck('unManagedComposition.cds', 'unManagedComposition.json')
  })

  test('Test for Description Annotations', async () => {
    await compileAndCheck('descriptions.cds', 'descriptions.json')
  })

  test('Test for i18n in Descriptions', async () => {
    await compileAndCheck('i18n-descriptions.cds', 'i18n-descriptions.json')
  })

})
