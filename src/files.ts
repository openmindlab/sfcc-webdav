import fs, { ReadStream, readdirSync, Dirent } from 'fs-extra';
import path from 'path';

/**
 * Create folder if not exists
 * @param {String} folder
 * @returns {Promise<String>}
 */
export async function createFolderIfNotExists(folder: string): Promise<string> {
  await fs.ensureDir(folder, 0o2775);
  return folder;
}
/**
 * Delete given folder path
 * @param {String} folder
 * @returns {Promise<Boolean>}
 */
export async function deleteFolder(folder: string): Promise<boolean> {
  await fs.remove(folder);
  return true;
}

/**
 * Check if configuration file `dw.json` exists in project root
 * @param {String} file
 * @returns {Promise<Boolean>}
 */
export async function checkForFile(file: string): Promise<boolean> {
  return await fs.pathExists(file);
}

/**
 * Return object represent `dw.json` project config
 * @param {string} file
 * @returns {Promise<String>}
 */
export async function getFileContent(file: string): Promise<string> {
  const missingError: string = `The file '${file}' is missing in given path`;
  if (await checkForFile(file)) {
    return await fs.readFile(file, { encoding: 'utf8' });
  } else {
    console.error(missingError);
    return '';
  }
}

/**
 * Return JSON parsed file
 * @param {String} file
 * @returns {Promise<Object>}
 */
export async function getJSONParsedContent(file: string): Promise<any> {
  return await fs.readJson(file);
}

/**
 *
 * @param {Object} object
 * @param {String} file
 * @returns {Promise<Boolean>}
 */
export async function writeJSONToFile(file: string, object: object): Promise<boolean> {
  await fs.outputFile(file, JSON.stringify(object, null, 2));
  return true;
}
/**
 *
 * @param {Object} content
 * @param {String} file
 * @returns {Promise<Boolean>}
 */
export async function writeToPlainFile(file: string, content: any): Promise<boolean> {
  await fs.outputFile(file, String(content));
  return true;
}

/**
 * Copy file or folder (including content) to specific destination
 * @param {String} source
 * @param {String} destination
 * @returns {Promise<Boolean>}
 */
export async function copy(source: string, destination: string): Promise<boolean> {
  if (await checkForFile(source)) {
    await createFolderIfNotExists(destination);
    const sourceStat = await fs.lstat(source);
    const sourceType = sourceStat.isFile() ? 'file' : 'directory';
    if (sourceType === 'file') {
      await fs.copy(source, `${destination}/${path.basename(source)}`);
      return true;
    } else if (sourceType === 'directory') {
      await fs.copy(source, `${destination}/`);
      return true;
    }
  } else {
    return false;
  }
}

/**
 * List all files in a directory (recoursive)
 * @param {String} folder
 * @returns {Array<string>}
 */
export function listFiles(folder: string): Array<string> {
  let results: Array<string> = [];
  fs.readdirSync(folder).forEach((file: string) => {
    const foundFile = `${folder}/${file}`;
    const stat = fs.statSync(foundFile);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(foundFile));
    } else {
      results.push(foundFile);
    }
  });

  return results;
}

export function listFolders(folder: string): Array<string> {
  return readdirSync(folder, { withFileTypes: true })
    .filter((dirent: Dirent) => dirent.isDirectory())
    .map((dirent: Dirent) => dirent.name);
}

/**
 * Rename file
 * @param {String} file the source file
 * @param {String} newname the destination file with new name
 * @returns {Promise<boolean>}
 */
export async function rename(file: string, newname: string): Promise<boolean> {
  try {
    await fs.rename(file, newname);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
