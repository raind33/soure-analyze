import { isObject } from "../shared/utils"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"
import { Original } from "./types"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter<T extends Original>(isReadonly?:boolean) {
  return function get(target:T, key:any) {
    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    if(!isReadonly) {
      track(target, key)
    }
    const result = Reflect.get(target, key)
    if(isObject(result)) { // 嵌套对象取值时，响应化处理
      return isReadonly ? readonly(result) : reactive(result)
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