import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { SharpFlags } from '../shared/SharpFlags'
import { setupComponent } from './component'
import { emit } from './componentEmit'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options

  function render(vnode: any, container: any) {
  // 直接调用 patch 方法
    patch(null, vnode, container, null)
  }
  function patch(n1, n2: any, container: any, parentComponent) {
  // 判断是 vnode 类型是 component 还是 element
    const sharpFlag = n2.sharpFlag
    switch (n2.type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (sharpFlag & SharpFlags.ELEMENT)
          processElement(n1, n2, container, parentComponent)
        else if (sharpFlag & SharpFlags.STATEFUL_COMPONENT)
          processComponent(n1, n2, container, parentComponent)
        break
    }
  }

  function processElement(n1, n2: any, container, parentComponent) {
    // 当 n1 为 null 时走初始化逻辑，直接调用 mountElement
    // 否则调用 patchElement 进行更新逻辑
    if (n1 === null)
      mountElement(n2, container, parentComponent)
    else
      patchElement(n1, n2, container, parentComponent)
  }

  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp)
          hostPatchProp(el, key, prevProp, nextProp)
      }

      // 移除新对象中不存在的 prop
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps))
            hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = vnode.el = hostCreateElement(vnode.type)
    for (const key in vnode.props) {
      const val = vnode.props[key]
      hostPatchProp(el, key, null, val)
    }

    const sharpFlag = vnode.sharpFlag
    if (sharpFlag & SharpFlags.TEXT_CHILDREN)
      el.textContent = vnode.children
    else if (sharpFlag & SharpFlags.ARRAY_CHILDREN)
      mountChildren(vnode, el, parentComponent)

    hostInsert(el, container)
  }

  function mountChildren(vnode: any, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2: any, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
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
      isMounted: false,
      subTree: {},
      emit: () => {},
    }
    component.emit = emit.bind(null, component) as any
    return component
  }
  function setupRenderEffect(instance: any, container) {
    effect(() => {
      if (!instance.isMounted) {
        // 当 render 函数中使用了响应式对象，将会此函数收集进依赖
        // 响应式对象进行更新时将再次执行当前 render 函数
        const subTree = instance.subTree = instance.render.call(instance.proxy)
        patch(null, subTree, container, instance)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      }
      else {
        console.log('update')
        const subTree = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree
        console.log('subTree', subTree)
        console.log('prevSubTree', prevSubTree)
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}
