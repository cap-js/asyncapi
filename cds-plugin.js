const cds = require('@sap/cds')
const { compile, import: asyncapi } = require('./index')

// register `cds compile -2 asyncapi` (dispatched via cds.compile.to[<format>])
cds.compile?.to?.register?.('asyncapi', compile, { extension: '.json', help: 'AsyncAPI document' })

// register `cds import --asyncapi` (dispatched via cds.import.from[<kind>])
cds.import?.from?.register?.('asyncapi', async function (filepath, options = {}) {
  const src = await cds.utils.read(filepath, 'utf-8')
  const csn = asyncapi.asyncapi2csn(src)
  options.inputFileKind = 'odata'
  return csn
}, { help: 'AsyncAPI specification' })
