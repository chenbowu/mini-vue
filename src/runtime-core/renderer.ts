import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
    patch(vnode, container);
}

function patch(vnode, container) {
    // 如果 type 为 object 那么就是一个组件
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container);
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    } else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    container.append(el);
}

function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}


