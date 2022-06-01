import { h, ref } from '../../lib/guide-mini-vue.esm.js'

const prevChildren = [h('div', {}, 'oldA'), h('div', {}, 'oldB')]
const nextChildren = 'newValue'

export const ArrayToText = {
  name: 'ArrayToText',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange
    return {
      isChange,
    }
  },
  render() {
    return this.isChange === false
      ? h('div', {}, prevChildren)
      : h('div', {}, nextChildren)
  },
}

