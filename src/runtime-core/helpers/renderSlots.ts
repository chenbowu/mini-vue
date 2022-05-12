import { h } from '../h'

export function renderSlots(slots, name) {
  const slot = slots[name]
  if (slot)
    return h('div', {}, slot)

  // return h('div', {}, slots[name]);
}
