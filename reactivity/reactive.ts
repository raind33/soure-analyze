import { mutableHandlers, readonlyHandlers } from "./baseHandlers"
import { Original } from "./types"



export function reactive<T extends Original>(raw: T) {

  return createActiveObject(raw, mutableHandlers)
}

export function readonly<T extends Original>(raw: T) {

  return createActiveObject<T>(raw, readonlyHandlers)
}
function createActiveObject<T extends Original>(raw: T, handlers: any) {
  return new Proxy(raw, handlers) 
}

