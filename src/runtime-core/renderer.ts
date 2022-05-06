import { isObject } from "../shared";

export function render(vnode: any, container: any) {
    // 直接调用 patch 方法
    patch(vnode, container);
}
function patch(vnode: any, container: any) {
    // 判断是 vnode 类型是 component 还是 element
    if (typeof vnode.type === "string") {
        processElement(vnode);
    } else if (isObject(vnode.type)) {
        processComponent(vnode);
    }
}

function processElement(vnode: any) {
    throw new Error("Function not implemented.");
}

function processComponent(vnode: any) {
    const instance = createComponentInstance(vnode);
}

function createComponentInstance(vnode: any) {
    const instance = {
        vnode
    };
    return instance;
}

