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
    
    it('', () => {
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
})
