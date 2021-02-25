import path from 'path';
import fs, { ReadStream } from 'fs';
import prettyBytes from 'pretty-bytes';
import Ocapi from './ocapi';
import { AxiosRequestConfig } from 'axios';
import { OcapiRequestMethod, OcapiProtocol } from './ocapiSettings';
import { UploadResponse } from './response';
export class Webdav extends Ocapi {
  webdavPath: string = '/on/demandware.servlet/webdav/Sites';
  /**
   * Use this method to upload files within current version cartridge path
   * @param {String} file
   */
  toServerPath(file: string) {
    let basepath: string = `/cartridges/${this.dwjson.codeVersion}/`;
    let cartridgepath: string = '';
    if (file.indexOf('/cartridge/') >= 0) {
      cartridgepath =
        path.basename(file.substr(0, file.indexOf('/cartridge/'))) + file.substr(file.indexOf('/cartridge/'));
    } else {
      cartridgepath = path.basename(file);
    }
    return `${basepath}${cartridgepath}`;
  }
  async fileUpload(file: string, relativepath: string, callback?: Function): Promise<UploadResponse> {
    await this.setup();
    return new Promise((resolve, reject) => {
      const fileStream: ReadStream = fs.createReadStream(file);
      fileStream.on('ready', () => {
        const filesize: number = fs.statSync(file).size;
        const options: AxiosRequestConfig = {
          baseURL: `${OcapiProtocol}://${this.dwjson.hostName}`,
          url: `${this.webdavPath}${relativepath}`,
          method: OcapiRequestMethod.PUT,
          data: fileStream
        };
        try {
          this.sendRequest(options).then(() => {
            const uploadResponse: UploadResponse = {
              message: `Uploaded ${relativepath} [${prettyBytes(filesize)}]`,
              fileSize: filesize
            };
            if (callback) {
              callback(uploadResponse);
            }
            resolve(uploadResponse);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  async fileDelete(file: string, relativepath: string, callback?: Function) {
    await this.setup();
    const options: AxiosRequestConfig = {
      baseURL: `${OcapiProtocol}://${this.dwjson.hostName}`,
      url: `${this.webdavPath}${relativepath}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      method: OcapiRequestMethod.DELETE
    };
    await this.sendRequest(options).then(() => {
      const deleteResponse = {
        message: `Deleted ${relativepath}`
      };
      if (callback) {
        callback(deleteResponse);
      }
      return deleteResponse;
    });
  }
}

const webdav = new Webdav();
export default webdav;
/**
 * Upload a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export async function fileUpload(file: string, relativepath: string, callback?: Function) {
  await webdav.fileUpload(file, relativepath, callback);
}
/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export async function fileDelete(file: string, relativepath: string, callback?: Function) {
  await webdav.fileDelete(file, relativepath, callback);
}
