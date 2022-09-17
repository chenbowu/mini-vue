import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context: ParserContext = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context: ParserContext, ancestors: any[]) {
  const nodes: any = []
  let node
  while (!isEnd(context, ancestors)) {
    if (context.source.startsWith('{{')) {
      node = parseInterpolation(context)
    }
    else if (context.source.startsWith('<')) {
      if (/[a-z]/i.test(context.source[1]))
        node = parseElement(context, ancestors)
    }
    else {
      node = parseText(context)
    }

    nodes.push(node)
  }
  return nodes
}

function isEnd(context: ParserContext, ancestors: any[]) {
  const s = context.source
  if (s.startsWith('</')) {
    for (let i = 0; i < ancestors.length; i++) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(context, tag))
        return true
    }
  }
  return !s
}

function startsWithEndTagOpen(context, tag: string) {
  return (context.source.startsWith('</') && context.source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase())
}

function parseText(context: ParserContext) {
  // 限定文本截取范围默认为所有
  let endIndex = context.source.length
  // 文本截取结束标识
  const endToken = ['</', '{{']
  // 判断文本中是否存在 token 标识，存在则文本截取到此 token 为止, 否则截取到文本末尾.
  for (let i = 0; i < endToken.length; i++) {
    const index = context.source.indexOf(endToken[i])
    if (index !== -1 && index < endIndex)
      endIndex = index
  }
  const content = parseTextData(context, endIndex)
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

function parseElement(context: ParserContext, ancestors: any[]) {
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  const tag = element.tag

  if (startsWithEndTagOpen(context, tag))
    parseTag(context, TagType.End)
  else
    throw new Error(`缺少结束标签: ${tag}`)

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

