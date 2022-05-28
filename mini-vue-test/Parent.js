import { createTextVNode, getCurrentInstance, provide, h, inject, renderSlots } from "../lib/mini-vue.esm.js"
import Son from './Son.js';
export default {
  name: 'Parent',
  setup(props, {emit}) {
    const fatherData = inject('father')
    provide('parentData', 'parentData')
    provide('father', 'parentData')
    console.log('parent',getCurrentInstance());
    return {
      a: 12,
      fatherData
    }
  },
  render() {
    debugger
    return h('div', {class:'parent'}, [createTextVNode(this.fatherData), h(Son)])
  }
}