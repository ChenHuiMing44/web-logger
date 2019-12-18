/**
 * @2019-10-28
 * @author: huimingchen
 * desc: 前端错误 报警日志自动收集
 */
import defaultOptions from './options';
import collectProducer from './collectProducer';
import * as dayjs from 'dayjs';

//日志级别 三个级别
enum CollectLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}
//日志类型
enum CollectType {
  LOG = 'LOG', //
  AJAX = 'AJAX',
  INFO = 'INFO',
  REJECT_LOSE = 'REJECT_LOSE',
  ERROR = 'error',
}

if (!('toJSON' in Error.prototype)) {
  /* eslint-disable no-extend-native */
  Object.defineProperty(Error.prototype, 'toJSON', {
    value() {
      const alt = {};
      Object.getOwnPropertyNames(this).forEach(function(key) {
        alt[key] = this[key];
      }, this);
      return alt;
    },
    configurable: true,
    writable: true,
  });
  /* eslint-enable no-extend-native */
}

export default class Collect {
  public push;
  /**
   * @author: huimingchen, 2019-10-28
   * des: xhr open方法，默认这种属性不用修改，除非把这些全关闭,手动上传等
   */
  public static xhrOpen = XMLHttpRequest.prototype.open;

  /**
   * @author: huimingchen, 2019-10-28
   * des: xhr send方法
   */
  public static xhrSend = XMLHttpRequest.prototype.send;

  /**
   * @author: huimingchen, 2019-10-31
   * des: 劫持 console.log  error  warn
   */
  public static originLog = console.log;

  public static originWarn = console.warn;

  public static originError = console.error;

  constructor(options, push) {
    this.push = push;
    defaultOptions.mergeOptions(options);
    //开启请求监听

    this.ajaxHandle();
    this.errorHandle();
    this.rejectHandle();
  }
  setDefaultOptions(options): void {
    if (options.autoLogAjax != null && options.autoLogAjax !== defaultOptions.autoLogAjax) {
      this.ajaxHandle(options.autoLogAjax);
    }
    if (options.hijackConsole !== null && options.hijackConsole !== defaultOptions.hijackConsole) {
      this.consoleHandle(options.hijackConsole);
    }
    defaultOptions.mergeOptions(options);
  }

  private rejectHandle(autoLogRejection: boolean = defaultOptions.autoLogRejection): void {
    if (autoLogRejection) {
      window.addEventListener('unhandledrejection', err => {
        this.push(
          collectProducer('unhandled_rejection', {
            promise: String(err.promise),
            type: CollectType.REJECT_LOSE,
            level: CollectLevel.WARN,
            data: err.reason,
          })
        );
      });
    }
  }
  //暂时不收集这个，容易出问题
  private consoleHandle(hijackConsole: boolean = defaultOptions.hijackConsole): void {
    if (!hijackConsole) {
      window.console.log = Collect.originLog;
      window.console.warn = Collect.originWarn;
      window.console.error = Collect.originError;
    } else {
      window.console.log = function(...arg): void {
        Collect.originLog.apply(this, ...arg);
      };
      window.console.warn = function(...arg): void {
        Collect.originWarn.apply(this, ...arg);
      };
      window.console.error = function(...arg): void {
        Collect.originError.apply(this, ...arg);
      };
    }
  }

  private errorHandle(autoLogError: boolean = defaultOptions.autoLogError): void {
    if (autoLogError) {
      window.addEventListener('error', err => {
        this.push(
          collectProducer('code_error', {
            message: err.message,
            level: CollectLevel.ERROR,
            type: CollectType.ERROR,
            data: err.error,
          })
        );
      });
    }
  }

  //解析出完整的url
  private static _resolveUrl(url: string): string {
    const link = document.createElement('a');
    link.href = url;
    return `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
  }

  ajaxHandle(autoLogAjax: boolean = defaultOptions.autoLogAjax): void {
    //如果关闭自动收集日志
    if (!autoLogAjax) {
      XMLHttpRequest.prototype.open = Collect.xhrOpen;
      XMLHttpRequest.prototype.send = Collect.xhrSend;
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // 重写 open 方法
    XMLHttpRequest.prototype.open = function(...args): void {
      this['_ajaxMethod'] = args[0];
      this['_ajaxUrl'] = Collect._resolveUrl(args[1]);
      Collect.xhrOpen.apply(this, args);
    };

    // 重写 send 方法
    XMLHttpRequest.prototype.send = function(data: string): void {
      // 请求开始时间
      const startTime = dayjs();
      const dataObj = JSON.parse(data);
      // 添加 readystatechange 事件
      this.addEventListener('readystatechange', function() {
        // 排除掉用户自定义不需要记录日志的 ajax
        if (defaultOptions.defaultAjaxFilter(this._ajaxUrl, dataObj.filterCollect)) {
          try {
            if (this.readyState === XMLHttpRequest.DONE) {
              // 请求结束时间
              const endTime = dayjs();
              // 请求耗时
              const costDuration = endTime.diff(startTime);
              const msgs = [];
              if (this.status >= 200 && this.status < 400) {
                msgs.push('接口请求成功。');
              } else {
                msgs.push('接口请求失败！');
              }
              msgs.push(
                `请求耗时：${costDuration}毫秒 URL：${this._ajaxUrl} 请求方式：${this._ajaxMethod}`
              );
              if (this._ajaxMethod.toLowerCase() === 'post') {
                msgs.push(`表单数据： ${data}`);
              }
              msgs.push(`状态码：${this.status}`);
              if (this.status >= 200 && this.status < 400) {
                that.push(
                  collectProducer('xhr_request', {
                    url: this._ajaxUrl,
                    msg: msgs,
                    type: CollectType.AJAX,
                    level: CollectLevel.INFO,
                  })
                );
              } else {
                that.push(
                  collectProducer('xhr_request', {
                    url: this._ajaxUrl,
                    msg: msgs,
                    type: CollectType.AJAX,
                    level: CollectLevel.ERROR,
                  })
                );
              }
            }
          } catch (err) {
            const msgs = [];
            msgs.push('接口请求出错！');
            msgs.push(`URL：${this._ajaxUrl} 请求方式：${this._ajaxMethod}`);
            if (this._ajaxMethod.toLowerCase() === 'post') {
              msgs.push('表单数据：', data);
            }
            msgs.push(`状态码：${this.status}`);
            msgs.push(`ERROR：${err}`);
            that.push(
              collectProducer('xhr_request', {
                url: this._ajaxUrl,
                msg: msgs,
                type: CollectType.AJAX,
                level: CollectLevel.ERROR,
              })
            );
          }
        }
      });

      Collect.xhrSend.call(this, data);
    };
  }
}
