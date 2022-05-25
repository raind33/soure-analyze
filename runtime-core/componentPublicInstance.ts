import { hasOwn } from "../shared"

const publicPropertiesMap = {
  $el: (instance) => {
    return instance.vnode.el
  },
  $slots: (instance) => instance.slots
}
export const publicInstanceProxyHandlers = {
  get(target, key) {
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