import { getCurrentInstance, h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  setup() {
    const instance = getCurrentInstance()
    console.log('App', instance)
  },
  render() {
    const app = h('p', {}, 'app')
    const foo = h(Foo, {}, '')
    return h('div', {}, [app, foo])
  },
}
