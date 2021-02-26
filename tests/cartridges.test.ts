import { projectCartridges } from '../src/cartridges';
import { checkForFile, createFolderIfNotExists, deleteFileOrFolder } from '../src/files';
const testFolder = `${process.cwd()}/cartridges`;

describe('cartridges.projectCartridges', () => {
  test('return a list of folders', async () => {
    await createFolderIfNotExists(testFolder);
    const folders = ['test1', 'test2', 'test3'];
    for (const folder of folders) {
      await createFolderIfNotExists(`${testFolder}/${folder}`);
    }
    const pcartridges = projectCartridges();
    expect(pcartridges.length).toEqual(3);
  });
  test('return a list of folders', async () => {
    if (checkForFile(testFolder)) {
      deleteFileOrFolder(testFolder);
    }
    try {
      projectCartridges();
    } catch (e) {
      expect(e.code).toEqual('ENOENT');
    }
    /* expect(() => {
      projectCartridges();
    }).toThrow(); */
    /* await createFolderIfNotExists(testFolder);
    const folders = ['test1', 'test2', 'test3'];
    for (const folder of folders) {
      await createFolderIfNotExists(`${testFolder}/${folder}`);
    }
    const pcartridges = projectCartridges();
    expect(pcartridges.length).toEqual(3); */
  });
});
