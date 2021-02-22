import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

const { log, error } = console;
const cwd = process.cwd();

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
  let dwjsonpath: string = path.join(cwd, 'dw.json');
  if (!fs.existsSync(dwjsonpath)) {
    error(chalk.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }
  const dwjson: DWJson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), 'UTF-8'));
  return dwjson;
}
