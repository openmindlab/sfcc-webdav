import * as dw from "../src/dw";
import { checkForFile, rename, writeJSONToFile } from "../src/files";
const dwfile: string = `${process.cwd()}/dw.json`;
const renamed: string = `${process.cwd()}/dw-renamed.json`;
let dwjson: dw.DWJson;
async function createFake() {
  let dwexists: boolean = await checkForFile(dwfile);
  if (!dwexists) {
    dwexists = await checkForFile(renamed);
  } else {
    dwjson = dw.getDwJson();
    dwexists = true;
    return dwexists;
  }
  if (!dwexists) {
    const dwcontent: dw.DWJson = {
      hostname: "fake-host.demandware.net",
      client_id: "d2d7d915-73f4-460d-a9f0-11ccecfb34fc",
      client_secret: "_0p3nM1nd!",
      "code-version": "test",
    };
    await writeJSONToFile(dwfile, dwcontent);
    dwjson = dw.getDwJson();
  } else {
    try {
      await rename(renamed, dwfile);
      dwjson = dw.getDwJson();
      dwexists = true;
      return dwexists;
    } catch (e) {
      console.error(e);
    }
  }
}
describe("dw properties", () => {
  test(`if no 'dw.json' exists it will throws error`, async () => {
    const dwexists = await checkForFile(`${process.cwd()}/dw.json`);
    if (dwexists) {
      await rename(dwfile, renamed);
    }
    expect(() => {
      dw.getDwJson();
    }).toThrow(new Error(`Missing 'dw.json' file`));
  });
  test(`client id exists`, async () => {
    await createFake();
    expect(dwjson.client_id).toBeDefined();
  });
  test(`client secret exists`, async () => {
    await createFake();
    expect(dwjson.client_secret).toBeDefined();
  });
  test(`hostname exists`, async () => {
    await createFake();
    expect(dwjson.hostname).toBeDefined();
  });
  test(`code version exists`, async () => {
    await createFake();
    expect(dwjson["code-version"]).toBeDefined();
  });
});
