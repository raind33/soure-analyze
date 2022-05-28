import { getCurrentInstance } from "./component";

export function provide(key:any, val:any) {
  const instance = getCurrentInstance()

  if(instance) {
    let { provides, parent } = instance

    if(parent && (provides === parent.provides)) {
      provides = instance.provides = Object.create(parent.provides)
    }
    provides[key] = val
  }
}
export function inject(key:any, defaultVal:any) {
  const instance = getCurrentInstance()
  if(instance && instance.parent) {
    const provides = instance.parent.provides
    return provides[key] || defaultVal
  }
}