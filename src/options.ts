class LogOptions {
  /**
   * @author: huimingchen, 2019-10-28
   * des: 是否开始埋点功能 默认true，初始化配置，后期配置无用
   */
  public static track = true;

  /**
   * @author: huimingchen, 2019-10-28
   * des: 是否开始错误等日志自动收集，初始化配置，后期配置无用
   */
  public static collect = true;

  /**
   * @author: huimingchen, 2019-10-28
   * des: 当收集到多少条list触发上传，默认10，可配置
   */
  public static upListLength = 10;

  /**
   * @author: huimingchen, 2019-10-30
   * des: 上传的地址，其实可以不写，为了可读性，写在这吧
   */
  public static url = '';

  /**
   * @author: huimingchen, 2019-10-30
   * des: 定时自动上传，当时间大于等于 3(s)有效
   */
  public static authUpdate = 10;
  /**
   * @author: huimingchen, 2019-12-18
   * des: 节流5秒时间
   */
  public static throttleStamp = 5000;

  public static system = '';

  public static project = '';

  public static profile = '';

  /**
   * @author: huimingchen, 2019-10-31
   * des: traceId，当前应用的主线id
   */
  public static traceId = '';

  //用户登录后可以记录userId
  public static userId = '';

  public static mergeOptions(config: object): void {
    Object.keys(config).forEach(item => {
      LogOptions[item] = config[item];
    });
  }
}
export default LogOptions;
