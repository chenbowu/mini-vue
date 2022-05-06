import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根据根组件 生成虚拟节点（vnode)
            // 后续所有操作都在 vnode 上进行
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

