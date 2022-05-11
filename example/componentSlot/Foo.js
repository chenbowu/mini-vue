import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup(props, context) {
    },
    render() {
        const foo = h('p', {}, 'foo');
        console.log(this.$slots);
        return h('div', {}, [foo, this.$slots]);
    }
};