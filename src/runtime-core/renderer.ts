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
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode: any, container: any) {
    // 直接调用 patch 方法
    patch(null, vnode, container, null, null)
  }
  function patch(n1, n2: any, container: any, parentComponent, anchor) {
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
          processElement(n1, n2, container, parentComponent, anchor)
        else if (sharpFlag & SharpFlags.STATEFUL_COMPONENT)
          processComponent(n1, n2, container, parentComponent)
        break
    }
  }

  function processElement(n1, n2: any, container, parentComponent, anchor) {
    // 当 n1 为 null 时走初始化逻辑，直接调用 mountElement
    // 否则调用 patchElement 进行更新逻辑
    if (n1 === null)
      mountElement(n2, container, parentComponent, anchor)
    else
      patchElement(n1, n2, container, parentComponent, anchor)
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.sharpFlag
    const nextShapeFlag = n2.sharpFlag
    const c1 = n1.children
    const c2 = n2.children
    if (nextShapeFlag & SharpFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & SharpFlags.ARRAY_CHILDREN) {
        // remove prevChildren
        unmountChildren(c1)
        // mount text child element
      }
      if (c1 !== c2)
        hostSetElementText(container, c2)
    }
    else {
      if (prevShapeFlag & SharpFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
      else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // left diff
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVNodeType(n1, n2))
        // 调用 patch 对比子元素
        patch(n1, n2, container, parentComponent, anchor)
      else
        break
      i++
    }

    // right diff
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2))
        patch(n1, n2, container, parentComponent, anchor)
      else
        break
      e1--
      e2--
    }

    // 新的比老的多
    // n1: (a b) n2: (a b)
    // i: 2 e1: 1 e2: 2
    // n1: (a b) n2: c (a b)
    // i: 0 e1: -1 e2: 0
    if (i > e1 && i <= e2) {
      for (let idx = i; idx <= e2; idx++) {
        const n2 = c2[idx]
        // 找出插入锚点
        const anchor = null
        patch(null, n2, container, parentComponent, anchor)
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
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
    mountChildren(n2.children, container, parentComponent)
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = vnode.el = hostCreateElement(vnode.type)
    for (const key in vnode.props) {
      const val = vnode.props[key]
      hostPatchProp(el, key, null, val)
    }

    const sharpFlag = vnode.sharpFlag
    if (sharpFlag & SharpFlags.TEXT_CHILDREN)
      el.textContent = vnode.children
    else if (sharpFlag & SharpFlags.ARRAY_CHILDREN)
      mountChildren(vnode.children, el, parentComponent)

    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, null)
    })
  }

  function processComponent(n1, n2: any, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(vnode, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container, null)
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
  function setupRenderEffect(instance: any, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        // 当 render 函数中使用了响应式对象，将会此函数收集进依赖
        // 响应式对象进行更新时将再次执行当前 render 函数
        const subTree = instance.subTree = instance.render.call(instance.proxy)
        patch(null, subTree, container, instance, anchor)
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
        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}
