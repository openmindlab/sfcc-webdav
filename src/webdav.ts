#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import { Ocapi } from './ocapi';
import { getDwJson, DWJson } from './dw';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

const cwd = process.cwd();

const { log, error } = console;

export class Webdav extends Ocapi {
  Webdav: typeof Webdav;
  constructor(dwJson: DWJson) {
    super(dwJson);
  }
  toServerPath(file: string) {
    let basepath = `/cartridges/${this.codeVersion}/`;
    let cartridgepath =
      path.basename(file.substr(0, file.indexOf('/cartridge/'))) + file.substr(file.indexOf('/cartridge/'));
    return `${basepath}${cartridgepath}`;
  }

  async fileUpload(file: string, relativepath: string) {
    if (!this.hostname) {
      error(chalk.red('Missing hostname! Cannot make create a request without it.'));
      throw 'Missing hostname';
    }
    if (!this.token) await this.authorize();
    const fileStream = fs.createReadStream(file);
    fileStream.on('error', (err: any) => error(`On Upload request of file ${file}, ReadStream Error: ${err}`));
    const filesize = fs.statSync(file).size;
    fileStream.on('ready', async () => {
      const options: AxiosRequestConfig = {
        baseURL: `https://${this.hostname}`,
        url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        method: 'PUT',
        data: fileStream,
      };
      await this.sendRequest(options, () => log(chalk.cyan(`Uploaded ${relativepath} [${prettyBytes(filesize)}]`)));
    });
  }

  async fileDelete(file: string, relativepath: string) {
    if (!this.hostname) {
      error(chalk.red('Missing hostname! Cannot make create a request without it.'));
      throw 'Missing hostname';
    }
    if (!this.token) await this.authorize();
    const options: AxiosRequestConfig = {
      baseURL: `https://${this.hostname}`,
      url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      method: 'DELETE',
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
