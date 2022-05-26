import { ShapeFlags } from "../shared/ShapeFlags"
import { isObject } from '../shared'
export function createVNode(type:any, props?:any, children?: any) {
  const vnode:any = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getType(type)
  }
  if(typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}
export function h(type:any, props?:any, children?:any) {
  return createVNode(type, props, children)
}

function getType(type: any) {
  if(typeof type === 'string') {
    return ShapeFlags.ELEMENT
  } else if(isObject(type)) {
    return ShapeFlags.STATEFUL_COMPONENT
  }
}