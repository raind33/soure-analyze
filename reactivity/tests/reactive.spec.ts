import { reactive } from '../reactive'

describe('reactive', () => {
  test('normal', () => { 
    const target = { num: 1 }
    const observed = reactive(target)

    expect(target).not.toBe(observed)
    expect(observed.num).toBe(1)
   })
})