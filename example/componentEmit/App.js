import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  setup() {

  },
  render() {
    return h('div', {
      id: 'root',
      class: ['red'],
    }, [
      h('div', { class: ['green'] }, 'hello mini-vue'),
      h(Foo, {
        onAdd(a, b) {
          console.log('emit', 'onAdd', a, b)
        },
        onAddFoo() {
          console.log('emit', 'onAddFoo')
        },
      }),
    ])
  },
}
