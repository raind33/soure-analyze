import { h } from "../lib/mini-vue.esm.js"

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
      
    }, a: this.data}, 'foo')
  }
}