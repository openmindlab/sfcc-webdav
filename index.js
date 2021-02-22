async function testCall() {
  const ocapiClient = require('./dist/ocapiClient');
  const response = await ocapiClient.dataRequest({
    version: '21_3',
    endpoint: 'code_versions',
  });
  console.log(response);
}
testCall();
