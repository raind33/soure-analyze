import { unref } from "vue"
import { isObject } from "../shared/utils"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"
import { Dep } from "./types"

class RefImpl<T> {
  private _value?: any
  deps: Dep = new Set()
  __v_isRef: boolean = true
  private _rawValue: any
  constructor(value:any) {
    this._value = convert(value)
    this._rawValue = value
  }
  get value(): T {
    trackRefValue<T>(this)
    return this._value
  }
  set value(newVal) {
    if(!hasChanged(newVal, this._rawValue)) return
    this._value = convert(newVal)
    this._rawValue = newVal
    triggerEffects(this.deps)
  }
}

function convert(value:any) {
  return isObject(value) ? reactive(value) : value
}
function trackRefValue<T>(ref:RefImpl<T>) {
  if(isTracking()){
    trackEffects(ref.deps)
  }
}
function hasChanged(newVal:any, oldVal:any) {
  return !Object.is(newVal, oldVal)
}
export function ref<T>(val?: T)  {
  return new RefImpl<T>(val)
}

export function isRef<T>(ref: any): ref is RefImpl<T> {
  return !!(ref as RefImpl<any>).__v_isRef
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRef: any) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      return unref(target[key])
    },
    set(target, key, val) {
      if(isRef(target[key]) && !isRef(val)) {
        return target[key].value = val
      } else {
        return Reflect.set(target, key, val )
      }
    }
  })
}