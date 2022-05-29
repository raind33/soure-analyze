import { createRenderer } from '../runtime-core'
export function createElement(type:any) {
  return document.createElement(type)
}
export function patchProps(el:any,prop:any, val:any) {
  const isOn = (key: any) => /^on[A-Z]/.test(key);
  if (isOn(prop)) {
    const event = prop.slice(2).toLowerCase();
    el.addEventListener(event, val);
  } else {
    el.setAttribute(prop, val);
  } 
}
export function insert(el:any, parent:any) {
  parent.appendChild(el)
}

const renderer = createRenderer({
  createElement,
  patchProps,
  insert
})

export function createApp(...args:any[]) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'