class CollectOptions {
  /**
   * @author: huimingchen, 2019-10-28
   * des: 是否自动收集错误信息,默认true，初始化可配置，后期配置无用
   */
  public static autoLogError = true;
  /**
   * @author: huimingchen, 2019-10-28
   * des: 是否自动收集promise未捕获的异常, 默认true，可配置
   */
  public static autoLogRejection = true;

  /**
   * @author: huimingchen, 2019-10-28
   * des: 是否自动记录ajax, 默认为true, 可配置
   */
  public static autoLogAjax = true;

  /**
   * @author: huimingchen, 2019-10-28
   * des: 默认的ajax 过滤函数，默认全部不过滤
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static defaultAjaxFilter = (url: string, filterCollect?: boolean): boolean => {
    return !filterCollect;
  };

  /**
   * @author: huimingchen, 2019-10-28
   * des: 是否劫持console, log error info三个函数, 默认false, 可配置
   */
  public static hijackConsole = false;

  public static mergeOptions(config: object): void {
    Object.keys(config).forEach(item => {
      CollectOptions[item] = config[item];
    });
  }
}

export default CollectOptions;
