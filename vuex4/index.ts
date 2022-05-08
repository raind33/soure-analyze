import { App, inject } from "vue"

const injectKey = 'store'
interface StoreOptions<S> {
  state?: S
  getters?: GetterTree<S,S>
  mutations?: MutationTree<S>
  actions?: ActionTree<S, S>
  modules?: ModuleTree<S>
}
interface ModuleTree<R>{
  [key:string]: Module<any, R>
}
export interface Module<S, R> {
  state?: S
  getters?: GetterTree<S,R>
  mutations?: MutationTree<S>
  actions?: ActionTree<S, R>
  modules?: ModuleTree<R>
  namespaced?: boolean
}
interface GetterTree<S, R>{
  [key:string]: Getter<S,R>
}
interface MutationTree<S>{
  [key:string]: Mutation<S>
}
interface ActionTree<S, R>{
  [key:string]: Action<S, R>
}
type Action<S,R> = (actionContext: ActionContext<S,R>, payload?:any) => void
interface ActionContext<S,R> {
  dispatch: Dispatch,
  commit: Commit
  state: S
}
type Dispatch = (type: string, payload?: any) => any
type Commit = (type: string, payload?: any) => void
// type Getter<S,R> = (state: S, getters: any, rootState: R, rootGetters:any) => any
type Getter<S, R> = (state: S) => any

type Mutation<S> = (state: S, payload?:any) => void


export function useStore<S>(): Store<S>{
  return inject(injectKey)!
}
class Store<S>{
  mutations: Record<string, any> = {}
  actions: Record<string, any> = {}
  getters: GetterTree<any, S> = {}
  commit: Commit
  dispatch: Dispatch
  moduleCollection: ModuleCollection<S>
  constructor(options: StoreOptions<S>) {
    this.moduleCollection = new ModuleCollection<S>(options)

    this.commit = (type: string, payload?: any) => {
      this.commit_(type, payload)
    }
    this.dispatch = (type: string, payload?: any) => {
      this.dispatch_(type, payload)
    }
    // 注册模块
    const rootState = this.moduleCollection.root.state
    installModule(this, rootState, [], this.moduleCollection.root)
  }
  install(app: App) {
    app.provide(injectKey, this)
  }
  commit_(type: string, payload?: any) {
    debugger
    if(this.mutations[type]) {
      this.mutations[type](payload)
    }
  }
  dispatch_(type: string, payload?: any) {
    if(this.actions[type]) {
      this.actions[type](payload)
    }
  }
}
class ModuleCollection<R> {
  root!: ModuleWrapper<any, R>

  constructor(rawRootModule: Module<any, R>) {
    this.register([], rawRootModule)
  }
  register(path:string[], module: Module<any, R>) {
    const newModule = new ModuleWrapper<any, R>(module)
    if(path.length === 0) {
      this.root = newModule
    } else {
      const parentModule = this.getParent(path.slice(0, -1))
      parentModule.addChild(path[path.length-1], newModule)
    }
    if(module.modules) {
      const modules = module.modules
      Object.keys(modules).forEach(key => {
        this.register(path.concat(key), modules[key])
      })

    }
  }
  getParent(path:string[]) {
    return path.reduce((moduleWrapper: ModuleWrapper<any, R>, key: string) => {
      return moduleWrapper.getChild(key)
    }, this.root)
  }
  getNamespace(path: string[]) {
    let module = this.root
    return path.reduce((cur, key) => {
      module = module.getChild(key)
      return cur + (module.namespaced?key+'/':'')
    }, '')
  }
}
class ModuleWrapper<S,R> {
  children: Record<string, ModuleWrapper<any, R>> = {}
  rawModule: Module<any, R>
  namespaced: boolean
  state: S

  constructor(rawModule_:Module<any, R>){
    this.rawModule = rawModule_
    this.namespaced = rawModule_.namespaced || false
    this.state = rawModule_.state
  }
  addChild(key: string, moduleWrapper: ModuleWrapper<any,R>) {
    this.children[key] = moduleWrapper
  }
  getChild(key: string) {
    return this.children[key]
  }
  forEachChild(fn: childModuleWrapperToKey<R>) {
    Object.keys(this.children).forEach(key => {
      fn(this.children[key], key)
    })
  }
  forEachGetters(fn: GetterToKey<R>) {
    if(this.rawModule.getters) {
      Object.keys(this.rawModule.getters).forEach(key => {
        fn((this.rawModule.getters as any)[key], key)
      })
    }
  }
  forEachMutations(fn: MutaionToKey<S>) {
    if(this.rawModule.mutations) {
      Object.keys(this.rawModule.mutations).forEach(key => {
        fn((this.rawModule.mutations as any)[key], key)
      })
    }
  }
}

type MutaionToKey<S> = (mutation: Mutation<S>, key: string) => any
type GetterToKey<R> = (getter: Getter<any, R>, key: string) => any
type childModuleWrapperToKey<R> = (moduleWrapper: ModuleWrapper<any, R>, key: string) => void
function installModule<R>(store: Store<R>, rootState_: R, path: string[], module: ModuleWrapper<any, R>) {
  const namespace = store.moduleCollection.getNamespace(path)
  if(path.length) {
    console.log(namespace)
    const parentState: Record<string, any> = getParentState<R>(rootState_, path.slice(0, -1))
    parentState[path[path.length-1]] = module.state
  }
  module.forEachChild((child, key) => {
    installModule(store, rootState_, path.concat(key), child)
  })
  module.forEachGetters((getter, key) => {
    const name = namespace+key
    Object.defineProperty(store.getters, name, {
      get: () => {
        return getter(module.state)
      }
    })
  })
  module.forEachMutations((mutation, key) => {
    const name = namespace+key
    store.mutations[name] = (payload: any) => {
      mutation(module.state, payload)
    }
  })
}
function getParentState<S>(rootState_: S, path: string[]) {
  return path.reduce((state, key) => {
    return (state as any)[key]
  }, rootState_)
}
export function createStore<S>(options: StoreOptions<S>) {
  const store = new Store<S>(options)
  console.log(store)
  return store
}