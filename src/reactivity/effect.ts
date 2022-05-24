import { extend } from '../shared'

let activeEffect
let shouldTrack = false

export class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    // 在执行了 stop 后会将 active 设置为 false
    // 如果当前响应式对象 active 为 false, 就不进行依赖收集
    // shouldTrack 默认为 false
    if (!this.active)
      return this._fn()

    // 当 active 为 true 时，将 shouldTrack 设置为 true，
    // 并执行 fn，当 fn 中触发 get 操作时行将会进行依赖收集
    shouldTrack = true
    const result = this._fn()
    // 因为 shouldTrack 为全局变量，这里需要将 shouldTrack 重置为 false
    shouldTrack = false
    // 执行 fn 时, 触发 track 收集依赖
    return result
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop)
        this.onStop()

      this.active = false
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  // TODO Why 为什么不直接设置为 0, GC 不会自动回收吗？
  effect.deps.length = 0
}

// 定义一个依赖收集容器
const targetMap = new WeakMap()
/**
 * 依赖收集
 * @param target
 * @param key
 */
export function track(target, key) {
  // 只有在执行 effect 时调用 run 后 activeEffect 才会有值
  // 当对象 get 时，会触发 track，由于没有执行 effect 此时 activeEffect 为空。
  // 所以这里直接 return
  // if (!activeEffect) return;
  // // 执行 stop 后，active 状态为 false 不进行依赖收集
  // if (!shouldTrack) return;
  if (!isTracking())
    return

  // 根据目标对象获取所收集的依赖集
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 通过 key 获取依赖
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  trackEffects(dep)
}

export function trackEffects(dep) {
  if (dep.has(activeEffect))
    return
  // 往依赖集中添加依赖
  dep.add(activeEffect)
  // 将当前依赖集挂到依赖对象上, 这样可以通过依赖对象找到所在依赖集
  // 执行 stop 时就可以找到对应的依赖集，并且将当前依赖对象从中删除
  activeEffect.deps.push(dep)
}

export function triggerEffects(dep) {
  // 遍历执行收集的依赖
  for (const effect of dep) {
    if (effect.scheduler)
      effect.scheduler()
    else
      effect.run()
  }
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  // 如果是来自 effect 的 set 就不触发 trigger
  triggerEffects(dep)
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)

  // 先执行一次 run
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  // 将 effect 挂载到 runner 上，使 stop 能够通过 runner 找到 effect
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
