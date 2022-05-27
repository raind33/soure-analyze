import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance:any, children:any) {
  if(instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}
function normalizeObjectSlots(children:any, slots:any) {
  for(let key in children) {
    let val = children[key]
    if(typeof val === 'function') {
      slots[key] = (props:any) => normalizeSlotValue(val(props))
    }
  }
}
function normalizeSlotValue(val:any) {
  return Array.isArray(val) ? val : [val]
}

