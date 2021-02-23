import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { getJSONParsedContent, writeJSONToFile } from './files';
const { log, error } = console;
const cwd = process.cwd();
const dwFile: string = 'dw.json';

export interface DWJson {
  client_id?: string;
  'client-id'?: string;
  client_secret?: string;
  'client-secret'?: string;
  hostname: string;
  'code-version': string;
}

/**
 * @returns {DWJson} dw.json content
 */
export function getDwJson() {
  let dwjsonpath: string = path.join(cwd, dwFile);
  if (!fs.existsSync(dwjsonpath)) {
    error(chalk.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }
  const dwjson: DWJson = JSON.parse(fs.readFileSync(path.join(cwd, dwFile), 'UTF-8'));
  return dwjson;
}

export async function setCodeVersion() {
  const dwConfig: DWJson = getDwJson();
  dwConfig['code-version'] = gitUtils.getCurrentBranchName();
  const writeDwJson: boolean = await writeJSONToFile(path.resolve(process.cwd(), dwFile), dwConfig);
  const textEmoji: string = String.fromCodePoint(0x1f9ea);
  console.log(`${textEmoji} updated code version in ${chalk.bold.white.bgGreen(dwConfig['code-version'])}`);
  return writeDwJson;
}
