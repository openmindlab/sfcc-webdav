import chalk from 'chalk';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { DWInstance, dwinstance } from './dw';
import { tokenstring } from './token';
export default class Ocapi {
  trace: boolean = process.env.NODE_ENV !== 'production';
  axios: AxiosInstance;
  dwjson: DWInstance;
  token: string;
  constructor() {
    this.axios = Axios.create();
    if (this.trace) {
      this.axios.interceptors.request.use((request) => {
        console.log(`
          ${chalk.yellow('---Sending Request---')}\n
          ${request.baseURL ? chalk.cyan('baseUrl: ') + request.baseURL + '\n' : ''}
          ${chalk.cyan('url: ') + request.url}\n
          ${chalk.cyan('method: ') + request.method}\n
          ${chalk.cyan('headers: ') + JSON.stringify(request.headers)}\n
          ${request.data ? chalk.cyan('data: ') + JSON.stringify(request.data) : ''}
        `);
        return request;
      });
      this.axios.interceptors.response.use((response) => {
        console.log(`
          ${chalk.yellow('--Getting Response---')}\n
          ${chalk.cyan('Status: ') + response.status}\n
          ${chalk.cyan('Status Msg: ') + response.statusText}\n
          ${chalk.cyan('Response Data: ') + JSON.stringify(response.data)}
        `);
        return response;
      });
    }
  }
  async setup() {
    if (!this.dwjson) {
      this.dwjson = await dwinstance();
    }
    if (!this.token) {
      this.token = await tokenstring();
    }
  }
  async requestOptions(options: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    await this.setup();
    const defaultOptions: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    };
    return Object.assign({}, defaultOptions, options);
  }
  async sendRequest(options: AxiosRequestConfig, callback?: Function) {
    const requestOptions: AxiosRequestConfig = await this.requestOptions(options);
    console.log(requestOptions);
    try {
      const { data } = await this.axios.request(requestOptions);
      if (callback) {
        callback(data);
      }
      return data;
    } catch (err) {
      console.error(err);
    }
  }
}
