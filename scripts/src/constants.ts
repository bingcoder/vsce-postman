export enum ParamsDataType {
  String = 1,
  Number,
}

export enum ContentType {
  JSON = 'json',
  FormData = 'formData',
  UrlEncoded = 'urlEncoded',
}

export enum AuthType {
  Bearer = 'bearerToken',
  Basic = 'auth',
}

export enum ParamsConfigType {
  Params = 'params',
  Body = 'body',
  Header = 'header',
  Cookie = 'cookie',
  Auth = 'auth',
}

export const ContentTypeList = [
  ContentType.JSON,
  ContentType.FormData,
  ContentType.UrlEncoded,
];

export const defaultGroupEnv = {
  baseURL: '',
  params: [],
  cookie: [],
  headers: [],
  [AuthType.Basic]: null,
  [AuthType.Bearer]: null,
};

export const methods = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
];
