import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props);
    // TODO 后面再实现
    // init slots
    setupStatefulComponent(instance);
}


function setupStatefulComponent(instance: any) {
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
        const setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}

function handleSetupResult(instance, setupResult: any) {
    if (setupResult instanceof Object) {
        instance.setupState = setupResult;
    } else if (setupResult instanceof Function) {

    }
    // 设置 render
    finishSetupComponent(instance);
}

function finishSetupComponent(instance: any) {
    const Component = instance.type;
    // 将组件上的 render 函数,挂载到实例上
    if (Component.render) {
        instance.render = Component.render;
    }
}