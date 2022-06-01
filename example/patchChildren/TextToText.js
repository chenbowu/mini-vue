import { h, ref } from '../../lib/guide-mini-vue.esm.js'

const prevChildren = 'oldChildren'
const nextChildren = 'newChildren'

export const TextToText = {
  name: 'TextToText',
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

