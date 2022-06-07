import { getCurrentInstance, h, inject, nextTick, ref, renderSlots } from "../lib/mini-vue.esm.js"

export default {
  name: 'Child',
  setup(props, {emit}) {
    const count = ref(1)
    const changeCount = () => {
      for(let i =0; i<100;i++) {
        count.value = i
      }
      nextTick(() => {
        debugger
      })
    }
    return {
      count,
      changeCount
    }
  },
  render() {
    return h('div', {class:'son'},  [h('div', null, 'child msg：'+this.$props.msg+this.count), h('button', {onClick: this.changeCount}, '批量更新')])
  }
}