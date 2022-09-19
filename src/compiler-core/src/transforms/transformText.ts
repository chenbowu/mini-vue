import { NodeTypes } from '../ast'

export function transformText(node) {
  return () => {
    const children = node.children
    let currentContainer
    if (node.type === NodeTypes.ELEMENT) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                }
                children[i] = currentContainer
                currentContainer.children.push(' + ', next)
                children.splice(j, 1)
                j--
              }
            }
            else {
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}

function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}
