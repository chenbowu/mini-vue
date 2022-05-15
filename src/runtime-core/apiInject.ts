import { getCurrentInstance } from './component'

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    // TODO Why 为什么要到这里重新赋值，而不是在初始化时直接将父组件的 provides 指向原型链
    // 因为只有当组件中执行了 provide 才需要一个属于自己的 provides 容器
    // 否则直接使用初始化时指向的父级 provides 就可以了
    // 算是一点优化吧...

    // 为了防止每次执行 provide 都重新给 provides 赋值
    // 在初始化时当前组件的 provides 指向了父组件的 provides
    // 所以这里可以直接判断当前组件实例的 provides 是否与父组件的 provides 指向同一个内存
    // 如果相等就创建一个新的 provides 容器，并将父组件的 provides 挂载到原型链上
    // 这里利用 js 的原型链，从而实现当前组件 provides 容器中上不存在的 key 时，可以一直向上查找
    if (provides === parentProvides)
      provides = currentInstance.provides = Object.create(parentProvides)

    provides[key] = value
  }
}

export function inject(key, defaultValue, treatDefaultAsFactory = true) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides
    if (key in parentProvides) { return parentProvides[key] }
    else if (defaultValue) {
      if (typeof defaultValue === 'function')
        return treatDefaultAsFactory ? defaultValue() : defaultValue
      return defaultValue
    }
  }
}
