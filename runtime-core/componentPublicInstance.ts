import { hasOwn } from "../shared"

const publicPropertiesMap:any = {
  $el: (instance:any) => {
    return instance.vnode.el
  },
  $slots: (instance:any) => instance.slots
}
export const publicInstanceProxyHandlers = {
  get(target:any, key:any) {
    if(hasOwn(target.setupState, key)){
      return target.setupState[key]
    } else if (hasOwn(target.props, key)) {
      return target.props[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if(publicGetter) {
      return publicGetter(target)
    }
  }
}