import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
    name: 'App',
    setup() {

    },
    render() {
        const app = h('div', {}, 'App');
        const foo = h(Foo, {}, h('p', {}, 'slot'));
        return h('div', {}, [app, foo]);
    }
}