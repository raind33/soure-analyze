import { createVNode } from "./vnode"

interface Component {
  [prop: string]:any
}
export function createAppApi(render) {
  return function createApp(rootComponent:Component) {
    const app = {
      mount(rootContainer:any) {
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }
    return app
  }
  
}