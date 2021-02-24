#!/usr/bin/env node
import path from 'path';
import fs, { ReadStream } from 'fs';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import { Ocapi } from './ocapi';
import { readStream } from './files';
import { AxiosRequestConfig } from 'axios';
import { OcapiRequestMethod, OcapiProtocol } from './ocapiSettings';
export class Webdav extends Ocapi {
  Webdav: typeof Webdav;
  webdavPath: string = '/on/demandware.servlet/webdav/Sites';
  constructor() {
    super();
  }
  /**
   * Use this method to upload files within current version cartridge path
   * @param {String} file
   */
  toServerPath(file: string) {
    let basepath: string = `/cartridges/${this.codeVersion}/`;
    let cartridgepath: string = '';
    if (file.indexOf('/cartridge/') >= 0) {
      cartridgepath =
        path.basename(file.substr(0, file.indexOf('/cartridge/'))) +
        file.substr(file.indexOf('/cartridge/'));
    } else {
      cartridgepath = path.basename(file);
    }
    return `${basepath}${cartridgepath}`;
  }
  async fileUpload(file: string, relativepath: string, callback?: Function) {
    await this.checkup();
    const fileStream: ReadStream = fs.createReadStream(file);
    fileStream.on('ready', () => {
      const filesize: number = fs.statSync(file).size;
      const options: AxiosRequestConfig = {
        baseURL: `${OcapiProtocol}://${this.hostname}`,
        url: `${this.webdavPath}${relativepath}`,
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        method: OcapiRequestMethod.PUT,
        data: fileStream
      };
      try {
        const response = this.sendRequest(options, () =>
          console.log(
            chalk.cyan(`Uploaded ${relativepath} [${prettyBytes(filesize)}]`)
          )
        );
        if (callback) {
          callback(response);
        }
        return response;
      } catch (error) {
        console.error(error);
      }
    });
  }
  async fileDelete(file: string, relativepath: string, callback?: Function) {
    const options: AxiosRequestConfig = {
      baseURL: `${OcapiProtocol}://${this.hostname}`,
      url: `${this.webdavPath}${relativepath}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      method: OcapiRequestMethod.DELETE
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

const webdav = new Webdav();
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
