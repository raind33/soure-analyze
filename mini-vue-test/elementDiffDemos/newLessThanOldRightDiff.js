import { h, ref } from "../../lib/mini-vue.esm.js"
// 新节点比老节点多，且是左侧节点先对比
const prevChildren = [h('div', {key:'A'}, 'A'), h('div', {key:'B', class:'b'}, 'B'), h('div', {key:'C'}, 'C'), h('div', {key:'D'}, 'D')]
const nextChildren = [h('div', {key:'C'}, 'C'), h('div', {key:'D'}, 'D')]
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