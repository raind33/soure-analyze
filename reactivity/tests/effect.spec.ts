import { reactive } from "../reactive"
import { effect } from '../effect'

describe('effect', () => {
  test('normal', () => {
    const user = reactive({
      age: 2
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(3)
    user.age = 5
    expect(nextAge).toBe(6)
  })
  test('effect返回值', () => {
    let nextAge = 1
    const runner = effect(() => {
      nextAge++
      return 'rain'
    })
    expect(nextAge).toBe(2)
    const r = runner()
    expect(nextAge).toBe(3)
    expect(r).toBe('rain')
  })
  
})
