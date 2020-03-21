#!/usr/bin/env node
/* eslint-disable camelcase */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
// https://github.com/request/request/issues/3142
// const request = require('request-promise-native');
const { request } = require('axios');

const cwd = process.cwd();

const { log, error } = console;

function getDwJson() {
  let dwjsonpath = path.join(cwd, 'dw.json');
  if (!fs.existsSync(dwjsonpath)) {
    error(chalk.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }

  const dwjson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), 'UTF-8'));
  if (!dwjson.client_id || !dwjson.client_secret) {
    error(chalk.red(`Missing client_id/client_secret in ${dwjsonpath}\n`));
    throw new Error(`Missing client_id/client_secret in ${dwjsonpath}`);
  }
  return dwjson;
}



class Webdav {
  client_id: string;
  client_secret: string;
  token: string;
  trace: boolean;
  hostname: string;
  constructor({ client_id, client_secret, hostname }) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.hostname = hostname;
    this.token = undefined;
    this.trace = true;
  }

  async authorize() {
    const { data } = await request({
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

  async sendRequest(options: object, callback: Function) {
    try {
      let { data, status, statusText } = await request(options);
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
        let { data, status, statusText } = await request(options);
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
}

const webdavInstance = new Webdav(getDwJson());

async function fileUpload(file: string, relativepath: string) {
  if (!webdavInstance.token) await webdavInstance.authorize();
  const fileStream = fs.createReadStream(file);
  fileStream.on('error', (err: any) => error(`On Upload request of file ${file}, ReadStream Error: ${err}`));
  await fileStream.on('ready', async () => {
    const options = {
      baseURL: `https://${webdavInstance.hostname}`,
      url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
      headers: {
        Authorization: `Bearer ${webdavInstance.token}`
      },
      method: 'PUT',
      data: fileStream
    };
    await webdavInstance.sendRequest(options, () => log(chalk.cyan(`Uploaded ${relativepath}`)));
  })
}


async function fileDelete(file: string, relativepath: string) {
  if (!webdavInstance.token) await webdavInstance.authorize();
  const options = {
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
