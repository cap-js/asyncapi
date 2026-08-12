const { describe, test } = require('node:test')
const assert = require('node:assert')
const { resolve } = require('path')

// ensure cds.import lazy getter is set up before cds-plugin runs
require('@sap/cds-dk')
require('../../cds-plugin')

const cds = require('@sap/cds')
const inputDir = resolve(__dirname, '../lib/import/input')

describe('cds import --asyncapi (plugin registration)', () => {
  test('single service', async () => {
    const csn = await cds.import.from.asyncapi(resolve(inputDir, 'inputBase.json'))
    assert.equal(csn.definitions['com.sap.Base'].kind, 'service')
    assert.ok(csn.definitions['com.sap.Base']['@AsyncAPI.StateInfo'])
    assert.ok(csn.definitions['com.sap.Base.MyName.v1']['@AsyncAPI.EventCharacteristics'])
    assert.ok(csn.definitions['com.sap.Base']['@AsyncAPI.Extensions'])
  })

  test('multiple services', async () => {
    const csn = await cds.import.from.asyncapi(resolve(inputDir, 'multipleService.json'))
    assert.ok(csn.definitions['com.sap.bookstore.BookStore'])
    assert.ok(csn.definitions['com.sap.bookstore.AuthorService'])
    assert.ok(csn.definitions['com.sap.bookstore.BookStore']['@AsyncAPI.Extensions'])
  })
})
