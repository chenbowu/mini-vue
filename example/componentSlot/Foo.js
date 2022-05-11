import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup(props, context) {
    },
    render() {
        const foo = h('p', {}, 'foo');
        console.log(this.$slots);
        // 实现具名插槽
        return h('div', {}, [renderSlots(this.$slots, 'header'), foo, renderSlots(this.$slots, 'footer')]);
    }
};