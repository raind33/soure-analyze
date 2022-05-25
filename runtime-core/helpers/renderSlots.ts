import { h } from "../vnode"

export function renderSlots(slots, key) {
  
  if(slots[key]) {

    return h('div', null, slots[key])
  }
}