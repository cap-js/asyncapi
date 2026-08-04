const { describe, test } = require('node:test')
const assert = require('node:assert')
const { asyncapi2csn } = require('../../../lib/import')
const cds = require('@sap/cds')
const { read, readdir } = cds.utils
const { join, resolve } = require('path')

describe('AsyncAPI to CSN generation Unit tests', () => {
    const inputDirName = join(__dirname, 'input')
    const outputDirName = join(__dirname, 'output')

    test('Test csn for all the input asyncapi files', async () => {
        const files = await readdir(inputDirName)
        for (const file of files) {
            const asyncapiDoc = await read(resolve(inputDirName, file), 'utf-8')
            const data = asyncapi2csn(asyncapiDoc)

            const baseName = file.includes('.') ? file.substring(0, file.indexOf('.')) : file
            let csnFromFile = await read(resolve(outputDirName, baseName + '.csn'), 'utf-8')
            csnFromFile = JSON.parse(csnFromFile)

            delete data.meta
            delete csnFromFile.meta
            assert.deepEqual(data, csnFromFile)
        }
    })
})
