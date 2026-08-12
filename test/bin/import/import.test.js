const { describe, test, before, beforeEach, after, afterEach } = require('node:test')
const assert = require('node:assert')
const { join, resolve } = require('path')
const cds = require('@sap/cds')
const { isfile, isdir, mkdirp, rimraf, read } = cds.utils
const _import = require('@sap/cds-dk/bin/import')

const inputDir = join(__dirname, '../../lib/import/input')
const project = join(__dirname, 'gen')
const out = (...p) => resolve(project, ...p)

const inputBase_json     = resolve(inputDir, 'inputBase.json')
const inputBase_csn      = out('srv/external/inputBase.csn')
const inputBase_cds      = out('srv/external/inputBase.cds')
const multipleService_json = resolve(inputDir, 'multipleService.json')
const multipleService_csn  = out('srv/external/multipleService.csn')
const multipleService_cds  = out('srv/external/multipleService.cds')

describe('AsyncAPI CLI import', () => {
  beforeEach(async () => {
    if (isdir(project)) await rimraf(project)
    await mkdirp(project)
    process.chdir(project)
  })

  afterEach(async () => {
    process.chdir(__dirname)
  })

  after(async () => {
    if (isdir(project)) await rimraf(project)
  })

  test('import asyncapi - single service', async () => {
    await _import([inputBase_json])
    assert.ok(isfile(inputBase_csn))
    assert.ok(isfile(inputBase_json))
    assert.ok(!isfile(inputBase_cds))
    const obj = JSON.parse(await read(inputBase_csn, 'utf-8'))
    assert.ok(obj.definitions['com.sap.Base']['@AsyncAPI.StateInfo'])
    assert.ok(obj.definitions['com.sap.Base.MyName.v1']['@AsyncAPI.EventCharacteristics'])
    assert.ok(obj.definitions['com.sap.Base']['@AsyncAPI.Extensions'])
  })

  test('import asyncapi - single service --as cds', async () => {
    await _import([inputBase_json], { as: 'cds' })
    assert.ok(!isfile(inputBase_csn))
    assert.ok(isfile(inputBase_json))
    assert.ok(isfile(inputBase_cds))
    const str = await read(inputBase_cds, 'utf-8')
    assert.ok(str.includes('checksum') && str.includes('@cds.external'))
  })

  test('import asyncapi - multiple services', async () => {
    await _import([multipleService_json])
    assert.ok(isfile(multipleService_csn))
    assert.ok(isfile(multipleService_json))
    assert.ok(!isfile(multipleService_cds))
    const obj = JSON.parse(await read(multipleService_csn, 'utf-8'))
    assert.ok(obj.definitions['com.sap.bookstore.BookStore'])
    assert.ok(obj.definitions['com.sap.bookstore.AuthorService'])
    assert.ok(obj.definitions['com.sap.bookstore.BookStore']['@AsyncAPI.Extensions'])
  })

  test('import asyncapi - multiple services --as cds', async () => {
    await _import([multipleService_json], { as: 'cds' })
    assert.ok(!isfile(multipleService_csn))
    assert.ok(isfile(multipleService_json))
    assert.ok(isfile(multipleService_cds))
    const str = await read(multipleService_cds, 'utf-8')
    assert.ok(str.includes('checksum') && str.includes('@cds.external'))
  })
})
