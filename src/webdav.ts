#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

const cwd = process.cwd();

const { log, error } = console;

function getDwJson() {
  let dwjsonpath = path.join(cwd, 'dw.json');
  if (!fs.existsSync(dwjsonpath)) {
    error(chalk.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }
  const dwjson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), 'UTF-8'));
  return dwjson;
}
export interface DwJson {
  client_id?: string,
  'client-id'?: string,
  client_secret?: string,
  'client-secret'?: string,
  hostname: string,
  'code-version': string
}
export class Webdav {
  clientId: string;
  clientSecret: string;
  token: string;
  trace: boolean;
  hostname: string;
  codeVersion: string;
  axios: AxiosInstance;
  Webdav: typeof Webdav;
  constructor(dwJson: DwJson) {
    this.useDwJson(dwJson);
    this.token = undefined;
    this.trace = false;
    this.axios = Axios.create();
    this.axios.interceptors.request.use(request => {
      if (this.trace) {
        log(chalk.cyan('Sending Request:'));
        log(chalk.cyan('baseUrl: '), request.baseURL);
        log(chalk.cyan('url: '), request.url);
        log(chalk.cyan('method: '), request.method);
        log(chalk.cyan('headers: '), JSON.stringify(request.headers));
        log(chalk.cyan('data: '), JSON.stringify(request.data));
      }
      return request;
    })
    this.axios.interceptors.response.use(response => {
      if (this.trace) {
        log(chalk.cyan('Sending Response:'));
        log(chalk.cyan('Status: '), response.status);
        log(chalk.cyan('Status Msg: '), response.statusText);
        log(chalk.cyan('Response Data: '), JSON.stringify(response.data))
      }
      return response;
    })
  }

  useDwJson(dwJson: DwJson) {
    this.clientId = dwJson?.client_id || dwJson?.['client-id'];
    this.clientSecret = dwJson?.client_secret || dwJson?.['client-secret'];
    this.hostname = dwJson?.hostname;
    this.codeVersion = dwJson?.['code-version'];
  }

  toServerPath(file: string) {
    let basepath = `/cartridges/${this.codeVersion}/`;
    let cartridgepath = path.basename(file.substr(0, file.indexOf('/cartridge/'))) + file.substr(file.indexOf('/cartridge/'));
    return `${basepath}${cartridgepath}`;
  }

  async authorize() {
    if (!this.clientId) {
      error(chalk.red("Missing Client-id! Cannot make authorize request without it."));
      throw "Missing Client-id";

    }
    if (!this.clientSecret) {
      error(chalk.red("Missing Client-secret! Cannot make authorize request without it."));
      throw "Missing Client-secret";
    }
    const { data } = await this.axios.request({
      url: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: this.clientId,
        password: this.clientSecret
      }
    });
    this.token = data.access_token;
  }

  async sendRequest(options: AxiosRequestConfig, callback: Function) {
    try {
      let { data } = await this.axios.request(options);
      callback(data);
    } catch (err) {
      error(chalk.red('Error processing request:', err));
      if (options?.headers?.Authorization) {
        if (this.trace) console.debug(`Expiring Token! ${this.token}`)
        await this.authorize();
        if (this.trace) console.debug(`New Token! ${this.token}`)
        options.headers.Authorization = `Bearer ${this.token}`;
      }
      try {
        let { data } = await Axios.request(options);
        callback(data);
      } catch (innerErr) {
        error(chalk.red('Error processing retry:', err));
        throw err;
      }
    }
  }

  async fileUpload(file: string, relativepath: string) {
    if (!this.hostname) {
      error(chalk.red("Missing hostname! Cannot make create a request without it."));
      throw "Missing hostname";
    }
    if (!this.token) await this.authorize();
    const fileStream = fs.createReadStream(file);
    fileStream.on('error', (err: any) => error(`On Upload request of file ${file}, ReadStream Error: ${err}`));
    const filesize = fs.statSync(file).size;
    await fileStream.on('ready', async () => {
      const options: AxiosRequestConfig = {
        baseURL: `https://${this.hostname}`,
        url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        method: 'PUT',
        data: fileStream
      };
      await this.sendRequest(options, () => log(chalk.cyan(`Uploaded ${relativepath} [${prettyBytes(filesize)}]`)));
    })
  }

  async fileDelete(file: string, relativepath: string) {
    if (!this.hostname) {
      error(chalk.red("Missing hostname! Cannot make create a request without it."));
      throw "Missing hostname";
    }
    if (!this.token) await this.authorize();
    const options: AxiosRequestConfig = {
      baseURL: `https://${this.hostname}`,
      url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      method: 'DELETE'
    };
    await this.sendRequest(options, () => log(chalk.cyan(`Deleted ${relativepath}`)));
  }
}

const webdav = new Webdav(getDwJson());
webdav.Webdav = Webdav;
export default webdav;

/**
 * Upload a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export async function fileUpload(file: string, relativepath: string) {
  await webdav.fileUpload(file, relativepath);
}

/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export async function fileDelete(file: string, relativepath: string) {
  await webdav.fileDelete(file, relativepath);
}
