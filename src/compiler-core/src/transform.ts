import { NodeTypes } from './ast'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function traverseNode(node, context) {
  const { nodeTransforms } = context
  const exitFns: any[] = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    const onExit = transform(node, context)
    if (onExit)
      exitFns.push(onExit)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context)
      break
    default:
      break
  }

  let i = exitFns.length
  while (i--)
    exitFns[i]()
}

function traverseChildren(node, context) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNode(node, context)
    }
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    },
  }
  return context
}

function createRootCodegen(root: any) {
  const { children } = root
  // TODO 目前只支持一个根节点, 且只有一个子节点或者符合类型
  // 因为在处理 transformElement 时，固定使用第一个节点当作入口节点
  // because when transformElement that codegenNode only use first of children node,

  // root 只有个一个子节点 transform 中将处理好的 codegenNode 挂载在这个子节点上
  // 所以这里直接取第一个子节点中的 codegenNode, 并挂载到 root 节点上
  const child = children[0]
  if (child.type === NodeTypes.ELEMENT)
    root.codegenNode = child.codegenNode
  else
    root.codegenNode = child
}

