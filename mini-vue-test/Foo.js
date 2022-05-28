import { getCurrentInstance, h, renderSlots } from "../lib/mini-vue.esm.js"

export default {
  name: 'Foo',
  setup(props, {emit}) {
    console.log(props);
    emit('add', 1,2)
    emit('add-foo',3,4)
    const foo = getCurrentInstance()
    console.log(foo);
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