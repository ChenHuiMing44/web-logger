declare const window: Window & {$webLogger: object};
import axios from 'axios';
import defaultOptions from './options';
import collectOptions from './collect/options';
import trackOptions from './track/options';
import Collect from './collect/index';
import Track from './track/index';
import throttle from './throttle';

//单例
import queue, {Queues} from './queues';
import LoggerItem from './loggerItem';
/**
 * @2019-10-30
 * @author: huimingchen
 * desc: 获取两边weblog参数
 */
interface LoggerInterface {
  logPush(params: object, upLimit?: boolean): LoggerItem;
}

const CusPushType = 'Push';

class WebLogger implements LoggerInterface {
  constructor(options) {
    let config = options;
    if (!config) {
      throw new Error('webLog初始化错误 - 构造函数的参数不能为空！');
    }
    if (typeof config === 'string') {
      config = {
        url: options,
      };
    } else if (typeof config === 'object') {
      if (typeof options.url !== 'string') {
        throw new Error('webLog初始化错误 - 构造函数的参数 url 必须是一个字符串！');
      } else if (options.upFilter != null && typeof options.upFilter !== 'function') {
        throw new Error('webLog初始化错误 - 构造函数的参数 upFilter 必须是一个函数！');
      } else if (options.customDesc != null && typeof options.customDesc !== 'function') {
        throw new Error('webLog初始化错误 - 构造函数的参数 customDesc 必须是一个函数！');
      }
    } else {
      throw new Error('webLog初始化错误 - 构造函数的参数格式不正确！');
    }
    if (typeof config === 'string') {
      config = {url: config};
    }

    this._init(config);
  }

  private queue: Queues;

  private track: Track;

  private collect: Collect;
  /**
   * @author: huimingchen, 2019-10-29
   * des: 初始化
   */
  private _init(config: object): void {
    this.queue = queue;
    const shuntOptions = this.shuntOptions(config);
    defaultOptions.mergeOptions(shuntOptions.logShunt);
    if (defaultOptions.track) {
      this.track = new Track(shuntOptions.trackShunt, this.logPush.bind(this));
    }
    if (defaultOptions.collect) {
      this.collect = new Collect(shuntOptions.collectShunt, this.logPush.bind(this));
    }
    this.unloadBind();
    if (defaultOptions.authUpdate && defaultOptions.authUpdate >= 3) {
      setInterval(() => {
        this.update();
      }, defaultOptions.authUpdate * 1000);
    }
  }

  public getQueue(): Queues {
    return this.queue;
  }

  private unloadBind(): void {
    window.addEventListener('unload', () => {
      if (this.queue.getQueueLength()) {
        this.update();
      }
    });
  }
  /**
   * @2019-10-28
   * @author: huimingchen
   * @params: 日志参数;  upLimit:是否立即上传日志（有些情况下存在某条日志收集后需要立即上传）
   * desc: 对外暴露的日志push
   */
  logPush(params, upLimit = false): LoggerItem {
    const item: LoggerItem = new LoggerItem({type: CusPushType, ...params});
    this.queue.push(item);
    if (this.queue.getQueueLength() >= defaultOptions.upListLength || upLimit) {
      this.update();
    }
    return item;
  }

  public static login(userId: string): void {
    defaultOptions.userId = userId;
  }

  private shuntOptions(options): {collectShunt: object; trackShunt: object; logShunt: object} {
    const collectKeys = Object.keys(collectOptions);
    const trackKeys = Object.keys(trackOptions);
    const collectShunt = {},
      trackShunt = {},
      logShunt = {};
    Object.keys(options).forEach(item => {
      if (collectKeys.includes(item)) {
        collectShunt[item] = options[item];
      } else if (trackKeys.includes(item)) {
        trackShunt[item] = options[item];
      } else {
        logShunt[item] = options[item];
      }
    });
    return {
      collectShunt,
      trackShunt,
      logShunt,
    };
  }
  /**
   * @2019-10-30
   * @author: huimingchen
   * desc: 设置默认参数
   */
  public setDefaultOptions(options): void {
    const shuntOptions = this.shuntOptions(options);
    defaultOptions.mergeOptions(shuntOptions.logShunt);
    this.track.setDefaultOptions(shuntOptions.trackShunt);
    this.collect.setDefaultOptions(shuntOptions.collectShunt);
  }

  /**
   * @2019-10-18
   * @author: huimingchen
   * desc: 清空当前栈内部数据数组
   */
  emptyQueue(): void {
    this.queue.empty();
  }

  /**
   * @2019-10-28
   * @author: huimingchen
   * desc: 触发上传日志 （例如程序关闭前需要将所有的日志传输上去）
   */
  private _update(): void {
    //上传
    const queueList = this.queue.parseList();
    if (this.queue.getQueueLength() > 0) {
      const data = {
        queue: JSON.parse(JSON.stringify(queueList)),
        filterCollect: true,
      };
      //先拿到数据清空  在上传
      this.emptyQueue();
      this.send(data);
    }
    const tmpData = window.localStorage.getItem('tmpLog');
    if (tmpData) {
      const data = JSON.parse(tmpData);
      data && this.send(data);
    }
  }
  //节流  5秒
  public update = throttle(this._update, defaultOptions.throttleStamp);

  public send(data: object): void {
    console.log('开始请求，数据:', data);
    axios({
      url: defaultOptions.url,
      method: 'POST',
      data: data,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
    })
      .then((res: object) => {
        const traceId = res['data']['traceId'];
        console.log(res, traceId);
        if (!defaultOptions.traceId && traceId) {
          this.setDefaultOptions({
            traceId: traceId,
          });
        }
        console.log('请求成功');
      })
      .catch(err => {
        console.error('请求失败', err);
        //日志服务器挂了怎么办？  怎么判定挂了？ 其实还是得记录上次上传时间 做一个节流
        // this.queue.pushArr(data['queue']) 最好不要push 回去 有bug 放到缓存里面去
        window.localStorage.setItem('tmpLog', JSON.stringify(data));
      });
  }
}

window.$webLogger = WebLogger;

export default WebLogger;
