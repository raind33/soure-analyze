import { isReactive, reactive } from '../reactive'

describe('reactive', () => {
  test('normal', () => { 
    const target = { num: 1 }
    const observed = reactive(target)

    expect(target).not.toBe(observed)
    expect(observed.num).toBe(1)
   })
  test('isReactive', () => { 
    const target = { num: 1 }
    const observed = reactive(target)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(target)).toBe(false)
   })
   test('nested object ', () => { 
    const target = { 
      nested: {
        a: 1
      },
      b: [{c:3}]
    }
    const observed = reactive(target)

    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.b)).toBe(true)
    expect(isReactive(observed.b[0])).toBe(true)
   })
})