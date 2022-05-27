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
    const button1 = h('button', {
    },
    'button 1')

    const button2 = h('button', {
    },
    'button 2')

    const button3 = h('button', {
    },
    'button 3')
    return h('div', {}, [text, button, button1, button2, button3])
  },
}
