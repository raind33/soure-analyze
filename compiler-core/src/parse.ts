import { NodeTypes } from "./ast"
import { Context } from "./types"

enum TagType {
  START,
  END
}
export function baseParse(content:string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context))
}

function createParseContext(content:string) {
  return {
    source: content
  }
}
function createRoot(children: any) {
  return {
    children
  }
}

function parseChildren(context:Context) {
  const nodes:any = []
  const s = context.source
  let node
  if(s.startsWith('{{')){
    node = parseInterpolation(context)
    nodes.push(node)
  } else if(s.startsWith('<')){
    if(/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  }
  nodes.push(node)

  return nodes
}
function parseElement(context:Context) {
  const element = parseTag(context, TagType.START)
  parseTag(context, TagType.END)
  return element
}
function parseTag(context:Context, type: TagType) {
  const match = /^<\/?([a-z]*)/i.exec(context.source)
  const content = match[1]
  advance(context, match[0].length)
  advance(context, 1)
  if(type === TagType.END) return
  return {
    type: NodeTypes.ELEMENT,
    tag: content
  }
}
function parseInterpolation(context:Context) {
  const closeDelimiter = '}}'
  const openDelimiter = '{{'
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  const rawContentlength = closeIndex - openDelimiter.length
  advance(context, openDelimiter.length)
  const rawContent = context.source.slice(0, rawContentlength)
  const content = rawContent.trim()
  advance(context, rawContentlength+closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    }
  }
}
function advance(context:Context, length:number) {
  context.source = context.source.slice(length)
}