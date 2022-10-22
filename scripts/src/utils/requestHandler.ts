import type { FormInstance } from 'antd';
import { FormValues } from '../type';

type Result = {
  config: any;
  record: any;
};

export type Handler = (value: FormValues, result: Result) => any;

export class RequestHandler {
  private readonly handlerList: Handler[] = [];
  private readonly result: Result = {
    record: {},
    config: {},
  };
  // TODO type
  use(...handlers: Handler[]) {
    this.handlerList.push(...handlers);
  }

  async getValueFromForm(form: FormInstance) {
    const res = await form.validateFields();
    this.handlerList.forEach((handler) => {
      handler(res, this.result);
    });
    return this.result;
  }
}
