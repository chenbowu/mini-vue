import { h, ref } from '../../lib/guide-mini-vue.esm.js'

// 1. 左侧的对比
// (a b) c
// (a b) d e
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'B' }, 'C'),
//   h('p', { key: 'B' }, 'E'),
// ]

// 2. 右侧的对比
// a (b c)
// d a (b c)
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// 3. 新的比老的多
// (a b)
// (a b) c
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ]

// 插入到新的前面
// (a b)
// c (a b)
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]
// const nextChildren = [
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ]

// 5. unknown sequence
// [i ... e1 + 1]: a b [c d e] f g
// [i ... e2 + 1]: a b [e d c h] f g
// i = 2, e1 = 4, e2 = 5
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'H' }, 'H'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]

export const ArrayToArray = {
  name: 'ArrayToArray',
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
