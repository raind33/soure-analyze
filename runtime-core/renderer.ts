import { isObject } from "../shared/"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode:any, container:any) {
  patch(vnode, container)
}

function patch(vnode:any, container:any) {
  const { type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break;
    case Text:
      processText(vnode, container)
      break;
  
    default:
      if(vnode.shapeFlag & ShapeFlags.ELEMENT) { 
        processElement(vnode, container)
      } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
      break;
  }
  
}

function processFragment(vnode:any, container:any) {
  mountChildren(vnode, container)
}
function processText(vnode:any, container:any) {
  const { children } = vnode
  const text = document.createTextNode(children)
  container.appendChild(text)
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
      const val = props[prop]
      const isOn = (key:any) => /^on[A-Z]/.test(key)
      if(isOn(prop)) {
        const event = prop.slice(2).toLowerCase()
        el.addEventListener(event, val)
      } else {

        el.setAttribute(prop, val)
      }
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