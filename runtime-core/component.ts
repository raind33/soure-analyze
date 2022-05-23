import { publicInstanceProxyHandlers } from "./componentPublicInstance"


export function createComponentInstance(vnode:Record<any,any>) {
  const instance = {
    vnode,
    type: vnode.type
  }
  return instance
}
export function setupComponent(instance:any) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:any) {
  const Component = instance.type
  instance.proxy = new Proxy(instance, publicInstanceProxyHandlers)
  const { setup } = Component

  if(setup) {
    const setupResult = setup()
    handleSetupResult(instance,setupResult)
  }
}

function handleSetupResult(instance:any, result:any) {
  if(typeof result === 'object') {
    instance.setupState = result
  }
  finishSetupComponent(instance)
}

function finishSetupComponent(instance:any) {
  const Component = instance.type
  if(Component.render) {
    instance.render = Component.render
  }
}