const { describe, test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

describe('cds-plugin registrations', () => {
  test('registers compile and import handlers', () => {
    const compileRegistrations = []
    const importRegistrations = []

    const fakeCds = {
      compile: { to: { register: (format, impl, opts) => compileRegistrations.push({ format, impl, opts }) } },
      import:  { from: { register: (kind,   impl, opts) => importRegistrations.push({ kind, impl, opts }) } }
    }

    // load cds-plugin with our fake cds instead of the real one
    const orig = Module._resolveFilename
    Module._resolveFilename = (req, ...rest) =>
      req === '@sap/cds' ? req : orig(req, ...rest)
    require.cache['@sap/cds'] = { id: '@sap/cds', filename: '@sap/cds', loaded: true, exports: fakeCds }

    delete require.cache[require.resolve('../../cds-plugin')]
    require('../../cds-plugin')

    delete require.cache['@sap/cds']
    Module._resolveFilename = orig

    assert.equal(compileRegistrations.length, 1)
    assert.equal(compileRegistrations[0].format, 'asyncapi')
    assert.equal(typeof compileRegistrations[0].impl, 'function')

    assert.equal(importRegistrations.length, 1)
    assert.equal(importRegistrations[0].kind, 'asyncapi')
    assert.equal(typeof importRegistrations[0].impl, 'function')
  })
})
