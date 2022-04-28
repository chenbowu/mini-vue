import { mutableHandler, readonlyHandler } from './baseHandlers';

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
    return crateActiveObject(raw, mutableHandler);
}

export function readonly(raw) {
    return crateActiveObject(raw, readonlyHandler);
}

// 增加可读性
function crateActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

export function isReactive(value) {
    // 如果传过来的是不 Proxy 对象，那么就不会有这个属性，结果会变成返回 undefined
    // 所以这里可以通过 !! 将结果强制转为 bool 类型
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}