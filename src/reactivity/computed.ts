import { ReactiveEffect } from './effect'

class ComputedImpl {
  private _getter: any
  private _dirty = true
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter) {
    this._getter = getter
    // 将 computed 中的 getter 收集到依赖中
    // 当 effect 传递了 scheduler 时，触发依赖时不会执行 run，而是执行 scheduler
    // 当依赖的响应式对象的值发送改变的时候, 执行 scheduler 将 dirty 更新为 true
    // 下次通过 value 获取结果时，将会调用 effect 的 run 重新计算结果
    this._effect = new ReactiveEffect(getter, () => {
      this._dirty = true
    })
  }

  get value() {
    // dirty 用于控制是否需要重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedImpl(getter)
}
