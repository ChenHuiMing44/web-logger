class TrackOptions {
  /**
   * @author: huimingchen, 2019-10-30
   * des: 是否开启默认日志收集  默认为true, 可关闭
   */
  public static autoCollectTrack = true;

  /**
   * @author: huimingchen, 2019-10-30
   * des: 埋点点击事件的key,将监听dom的点击事件,当dom上有该属性则监听
   */
  public static tapTrackKey = 'log_track';

  /**
   * @author: huimingchen, 2019-10-30
   * des: 埋点点击事件的key,将监听dom的点击事件,当dom上有该属性则监听
   */
  public static inputTrackKey = 'log_track';
  /**
   * @author: huimingchen, 2019-10-30
   * des: 是否监听页面跳转，初始化进入也将监听
   */
  public static autoListenRouterEach = true;

  /**
   * @author: huimingchen, 2019-10-30
   * des: 是都携带custom info; 默认为true,可关闭
   */
  public static withCustomObj = true;

  /**
   * @author: huimingchen, 2019-10-30
   * des: 默认的defaultCustomObj
   */
  public static defaultCustomObj = {};

  public static mergeOptions(config: object): void {
    Object.keys(config).forEach(item => {
      TrackOptions[item] = config[item];
    });
  }
}

export default TrackOptions;
