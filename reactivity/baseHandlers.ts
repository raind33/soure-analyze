import { track, trigger } from "./effect"
import { Original } from "./types"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter<T extends Original>(isReadonly?:boolean) {
  return function get(target:T, key:any) {
    const result = Reflect.get(target, key)
    if(!isReadonly) {
      track(target, key)
    }
    return result
  }
}
function createSetter<T extends Original>() {
  return function (target: T, key:any, val:any) {
    const result = Reflect.set(target, key, val)
      trigger(target, key)
      return result
  }
}
export const mutableHandlers = {
  get,
  set
}
export const readonlyHandlers = {
  get: readonlyGet,
  set(target:object, key:any, val:any) {
    console.warn('not set')
    return true
  }
}