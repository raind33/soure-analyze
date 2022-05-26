import { h, renderSlots } from "../lib/mini-vue.esm.js"

export default {
  setup(props, {emit}) {
    console.log(props);
    emit('add', 1,2)
    emit('add-foo',3,4)
    return {
      a: 12
    }
  },
  render() {
    return h('div', {class:'foo', onClick() {
      console.log('foo');
      
    }, a: this.data+777}, [h('p', null, 'app'), renderSlots(this.$slots, 'header', {name: 'slot1'}), renderSlots(this.$slots, 'footer')])
  }
}