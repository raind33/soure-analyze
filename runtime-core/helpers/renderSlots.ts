import { h } from "../vnode"

export function renderSlots(slots:any, key:any) {
  
  if(slots[key]) {

    return h('div', null, slots[key])
  }
}