#!/usr/bin/env node
import path from 'path';
import fs, { ReadStream } from 'fs';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import { Ocapi } from './ocapi';
import { getDwJson, DWJson } from './dw';
import { readStream } from './files';
import { AxiosRequestConfig } from 'axios';
export class Webdav extends Ocapi {
  Webdav: typeof Webdav;
  constructor(dwJson: DWJson) {
    super(dwJson);
  }
  toServerPath(file: string) {
    let basepath = `/cartridges/${this.codeVersion}/`;
    let cartridgepath =
      path.basename(file.substr(0, file.indexOf('/cartridge/'))) +
      file.substr(file.indexOf('/cartridge/'));
    return `${basepath}${cartridgepath}`;
  }
  async fileUpload(file: string, relativepath: string, callback?: Function) {
    const fileStream = await readStream(file);
    const filesize: number = fs.statSync(file).size;
    const options: AxiosRequestConfig = {
      baseURL: `https://${this.hostname}`,
      url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      method: 'PUT',
      data: fileStream
    };
    const response = await this.sendRequest(options, () =>
      console.log(
        chalk.cyan(`Uploaded ${relativepath} [${prettyBytes(filesize)}]`)
      )
    );
    if (callback) {
      callback(response);
    }
    return response;
  }
  async fileDelete(file: string, relativepath: string, callback?: Function) {
    const options: AxiosRequestConfig = {
      baseURL: `https://${this.hostname}`,
      url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      method: 'DELETE'
    };
    const response = await this.sendRequest(options, () =>
      console.log(chalk.cyan(`Deleted ${relativepath}`))
    );
    if (callback) {
      callback(response);
    }
    return response;
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
export async function fileUpload(
  file: string,
  relativepath: string,
  callback?: Function
) {
  await webdav.fileUpload(file, relativepath, callback);
}

/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export async function fileDelete(
  file: string,
  relativepath: string,
  callback?: Function
) {
  await webdav.fileDelete(file, relativepath, callback);
}
