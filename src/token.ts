import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { DWJson, getDwJson } from './dw';
import { OcapiRequestMethod, OcapiRequestContentType } from './ocapiSettings';
export declare interface Token {
  on(event: 'authorized', listener: (token: string, expiration: number) => void): this;
  on(event: 'expired', listener: (token: string, expiration: number) => void): this;
  on(event: string, listener: Function): this;
}
export class Token extends EventEmitter {
  clientId: string;
  clientSecret: string;
  authURL: string = 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials';
  expiration: number;
  token: string;
  axios: AxiosInstance;
  timeout: NodeJS.Timeout;
  autorenew: boolean = true;
  constructor() {
    super();
    const dwJSON: DWJson = getDwJson();
    this.clientId = dwJSON.client_id;
    this.clientSecret = dwJSON.client_secret;
    this.axios = Axios.create();
  }
  async authorize(): Promise<string> {
    const { data } = await this.axios.request({
      url: this.authURL,
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
    this.expiration = new Date().getTime() + data.expires_in * 1000;
    this.emit('authorized', this.token, this.expiration);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.emit('expired', this.token, this.expiration);
      if (this.autorenew) {
        this.authorize();
      }
    }, 5 * 1000);
    return this.token;
  }
}
