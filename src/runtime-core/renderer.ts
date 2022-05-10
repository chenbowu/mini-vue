import { isOn } from "../shared";
import { setupComponent } from "./component";
import { emit } from "./componentEmit";

export function render(vnode: any, container: any) {
    // 直接调用 patch 方法
    patch(vnode, container);
}
function patch(vnode: any, container: any) {
    // 判断是 vnode 类型是 component 还是 element
    const sharpFlag = vnode.sharpFlag;
    if (sharpFlag & SharpFlags.ELEMENT) {
        processElement(vnode, container);
    } else if (sharpFlag & SharpFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}

function processElement(vnode: any, container) {
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
    const el = vnode.el = document.createElement(vnode.type);
    for (let key in vnode.props) {
        if (isOn(key)) {
            let event = key.slice(2).toLowerCase();
            el.addEventListener(event, vnode.props[key]);
        } else {
            el.setAttribute(key, vnode.props[key]);
        }
    }

    const sharpFlag = vnode.sharpFlag;
    if (sharpFlag & SharpFlags.TEXT_CHILDREN) {
        el.textContent = vnode.children;
    } else if (sharpFlag & SharpFlags.ARRAY_CHILDREN) {
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
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => {}
    };
    component.emit = emit.bind(null, component) as any;
    return component;
}
function setupRenderEffect(instance: any, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

