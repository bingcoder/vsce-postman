import { ContentType } from './constants';

export interface EditableRecord {
  name: string;
  value: string;
  description: string;
  use: boolean;
}

export type EditableParams = Partial<{
  params: EditableRecord[];

  headers: EditableRecord[];
  cookie: EditableRecord[];
  // body
  urlEncoded: EditableRecord[];
  formData: EditableRecord[];
  json?: any;
  // auth
  bearerToken: string;
  auth: string;
}>;

export type EditableParamsKey = keyof EditableParams;

export interface PostmanRecord extends EditableParams {
  title: string;
  method: string;
  baseURL: string;
  url: string;
  env?: string;
  /** key */
  k: string;
  /** parent key*/
  pK: string;
}

export interface FormValues extends PostmanRecord {
  group?: EditableParams;
}

export interface Env extends EditableParams {
  key?: number;
  title: string;
  baseURL: string;
}

declare global {
  interface Window {
    monaco: any;
    prettier: any;
    prettierPlugins: any;
  }
}
