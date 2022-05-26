import { h } from './vnode'
export function initSlots(instance:any, children:any) {
  let slots:any = {}
  for(let key in children) {
    const val = children[key]
    slots[key] = Array.isArray(val) ? val : [val]
  }
  instance.slots = slots
}

