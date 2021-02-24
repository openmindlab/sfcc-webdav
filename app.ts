const { SFCCUtils } = require('./dist/sfccUtils');
async function testCall() {
  /* const ocapiClient = require('./dist/ocapiClient');
  const response = await ocapiClient.dataRequest({
    version: '21_3',
    endpoint: 'code_versions',
  });
  console.log(response); */
  const client = new SFCCUtils();
  const response = await client.import('metadata.zip');
  const poppo = '';
}
testCall();
