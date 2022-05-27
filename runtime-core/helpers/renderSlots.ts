import { Fragment, h } from "../vnode"

export function renderSlots(slots:any, key:any, params:any) {
  
  if(slots[key]) {

    return h(Fragment, null, slots[key](params))
  }
}