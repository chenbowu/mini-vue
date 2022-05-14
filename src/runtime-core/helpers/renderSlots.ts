import { Fragment, createVNode } from '../vnode'

/**
 * Convert children to vnode
 * @param slots
 * @param name
 * @param props
 */
export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function')
      return createVNode(Fragment, {}, slot(props))
  }
}
