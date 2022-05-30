import { createRenderer } from '../runtime-core'
export function createElement(type:any) {
  return document.createElement(type)
}
export function patchProps(el:any,prop:any, oldVal:any, newVal:any) {
  const isOn = (key: any) => /^on[A-Z]/.test(key);
  if (isOn(prop)) {
    const event = prop.slice(2).toLowerCase();
    el.addEventListener(event, newVal);
  } else {
    if(newVal === undefined || newVal === null) {
      el.removeAttribute(prop)
    } else {
      el.setAttribute(prop, newVal);
    }
  } 
}
export function insert(el:any, parent:any) {
  parent.appendChild(el)
}

const renderer = createRenderer({
  createElement,
  patchProps,
  insert,
  remove,
  setElementText
})

export function createApp(...args:any[]) {
  return renderer.createApp(...args)
}
function remove(child:any) {
  const parent = child.parentNode
  if(parent) {
    parent.removeChild(child)
  }
}
function setElementText(el:any, text:any) {
  el.textContent = text
}

export * from '../runtime-core'