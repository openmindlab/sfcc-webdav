function otherMetod() {
  const { exec } = require('child_process');
  exec('git name-rev --name-only HEAD', (err, stdout, stderr) => {
    return stdout;
  });
}
async function test() {
  otherMetod();
}
test();
