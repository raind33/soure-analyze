
const publicPropertiesMap = {
  $el: (instance) => {
    return instance.vnode.el
  }
}
export const publicInstanceProxyHandlers = {
  get(target, key) {
    if(key in target.setupState){
      return target.setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if(publicGetter) {
      return publicGetter(target)
    }
  }
}