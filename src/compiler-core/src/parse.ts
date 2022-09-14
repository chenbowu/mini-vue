import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context: ParserContext = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context: ParserContext) {
  const nodes: any = []
  let node
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context)
  }
  else if (context.source.startsWith('<')) {
    if (/[a-z]/i.test(context.source[1]))
      node = parseElement(context)
  }
  else {
    node = parseText(context)
  }

  nodes.push(node)
  return nodes
}

function parseText(context: ParserContext) {
  const content = parseTextData(context, context.source.length)
  return {
    type: NodeTypes.TEXT,
    content,
  }
}

/**
 * Get text data with given length from the current location
 * @param context
 * @param length
 * @returns
 */
function parseTextData(context: ParserContext, length: number): string {
  const rawText = context.source.substring(0, length)
  advanceBy(context, length)
  return rawText
}

function parseElement(context: ParserContext) {
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)
  console.log(context.source)
  return element
}

function parseTag(context: ParserContext, type: TagType) {
  const match = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match![1]
  advanceBy(context, match![0].length)
  advanceBy(context, 1)

  if (type === TagType.End)
    return

  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function parseInterpolation(context: ParserContext) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, closeDelimiter.length)

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

