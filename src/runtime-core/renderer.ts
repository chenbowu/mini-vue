import { isOn } from '../shared'
import { SharpFlags } from '../shared/SharpFlags'
import { setupComponent } from './component'
import { emit } from './componentEmit'
import { Fragment, Text } from './vnode'

export function render(vnode: any, container: any) {
  // 直接调用 patch 方法
  patch(vnode, container, null)
}
function patch(vnode: any, container: any, parentComponent) {
  // 判断是 vnode 类型是 component 还是 element
  const sharpFlag = vnode.sharpFlag
  switch (vnode.type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (sharpFlag & SharpFlags.ELEMENT)
        processElement(vnode, container, parentComponent)
      else if (sharpFlag & SharpFlags.STATEFUL_COMPONENT)
        processComponent(vnode, container, parentComponent)
      break
  }
}

function processElement(vnode: any, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}

function mountElement(vnode: any, container: any, parentComponent) {
  const el = vnode.el = document.createElement(vnode.type)
  for (const key in vnode.props) {
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, vnode.props[key])
    }
    else {
      el.setAttribute(key, vnode.props[key])
    }
  }

  const sharpFlag = vnode.sharpFlag
  if (sharpFlag & SharpFlags.TEXT_CHILDREN)
    el.textContent = vnode.children
  else if (sharpFlag & SharpFlags.ARRAY_CHILDREN)
    mountChildren(vnode, el, parentComponent)

  container.append(el)
}

function mountChildren(vnode: any, container, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent)
  })
}

function processComponent(vnode: any, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(vnode, container, parentComponent) {
  const instance = createComponentInstance(vnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function createComponentInstance(vnode: any, parent: any) {
  console.log(parent)
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    emit: () => {},
  }
  component.emit = emit.bind(null, component) as any
  return component
}
function setupRenderEffect(instance: any, container) {
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container, instance)
  instance.vnode.el = subTree.el
}
