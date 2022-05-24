import { isObject } from "../shared/"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode:any, container:any) {
  patch(vnode, container)
}

function patch(vnode:any, container:any) {
  if(vnode.shapeFlag & ShapeFlags.ELEMENT) { 
    processElement(vnode, container)
  } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }
}
 
function processComponent(vnode:any, container:any) {
  mountComponent(vnode, container)
}
function processElement(vnode:any, container:any) {
  mountElement(vnode, container)
}

function mountElement(vnode:any, container:any) {
  const { type, children, props } = vnode
  const el: HTMLElement = (vnode.el = document.createElement(type))
  if(isObject(props)) {
    for(let prop in props) {
      el.setAttribute(prop, props[prop])
    }
  }
  if(vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if(vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }
  (container as HTMLElement).appendChild(el)
}
function mountChildren(vnode:any, container:any) {
  vnode.children.forEach((child:any) => {
    patch(child, container)
  })
}
function mountComponent(initialVnode:any, container:any) {
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, container, initialVnode)
}

function setupRenderEffect(instance:any, container:any, initialVnode:any) {
  const subTree:any = instance.render.call(instance.proxy)
  patch(subTree, container)
  // 组件vnode设置el
  initialVnode.el = subTree.el
}