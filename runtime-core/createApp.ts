import { render } from "./renderer"
import { createVNode } from "./vnode"

interface Component {
  [prop: string]:any
}
export function createApp(rootComponent:Component) {
  const app = {
    mount(rootContainer:any) {
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    }
  }
  return app
}