import { isString } from '../../shared'
import { NodeTypes } from './ast'
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from './runtimeHelpers'

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context
  console.log('codegen--------', ast)
  if (ast.helpers.length > 0)
    genFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push('return ')
  push(`function ${functionName}(${signature}) {`)
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')
  return {
    code: context.code,
  }
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    default:
      break
  }
}

function createCodegenContext() {
  const context = {
    code: '',
    push: (code) => {
      context.code += code
    },
    helper: key => `_${helperMapName[key]}`,
  }
  return context
}

function genFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s: any) => `${s}: _${s}`
  push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`)
  push('\n')
}

function genText(node: any, context: any) {
  const { push } = context
  push(`"${node.content}"`)
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genExpression(node: any, context: any) {
  const { push } = context
  push(node.content)
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, props, children } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullableArgs([tag, props, children]), context)
  push(')')
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node))
      push(node)
    else
      genNode(node, context)

    // 参数之间需要用逗号分隔
    if (i < nodes.length - 1)
      push(', ')
  }
}

function genNullableArgs(args: unknown[]) {
  // 把为 falsy 的值都替换成 "null"
  return args.map(arg => arg || 'null')
}

function genCompoundExpression(node, context) {
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child))
      context.push(child)
    else
      genNode(child, context)
  }
}
