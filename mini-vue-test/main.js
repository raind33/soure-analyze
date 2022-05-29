import { createApp, h,createTextVNode, getCurrentInstance, provide, ref } from '../lib/mini-vue.esm.js'
import Foo from './Parent.js'
const app = createApp({
  name: 'App',
  setup () {
    const a = ref('9999')
    const onClick = () => {
      a.value = '888'
    }
    return {
      a,
      onClick
    }
  },
  render() {
    return h('div', { id: 'd', class: 'c', onClick: this.onClick}, this.a)
  }
})

app.mount(document.querySelector('#app'))
