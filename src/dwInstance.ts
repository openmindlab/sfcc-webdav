import { getJSONParsedContent } from './files';
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
  constructor() {}
  setup(dwJson: DWJson): DWInstance {
    this.clientID = dwJson['client-id'];
    this.clientSecret = dwJson['client-secret'];
    this.hostName = dwJson.hostname;
    this.codeVersion = dwJson['code-version'];
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
        //chalk.red(`'dw.json' file ${err.message}`)
        console.error(chalk`{bgRed.black 'dw.json' file ${err.message}}`);
      }
    }
  }
}

export async function dwinstance() {
  const instance: DWInstance = new DWInstance();
  return await instance.check();
}
