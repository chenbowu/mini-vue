import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  setup() {

  },
  render() {
    const app = h('div', {}, 'App')
    const foo = h(Foo, {}, {
      header: ({ age }) => h('p', {}, `header${age}`),
      main: () => h('p', {}, 'main'),
      footer: () => h('p', {}, 'footer'),
    })
    return h('div', {}, [app, foo])
  },
}
