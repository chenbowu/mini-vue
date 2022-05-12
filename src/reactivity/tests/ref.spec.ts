import { effect } from '../effect'
import { isReactive, reactive } from '../reactive'
import { isRef, proxyRefs, ref, unRef } from '../ref'

describe('ref', () => {
  // # ref 的功能点
  // 1. ref 用来将一个基本数据类型的值，转换成一个响应式对象
  // 2. set 时，如果新值与旧值相同不触发依赖
  // 3. 如果 ref 了一个对象类型，就相当于直接调用了 reactive
  it('happy path', () => {
    const count = ref(1)
    expect(count.value).toBe(1)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      dummy = a.value
      calls++
    })
    expect(dummy).toBe(1)
    expect(calls).toBe(1)
    // a.value = 2;
    a.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
  })

  it('should make nested properties reactive', () => {
    const a = ref({
      foo: 1,
    })
    let dummy
    effect(() => {
      dummy = a.value.foo
    })
    expect(dummy).toBe(1)
    a.value.foo++
    expect(dummy).toBe(2)
    // 当访问 value 的话，还是会触发 ref 对象的 get, set
    // 重新赋值一个对象时，依赖转换成 reactive 对象
    a.value = { foo: 1 }
    expect(dummy).toBe(1)
    a.value.foo++
    expect(dummy).toBe(2)
    // TODO 如果重新赋值传入的对象属性不同会发生什么
    // 会触发 set 操作，并且触发依赖，
    a.value = { bar: 1 }
    expect(dummy).toBe(undefined)
  })

  it('isRef', () => {
    const a = ref(1)
    const observed = reactive({ foo: 1 })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(observed)).toBe(false)
  })

  it('unRef', () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(1).toBe(1)
  })

  it('proxyRefs', () => {
    const user: any = {
      age: ref(10),
      name: 'antony',
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('antony')

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    proxyUser.name = ref('pony')
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
    expect(proxyUser.name).toBe('pony')
    expect(user.name.value).toBe('pony')
  })
})
