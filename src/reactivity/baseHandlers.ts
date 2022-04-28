import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

// 优化性能，缓存 get set
const get = createGetter();
const set = creatSetter();
const readonlyGet = createGetter(true);

// 这里为什么不直接定义一个 get 函数，而是使用一个高阶函数包了一层?
// 因为这里要定义一个函数签名与 Proxy get 函数签名一致的方法，并且需要在内部判断是否为 readonly
// 这时我们就能结合闭包，传递 isReadonly 使 get 函数内能使用到这个参数
// 这样不仅没有修改函数签名，还提升了可读性。
function createGetter (isReadonly = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    }
}

function creatSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    }
}

export const mutableHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.warn(`key: ${ key } set 失败 因为 target 是 readonly`);
        return true;
    }
}