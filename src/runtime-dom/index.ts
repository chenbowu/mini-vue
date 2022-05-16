import { createRenderer } from '../runtime-core/renderer'
import { isOn } from '../shared'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, value) {
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, value)
  }
  else {
    el.setAttribute(key, value)
  }
}

function insert(conatiner, el) {
  conatiner.append(el)
}

createRenderer({
  createElement,
  patchProp,
  insert,
})
