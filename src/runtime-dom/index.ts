import { createRenderer } from '../runtime-core'
import { isOn } from '../shared'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextVal)
  }
  else {
    if (nextVal === undefined || nextVal === null)
      el.removeAttribute(key)
    else
      el.setAttribute(key, nextVal)
  }
}

function insert(el, parent) {
  parent.append(el)
}

function remove(container, child) {
  container.removeChild(child.el)
}

export const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
})

export function createApp(...arg) {
  return renderer.createApp(...arg)
}

export * from '../runtime-core'
