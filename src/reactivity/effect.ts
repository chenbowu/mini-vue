import { extend } from "../shared";

class ReactiveEffect {
    private _fn: any;
    deps = [];
    active = true;
    onStop?: () => void;
    constructor(fn, public scheduler?) {
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        return this._fn();
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}

function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    });
}

// 定义一个依赖收集容器
const targetMap = new Map();
/**
 * 依赖收集
 * @param target 
 * @param key 
 */
export function track(target, key) {
    // 根据目标对象获取所收集的依赖集
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    // 通过 key 获取依赖
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 只有在执行 effect 时调用 run 后 activeEffect 才会有值
    // 当对象 get 时，会触发 track，由于没有执行 effect 此时 activeEffect 为空。
    // 所以这里直接 return
    if (!activeEffect) return;
    // 往依赖集中添加依赖
    dep.add(activeEffect);
    // 反向收集 dep 
    activeEffect.deps.push(dep);
}

let activeEffect;

/**
 * 触发依赖
 * @param target 
 * @param key 
 */
export function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);

    // 遍历执行收集的依赖
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);

    // 先执行一次 run
    _effect.run();
    const runner: any = _effect.run.bind(_effect);
    // 将 effect 挂载到 runner 上，使 stop 能够通过 runner 找到 effect
    runner.effect = _effect;
    return runner;
}

export function stop(runner) {
    runner.effect.stop();
}