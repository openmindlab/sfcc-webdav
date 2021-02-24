import fs, { ReadStream } from 'fs-extra';
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
 * @param {String} fileName
 * @returns {Promise<Boolean>}
 */
export async function checkForFile(fileName: string): Promise<boolean> {
  return await fs.pathExists(fileName);
}

/**
 * Return object represent `dw.json` project config
 * @param {string} fileName
 * @returns {Promise<String>}
 */
export async function getFileContent(fileName: string): Promise<string> {
  const missingError: string = `The file '${fileName}' is missing in given path`;
  if (await checkForFile(fileName)) {
    return await fs.readFile(fileName, { encoding: 'utf8' });
  } else {
    console.error(missingError);
    return '';
  }
}

/**
 * Return JSON parsed file
 * @param {String} filePath
 * @returns {Promise<Object>}
 */
export async function getJSONParsedContent(filePath: string): Promise<any> {
  return await fs.readJson(filePath);
}

/**
 *
 * @param {Object} object
 * @param {String} filePath
 * @returns {Promise<Boolean>}
 */
export async function writeJSONToFile(
  filePath: string,
  object: object
): Promise<boolean> {
  await fs.outputFile(filePath, JSON.stringify(object, null, 2));
  return true;
}
/**
 *
 * @param {Object} content
 * @param {String} filePath
 * @returns {Promise<Boolean>}
 */
export async function writeToPlainFile(
  filePath: string,
  content: any
): Promise<boolean> {
  await fs.outputFile(filePath, String(content));
  return true;
}

/**
 * Copy file or folder (including content) to specific destination
 * @param {String} source
 * @param {String} destination
 * @returns {Promise<Boolean>}
 */
export async function copy(
  source: string,
  destination: string
): Promise<boolean> {
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
 * @param {String} dir
 * @returns {Array<string>}
 */
export function listFiles(dir: string): Array<string> {
  var results: Array<string> = [];
  fs.readdirSync(dir).forEach((file: string) => {
    const foundFile = `${dir}/${file}`;
    var stat = fs.statSync(foundFile);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(foundFile));
    } else {
      results.push(foundFile);
    }
  });

  return results;
}

/**
 * Return the stream for given file
 * @param {String} filePath
 * @returns {Promise<ReadStream>}
 */
export function readStream(filePath: string): Promise<ReadStream> {
  return new Promise((resolve, reject) => {
    const fileStream: ReadStream = fs.createReadStream(filePath);
    fileStream.on('error', (err: any) => {
      console.error(
        `On Upload request of file ${filePath}, ReadStream Error: ${err}`
      );
      reject(err);
    });
    fileStream.on('ready', async () => {
      resolve(fileStream);
    });
  });
}

export async function rename(
  source: string,
  newname: string
): Promise<boolean> {
  try {
    await fs.rename(source, newname);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
