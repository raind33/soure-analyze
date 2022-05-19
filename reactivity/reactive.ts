import { track, trigger } from "./effect"
import { Original } from "./types"

export function reactive(raw: Original) {

  return new Proxy(raw, {
    get(target, key) {
      const result = Reflect.get(target, key)
      track(target, key)
      return result
    },
    set(target, key, val) {
      const result = Reflect.set(target, key, val)
      trigger(target, key)
      return result
    }
  })
}


