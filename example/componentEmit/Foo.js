import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup(props, { emit }) {
    // 触发事件（函数，等价于 $emit）
    // console.log(context.emit);
    const emitAdd = () => {
      console.log('emit add')
      emit('add', 1, 2)
      emit('add-foo')
    }
    // 触发父组件的 onAdd 事件
    return {
      emitAdd,
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd,
    }, 'emitAdd')
    const foo = h('div', {}, 'foo')
    return h('div', {}, [foo, btn])
  },
}
