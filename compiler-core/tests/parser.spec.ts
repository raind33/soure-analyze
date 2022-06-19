import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe('parser', () => {
  describe("Interpolation", () => {
    test("simple interpolation", () => {
      // 1. 看看是不是一个 {{ 开头的
      // 2. 是的话，那么就作为 插值来处理
      // 3. 获取内部 message 的内容即可
      const ast = baseParse("{{message}}");
      const interpolation = ast.children[0];

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`,
        },
      });
    });
  });
  describe("element", () => {
    test("simple element", () => {
      const ast = baseParse("<div></div>");
      const interpolation = ast.children[0];

      expect(interpolation).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: []
      });
    });
    test("nested element", () => {
      const ast = baseParse("<div><span>hhh</span>9999</div>");
      const interpolation = ast.children[0];

      expect(interpolation).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeTypes.ELEMENT,
            tag: 'span',
            children: [
              {
                type: NodeTypes.TEXT,
                content: 'hhh'
              },
            ]
          },
          {
            type: NodeTypes.TEXT,
            content: '9999'
          },
        ]
      });
    });
    test('unclose tag throw error', () =>  {
      expect(() => {
        baseParse('<div><span></div>')
      }).toThrow('unclose tag: span')
    })
  });
  test("text", () => {
    const ast = baseParse("哈哈哈好");
    const interpolation = ast.children[0];

    expect(interpolation).toStrictEqual({
      type: NodeTypes.TEXT,
      content: '哈哈哈好'
    });
  });
  test('union type', () => {
    const ast = baseParse("<div>rain{{message}}</div>");
    const interpolation = ast.children[0];

    expect(interpolation).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'rain'
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: `message`,
          }
        }
      ]
    });
  })
})