export function generate(ast:any) {
  const context = createCodegenContext()
  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const functionName = 'render'
  const renderContent = `return "rain"`
  context.push(`function ${functionName}(${args.join(',')}) {`)
  context.push(renderContent)
  return context.code
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