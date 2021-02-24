import chalk from 'chalk';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { DWJson, getDwJson } from './dw';
import { OcapiRequestMethod, OcapiRequestContentType } from './ocapiSettings';
export class Ocapi {
  clientId: string;
  clientSecret: string;
  token: string;
  trace: boolean = process.env.NODE_ENV !== 'production';
  hostname: string;
  codeVersion: string;
  axios: AxiosInstance;
  Ocapi: typeof Ocapi;
  constructor() {
    const dwJSON: DWJson = getDwJson();
    this.useDwJson(dwJSON);
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
    if (!this.hostname) {
      console.error(chalk.red('Missing hostname! Cannot make create a request without it.'));
      throw 'Missing hostname';
    }
    if (!this.token) {
      this.token = await this.authorize();
    }
  }
  useDwJson(dwJson: DWJson) {
    this.clientId = dwJson.client_id;
    this.clientSecret = dwJson.client_secret;
    this.hostname = dwJson?.hostname;
    this.codeVersion = dwJson?.['code-version'];
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
  async authorize(): Promise<string> {
    if (!this.clientId) {
      throw new Error('Missing Client-id! Cannot make authorize request without it.');
    }
    if (!this.clientSecret) {
      throw new Error('Missing Client-secret');
    }
    const authURL: string = 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials';
    const { data } = await this.axios.request({
      url: authURL,
      method: OcapiRequestMethod.POST,
      headers: {
        'content-type': OcapiRequestContentType.APPLICATION_URL_ENCODED
      },
      auth: {
        username: this.clientId,
        password: this.clientSecret
      }
    });
    this.token = data.access_token;
    console.log(`Successfully authorized with token: ${this.token}`);
    return this.token;
  }
}
export default Ocapi;
