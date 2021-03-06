import { extend, isObject } from '../shared'
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'

// 优化性能，缓存 get set
const get = createGetter()
const set = creatSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

// 这里为什么不直接定义一个 get 函数，而是使用一个高阶函数包了一层?
// 因为这里要定义一个函数签名与 Proxy get 函数签名一致的方法，并且需要在内部判断是否为 readonly
// 这时我们就能结合闭包，传递 isReadonly 使 get 函数内能使用到这个参数
// 这样不仅没有修改函数签名，还提升了可读性。
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return !isReadonly
    else if (key === ReactiveFlags.IS_READONLY)
      return isReadonly

    const res = Reflect.get(target, key)
    if (shallow)
      return res

    if (!isReadonly)
      track(target, key)

    // 嵌套对象转换成响应式对象
    // 当属性值为对象时，调用 reactive 转换成响应式对象返回出去。
    if (isObject(res))
      return isReadonly ? readonly(res) : reactive(res)

    return res
  }
}

function creatSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key, value) => {
    console.warn(`key: ${key} set 失败 因为 target 是 readonly`)
    return true
  },
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
})
