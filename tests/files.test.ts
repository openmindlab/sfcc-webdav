import * as fileUtils from '../src/files';
import path from 'path';
const testFolder = `${process.cwd()}/__mocks__`;
const testFile = 'demofile';
const subdir = `${testFolder}/subdir`;
describe('File Utils', () => {
  test('Create folder if not extists', async () => {
    const operation = await fileUtils.createFolderIfNotExists(testFolder);
    expect(operation).toBe(testFolder);
  });
  test('Create file as plain text', async () => {
    const operation = await fileUtils.writeToPlainFile(`${testFolder}/${testFile}.txt`, 'content=true');
    expect(operation).toBe(true);
  });
  test('Create file as JSON', async () => {
    const operation = await fileUtils.writeJSONToFile(`${testFolder}/${testFile}.json`, { content: true });
    expect(operation).toBe(true);
  });
  test('Check if file exists', async () => {
    const operation = await fileUtils.checkForFile(`${testFolder}/${testFile}.json`);
    expect(operation).toBe(true);
  });
  test('Get file content', async () => {
    const operation = await fileUtils.getFileContent(`${testFolder}/${testFile}.txt`);
    expect(operation).toBe('content=true');
  });
  test('Get file content when file does not exists', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await fileUtils.getFileContent(`${testFolder}/${testFile}_undefined.txt`);
    expect(consoleSpy).toHaveBeenCalled();
  });
  test('Get file content as JSON', async () => {
    const operation = await fileUtils.getJSONParsedContent(`${testFolder}/${testFile}.json`);
    expect(operation).toEqual({ content: true });
  });
  test('Copy files', async () => {
    await fileUtils.createFolderIfNotExists(subdir);
    const operation = await fileUtils.copy('./package.json', subdir);
    expect(operation).toEqual(true);
  });
  test('List files of folder', async () => {
    const operation = await fileUtils.listFiles(testFolder);
    expect(operation).toEqual([
      `${path.resolve(`${testFolder}/${testFile}.json`)}`,
      `${path.resolve(`${testFolder}/${testFile}.txt`)}`,
      `${path.resolve(`${testFolder}/dw.json`)}`,
      `${path.resolve(`${testFolder}/subdir/package.json`)}`,
      `${path.resolve(`${testFolder}/testUploadFile.txt`)}`
    ]);
  });
  test('Copy Folder', async () => {
    const subdir = `${testFolder}/subdir`;
    await fileUtils.createFolderIfNotExists(subdir);
    const operation = await fileUtils.copy('./src', subdir);
    expect(operation).toEqual(true);
  });
  test('Copy file does not exists', async () => {
    await fileUtils.createFolderIfNotExists(subdir);
    const operation = await fileUtils.copy('./package_fake.json', subdir);
    expect(operation).toEqual(false);
  });
  test('Rename file if file exists', async () => {
    const renamed = await fileUtils.rename(`${testFolder}/${testFile}.txt`, `${testFolder}/${testFile}_renamed.txt`);
    expect(renamed).toEqual(true);
  });
  test('Rename file if file not exists', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await fileUtils.rename(`${testFolder}/${testFile}_fake.txt`, `${testFolder}/${testFile}_renamed.txt`);
    expect(consoleSpy).toHaveBeenCalled();
  });
  test('Delete folder', async () => {
    await fileUtils.deleteFileOrFolder(`${testFolder}/${testFile}_renamed.txt`);
    await fileUtils.deleteFileOrFolder(`${testFolder}/${testFile}.json`);
    const operation = await fileUtils.deleteFileOrFolder(subdir);
    expect(operation).toBe(true);
  });
});
