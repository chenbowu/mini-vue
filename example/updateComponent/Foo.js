import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup() {
  },
  render() {
    return h('p', {}, `${this.$props.msg}`)
  },
}
