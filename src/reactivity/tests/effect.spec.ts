import { reactive } from '../reactive';
import { effect } from '../effect';

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        });

        let nextAge;
        effect(() => {
            // 此处执行了一次 get 触发了 track 
            nextAge = user.age + 1;
        });

        expect(nextAge).toBe(11);
        // update
        user.age++;
        expect(nextAge).toBe(12);
    })
    
    it('runner', () => {
        // 执行 effect 会返回一个 runner 函数
        // 执行 runner 函数会再次执行 effect 中的 fn, 并且会 return fn 的返回值
        let foo = 10;
        const runner = effect(() => {
            foo++;
            return 'bar';
        });
        expect(foo).toBe(11);
        let res = runner();
        expect(foo).toBe(12);
        expect(res).toBe('bar');
    });

    it('scheduler', () => {
        // 1. 通过 effect 的第二个参数给定的一个 scheduler 的 fn
        // 2. effect 第一次执行的时候 还会执行 fn
        // 3. 当 响应式对象 set update 不会执行 fn 而是执行 scheduler
        // 4. 如果说当执行 runner 的时候，会再次的执行 fn
        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(() => {
            dummy = obj.foo;
        }, { scheduler });

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // should not run yet
        expect(dummy).toBe(1);
        // manually run
        run();
        // should have run
        expect(dummy).toBe(2);
    });

})
