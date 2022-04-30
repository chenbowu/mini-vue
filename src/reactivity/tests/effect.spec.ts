import { reactive } from '../reactive';
import { effect, stop } from '../effect';

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
        // TODO 在依赖中执行一元运算符，会导致 track trigger 重复调用，导致调用栈溢出
        // effect(() => {
        //     user.age++;
        // });

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

    it('stop', () => {
        // 实现功能: 当执行 stop 函数后，set update 时不再触发收集到的依赖
        let dummy;
        const obj = reactive({ prop: 1 });
        const runner = effect(() => {
            dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);
        obj.prop = 3;
        expect(dummy).toBe(2);
        // 当使用 ++ 会同时触发 track 和 trigger
        // 导致结果与预期结果不一致
        obj.prop++;
        expect(dummy).toBe(2);

        // stopped  effect should still be manually changes.
        runner();
        expect(dummy).toBe(4);
    });

    it('onStop', () => {
        // 通过 effect 方法的第二个 options 参数传递一个函数
        // 当调用 stop 函数时触发
        let dummy;
        const obj = reactive({ prop: 1 });
        const onStop = jest.fn();
        const runner = effect(() => {
            dummy = obj.prop;
        }, {
            onStop
        });
        stop(runner);
        expect(onStop).toBeCalledTimes(1);
    });
})
