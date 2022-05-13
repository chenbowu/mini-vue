import { SharpFlags } from '../shared/SharpFlags'

export function initSlots(instance, children) {
  // children 此时为一个函数对象数组
  if (instance.vnode.sharpFlag & SharpFlags.SLOT_CHILDREN)
    normalizeObjectSlots(children, instance.slots)
}

function normalizeObjectSlots(children, slots) {
  // key 为具名插槽的名字, 将插槽挂载到组件实例上（可以通过$slots访问到所有插槽）
  for (const key in children) {
    // value => 生成插槽的函数，可传入一个 props 参数
    const value = children[key]
    // 创建一个接收 props 的函数，暴露给调用者传递
    // renderSlots 会调用此方法，传递 props， 实现作用域插槽
    slots[key] = props => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
