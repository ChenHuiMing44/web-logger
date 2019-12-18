//埋点事件生成器

export default function(trackKey: string, updateVal: object, type?: string): object {
  //这个地方处理一下数据结构
  return {key: trackKey, val: updateVal, type};
}
