export function transform(root, options={}) {
  const context = createTransformContext(root, options)
  root.codegenNode = root.children[0]
  traverseNode(root, context)
}

function traverseNode(node:any, context:any) {
  context.nodeTransforms.forEach(transform => {
    transform(node)
  })
  traverseChildren(node, context)
}
function traverseChildren(node:any, context:any) {
  if(node.children) {
    node.children.forEach(node => {
      traverseNode(node, context)
    })
  }
}
function createTransformContext(root:any, options:any) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
}