import { createApp, h } from '../lib/mini-vue.esm.js'

const app = createApp({
  setup () {

    return {
      a: '13239999'
    }
  },
  render() {
    return h('div', { id: 'd', class: 'c'}, [
      h('span', {class: 'e'}, this.a)
    ])
  }
})

app.mount(document.querySelector('#app'))
