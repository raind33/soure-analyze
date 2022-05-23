import { createApp, h } from '../lib/mini-vue.esm.js'

const app = createApp({
  setup () {

    return {
      a: 1323
    }
  },
  render() {
    return h('div', { id: 'd', class: 'c'}, [
      h('span', {class: 'e'}, '2323')
    ])
  }
})

app.mount(document.querySelector('#app'))
