const extend = Object.assign;
const isObject = (val) => {
    return val !== null && val instanceof Object;
};
const isOn = (key) => /^on[A-Z]/.test(key);
const hasOwn = (obj, key) => obj.hasOwnProperty(key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toLocaleUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

// 定义一个依赖收集容器
const targetMap = new Map();
function triggerEffects(dep) {
    // 遍历执行收集的依赖
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    // 如果是来自 effect 的 set 就不触发 trigger
    triggerEffects(dep);
}

// 优化性能，缓存 get set
const get = createGetter();
const set = creatSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 这里为什么不直接定义一个 get 函数，而是使用一个高阶函数包了一层?
// 因为这里要定义一个函数签名与 Proxy get 函数签名一致的方法，并且需要在内部判断是否为 readonly
// 这时我们就能结合闭包，传递 isReadonly 使 get 函数内能使用到这个参数
// 这样不仅没有修改函数签名，还提升了可读性。
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 嵌套对象转换成响应式对象
        // 当属性值为对象时，调用 reactive 转换成响应式对象返回出去。
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function creatSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.warn(`key: ${key} set 失败 因为 target 是 readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return crateActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return crateActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return crateActiveObject(raw, shallowReadonlyHandlers);
}
// 增加可读性
function crateActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

function initProps(instance, rowProps) {
    instance.props = rowProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const slots = {};
    for (let key in children) {
        const value = children[key];
        slots[key] = Array.isArray(value) ? value : [value];
    }
    instance.slots = slots;
}

function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 获取组件配置
    // 组件已经被转成 vnode，type 就是组件的配置
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    // 使用者可能不会写 setup，所以这里需要做判断
    if (setup) {
        // setup 允许返回 function & object
        // 如果返回的是 function 那就是一个 render 函数
        // 如果返回的是 object 那将这个 object 注入进组件实例的上下文中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
            props: instance.props
        });
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

function emit(instance, event, ...args) {
    console.log('emit', event);
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
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
        if (isOn(key)) {
            let event = key.slice(2).toLowerCase();
            el.addEventListener(event, vnode.props[key]);
        }
        else {
            el.setAttribute(key, vnode.props[key]);
        }
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
        setupState: {},
        props: {},
        slots: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

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
    else {
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

function renderSlots(slots, name) {
    const slot = slots[name];
    if (slot) {
        return h('div', {}, slot);
    }
    // return h('div', {}, slots[name]);
}

export { createApp, h, renderSlots };
