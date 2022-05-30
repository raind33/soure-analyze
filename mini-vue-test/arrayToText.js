import { getCurrentInstance, h, inject, renderSlots } from "../lib/mini-vue.esm.js"

const nextChildren = 'nextChildren'
const prevChildren = [h('div', null, 'child1'), h('div', null, 'child2')]
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
    return this.change ? h('div', {class:'son'},  nextChildren) : h('div', {class:'son'},  prevChildren)
  }
}