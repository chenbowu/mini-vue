class ReactiveEffect {
    private _fn: any;
    constructor(fn) {
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        this._fn();
    }
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
    // 往依赖集中添加依赖
    dep.add(activeEffect);
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
        effect.run();
    }
}

export function effect(fn) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();
}