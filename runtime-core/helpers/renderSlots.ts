import { h } from "../vnode"

export function renderSlots(slots:any, key:any, params:any) {
  
  if(slots[key]) {

    return h('div', null, slots[key](params))
  }
}