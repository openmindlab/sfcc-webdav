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
  hostname: string
}
class Webdav {
  private client_id: string;
  private client_secret: string;
  private token: string;
  private trace: boolean;
  private hostname: string;
  constructor(dwJson: DwJson) {
    this.client_id = dwJson?.client_id || dwJson?.['client-id'];
    this.client_secret = dwJson?.client_secret || dwJson?.['client-secret'];
    this.hostname = dwJson?.hostname;
    this.token = undefined;
    this.trace = true;
  }

  async authorize() {
    const { data } = await Axios.request({
      url: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: this.client_id,
        password: this.client_secret
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
        if (this.trace) console.debug(`Expiring Token! ${webdavInstance.token}`)
        await webdavInstance.authorize();
        if (this.trace) console.debug(`New Token! ${webdavInstance.token}`)
        options.headers.Authorization = `Bearer ${webdavInstance.token}`;
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
}

const webdavInstance = new Webdav(getDwJson());

async function fileUpload(file: string, relativepath: string) {
  await webdavInstance.fileUpload(file, relativepath);
}


async function fileDelete(file: string, relativepath: string) {
  if (!webdavInstance.token) await webdavInstance.authorize();
  const options: AxiosRequestConfig = {
    baseURL: `https://${webdavInstance.hostname}`,
    url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
    headers: {
      Authorization: `Bearer ${webdavInstance.token}`
    },
    method: 'DELETE'
  };
  await webdavInstance.sendRequest(options, () => log(chalk.cyan(`Deleted ${relativepath}`)));
}

module.exports = {
  fileUpload: fileUpload,
  fileDelete: fileDelete
};
