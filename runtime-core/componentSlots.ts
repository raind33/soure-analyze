export function initSlots(instance:any, children:any) {
  normalizeObjectSlots(children, instance.slots)
}
function normalizeObjectSlots(children:any, slots:any) {
  for(let key in children) {
    const val = children[key]
    slots[key] = normalizeSlotValue(val)
  }
}
function normalizeSlotValue(val:any) {
  return Array.isArray(val) ? val : [val]
}

