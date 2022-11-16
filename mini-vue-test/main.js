import { reactive, effect } from '../lib/mini-vue.esm.js'

const obj = reactive({
  a: 1,
  b: {
    c: 99
  }
})

effect(() => {
  console.log(obj.a)
})
setTimeout(() => {
  debugger
  obj.a++
}, 2000)

