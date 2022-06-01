import { h, ref } from "../../lib/mini-vue.esm.js"
// 新节点比老节点多，且是左侧节点先对比
const prevChildren = [h('div', null, 'A'), h('div', {class:'c'}, 'B')]
const nextChildren = [h('div', null, 'A'), h('div', {class:'b'}, 'B'), h('div', null, 'C'), h('div', null, 'D')]
export default {
  name: 'Son',
  setup(props, {emit}) {
    const change = ref(false)
    window.change = change
    return {
      change
    }
  },
  render() {
    return this.change ? h('div', null, nextChildren) : h('div', null, prevChildren)
  }
}