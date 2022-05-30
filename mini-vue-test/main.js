import { createApp, h,createTextVNode, getCurrentInstance, provide, ref } from '../lib/mini-vue.esm.js'
import arrayToText from './arrayToText.js'
import textToArray from './textToArray.js'
const app = createApp({
  name: 'App',
  setup() {

  },
  render() {
    return h(arrayToText)
  }
})

app.mount(document.querySelector('#app'))
