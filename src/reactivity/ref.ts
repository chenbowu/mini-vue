import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class RefImpl {
  private _value: any
  dep = new Set()
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
  }

  get value() {
    if (isTracking())
      trackEffects(this.dep)

    return this._value
  }

  set value(newValue) {
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get: (target, key) => {
      return unRef(Reflect.get(target, key))
    },
    set: (target, key, value) => {
      // 如果目标属性为 ref 对象，且传入的值不是一个 ref 对象，就通过 value 属性进行赋值
      // isRef(target[key]) && isRef(value) => 直接赋值
      // isRef(target[key]) && !isRef(value) => 通过 value 属性赋值
      // !isRef(target[key]) => 直接赋值
      if (isRef(target[key]) && !isRef(value))
        return target[key].value = value
      else
        return Reflect.set(target, key, value)
    },
  })
}
