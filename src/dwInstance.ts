import { getJSONParsedContent, writeJSONToFile } from './files';
import Ajv from 'ajv';
import chalk from 'chalk';

export interface DWJson {
  'client-id': string;
  'client-secret': string;
  hostname: string;
  'code-version': string;
}
export class DWInstance {
  dwfile: string = 'dw.json';
  schemaFile: string = 'schema/dw.schema.json';
  clientID: string;
  clientSecret: string;
  hostName: string;
  codeVersion: string;
  path: string;
  setup(dwJson: DWJson): DWInstance {
    this.clientID = dwJson['client-id'];
    this.clientSecret = dwJson['client-secret'];
    this.hostName = dwJson.hostname;
    this.codeVersion = dwJson['code-version'];
    this.path = `${process.cwd()}/${this.dwfile}`;
    return this;
  }
  async loadFile(): Promise<DWJson> {
    try {
      return await getJSONParsedContent(`${process.cwd()}/${this.dwfile}`);
    } catch (error) {
      console.error(chalk`{bgRed.black ${error}}`);
    }
  }
  async loadScheme() {
    try {
      return await getJSONParsedContent(`${process.cwd()}/${this.schemaFile}`);
    } catch (error) {
      console.error(chalk`{bgRed.black ${error}}`);
    }
  }
  async check(): Promise<DWInstance> {
    const ajv = new Ajv();
    const dwJson = await this.loadFile();
    const schema = await this.loadScheme();
    const validate = ajv.compile(schema);
    if (validate(dwJson)) {
      return this.setup(dwJson);
    } else {
      for (const err of validate.errors) {
        console.error(chalk`{bgRed.black 'dw.json' file ${err.message}}`);
      }
    }
  }
  async setCodeVersion(codeVersion: string) {
    this.codeVersion = codeVersion;
    const dwjson = await this.loadFile();
    dwjson['code-version'] = codeVersion;
    await writeJSONToFile(this.path, dwjson);
  }
}

export async function dwinstance() {
  const instance: DWInstance = new DWInstance();
  return await instance.check();
}
