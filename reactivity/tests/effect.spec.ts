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
})
