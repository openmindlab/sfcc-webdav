import { AxiosRequestConfig } from 'axios';
import Ocapi from './ocapi';
import { OcapiRequestInterface } from './ocapiRequest';

export class OcapiClient extends Ocapi {
  async dataRequest(options: AxiosRequestConfig, requestOption: OcapiRequestInterface, callback?: Function) {}
}
