import chalk from 'chalk';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import Ocapi from './ocapi';
import { OcapiRequestInterface } from './ocapiRequest';
const { log, error } = console;
export class OcapiClient extends Ocapi {
  async dataRequest(options: AxiosRequestConfig, requestOption: OcapiRequestInterface, callback?: Function) {
    if (!this.hostname) {
      error(chalk.red('Missing hostname! Cannot make create a request without it.'));
      throw 'Missing hostname';
    }
    if (!this.token) await this.authorize();
    const axiosOptions: AxiosRequestConfig = {
      baseURL: `https://${this.hostname}`,
      url: `s/-/dw/data/v${requestOption.version ? requestOption.version : '19_5'}/${requestOption.endpoint}`,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      method: requestOption.method,
    };
    if (requestOption.body) {
      axiosOptions.data = requestOption.body;
    }
    const request = await this.sendRequest(axiosOptions, callback);
    return JSON.stringify(request.data);
  }
}
