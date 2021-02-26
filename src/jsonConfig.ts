import chalk from 'chalk';
import Ajv from 'ajv';
import { getJSONParsedContent, writeJSONToFile } from './files';
export interface JSONConfig {
  file: string;
  path: string;
  schemaFile?: string;
  content: object;
}
export class JSONConfig {
  constructor(file?: string) {
    if (file) {
      this.file = file;
    }
  }
  setupPath() {
    this.path = `${this.file}`;
  }
  async loadScheme() {
    try {
      return await getJSONParsedContent(`${this.schemaFile}`);
    } catch (error) {
      console.error(chalk`{bgRed.black ${error}}`);
    }
  }
  async load() {
    this.setupPath();
    try {
      return await getJSONParsedContent(`${this.path}`);
    } catch (error) {
      console.error(chalk`{bgRed.black ${error}}`);
    }
  }
  async save(content: object) {
    await writeJSONToFile(this.path, content);
  }
  async validate(): Promise<object> {
    const ajv = new Ajv();
    const json = await this.load();
    const schema = await this.loadScheme();
    const validate = ajv.compile(schema);
    if (validate(json)) {
      this.content = json;
      return this.content;
    } else {
      for (const err of validate.errors) {
        console.error(chalk`{bgRed.black 'dw.json' file ${err.message}}`);
      }
    }
  }
}
