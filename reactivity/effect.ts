import { extend } from "@vue/shared"
import { Fn, Original } from "./types"

let activeEffect:ReactiveEffect

class ReactiveEffect {
  fn!: Fn
  scheduler?: Fn
  constructor(fn: Fn) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    return this.fn()
  }
}

export function effect(fn: Fn, options:any) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)
  _effect.run()
  return _effect.run.bind(_effect)
}

const targetMap = new Map<Original, Map<string, Set<ReactiveEffect>>>()
export function track(target:Original, key:any) {
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if(!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }
  deps.add(activeEffect)
}
export function trigger(target:Original, key:any) {
  const depsMap = targetMap.get(target)
  const deps = depsMap!.get(key)
  for(const effect of deps!) {
    if(effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}