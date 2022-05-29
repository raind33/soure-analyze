import { createApp, h,createTextVNode, getCurrentInstance, provide, ref } from '../lib/mini-vue.esm.js'
import Foo from './Parent.js'
const app = createApp({
  name: 'App',
  setup () {
    const a = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const onClick = () => {
      a.value.foo = '888'
    }
    const onClick2 = () => {
      a.value.foo = undefined
    }
    const onClick3 = () => {
      a.value = {
        age: '23'
      }
    }
    return {
      a,
      onClick,
      onClick2,
      onClick3
    }
  },
  render() {
    return h('div', { ...this.a },  [
      '1323',
      h('button', {onClick: this.onClick}, '设置新值'),
      h('button', {onClick: this.onClick2}, '设置undefined'),
      h('button', {onClick: this.onClick3}, '赋值'),
    ])
  }
})

app.mount(document.querySelector('#app'))
