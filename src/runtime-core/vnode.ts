import { SharpFlags } from '../shared/SharpFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export { createVNode as createElementVNode }

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    component: null,
    children,
    key: props && props.key,
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

export function createTextVNode(text) {
  return createVNode(Text, {}, text)
}
