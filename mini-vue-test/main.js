import { createApp, h } from '../lib/mini-vue.esm.js'
import Foo from './Foo.js'
const app = createApp({
  setup () {

    return {
      a: '13239999'
    }
  },
  render() {
    return h('div', { id: 'd', class: 'c', onClick() {
      console.log(888);
    }}, [
      h('span', {class: 'e'}, this.a),
      h(Foo, { data: 32323, onAdd(a,b) {
        console.log('foo监听：onAdd',a,b);
      },onAddFoo(a,b) {
        console.log('onAddFoo',a,b);
      } },{ header: ({name}) => h('div', null, name),footer: () => h('div', null, '我是slots2')})
    ])
  }
})

app.mount(document.querySelector('#app'))
