import { isObject } from "../shared";
import { setupComponent } from "./component";

export function render(vnode: any, container: any) {
    // 直接调用 patch 方法
    patch(vnode, container);
}
function patch(vnode: any, container: any) {
    // 判断是 vnode 类型是 component 还是 element
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}

function processElement(vnode: any, container) {
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type);
    for (let key in vnode.props) {
        el.setAttribute(key, vnode.props[key]);
    }

    if (typeof vnode.children === "string") {
        el.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
        mountChildren(vnode, el);
    };
    container.append(el);
}

function mountChildren(vnode: any, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}

function processComponent(vnode: any, container) {
    mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}

function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupRenderEffect(instance: any, container) {
    const subTree = instance.render();
    patch(subTree, container);
}

