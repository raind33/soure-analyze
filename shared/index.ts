export const extend = Object.assign
export function isObject(val:any) {
  return val !== null && typeof val === 'object'
}
export function hasOwn(obj: object, key:any) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}