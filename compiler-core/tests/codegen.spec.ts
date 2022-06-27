import { NodeTypes } from "../src/ast"
import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('generate', () => {
  test('text', () => {
    const ast = baseParse('rain')
    transform(ast)
    const code = generate(ast)
    expect(code).toMatchSnapshot()
  })
})