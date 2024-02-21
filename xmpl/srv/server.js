const cds = require('../../cds-plugin');
const fs = require('fs');

async function generateAsyncAPI (filePath) {
    const asyncapiDocument = await cds.compile(`file:${filePath}`).to.asyncapi({ service: "ProcessorService" }); // to generate document for single service

    fs.writeFile('./asyncapi.json', JSON.stringify(asyncapiDocument), err => {
        if (err) {
          console.error(err);
        } 
      });
}

generateAsyncAPI('./srv/services.cds')
