import prettyBytes from 'pretty-bytes';
import fs, { ReadStream } from 'fs';
import { AxiosRequestConfig } from 'axios';
import { OcapiClient } from './ocapiClient';
import { OcapiRequestInterface, OcapiProtocol, OcapiRequestMethod } from './ocapiSettings';

export class SFCCUtils extends OcapiClient {
  async runJob(jobID: string, body?: any, callback?: Function) {
    const options: OcapiRequestInterface = {
      endpoint: `jobs/${jobID}/executions`,
      body: body
    };
    const response = await this.dataRequest(options);
    if (callback) {
      callback(response);
    }
    return response;
  }
  async upload(filePath: string, callback?: Function) {
    try {
      const fileStream: ReadStream = fs.createReadStream(filePath);
      fileStream.on('ready', () => {
        const options: AxiosRequestConfig = {
          baseURL: `${OcapiProtocol}://${this.dwjson.hostName}`,
          url: `/on/demandware.servlet/webdav/Sites/impex/src/instance`,
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          method: OcapiRequestMethod.PUT,
          data: fileStream
        };
        this.sendRequest(options).then(() => {
          const uploadResponse = {
            message: `Uploaded ${filePath} [${prettyBytes(fs.statSync(filePath).size)}]`,
            fileSize: fs.statSync(filePath).size
          };
          if (callback) {
            callback(uploadResponse);
          }
          return uploadResponse;
        });
      });
    } catch (error) {
      console.error(error);
    }
  }
  async importJob(fileName: string, callback?: Function) {
    const jobexecution = await this.runJob('sfcc-site-archive-import', {
      file_name: fileName
    });
    if (callback) {
      callback(jobexecution);
    }
    return jobexecution;
  }
}
const client = new SFCCUtils();
export default client;

export async function runJob(jobID: string, body?: any, callback?: Function) {
  return await client.runJob(jobID, callback);
}
export async function upload(filePath: string, callback?: Function) {
  return await client.upload(filePath, callback);
}
export async function importJob(filePath: string, callback?: Function) {
  return await client.importJob(filePath, callback);
}
