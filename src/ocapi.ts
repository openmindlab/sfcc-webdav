import chalk from 'chalk';
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { DWJson } from './dw';
const { log, error } = console;
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
        log(chalk.cyan('Sending Request:'));
        log(chalk.cyan('baseUrl: '), request.baseURL);
        log(chalk.cyan('url: '), request.url);
        log(chalk.cyan('method: '), request.method);
        log(chalk.cyan('headers: '), JSON.stringify(request.headers));
        log(chalk.cyan('data: '), JSON.stringify(request.data));
      }
      return request;
    });
    this.axios.interceptors.response.use((response) => {
      if (this.trace) {
        log(chalk.cyan('Sending Response:'));
        log(chalk.cyan('Status: '), response.status);
        log(chalk.cyan('Status Msg: '), response.statusText);
        log(chalk.cyan('Response Data: '), JSON.stringify(response.data));
      }
      return response;
    });
  }
  useDwJson(dwJson: DWJson) {
    this.clientId = dwJson?.client_id || dwJson?.['client-id'];
    this.clientSecret = dwJson?.client_secret || dwJson?.['client-secret'];
    this.hostname = dwJson?.hostname;
    this.codeVersion = dwJson?.['code-version'];
  }
  async authorize() {
    if (!this.clientId) {
      error(chalk.red('Missing Client-id! Cannot make authorize request without it.'));
      throw 'Missing Client-id';
    }
    if (!this.clientSecret) {
      error(chalk.red('Missing Client-secret! Cannot make authorize request without it.'));
      throw 'Missing Client-secret';
    }
    const { data } = await this.axios.request({
      url: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: this.clientId,
        password: this.clientSecret,
      },
    });
    this.token = data.access_token;
  }
}
export default Ocapi;
