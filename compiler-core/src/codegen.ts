
export function generate(ast:any) {
  const context = createCodegenContext()
  const { push } = context
  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const functionName = 'render'
  const node = ast.codegenNode
  const renderContent = `return "${node.content}"`
  push('return ')
  push(`function ${functionName}(${args.join(',')}) {`)
  push(renderContent)
  return {
    code: context.code
  }
}

function createCodegenContext() {
  const obj = {
    code: '',
    push(str: any) {
      obj.code+=str
    }
  }
  return obj
}