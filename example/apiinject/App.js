import { h, inject, provide } from '../../lib/guide-mini-vue.esm.js'

const Consumer = {
  name: 'consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    // const baz = inject('baz', 'bazDefault')
    const baz = inject('baz', () => 'bazDefault', false)
    return {
      foo,
      bar,
      baz,
    }
  },
  render() {
    return h('div', {}, `Consumer-${this.foo}-${this.bar}-${this.baz}`)
  },
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')
    return {
      foo,
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo-${this.foo}`), h(Consumer)])
  },
}

const Provider = {
  name: 'provider',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  },
}

export default {
  name: 'App',
  setup() {
  },
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)])
  },
}

