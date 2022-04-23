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
})
