#!/usr/bin/env node
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import bytesize from 'byte-size';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';


const cwd = process.cwd();

const { log, error } = console;

function getDwJson() {
  let dwjsonpath = path.join(cwd, 'dw.json');
  if (!fs.existsSync(dwjsonpath)) {
    error(pc.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }
  const dwjson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), { encoding: 'utf8' }));
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
        log(pc.cyan('Sending Request:'));
        log(pc.cyan('baseUrl: '), request.baseURL);
        log(pc.cyan('url: '), request.url);
        log(pc.cyan('method: '), request.method);
        log(pc.cyan('headers: '), JSON.stringify(request.headers));
        log(pc.cyan('data: '), JSON.stringify(request.data));
      }
      return request;
    })
    this.axios.interceptors.response.use(response => {
      if (this.trace) {
        log(pc.cyan('Sending Response:'));
        log(pc.cyan('Status: '), response.status);
        log(pc.cyan('Status Msg: '), response.statusText);
        log(pc.cyan('Response Data: '), JSON.stringify(response.data))
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
      error(pc.red("Missing Client-id! Cannot make authorize request without it."));
      throw "Missing Client-id";

    }
    if (!this.clientSecret) {
      error(pc.red("Missing Client-secret! Cannot make authorize request without it."));
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

  async sendRequest(options: AxiosRequestConfig, callback: Function, retry?: Function) {
    try {
      let { data } = await this.axios.request(options);
      callback(data);
    } catch (err) {
      error(pc.red(`Error processing request for file ${options.url}: ${err.message}`));
      if (options?.headers?.Authorization) {
        if (this.trace) console.debug(`Expiring Token! ${this.token}`)
        await this.authorize();
        if (this.trace) console.debug(`New Token! ${this.token}`)
        options.headers.Authorization = `Bearer ${this.token}`;
      }
      try {
        if (retry) {
          await retry();
        } else {
          let { data } = await Axios.request(options);
          callback(data);
        }
      } catch (innerErr) {
        error(pc.red(`Error processing retry: ${err.message}`));
        throw err;
      }
    }
  }

  async fileUpload(file: string, relativepath: string, retry?: boolean) {
    if (!this.hostname) {
      error(pc.red("Missing hostname! Cannot make create a request without it."));
      throw "Missing hostname";
    }
    if (!this.token) await this.authorize();
    const fileStream = fs.createReadStream(file);
    fileStream.on('error', (err: any) => error(`On Upload request of file ${file}, ReadStream Error: ${err}`));
    const size = fs.statSync(file).size;
    fileStream.on('ready', async () => {
      const options: AxiosRequestConfig = {
        baseURL: `https://${this.hostname}`,
        url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        method: 'PUT',
        decompress: true,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        data: fileStream
      };
      if (retry) {
        await this.sendRequest(options, () => log(pc.cyan(`Uploaded ${relativepath} [${bytesize(size)}]`)), async () => this.fileUpload(file, relativepath, false));
      } else {
        await this.sendRequest(options, () => log(pc.cyan(`Uploaded ${relativepath} [${bytesize(size)}]`)));
      }
    })
  }

  async fileDelete(file: string, relativepath: string) {
    if (!this.hostname) {
      error(pc.red("Missing hostname! Cannot make create a request without it."));
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
    await this.sendRequest(options, () => log(pc.cyan(`Deleted ${relativepath}`)));
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
  await webdav.fileUpload(file, relativepath, true);
}

/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export async function fileDelete(file: string, relativepath: string) {
  await webdav.fileDelete(file, relativepath);
}
