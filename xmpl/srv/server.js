const cds = require('../../cds-plugin')

async function generateOpenAPI (filePath) {
    const asyncapiFile = await cds.compile(`file:${filePath}`).to.asyncapi({ service: "ProcessorService" });
    console.log(asyncapiFile)
}

generateOpenAPI('./srv/services.cds')
