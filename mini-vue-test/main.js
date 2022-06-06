import { createApp, h,createTextVNode, getCurrentInstance, provide, ref } from '../lib/mini-vue.esm.js'
import child from './child.js'
const app = createApp({
  name: 'App',
  setup() {
    const msg = ref('aa')
    const count = ref(1)
    const changeChildProps = () => {
      msg.value = 'bbb'
    }
    const changeCount = () => {
      count.value++
    }
    return {
      msg,
      changeChildProps,
      count,
      changeCount
    }
  },
  render() {
    return h('div', null, [
      h('button', {
        onClick: this.changeChildProps
      }, '修改child prop'),
      h(child, {
        msg: this.msg
      }),
      h('button', {
        onClick: this.changeCount
      }, '修改不属于props的自身属性，不应更新子组件'),
      h('p', null, "count:"+this.count)
    ])
  }
})

app.mount(document.querySelector('#app'))
