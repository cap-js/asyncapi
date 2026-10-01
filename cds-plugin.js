const cds = require('@sap/cds')
const { compile, import: asyncapi } = require('./index')

// monkey-patch cds.compile.to and cds.import.from directly, same pattern as cds-dk's lazy getters
if (cds.compile?.to)  cds.compile.to.asyncapi = compile

if (cds.import?.from) cds.import.from.asyncapi = async function (filepath, options = {}) {
  const src = await cds.utils.read(filepath, 'utf-8')
  const csn = asyncapi.asyncapi2csn(src)
  options.inputFileKind = 'odata'
  return csn
}

cds.on('served', ()=> {
  console.log(42)
})

if (cds.schema.default4) {
  const old = cds.schema.default4
  cds.schema.default4 = async function (...args) {
    const schema = await old(...args)
    schema.YYY = { x : 42}
    return schema
  }
}

