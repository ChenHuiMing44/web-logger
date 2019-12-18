import LoggerItem from './loggerItem';
import defaultOptions from './options';

// enum LogLeave {
//   INFO = 'INFO',
//   ERROR = 'ERROR',
//   TRACE = 'TRACE',
//   WARN = 'WARN',
// }

export class Queues {
  private queue: Array<LoggerItem>;

  constructor() {
    this.queue = [];
  }
  //入栈
  push(item: LoggerItem): void {
    this.queue.push(item);
  }
  pushArr(list: Array<object>): void {
    list.forEach(item => {
      this.queue.push(new LoggerItem(item));
    });
  }

  getQueue(): Array<LoggerItem> {
    return this.queue;
  }

  getQueueLength(): number {
    return this.queue.length || 0;
  }

  empty(): void {
    this.queue.splice(0, this.queue.length);
  }

  parse(): object {
    // this.params = itemParams;
    const request = {};
    if (defaultOptions.traceId) {
      request['traceId'] = defaultOptions.traceId;
    }
    request['system'] = defaultOptions.system;

    request['project'] = defaultOptions.project;

    request['profile'] = defaultOptions.profile;

    request['level'] = 'INFO';

    request['body'] = this.queue.map(function(item: LoggerItem) {
      return item.parse();
    });
    return request;
  }
}
//单例
const queues = new Queues();
export default queues;
