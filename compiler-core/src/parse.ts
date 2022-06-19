import { NodeTypes } from "./ast"
import { Context } from "./types"

enum TagType {
  START,
  END
}
export function baseParse(content:string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context, []))
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

function parseChildren(context:Context, ancestors: string[]) {
  const nodes:any = []
  
  while(!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if(s.startsWith('{{')){
      node = parseInterpolation(context)
    } else if(s.startsWith('<')){
      if(/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    } else {
      node = parseText(context)
    }
    nodes.push(node)
  }

  return nodes
}
function isEnd(context:Context, ancestors:string[]) {
  if(!context.source) return true
  for(let i = ancestors.length - 1;i>=0;i--) {
    const tag = ancestors[i]
    const endTag = context.source.slice(2, tag.length+2)
    if(endTag === tag) return true
  
  }
}
// rain {{message}}</div>
function parseText(context: Context) {
  const endTokens = ["{{", "</"]
  let endIndex = context.source.length
  for(let i = 0;i<endTokens.length;i++){
    const endToken = endTokens[i]
    const index = context.source.indexOf(endToken)
    if(index > -1 && endIndex > index) {
      endIndex = index
    }
  }
  const content = context.source.slice(0, endIndex)
  advance(context, content.length)
  return {
    type: NodeTypes.TEXT,
    content
  }
}
function parseElement(context:Context, ancestors:string[]) {
  const element:any = parseTag(context, TagType.START)
  ancestors.push(element.tag)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  // unclose tag <div><span></div>
  if(element.tag === context.source.slice(2, element.tag.length+2)) {
    parseTag(context, TagType.END)
  } else {
    throw new Error(`unclose tag: ${element.tag}`)
    return
  }
  return element
}
function parseTag(context:Context, type: TagType) {
  const match = /^<\/?([a-z]*)/i.exec(context.source)!
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