import { isObject } from "../shared/"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode:any, container:any) {
  patch(vnode, container, null)
}

function patch(vnode:any, container:any, parent:any) {
  const { type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parent)
      break;
    case Text:
      processText(vnode, container)
      break;
  
    default:
      if(vnode.shapeFlag & ShapeFlags.ELEMENT) { 
        processElement(vnode, container, parent)
      } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parent)
      }
      break;
  }
  
}

function processFragment(vnode:any, container:any, parent:any) {
  mountChildren(vnode, container,parent)
}
function processText(vnode:any, container:any) {
  const { children } = vnode
  const text = document.createTextNode(children)
  container.appendChild(text)
}
function processComponent(vnode:any, container:any, parent:any) {
  mountComponent(vnode, container, parent)
}
function processElement(vnode:any, container:any, parent:any) {
  mountElement(vnode, container, parent)
}

function mountElement(vnode:any, container:any, parent:any) {
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
    mountChildren(vnode, el, parent)
  }
  (container as HTMLElement).appendChild(el)
}
function mountChildren(vnode:any, container:any, parent:any) {
  vnode.children.forEach((child:any) => {
    patch(child, container,parent)
  })
}
function mountComponent(initialVnode:any, container:any, parent:any) {
  const instance = createComponentInstance(initialVnode, parent)
  setupComponent(instance)
  setupRenderEffect(instance, container, initialVnode)
}

function setupRenderEffect(instance:any, container:any, initialVnode:any) {
  const subTree:any = instance.render.call(instance.proxy)
  patch(subTree, container, instance)
  // 组件vnode设置el
  initialVnode.el = subTree.el
}