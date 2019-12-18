import LoggerItem from './loggerItem';

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

  parseList(): Array<object> {
    return this.queue.map(item => {
      return item.parse();
    });
  }
}
//单例
const queues = new Queues();
export default queues;
