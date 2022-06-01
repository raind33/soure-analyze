import { createApp, h,createTextVNode, getCurrentInstance, provide, ref } from '../lib/mini-vue.esm.js'
import arrayToText from './arrayToText.js'
import textToArray from './textToArray.js'
import leftDiff from './elementDiffDemos/newMoreThanOldleftDiff.js'
import rightDiff from './elementDiffDemos/newMoreThanOldRightDiff.js'
import newLessThanOldleftDiff from './elementDiffDemos/newLessThanOldleftDiff.js'
import newLessThanOldRightDiff from './elementDiffDemos/newLessThanOldRightDiff.JS'
const app = createApp({
  name: 'App',
  setup() {

  },
  render() {
    return h(newLessThanOldRightDiff)
  }
})

app.mount(document.querySelector('#app'))
