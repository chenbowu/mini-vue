import { SharpFlags } from '../shared/SharpFlags'

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    sharpFlag: getSharpFlag(type),
  }

  if (typeof children === 'string')
    vnode.sharpFlag |= SharpFlags.TEXT_CHILDREN
  else if (Array.isArray(children))
    vnode.sharpFlag |= SharpFlags.ARRAY_CHILDREN

  // component + children === object 就是插槽
  if (vnode.sharpFlag & SharpFlags.STATEFUL_COMPONENT
     && typeof vnode.children === 'object')
    vnode.sharpFlag |= SharpFlags.SLOT_CHILDREN

  return vnode
}

function getSharpFlag(type) {
  if (typeof type === 'string')
    return SharpFlags.ELEMENT
  else
    return SharpFlags.STATEFUL_COMPONENT
}
