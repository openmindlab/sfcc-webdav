import * as dw from '../src/dw';
const dwjson: dw.DWJson = dw.getDwJson();
describe('dw properties', () => {
  test(`client id exists`, () => {
    expect(dwjson.client_id).toBeDefined();
  });
  test(`client secret exists`, () => {
    expect(dwjson.client_secret).toBeDefined();
  });
  test(`hostname exists`, () => {
    expect(dwjson.hostname).toBeDefined();
  });
  test(`code version exists`, () => {
    expect(dwjson['code-version']).toBeDefined();
  });
});
