import { FormInstance } from 'antd';
import { useCallback } from 'react';
import { AuthType, ContentType } from '../constants';

import { EditableParamsKey, EditableRecord, FormValues } from '../type';
import type { Handler } from './requestHandler';

export const getAuthorization = (...values: any[]) => {
  for (const iterator of values) {
    for (const item of [AuthType.Bearer, AuthType.Basic]) {
      if (iterator?.[item]) {
        return {
          [item]: iterator[item],
        };
      }
    }
  }
};

export const getAuthorizationType = (value: any) => {
  for (const item of [AuthType.Bearer, AuthType.Basic]) {
    if (value?.[item]) {
      return item;
    }
  }
};

export const getContentType = (value: any) => {
  for (const item of [
    ContentType.FormData,
    ContentType.JSON,
    ContentType.UrlEncoded,
  ]) {
    if (value?.[item]) {
      return item;
    }
  }
};

const getConfig = (value?: EditableRecord[]) => {
  const map: Record<string, string> = {};
  if (Array.isArray(value)) {
    value.forEach((item) => {
      const name = item.name?.trim();
      if (item.use && name) {
        map[name] = item.value;
      }
    });
  }
  return map;
};

const existKey = (value: Record<string, string>, key: string) => {
  if (!value) return;
  return Object.keys(value).find(
    (item) => item.trim().toLowerCase() === key.toLowerCase()
  );
};

const mergeGroupParams = (
  value: FormValues,
  key: Extract<EditableParamsKey, 'params' | 'cookie' | 'headers'>
) => {
  let params = value[key] || [];
  const groupParams = value.group?.[key] || [];
  if (groupParams?.length) {
    params = [...groupParams, ...params];
  }
  return params;
};

const setCommonConfig = (
  value: FormValues,
  result: any,
  key: Extract<EditableParamsKey, 'params' | 'headers'>
) => {
  result.record[key] = value[key] || [];

  const mergedParams = mergeGroupParams(value, key);

  if (mergedParams.length) {
    result.config[key] = getConfig(mergedParams);
  }
};

const setHeader = (result: any, value: Record<string, any>) => {
  if (result.config.headers) {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result.config.headers[key] = value[key];
      }
    }
  } else {
    result.config.headers = value;
  }
};

// TODO type
const baseFields = ['method', 'env', 'baseURL', 'url', 'title'] as const;

export const baseHandler: Handler = (value, result) => {
  baseFields.forEach((field) => {
    const fieldValue = value[field]?.trim();
    if (fieldValue) {
      result.record[field] = fieldValue;
      result.config[field] = fieldValue;
    }
  });
};

export const queryStringHandler: Handler = (value, result) => {
  setCommonConfig(value, result, 'params');
};

export const headersHandler: Handler = (value, result) => {
  setCommonConfig(value, result, 'headers');
  if (!result.config.headers) {
    result.config.headers = {};
  }
};

export const bodyHandler: Handler = (value, result) => {
  if (value[ContentType.FormData]) {
    const params = value[ContentType.FormData];
    if (Array.isArray(params) && params.length) {
      result.record[ContentType.FormData] = params;
      result.config.data = getConfig(params);
      setHeader(result, { 'Content-Type': 'multipart/form-data' });
    }
  } else if (value[ContentType.UrlEncoded]) {
    const params = value[ContentType.UrlEncoded];
    if (Array.isArray(params) && params.length) {
      result.record[ContentType.UrlEncoded] = params;
      result.config.data = getConfig(params);
      setHeader(result, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    }
  } else if (value[ContentType.JSON]) {
    result.record[ContentType.JSON] = value[ContentType.JSON];
    result.config.data = value[ContentType.JSON];
    setHeader(result, { 'Content-Type': 'application/json' });
  }
};

export const cookieHandler: Handler = (value, result) => {
  if (existKey(result.config.headers, 'cookie')) return;
  const mergedCookie = mergeGroupParams(value, 'cookie');
  const cookieString: string[] = [];
  result.record.cookie = value.cookie || [];

  if (mergedCookie.length) {
    mergedCookie.forEach((item) => {
      const name = item.name?.trim();
      if (item.use && name) {
        cookieString.push(`${name}=${item.value || ''}`);
      }
    });
  }

  if (cookieString.length) {
    result.config.headers.Cookie = cookieString.join(';');
  }
};

export const authHandler: Handler = (value: any, result) => {
  if (existKey(result.config.headers, 'authorization')) return;
  const bearerToken = value.bearerToken;
  const groupBearerToken = value.group?.bearerToken;
  if (groupBearerToken) {
    result.config.headers.Authorization = groupBearerToken;
  } else if (value.group?.auth?.username && value.group?.auth?.password) {
    result.config.auth = value.group.auth;
  } else if (bearerToken) {
    result.record.bearerToken = bearerToken;
    result.config.headers.Authorization = bearerToken;
  } else if (value.auth?.username && value.auth?.password) {
    result.record.auth = value.auth;
    result.config.auth = value.auth;
  }
};

export { RequestHandler } from './requestHandler';

// TODO type
export const handleConfig = (value: any) => {
  const recordConfig: {
    record: any;
    config: any;
  } = {
    record: {},
    config: {},
  };
  [
    baseHandler,
    queryStringHandler,
    bodyHandler,
    headersHandler,
    cookieHandler,
    authHandler,
  ].forEach((handler) => {
    handler(value, recordConfig);
  });
  return recordConfig;
};

export function useFormHandler(form: FormInstance) {
  const getRecordConfig = useCallback(async () => {
    const value = await form.validateFields();
    return handleConfig(value);
  }, [form]);
  return getRecordConfig;
}
