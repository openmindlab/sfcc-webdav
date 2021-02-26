import fs from 'fs-extra';

const mockFs = fs as jest.Mocked<typeof fs>;

import { DWInstance, dwinstance } from '../src/dw';

describe(`'dw.json' instance`, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  /* test('dw.json setup', async () => {
    mockFs.readJSON.mockResolvedValue({
      hostname: 'sandbox-instance.demandware.net',
      username: 'user@email.com',
      password: '!3urTpz9$1MX',
      'code-version': 'pippo',
      'client-id': 'd5d89dX15-73f4-46rd-a9f0-fak3c0de',
      'client-secret': 'v7%j2OJkYxji'
    });
    const instance: DWInstance = new DWInstance();
    await instance.load();
    const pippo = '';
  }); */
});
