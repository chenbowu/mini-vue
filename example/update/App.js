import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    const add = () => {
      count.value++
      console.log('onclick Add', count.value)
    }
    return {
      count,
      add,
    }
  },
  render() {
    const text = h('p', {}, `count: ${this.count}`)
    const button = h('button', {
      onClick: this.add,
    }, 'Add')
    return h('div', {}, [text, button])
  },
}
