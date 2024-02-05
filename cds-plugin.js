const cds = module.exports = require('@sap/cds/lib');

class AsyncAPI {
  
    get compile() {
      let compile = require('@sap/cds/lib/compile/cds-compile')
      cds.extend (compile.to.constructor) .with (class {
        get asyncapi() { return super.asyncapi = require('./srv/compile/lib') }
      })
      return super.compile = compile
    }
}

cds.extend (cds.constructor) .with (AsyncAPI);