const path = require('path');
const fs = require('fs');
const fileUtils = require('./dist/files');
const Ocapi = require('./dist/ocapi').Ocapi;
const OcapiClient = require('./dist/ocapiClient').OcapiClient;
const Webdav = require('./dist/webdav').Webdav;
const Token = require('./dist/token').Token;
const tokenstring = require('./dist/token').tokenstring;
const dwinstance = require('./dist/dwInstance').dwinstance;
async function test() {
  /* const ocapiClient = new OcapiClient();
  const response = await ocapiClient.dataRequest({
    endpoint: 'code_versions',
    version: '21_3'
  });
  console.log(response); */
  /* const webdavClient = new Webdav();
  try {
    const response = await webdavClient.fileUpload(
      path.resolve('./testUploadFile.txt'),
      webdavClient.toServerPath('testUploadFile.txt')
    );
    console.log(response);
  } catch (err) {} */
  /*const token = new Token();
  token.authorize();
  token.on('authorized', (token, expiration) => {
    console.log('authorized', token, new Date(expiration));
  });
  token.on('expired', (token, expiration) => {
    console.log('expired', token, new Date(expiration));
  });*/
  /* const dwInstance = await dwinstance();
  console.log(dwInstance);
  dwInstance.setCodeVersion('pippo'); */
  /* const token = await tokenstring();
  console.log(token); */
}
test();
