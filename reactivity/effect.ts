import { Fn, Original } from "./types"

let activeEffect:ReactiveEffect

class ReactiveEffect {
  fn!: Fn
  constructor(fn: Fn) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    return this.fn()
  }
}

export function effect(fn: Fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  return _effect.run.bind(_effect)
}

const targetMap = new Map()
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
  const deps = depsMap.get(key)
  for(const effect of deps) {
    effect.run()
  }
}