import { NodeTypes } from './ast'

export function baseParse(content: string) {
  const context: ParserContext = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context: ParserContext) {
  const nodes: any = []
  let node
  if (context.source.startsWith('{{'))
    node = parseInterpolation(context)

  nodes.push(node)
  return nodes
}

function parseInterpolation(context: ParserContext) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = context.source.substring(0, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  }
}

function advanceBy(context, step) {
  context.source = context.source.slice(step)
}

function createParserContext(content: string): ParserContext {
  return {
    source: content,
  }
}

function createRoot(children) {
  return {
    children,
  }
}

interface ParserContext {
  source: string
}
