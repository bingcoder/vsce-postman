export enum ContentType {
  JSON = 1,
  FormData,
  UrlEncoded,
}

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export interface ParamsRecord {
  /** name */
  name: string;
  /** value */
  value: string | number;
  /** description */
  description: string;
  /** use */
  use: boolean;
}

export type ReceiveMessageType = 'save' | 'saveGroupEnv';
