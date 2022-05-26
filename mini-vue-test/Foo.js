import { h, renderSlots } from "../lib/mini-vue.esm.js"

export default {
  setup(props, emit) {
    console.log(props);
    emit('add')
    return {
      a: 12
    }
  },
  render() {
    return h('div', {class:'foo', onClick() {
      console.log('foo');
      
    }, a: this.data}, [h('p', null, 'app'), renderSlots(this.$slots, 'header'), renderSlots(this.$slots, 'footer')])
  }
}