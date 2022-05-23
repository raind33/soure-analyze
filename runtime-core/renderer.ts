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
  const el: HTMLElement = document.createElement(type)
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
function mountComponent(vnode:any, container:any) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance:any, container:any) {
  const subTree = instance.render()
  patch(subTree, container)
}