import { ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: 'App',
  template: '<div>hi. {{count}}{{message}}</div>',
  setup() {
    const count = window.count = ref(0)
    return {
      message: 'mini-vue',
      count,
    }
  },
}
