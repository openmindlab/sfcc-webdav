import chalk from 'chalk';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { DWJson } from './dw';
export class Ocapi {
  clientId: string;
  clientSecret: string;
  token: string;
  trace: boolean;
  hostname: string;
  codeVersion: string;
  axios: AxiosInstance;
  Ocapi: typeof Ocapi;
  constructor(dwJson: DWJson) {
    this.useDwJson(dwJson);
    this.token = undefined;
    this.trace = false;
    this.axios = Axios.create();
    this.axios.interceptors.request.use((request) => {
      if (this.trace) {
        console.log(`
          ${chalk.cyan('Sending Request:')}\n
          ${(chalk.cyan('baseUrl: '), request.baseURL)}\n
          ${(chalk.cyan('url: '), request.url)}\n
          ${(chalk.cyan('method: '), request.method)}\n
          ${(chalk.cyan('headers: '), JSON.stringify(request.headers))}\n
          ${(chalk.cyan('data: '), JSON.stringify(request.data))}
        `);
      }
      return request;
    });
    this.axios.interceptors.response.use((response) => {
      if (this.trace) {
        console.log(`
          ${chalk.cyan('Sending Response:')}\n
          ${(chalk.cyan('Status: '), response.status)}\n
          ${(chalk.cyan('Status Msg: '), response.statusText)}\n
          ${(chalk.cyan('Response Data: '), JSON.stringify(response.data))}
        `);
      }
      return response;
    });
  }
  async checkup() {
    if (!this.hostname) {
      console.error(
        chalk.red('Missing hostname! Cannot make create a request without it.')
      );
      throw 'Missing hostname';
    }
    if (!this.token) await this.authorize();
  }
  useDwJson(dwJson: DWJson) {
    this.clientId = dwJson.client_id;
    this.clientSecret = dwJson.client_secret;
    this.hostname = dwJson?.hostname;
    this.codeVersion = dwJson?.['code-version'];
  }
  async sendRequest(options: AxiosRequestConfig, callback?: Function) {
    await this.checkup();
    try {
      let { data } = await this.axios.request(options);
      if (callback) {
        callback(data);
      }
      return data;
    } catch (err) {
      console.error(chalk.red('Error processing request:', err));
      if (options?.headers?.Authorization) {
        if (this.trace) console.debug(`Expiring Token! ${this.token}`);
        await this.authorize();
        if (this.trace) console.debug(`New Token! ${this.token}`);
        options.headers.Authorization = `Bearer ${this.token}`;
      }
      try {
        let { data } = await Axios.request(options);
        if (callback) {
          callback(data);
        }
        return data;
      } catch (innerErr) {
        console.error(chalk.red('Error processing retry:', err));
        throw err;
      }
    }
  }
  async authorize() {
    if (!this.clientId) {
      console.error(
        chalk.red(
          'Missing Client-id! Cannot make authorize request without it.'
        )
      );
      throw 'Missing Client-id';
    }
    if (!this.clientSecret) {
      console.error(
        chalk.red(
          'Missing Client-secret! Cannot make authorize request without it.'
        )
      );
      throw 'Missing Client-secret';
    }
    const { data } = await this.axios.request({
      url:
        'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: this.clientId,
        password: this.clientSecret
      }
    });
    this.token = data.access_token;
    return this.token;
  }
}
export default Ocapi;
