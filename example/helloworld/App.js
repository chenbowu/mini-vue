import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
  // template 最终会编译成 render 函数
  render() {
    // return h('div', {
    //     id: 'root',
    //     class: ['red', 'green']
    // },[
    //     h('p', { class: ['blue'] }, 'blue'),
    //     h('p', { class: ['red'] }, 'red'),
    // ]);
    return h('div', {
      id: 'root',
      class: ['red', 'green'],
      onClick() {
        console.log('div onclick')
      },
      onMouseDown() {
        console.log('div mousedown')
      },
    }, [
      h('div', {}, `hello ${this.msg}`),
      h(Foo, { count: 1 }),
    ])
  },
  setup() {
    // composition api
    return {
      msg: 'mini-vue',
    }
  },
}
