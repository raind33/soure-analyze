import { ShapeFlags } from "../shared/ShapeFlags"
import { isObject } from '../shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createTextVNode(str:any) {
  return createVNode(Text, {}, str)
}
export function createVNode(type:any, props?:any, children?: any) {
  const vnode:any = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    shapeFlag: getType(type)
  }
  if(typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  normalizeChildren(vnode, children);
  return vnode
}
export function normalizeChildren(vnode:any, children:any) {
  if (typeof children === "object") {
    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
      // 如果是 element 类型的话，那么 children 肯定不是 slots
    } else {
      // 这里就必然是 component 了,
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
  }
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