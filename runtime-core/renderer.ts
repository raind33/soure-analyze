import { isObject } from "../shared/utils"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode:any, container:any) {
  patch(vnode, container)
}

function patch(vnode:any, container:any) {
  if(typeof vnode.type === 'string') { 
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
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
  if(typeof children === 'string') {
    el.textContent = children
  } else if(Array.isArray(children)) {
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