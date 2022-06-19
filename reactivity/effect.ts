import { extend } from "../shared"
import { Dep, EffectOptions, Fn, Original, ReactiveEffectRunner } from "./types"

let activeEffect:ReactiveEffect // 只有reactive配合effect使用时, 才会存在activeEffect
let shouldTrack: boolean = true  // stop后，避免再次收集依赖
export class ReactiveEffect {
  fn!: Fn
  scheduler?: Fn
  onStop?: Fn
  active: boolean = true
  deps: Dep[] = []
  constructor(fn: Fn, scheduler?: Fn) {
    this.fn = fn
    this.scheduler = scheduler
  }
  run() {
    if(!this.active) {
      return this.fn()
    }
    shouldTrack = true
    activeEffect = this
    const res = this.fn()
    shouldTrack = false
    return res
  }
  stop() {
    if(this.active) {
      cleanupEffect(this)
      this.onStop && this.onStop()
      this.active = false
    }
  }
}

export function effect(fn: Fn, options?:EffectOptions):ReactiveEffectRunner {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)
  _effect.run()
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}

const targetMap = new Map<Original, Map<string, Dep>>()
export function track(target:Original, key:any) {
  if(!isTracking()) return
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
  trackEffects(deps)
}

export function trackEffects(deps: Dep) {
  if(deps.has(activeEffect)) return // 避免重复收集
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}
export function isTracking():boolean {
  
  return activeEffect && shouldTrack
}
export function trigger(target:Original, key:any) {
  const depsMap = targetMap.get(target)
  const deps = depsMap!.get(key)
  triggerEffects(deps!)
}
export function triggerEffects(deps: Dep) {
  for(const effect of deps!) {
    if(effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
export function stop(runner:ReactiveEffectRunner) {
  runner.effect.stop()
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}