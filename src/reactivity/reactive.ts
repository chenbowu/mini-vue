import { mutableHandler, readonlyHandler } from './baseHandlers';

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