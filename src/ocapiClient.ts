import { AxiosRequestConfig } from 'axios';
import { DataResponse } from './response';
import Ocapi from './ocapi';
import { OcapiRequestInterface, OcapiRequestType, OcapiRequestMethod, OcapiDefaultVersion } from './ocapiSettings';
export class OcapiClient extends Ocapi {
  private async requestBuilder(requestOption: OcapiRequestInterface): Promise<AxiosRequestConfig> {
    await this.setup();
    const axiosOptions: AxiosRequestConfig = {
      baseURL: `https://${this.dwjson.hostName}`,
      url: `s/-/dw/${requestOption.type ? requestOption.type : OcapiRequestType.DATA}/v${
        requestOption.version ? requestOption.version : OcapiDefaultVersion
      }/${requestOption.endpoint}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      method: requestOption.method ? requestOption.method : OcapiRequestMethod.GET
    };
    if (requestOption.body) {
      axiosOptions.data = requestOption.body;
    }
    return axiosOptions;
  }
  async dataRequest(requestOption: OcapiRequestInterface, callback?: Function): Promise<DataResponse> {
    const options = requestOption;
    options.type = OcapiRequestType.DATA;
    const axiosOptions: AxiosRequestConfig = await this.requestBuilder(options);
    const response = await this.sendRequest(axiosOptions);
    if (callback) {
      callback();
    }
    return {
      data: response.data
    };
  }
  async shopRequest(requestOption: OcapiRequestInterface, callback?: Function): Promise<DataResponse> {
    const options = requestOption;
    options.type = OcapiRequestType.SHOP;
    const axiosOptions: AxiosRequestConfig = await this.requestBuilder(options);
    const response = await this.sendRequest(axiosOptions);
    if (callback) {
      callback();
    }
    return {
      data: response.data
    };
  }
}

const client = new OcapiClient();
export default client;

export async function dataRequest(requestOption: OcapiRequestInterface, callback?: Function): Promise<DataResponse> {
  return await client.dataRequest(requestOption, callback);
}
export async function shopRequest(requestOption: OcapiRequestInterface, callback?: Function): Promise<DataResponse> {
  return await client.shopRequest(requestOption, callback);
}
