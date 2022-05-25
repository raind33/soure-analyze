import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"


export function createComponentInstance(vnode:Record<any,any>) {
  const instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {}
  }
  return instance
}
export function setupComponent(instance:any) {
  initProps(instance)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:any) {
  const Component = instance.type
  instance.proxy = new Proxy(instance, publicInstanceProxyHandlers)
  const { setup } = Component

  if(setup) {
    const setupResult = setup(instance.props, emit.bind(null, instance))
    handleSetupResult(instance,setupResult)
  }
}
function emit(instance:any, key:string) {
  const captallize = (key: string) => {
    return key.charAt(0).toUpperCase()+key.slice(1)
  }
  const onEvent = (key:string) => {
    const str = captallize(key)
    return 'on'+str
  }
  const props = instance.props
  const event = onEvent(key)
  props[event] && props[event]()
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