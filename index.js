const fileUtils = require('./dist/files');
async function test() {
  try {
    const stream = await fileUtils.readStream('./openmind-x.svg');
  } catch (e) {
    console.error('xxxxx');
  }
}
test();
