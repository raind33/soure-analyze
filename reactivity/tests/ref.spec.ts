import { effect } from "../effect"
import { reactive } from "../reactive"
import { isRef, proxyRefs, ref, unRef } from "../ref"

describe('ref', () => {
  test('normal', () => { 
    const a = ref(1)
    expect(a.value).toBe(1)
   })

   test('update', () => {
    const age = ref(7)
    let nextAge
    let calls = 0
    effect(() => {
      calls++
      nextAge = age.value
    })
    expect(nextAge).toBe(7)
    expect(calls).toBe(1)

    age.value = 9
    expect(nextAge).toBe(9)
    expect(calls).toBe(2)
    // same val not again trigger effect
    age.value = 9
    expect(nextAge).toBe(9)
    expect(calls).toBe(2)
  })

  test('nested property reactive', () => {
    const a = ref({
      num: 1
    })
    let b
    effect(() => {
      b = a.value.num
    })
    expect(b).toBe(1)
    a.value.num = 9
    expect(b).toBe(9)
  })

  test('set new object', () => {
    const obj = {
      num: 1
    }
    const a = ref(obj)
    let b
    let calls = 0
    effect(() => {
      b = a.value.num
      calls++
    })
    expect(b).toBe(1)
    a.value = obj
    expect(calls).toBe(1)
  })

  test('isRef', () => {
    const a = ref(1)
    const b = reactive({
      c: 99
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(b)).toBe(false)
  })
  test('unRef', () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  test('proxyRefs', () => {
    const user = {
      age: ref(1),
      name: 'rain'
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(1)
    expect(proxyUser.age).toBe(1)
    expect(proxyUser.name).toBe('rain')

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(30)
    expect(proxyUser.age).toBe(30)
    expect(user.age.value).toBe(30)
  })
})