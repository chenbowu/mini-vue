import { isReactive, isReadonly, readonly } from "../reactive";

describe('readonly', () => {
    it('happy path', () => {
        // 1. readonly 只能 get 不能被 set
        // 2. 不能被 set 意味着不会触发依赖，也就意味不需要依赖收集
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapped: any = readonly(original);
        expect(wrapped).not.toBe(original);
        expect(wrapped.foo).toBe(1);
        // isReadonly
        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(original)).toBe(false);
        expect(isReadonly(original.bar)).toBe(false);
        expect(isReadonly(wrapped.bar)).toBe(true);
    });

    it('warn then call set', () => {
        // 当调用 set 时，触发一个警告
        console.warn = jest.fn();
        const wrapped = readonly({ foo: 1 });
        wrapped.foo = 10;
        expect(console.warn).toBeCalled();
    });
});