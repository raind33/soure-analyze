import { proxyRefs, shallowReadonly } from "../reactivity"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"


export function createComponentInstance(vnode:Record<any,any>, parent:any) {
  const instance = {
    vnode,
    type: vnode.type,
    next: null,
    setupState: {},
    slots: {},
    props: {},
    provides: parent? parent.provides:{},
    parent,
    subTree: {},
    isMounted: false,
    emit:() => {}
  }
  instance.emit = emit.bind(null, instance) as any
  return instance
}
export function setupComponent(instance:any) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:any) {
  const Component = instance.type
  instance.proxy = new Proxy(instance, publicInstanceProxyHandlers)
  const { setup } = Component

  if(setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {emit:instance.emit})
    setCurrentInstance(null)
    handleSetupResult(instance,setupResult)
  }
}

function handleSetupResult(instance:any, result:any) {
  if(typeof result === 'object') {
    instance.setupState = proxyRefs(result)
  }
  finishSetupComponent(instance)
}

function finishSetupComponent(instance:any) {
  const Component = instance.type
  if(Component.render) {
    instance.render = Component.render
  }
}

let currentInstance:any = null
export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(i:any) {
  currentInstance = i
}