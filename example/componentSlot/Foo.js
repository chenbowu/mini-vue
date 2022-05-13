import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup() {
  },
  render() {
    const foo = h('p', {}, 'foo')
    console.log(this.$slots)
    // initSlots => $slots[name](props) name 为具名插槽名 将每个插槽转换成一个函数，参数就变成了 props
    // 实现具名插槽
    // 作用域插槽
    const age = 18
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { age }),
      renderSlots(this.$slots, 'main'),
      foo,
      renderSlots(this.$slots, 'footer')])
  },
}
