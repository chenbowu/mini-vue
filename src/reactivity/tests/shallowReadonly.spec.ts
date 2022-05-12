import { isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
  it('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })

  it('warn then call set', () => {
    // 当调用 set 时，触发一个警告
    console.warn = jest.fn()
    const wrapped = shallowReadonly({ foo: 1 })
    wrapped.foo = 10
    expect(console.warn).toBeCalled()
  })
})
