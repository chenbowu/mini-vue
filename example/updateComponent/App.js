import { h, ref } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  setup() {
    const msg = ref('123')
    window.msg = msg
    const count = ref(1)

    const onChangeMsg = () => {
      msg.value = '456'
    }

    const onAddCount = () => {
      count.value++
    }
    return {
      msg,
      count,
      onChangeMsg,
      onAddCount,
    }
  },
  render() {
    return h('div', {}, [
      h('button', { onClick: this.onChangeMsg }, 'change msg'),
      h(Foo, { msg: this.msg }),
      h('button', { onClick: this.onAddCount }, 'add count'),
      h('p', {}, `${this.count}`),
    ])
  },
}
