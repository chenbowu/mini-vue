import { h, ref } from '../../lib/guide-mini-vue.esm.js'
import { TextToArray } from './TextToArray.js'
import { TextToText } from './TextToText.js'
import { ArrayToArray } from './ArrayToArray.js'
import { ArrayToText } from './ArrayToText.js'

export const App = {
  name: 'App',
  setup() {
  },
  render() {
    return h(ArrayToText)
    // return h(TextToText)
  },
}
