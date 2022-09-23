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

function insert(child: HTMLElement, parent: HTMLElement, anchor: HTMLElement | null) {
  parent.insertBefore(child, anchor)
}

function remove(child) {
  const parent = child.parentNode
  if (parent)
    parent.removeChild(child)
}

function setElementText(container, text) {
  container.textContent = text
}

export const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
})

export function createApp(...arg) {
  return renderer.createApp(...arg)
}

export * from '../runtime-core'
