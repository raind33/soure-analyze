export function transform(root, options) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
}

function traverseNode(node:any, context:any) {
  context.nodeTransforms.forEach(transform => {
    transform(node)
  })
  transformChildren(node, context)
}
function transformChildren(node:any, context:any) {
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