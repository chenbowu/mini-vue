import { createRenderer, h } from '../../lib/guide-mini-vue.esm.js'

const game = new PIXI.Application({
  width: 500,
  height: 500,
})
document.body.appendChild(game.view)
const renderer = createRenderer({
  createElement(type) {
    if (type === 'Rect') {
      const rect = new PIXI.Graphics()
      rect.beginFill(0xFF0000)
      rect.drawRect(0, 0, 200, 100)
      rect.endFill()
      return rect
    }
    else if (type === 'Circle') {
      const circle = new PIXI.Graphics()
      circle.beginFill(0xFFFFFF)
      circle.drawCircle(100, 100, 50)
      circle.endFill()
      return circle
    }
  },
  patchProp(el, key, val) {
    el[key] = val
  },
  insert(el, parent) {
    parent.addChild(el)
  },
})

const App = {
  name: 'App',
  setup() {

  },
  render() {
    return h('Rect', { x: 50, y: 50 }, [h('Circle')])
  },
}

renderer.createApp(App).mount(game.stage)
