import { h } from '../../lib/guide-mini-vue.esm.js';
export const App = {
    // template 最终会编译成 render 函数
    render() {
        return h('div', {
            id: 'root',
            class: ['red', 'green']
        },[
            h('p', { class: ['blue'] }, 'blue'),
            h('p', { class: ['red'] }, 'red'),
        ]);
    },
    setup() {
        // composition api
        return {
            msg: 'mini-vue'
        }
    }
}