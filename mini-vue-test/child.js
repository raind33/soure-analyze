import { getCurrentInstance, h, inject, ref, renderSlots } from "../lib/mini-vue.esm.js"

export default {
  name: 'Child',
  setup(props, {emit}) {
  },
  render() {
    return h('div', {class:'son'},  'child msg：'+this.$props.msg)
  }
}