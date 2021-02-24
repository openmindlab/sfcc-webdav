const path = require('path');
const fs = require('fs');
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
  const response = await webdavClient.fileUpload(
    path.resolve('./file.txt'),
    webdavClient.toServerPath('file.txt')
  );
  console.log(response);
  const pippo = '21_3';
  /* const stream = fs.createReadStream(path.resolve('./file.txt'));
  stream.on('ready', () => {
    console.log('ready');
  });
  stream.on('readable', () => {
    console.log('readable');
  });
  stream.on('error', () => {
    console.log('error');
  }); */
}
test();
