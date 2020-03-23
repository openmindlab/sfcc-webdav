#!/usr/bin/env node
/* eslint-disable camelcase */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
// https://github.com/request/request/issues/3142
// const request = require('request-promise-native');
import Axios, { AxiosRequestConfig } from 'axios';

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
  private clientId: string;
  private clientSecret: string;
  private token: string;
  private trace: boolean;
  private hostname: string;
  Webdav: typeof Webdav;
  private codeVersion: string;
  constructor(dwJson: DwJson) {
    this.useDwJson(dwJson);
    this.token = undefined;
    this.trace = true;
  }

  useDwJson(dwJson: DwJson) {
    this.clientId = dwJson?.client_id || dwJson?.['client-id'];
    this.clientSecret = dwJson?.client_secret || dwJson?.['client-secret'];
    this.hostname = dwJson?.hostname;
    this.codeVersion = dwJson?.['code-version'];
  }

  async authorize() {
    const { data } = await Axios.request({
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
      let { data, status, statusText } = await Axios.request(options);
      if (this.trace) console.debug(`On request data: ${data}`)
      if (this.trace) console.debug(`On request status: ${status}`)
      if (this.trace) console.debug(`On request status text: ${statusText}`)
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
        let { data, status, statusText } = await Axios.request(options);
        if (this.trace) console.debug(`On request retry data: ${data}`)
        if (this.trace) console.debug(`On request retry status: ${status}`)
        if (this.trace) console.debug(`On request retry status text: ${statusText}`)
        callback(data);
      } catch (innerErr) {
        error(chalk.red('Error processing retry:', err));
        throw err;
      }
    }
  }

  async fileUpload(file: string, relativepath: string) {
    if (!this.token) await this.authorize();
    const fileStream = fs.createReadStream(file);
    fileStream.on('error', (err: any) => error(`On Upload request of file ${file}, ReadStream Error: ${err}`));
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
      await this.sendRequest(options, () => log(chalk.cyan(`Uploaded ${relativepath}`)));
    })
  }

  async fileDelete(file: string, relativepath: string) {
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
