enum methods {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
export interface OcapiRequestInterface {
  version: string;
  endpoint: string;
  method: methods;
  body?: string;
}
