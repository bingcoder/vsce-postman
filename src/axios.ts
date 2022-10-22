import * as axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import * as vscode from 'vscode';
import { Method } from './type';

const hasBodyMethod = [Method.POST];

const instance = (axios as unknown as axios.AxiosStatic).create();

const requestInfo: Record<string, { currentRequestId: number; cancel?: any }> =
  {};

export async function request(message: any, panel: vscode.WebviewPanel) {
  console.log('message', message);

  let startTime = +new Date();
  const { requestId, k, ...requestConfig } = message;
  if (requestInfo[k]) {
    requestInfo[k].currentRequestId = requestId;
  } else {
    requestInfo[k] = { currentRequestId: requestId };
  }
  let value: any = {
    requestId,
  };

  try {
    const config: AxiosRequestConfig = {
      timeout: 30 * 1000,
      ...requestConfig,
      validateStatus(status) {
        return status >= 200 && status <= 599;
      },
    };

    const res = await instance.request(config);
    console.log('res', res);

    value = {
      ...value,
      ...res,
    };
  } catch (error: any) {
    value = {
      ...value,
      data: error.message,
      statusText: 'Error',
    };
  } finally {
    if (!panel || requestId !== requestInfo[k].currentRequestId) return;
    panel.webview.postMessage({
      source: 'vsce-postman',
      type: 'response',
      value: {
        ...value,
        spend: +new Date() - startTime,
      },
    });
  }
}
