import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { SharpFlags } from '../shared/SharpFlags'
import { setupComponent } from './component'
import { emit } from './componentEmit'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { queueJobs } from './scheduler'
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

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let i = 0
    const l2 = c2.length
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
        patch(n1, n2, container, parentComponent, null)
      else
        break
      i++
    }

    // right diff
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2))
        patch(n1, n2, container, parentComponent, null)
      else
        break
      e1--
      e2--
    }

    // 新的比老的多
    // n1: (a b) n2: (a b) c
    // i: 2 e1: 1 e2: 2
    // n1: (a b) n2: d c (a b)
    // i: 0 e1: -1 e2: 1
    if (i > e1 && i <= e2) {
      // 找出插入锚点
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
      while (i <= e2) {
        patch(null, c2[i], container, parentComponent, anchor)
        i++
      }
    }
    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i])
        i++
      }
    }
    // 5. unknown sequence
    // 中间对比
    else {
      // [i ... e1 + 1]: a b [c d] f g
      // [i ... e2 + 1]: a b [e c] f g
      // i = 2 e1 = 3 e2 = 3
      const s1 = i
      const s2 = i
      // 定义一个映射表，用来保存新节点中存在 key 的元素
      // 后面在比对节点的时候就可以直接从映射表中查找是否存在，达到优化的效果
      const keyToNewIndexMap = new Map()
      let moved = false
      let maxNewIndexSoFar = 0
      const toBePatched = e2 - s2 + 1
      let patched = 0

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      // 初始化 从新 index 映射到老 index
      const newIndexToOldIndexMap = new Array(toBePatched)
      // 将映射表初始化为 0
      // 后面处理的时候，如果发现是 0 的话，那么就说明新值在老的里面不存在
      for (let i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0

      // 处理老节点存在/不存在新节点中的时候
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 优化点 当前所处理的节点数量大于所需处理的节点数量(新节点中间部分)时
        // 证明后续元素不存在新节点中，可以直接进行移除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        // 查找老节点在新节点中的索引
        let newIndex
        if (prevChild.key != null) {
          // 存在 key 时，通过 key 获取所在新节点的索引
          newIndex = keyToNewIndexMap.get(prevChild.key)
        }
        else {
          // 不存在 key 时，通过遍历老节点，获取所在新节点的索引位置
          for (let i = s2; i <= e2; i++) {
            if (isSomeVNodeType(prevChild, c2[i])) {
              newIndex = i
              break
            }
          }
        }

        // 老节点在新节点中不存在时，移除该节点
        if (newIndex === undefined) {
          console.log('老节点不存在新节点中')
          hostRemove(prevChild.el)
        }
        else {
          // 新老节点都存在
          console.log('新老节点都存在')
          // 把新节点的索引和老节点的索引建立映射关系
          // i + 1 是应为 i 有可能是 0（0 的话会被认为新节点在老节点中不存在）
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          if (newIndex >= maxNewIndexSoFar)
            maxNewIndexSoFar = newIndex
          else
            moved = true

          patch(prevChild, c2[i], container, parentComponent, null)
          patched++
        }
      }

      // 插入新节点以及移动
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let j = increasingNewIndexSequence.length

      // 遍历中间新节点
      for (let i = toBePatched; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]

        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor

        if (newIndexToOldIndexMap[i] === 0) {
          // 说明新节点在老节点中不存在 需要创建
          patch(null, nextChild, container, parentComponent, anchor)
        }
        else if (moved) {
          if (j < 0 || increasingNewIndexSequence[j] !== i)
            hostInsert(nextChild.el, container, anchor)
          else
            j--
        }
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
    if (n1 == null)
      mountComponent(n2, container, parentComponent)
    else
      updateComponent(n1, n2)
  }

  function updateComponent(n1, n2) {
    // 实现组件更新实际就是调用再次调用 render 函数
    // TODO Why 如何实现
    if (shouldUpdateComponent(n1, n2)) {
      // 组件实例(component)是在 mount 时进行赋值的
      // 所以此时 n2 中 component 为空, 将 n1 的赋值给 n2
      const instance = n2.component = n1.component
      // 将新 vnode 挂载到组件到实例上
      instance.next = n2
      instance.update()
    }
  }

  function mountComponent(vnode, container, parentComponent) {
    const instance = vnode.component = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }

  function createComponentInstance(vnode: any, parent: any) {
    console.log(parent)
    const component = {
      vnode,
      next: null,
      type: vnode.type,
      setupState: {},
      props: {},
      slots: {},
      provides: parent ? parent.provides : {},
      parent,
      isMounted: false,
      subTree: {},
      emit: () => { },
    }
    component.emit = emit.bind(null, component) as any
    return component
  }

  function setupRenderEffect(instance: any, container) {
    // effect 会返回一个 runner，执行 runner 将会执行这个依赖函数
    // 将 runner 挂在到实例上，用于组件更新时调用
    instance.update = effect(() => {
      if (!instance.isMounted) {
        // 当 render 函数中使用了响应式对象，将会此函数收集进依赖
        // 响应式对象进行更新时将再次执行当前 render 函数
        const subTree = instance.subTree = instance.render.call(instance.proxy)
        patch(null, subTree, container, instance, null)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      }
      else {
        console.log('update')
        // next 是新节点, vnode 是旧节点
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          // 此时组件实例上的数据还是旧的，需要对数据进行更新
          updateComponentPreRender(instance, next)
        }

        // 调用组件的 render 函数获取 vnode 对象，将 this 指向组件实例的代理对象
        const subTree = instance.render.call(instance.proxy)
        // 记录老组件 vnode
        const prevSubTree = instance.subTree
        console.log('subTree', subTree)
        console.log('prevSubTree', prevSubTree)
        // 将新 vnode 保存到组件实例对象上
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, null)
      }
    }, {
      scheduler() {
        console.log('update - scheduler')
        queueJobs(instance.update)
      },
    })
  }

  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
  }

  return {
    createApp: createAppAPI(render),
  }
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI)
          u = c + 1

        else
          v = c
      }
      if (arrI < arr[result[u]]) {
        if (u > 0)
          p[i] = result[u - 1]

        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
