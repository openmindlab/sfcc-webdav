const path = require('path');
const fs = require('fs');
const fileUtils = require('./dist/files');
// const Ocapi = require('./dist/ocapi').Ocapi;
// const OcapiClient = require('./dist/ocapiClient').OcapiClient;
const Webdav = require('./dist/webdav').Webdav;
async function test() {
  // const ocapi = new Ocapi();
  // const token = await ocapi.authorize();
  // const ocapiClient = new OcapiClient();
  // const response = await ocapiClient.dataRequest({
  //   endpoint: 'code_versions',
  //   version: '21_3'
  // });
  const webdavClient = new Webdav();
  try {
    const response = await webdavClient.fileUpload(
      path.resolve('./hunger.svg'),
      webdavClient.toServerPath('hunger.svg')
    );
    console.log(response);
  } catch (err) {
    const poppo = err;
    const ccccc = '';
  }
  // const stream = await fileUtils.readStream(path.resolve('./file.txt'));
  /* var hjuy = fs.createReadStream(path.resolve('./file.txt'));
  hjuy.on('data', () => {
    const dddd = hjuy;
    const ccc = '';
  });
  hjuy.on('end', () => {
    const dddd = hjuy;
    const ccc = '';
  });
  hjuy.on('ready', () => {
    const dddd = hjuy;
    const ccc = '';
  });*/
  const pippo = '21_3';
}
test();
