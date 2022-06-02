import { createRenderer } from '../runtime-core'
import { isOn } from '../shared'

function createElement(type) {
  return document.createElement(type)
}

function patchChild(el, child) {
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

export const renderer: any = createRenderer({
  createElement,
  patchChild,
  patchProp,
  insert,
})

export function createApp(...arg) {
  return renderer.createApp(...arg)
}

export * from '../runtime-core'
