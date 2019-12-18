import defaultOptions from './options';
import * as dayjs from 'dayjs';

interface LoggerItemInterface {
  parse(): object;
}

export default class LoggerItem implements LoggerItemInterface {
  private body: Map<string, any> = new Map<string, any>();

  constructor(itemParams: object) {
    Object.keys(itemParams).forEach(keys => {
      this.body.set(keys, itemParams[keys]);
    });
    defaultOptions.userId && this.body.set('userId', defaultOptions.userId);
    this.body.set('stamp', new Date().valueOf());
    this.body.set('time', dayjs().format('YYYY-MM-DD HH:mm:ss,SSS'));
  }
  parse(): object {
    //根据默认配置生成xxxx
    const params = {};
    this.body.forEach((item, keys) => {
      params[keys] = item;
    });
    return params;
  }
}
