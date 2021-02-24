import path from 'path';
import fs from 'fs';
import * as fileUtils from './files';
import chalk from 'chalk';
import { writeJSONToFile } from './files';
import { getCurrentBranchName } from './git';
const cwd = process.cwd();
const dwFile: string = 'dw.json';

export interface DWJson {
  client_id: string;
  client_secret: string;
  hostname: string;
  'code-version': string;
}

/**
 * @returns {DWJson} dw.json content
 */
export function getDwJson(): DWJson {
  let dwjsonpath: string = path.resolve(cwd, dwFile);
  if (!fs.existsSync(dwjsonpath)) {
    throw new Error(`Missing 'dw.json' file`);
  } else {
    const dwjson: DWJson = JSON.parse(fs.readFileSync(path.join(cwd, dwFile), 'UTF-8'));
    return dwjson;
  }
}

export async function setCodeVersion() {
  const dwConfig: DWJson = getDwJson();
  dwConfig['code-version'] = getCurrentBranchName();
  const writeDwJson: boolean = await writeJSONToFile(path.resolve(process.cwd(), dwFile), dwConfig);
  const textEmoji: string = String.fromCodePoint(0x1f9ea);
  console.log(`${textEmoji} updated code version in ${chalk.bold.white.bgGreen(dwConfig['code-version'])}`);
  return writeDwJson;
}
