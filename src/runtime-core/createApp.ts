import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp (rootComponent) {
    return {
        // TODO mount 应该可以传入一个 CSS 原则器，后面实现，先传入一个 Element 实例。
        mount(rootContainer) {
            debugger;
            // 先把组件转换成 vnode (虚拟节点)
            // 所有的逻辑操作，都会基于 vnode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}
