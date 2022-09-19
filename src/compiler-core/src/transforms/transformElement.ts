import { NodeTypes } from '../ast'
import { CREATE_ELEMENT_VNODE, helperMapName } from '../runtimeHelpers'

export function transformElement(node, context) {
  return () => {
    if (node.type === NodeTypes.ELEMENT) {
      context.helper(helperMapName[CREATE_ELEMENT_VNODE])
      const { tag, props, children } = node

      // TODO ROOT 和 ELEMENT 需要创建一个 codegenNode, 入口节点
      // 将所有子节点封装 codegenNode 中，对次节点类型进行特殊处理
      // 使其 createVNode 时可传入 vnode 数组
      const vnodeTag = `"${tag}"`
      const vnodeProps = props
      const vnodeChildren = children[0]

      const vnodeElement = {
        type: NodeTypes.ELEMENT,
        tag: vnodeTag,
        props: vnodeProps,
        children: vnodeChildren,
      }

      node.codegenNode = vnodeElement
    }
  }
}
