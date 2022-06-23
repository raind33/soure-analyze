import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('transform', () => {
  test.only('update', () => {
    const ast = baseParse('<div>rain,{{message}}</div>')
    const transformText = (node) => {
      if(node.type === NodeTypes.TEXT) {
        node.content+='come on'
      }
    }
    transform(ast, {
      nodeTransforms: [transformText]
    })

    const nodeText = ast.children[0].children[0]
    expect(nodeText.content).toBe('rain,come on')
  })
})