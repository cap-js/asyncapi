
async function generateOpenAPI (filePath) {
    const asyncapiFile = await cds.compile(`file:${filePath}`).to.asyncapi();
    console.log(asyncapiFile)
}

generateOpenAPI('./srv/sampleValid.cds')
