import defaultOptions from './options';
import trackProducer from './trackProducer';
//埋点 处理

enum TrackType {
  TAP = 'tap',
  INPUT = 'input',
  ROUTE_ENTER = 'routeEnter',
  ROUTE_LEAVE = 'routeLeave',
  EVENT_PUSH = 'eventPush',
}

class Track {
  /**
   * @2019-10-28
   * @author: huimingchen
   * desc: 外面的对面提供两个属性，一个track 一个 collect
   * 初始化的时候必须传递过来options 和 push方法
   */
  constructor(options, push) {
    Object.assign(defaultOptions, options);
    this.push = push;

    //注册监听
    if (defaultOptions.autoCollectTrack) {
      document.addEventListener('click', this.tapHandle.bind(this));
      document.addEventListener('focusin', Track.inputFocusinHandle.bind(this));
      document.addEventListener('focusout', this.inputFocusoutHandle.bind(this));
    }
    if (defaultOptions.autoListenRouterEach) {
      this.listenerRouteEach();
    }
  }

  public push;

  setDefaultOptions(options): void {
    if (
      typeof options.autoListenRouterEach === 'boolean' &&
      defaultOptions.autoListenRouterEach !== options.autoListenRouterEach
    ) {
      this.toggleAutoRouteListener();
    }
    if (
      typeof options.autoCollectTrack === 'boolean' &&
      defaultOptions.autoCollectTrack !== options.autoCollectTrack
    ) {
      this.toggleAutoListener();
    }
    //如果key值发生变化！！ 嗯  这个值不能变化
    // Object.assign(defaultOptions, options);
    defaultOptions.mergeOptions(options);
  }
  /**
   * @2019-10-28
   * @author: huimingchen
   * desc: 切换是否开启自动监听 参数为boolean，不传默认给开始的非值
   */
  toggleAutoListener(open?: boolean): void {
    let toggleVal = open;
    if (toggleVal == null) {
      toggleVal = !defaultOptions.autoCollectTrack;
    }
    if (typeof toggleVal === 'boolean' && toggleVal !== defaultOptions.autoCollectTrack) {
      if (defaultOptions.autoCollectTrack) {
        document.removeEventListener('focusin', Track.inputFocusinHandle.bind(this));
        document.removeEventListener('focusout', this.inputFocusoutHandle.bind(this));
        document.removeEventListener('click', this.tapHandle.bind(this));
      } else {
        document.addEventListener('focusin', Track.inputFocusinHandle.bind(this));
        document.addEventListener('focusout', this.inputFocusoutHandle.bind(this));
        document.addEventListener('click', this.tapHandle.bind(this));
      }
      defaultOptions.autoCollectTrack = toggleVal;
    }
  }
  /**
   * @2019-10-31
   * @author: huimingchen
   * @params: key 事件名  val: object
   */
  public pushEvent(key: string, val: object): void {
    this.push(trackProducer(key, val, TrackType.EVENT_PUSH));
  }

  public toggleAutoRouteListener(open?: boolean): void {
    let toggleVal = open;
    if (toggleVal == null) {
      toggleVal = !defaultOptions.autoListenRouterEach;
    }
    if (typeof toggleVal === 'boolean' && toggleVal !== defaultOptions.autoListenRouterEach) {
      if (defaultOptions.autoListenRouterEach) {
        this.removeRouteEach();
      } else {
        this.listenerRouteEach();
      }
      defaultOptions.autoListenRouterEach = toggleVal;
    }
  }
  private tapHandle(event): void {
    const dealTapItem = (node, event?): void => {
      const nodeAttribute = node.getAttribute(defaultOptions.tapTrackKey);
      if (nodeAttribute) {
        // 上传埋点
        const eventKey = nodeAttribute;
        const updateVal = {
          elementId: node.id,
          elementType: node.nodeName,
          optionsStamp: Math.ceil(event.timeStamp),
        };
        this.push(trackProducer(eventKey, updateVal, TrackType.TAP));
      }
    };
    if (!event.path) {
      event.target.nodeName !== 'INPUT' && dealTapItem(event.target);
    } else {
      for (let i = 0; i < event.path.length; i++) {
        const node = event.path[i];
        if (node.tagName === 'BODY') break;
        node.tagName !== 'INPUT' && dealTapItem(node, event);
      }
    }
  }
  private static inputFocusinHandle(event): void {
    if (event.target.nodeName === 'INPUT') {
      const nodeAttribute = event.target.getAttribute(defaultOptions.inputTrackKey);
      if (nodeAttribute) {
        event.target.focusTimeStamp = event.timeStamp;
      }
    }
  }
  private inputFocusoutHandle(event): void {
    if (event.target.nodeName === 'INPUT') {
      const nodeAttribute = event.target.getAttribute(defaultOptions.inputTrackKey);
      if (nodeAttribute) {
        const sensorKey = nodeAttribute;
        let eventDuration = Math.ceil(event.timeStamp - event.target.focusTimeStamp);
        if (!eventDuration || eventDuration < 0) {
          eventDuration = 0;
        }
        //上传三个值
        const updateVal = {
          elementId: event.target.id,
          elementType: event.target.nodeName,
          value: event.target.value,
          eventDuration,
        };
        this.push(trackProducer(sensorKey, updateVal, TrackType.INPUT));
      }
    }
  }
  private listenerRouteEach(): void {
    this.push(
      trackProducer('pageEnter', {url: location.href, title: document.title}, TrackType.ROUTE_ENTER)
    );
  }

  private removeRouteEach(): void {
    this.push(
      trackProducer(
        'demo_event',
        {url: location.href, title: document.title},
        TrackType.ROUTE_LEAVE
      )
    );
  }
}

export default Track;
