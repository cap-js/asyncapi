const cds = require('@sap/cds')

function _lazyRegisterCompileTarget() {
  const value = require('./lib/compile/index')
  Object.defineProperty(this, "asyncapi", { value })
  return value
}

const registerAsyncapiCompileTarget = () => {
    Object.defineProperty(cds.compile.to, "asyncapi", {
      get: _lazyRegisterCompileTarget,
      configurable: true
    })
  }


module.exports = { registerAsyncapiCompileTarget }