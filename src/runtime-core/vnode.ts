import { isObject } from "../shared";

export function createVNode(type, props?, children?) {
    const vnode = {
        type, 
        props,
        children,
        el: null,
        sharpFlag: getSharpFlag(type)
    }

    if (typeof children === 'string') {
        vnode.sharpFlag |= SharpFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.sharpFlag |= SharpFlags.ARRAY_CHILDREN;
    }
    return vnode;
}

function getSharpFlag(type) {
    if (typeof type === 'string') {
        return SharpFlags.ELEMENT;
    } else {
        return SharpFlags.STATEFUL_COMPONENT;
    }
}