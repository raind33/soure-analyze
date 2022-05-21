import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"
import { Original } from "./types"

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export function reactive<T extends Original>(raw: T) {

  return createActiveObject(raw, mutableHandlers)
}

export function readonly<T extends Original>(raw: T) {

  return createActiveObject<T>(raw, readonlyHandlers)
}
export function shallowReadonly<T extends Original>(raw: T) {
  return createActiveObject<T>(raw, shallowReadonlyHandlers)
}
function createActiveObject<T extends Original>(raw: T, handlers: any) {
  return new Proxy(raw, handlers) 
}

export function isReadonly(obj: any): boolean {
  return !!obj[ReactiveFlags.IS_READONLY]
}
export function isReactive(obj: any): boolean {
  return !!obj[ReactiveFlags.IS_REACTIVE]
}
export function isProxy(obj:any) {
  return isReadonly(obj) || isReactive(obj)
}

