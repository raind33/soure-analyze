import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers, shallowReactiveHandlers } from "./baseHandlers"
import { Original } from "./types"

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
}
export interface Target {
  [ReactiveFlags.IS_REACTIVE]?:boolean
  [ReactiveFlags.IS_READONLY]?:boolean
  [ReactiveFlags.IS_SHALLOW]?:boolean
}

export function reactive<T extends Original>(raw: T) {
  if(isReadonly(raw)) return raw
  return createReactiveObject(raw, false, mutableHandlers)
}

export function readonly<T extends Original>(raw: T) {

  return createReactiveObject<T>(raw, true, readonlyHandlers)
}
export function shallowReadonly<T extends Original>(raw: T) {
  return createReactiveObject<T>(raw, true, shallowReadonlyHandlers)
}
export function shallowReactive<T extends Original>(raw: T) {
  return createReactiveObject<T>(raw, false, shallowReactiveHandlers)
}
function createReactiveObject<T extends Original>(raw: T, isReadonly: boolean, handlers: ProxyHandler<any>) {
  return new Proxy<T>(raw, handlers) 
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
export function isReactive(obj: any): boolean {
  return !!obj[ReactiveFlags.IS_REACTIVE]
}
export function isProxy(obj:any) {
  return isReadonly(obj) || isReactive(obj)
}

