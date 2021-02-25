import { getJSONParsedContent, writeJSONToFile } from './files';
import Ajv from 'ajv';
import chalk from 'chalk';
import { JSONConfig } from './jsonConfig';

export interface DWJson {
  'client-id': string;
  'client-secret': string;
  hostname: string;
  'code-version': string;
}
export class DWInstance extends JSONConfig {
  file = 'dw.json';
  schemaFile = 'schema/dw.schema.json';
  clientID: string;
  clientSecret: string;
  hostName: string;
  codeVersion: string;
  setup(dwJson: DWJson): DWInstance {
    this.clientID = dwJson['client-id'];
    this.clientSecret = dwJson['client-secret'];
    this.hostName = dwJson.hostname;
    this.codeVersion = dwJson['code-version'];
    return this;
  }
  async check(): Promise<DWInstance> {
    const validatedObject = await this.validate();
    return this.setup(validatedObject as DWJson);
  }
  async setCodeVersion(codeVersion: string) {
    this.codeVersion = codeVersion;
    const dwjson = await this.load();
    dwjson['code-version'] = codeVersion;
    await this.save(dwjson);
  }
}

export async function dwinstance() {
  const instance: DWInstance = new DWInstance();
  await instance.load();
  return instance.check();
}
