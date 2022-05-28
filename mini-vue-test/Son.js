import { getCurrentInstance, h, inject, renderSlots } from "../lib/mini-vue.esm.js"

export default {
  name: 'Son',
  setup(props, {emit}) {
    const parentData = inject('parentData')
    const fatherData = inject('father')
    const aa = inject('aa', '默认值')
    console.log('son',getCurrentInstance());

    return {
      a: 12,
      parentData,
      fatherData,
      aa
    }
  },
  render() {
    return h('div', {class:'son'}, this.parentData+'  '+this.fatherData+'   '+this.aa)
  }
}