export default function throttle(fn, delay = 300): Function {
  let timer; // 节流的计时器
  let startTime = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function(...args: any[]): void {
    const currentTime = Date.now();
    const remaining = delay - (currentTime - startTime);
    // 保存函数调用时的上下文和参数，传递给func
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    clearTimeout(timer);
    // 剩余时间为0时，立即执行，保证第一次执行
    if (remaining <= 0) {
      fn.call(context, context, ...args);
      startTime = Date.now();
    } else {
      // 针对最后一次时，通过倒计时结束后执行
      timer = setTimeout(() => {
        fn.call(context, context, ...args); // 这里也是上个坑
      }, remaining);
    }
  };
}
