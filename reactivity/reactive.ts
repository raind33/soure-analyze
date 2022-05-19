let activeEffect:ReactiveEffect

type Original = Record<string, any>
export function reactive(original: Original) {

  return new Proxy(original, {
    get(target:typeof original, key: keyof typeof original):any {
      const result = Reflect.get(target, key)
      track(target, key)
      return result
    },
    set(target:typeof original, key:any, val) {
      const result = Reflect.set(target, key, val)
      trigger(target, key)
      return result
    }
  })
}

type Fn = (...args: any[]) => any
class ReactiveEffect {
  fn!: Fn
  constructor(fn: Fn) {
    this.fn = fn
    activeEffect = this
    this.run()
  }
  run() {
    this.fn()
  }
}

export function effect(fn: Fn) {
  activeEffect = new ReactiveEffect(fn)
}
const targetMap = new Map()
function track(target:Original, key:any) {
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if(!deps) {
    deps = new Set()
  }
  deps.add(activeEffect)
  depsMap.set(key, deps)
}
function trigger(target:Original, key:any) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)
  for(const dep of deps) {
    dep.run()
  }
}