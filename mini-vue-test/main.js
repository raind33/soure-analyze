import { reactive, effect } from '../lib/mini-vue.esm.js'

const obj = reactive({
  a: 1,
  b: {
    c: 99
  }
})

effect(() => {
  console.log(obj.b.c)
})
setTimeout(() => {
  debugger
  obj.a++
  obj.b.c++
}, 2000)

