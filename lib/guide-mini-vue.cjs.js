'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function setupComponent(instance) {
    // TODO 后面再实现
    // init props
    // init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 获取组件配置
    // 组件已经被转成 vnode，type 就是组件的配置
    const Component = instance.type;
    instance.proxy = new Proxy({}, {
        get(target, key) {
            const { setupState } = instance;
            if (key in setupState) {
                return setupState[key];
            }
            if (key === "$el") {
                return instance.vnode.el;
            }
        }
    });
    const { setup } = Component;
    // 使用者可能不会写 setup，所以这里需要做判断
    if (setup) {
        // setup 允许返回 function & object
        // 如果返回的是 function 那就是一个 render 函数
        // 如果返回的是 object 那将这个 object 注入进组件实例的上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (setupResult instanceof Object) {
        instance.setupState = setupResult;
    }
    // 设置 render
    finishSetupComponent(instance);
}
function finishSetupComponent(instance) {
    const Component = instance.type;
    // 将组件上的 render 函数,挂载到实例上
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // 直接调用 patch 方法
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断是 vnode 类型是 component 还是 element
    const sharpFlag = vnode.sharpFlag;
    if (sharpFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (sharpFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    for (let key in vnode.props) {
        el.setAttribute(key, vnode.props[key]);
    }
    const sharpFlag = vnode.sharpFlag;
    if (sharpFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = vnode.children;
    }
    else if (sharpFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

const isObject = (val) => {
    return val !== null && val instanceof Object;
};

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        sharpFlag: getSharpFlag(type)
    };
    if (typeof children === 'string') {
        vnode.sharpFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.sharpFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getSharpFlag(type) {
    if (typeof type === 'string') {
        return 1 /* ELEMENT */;
    }
    else if (isObject(type)) {
        return 2 /* STATEFUL_COMPONENT */;
    }
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根据根组件 生成虚拟节点（vnode)
            // 后续所有操作都在 vnode 上进行
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
