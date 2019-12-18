import defaultOptions from './options'
import * as dayjs from 'dayjs'

interface LoggerItemInterface {
  parse(): object;
}

enum LogLeave {
  INFO = 'INFO',
  ERROR = 'ERROR',
  TRACE = 'TRACE',
  WARN = 'WARN',
}

export default class LoggerItem implements LoggerItemInterface {
  private body: Map<string, any> = new Map<string, any>();
  // private params: object;
  private traceId: string;

  private system: string;

  private project: string;

  private level: LogLeave = LogLeave.INFO;

  private profile: string;

  constructor(itemParams: object) {
    Object.keys(itemParams).forEach(keys => {
      this.body.set(keys, itemParams[keys])
    });
    defaultOptions.userId && (this.body.set('userId', defaultOptions.userId));
    this.body.set('stamp', new Date().valueOf());
    this.body.set('time', dayjs().format('YYYY-MM-DD HH:mm:ss,SSS'));
    // this.params = itemParams;
    if(defaultOptions.traceId) {
      this.traceId = defaultOptions.traceId;
    }
    this.system = defaultOptions.system;

    this.project = defaultOptions.project;

    this.profile = defaultOptions.profile;
    if(itemParams['type'] && itemParams['type'] === 'error') {
      this.level = LogLeave.ERROR
    }
  }
  parse() {
    //根据默认配置生成xxxx
    const body = {};
    this.body.forEach((item, keys) => {
      body[keys] = item;
    });
    return {
      traceId: this.traceId,
      system: this.system,
      project: this.project,
      level: this.level,
      profile: this.profile,
      body: body
    };

  }
}
