import { NodeTypes } from "./ast"
import { Context } from "./types"

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
  if(context.source.startsWith('{{')){
    const node = parseInterpolation(context)
    nodes.push(node)
  }

  return nodes
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