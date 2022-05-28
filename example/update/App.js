import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
      console.log('onclick Add', count.value)
    }
    return {
      count,
      onClick,
    }
  },
  render() {
    return h('div', {
      id: 'root',
      ...this.props,
    }, [
      h('div', {}, `count: ${this.count}`),
      h('button', {
        onClick: this.onClick,
      }, 'click'),
      h('button', {
        onClick: this.onChangePropsDemo1,
      }, 'changeProps - 值改变了 - 修改'),
      h('button', {
        onClick: this.onChangePropsDemo2,
      }, 'changeProps - 值变成了 undefined - 删除'),
      h('button', {
        onClick: this.onChangePropsDemo3,
      }, 'changeProps - key 在新的里面没有了 - 删除'),
    ])
  },
}
