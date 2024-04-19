const cds = require('@sap/cds')

function _lazyRegisterCompileTargets() {
  const value = require('./index')
  Object.defineProperty(this, "asyncapi", { value })
  return value
}

const registerCompileTargets = () => {
    Object.defineProperty(cds.compile.to, "asyncapi", {
      get: _lazyRegisterCompileTargets,
      configurable: true
    })
  }


module.exports = { registerCompileTargets }