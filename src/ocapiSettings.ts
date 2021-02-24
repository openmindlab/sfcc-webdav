export enum OcapiRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
export enum OcapiRequestType {
  DATA = 'data',
  SHOP = 'shop'
}
export interface OcapiRequestInterface {
  version?: string;
  endpoint: string;
  method?: OcapiRequestMethod;
  body?: any;
  type?: OcapiRequestType;
}
export enum OcapiRequestContentType {
  APPLICATION_URL_ENCODED = 'application/x-www-form-urlencoded'
}
export const OcapiDefaultVersion: string = '19_5';
export const OcapiProtocol: string = 'https';
