
export function createVNode(type:any, props?:any, children?: any) {
  const vnode = {
    type,
    props,
    children
  }
  return vnode
}
export function h(type:any, props?:any, children?:any) {
  return createVNode(type, props, children)
}