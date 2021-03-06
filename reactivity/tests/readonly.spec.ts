import { isReadonly, readonly, shallowReadonly, isProxy } from '../reactive'

describe('readonly', () => {
  test('normal', () => { 
    const target = { num: 1 }
    const observed = readonly(target)

    expect(target).not.toBe(observed)
    expect(observed.num).toBe(1)
    expect(isProxy(observed)).toBe(true)
   })

   test('warn when call set', () => { 
    console.warn = jest.fn()
    const target = readonly({ num: 1 })
    target.num = 8
    expect(console.warn).toHaveBeenCalled()
   })
   test('isReadonly', () => { 
    const target = { num: 1 }
    const observed = readonly(target)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(target)).toBe(false)
    
   })
   test('nested object ', () => { 
    const target = { 
      nested: {
        a: 1
      },
      b: [{c:3}]
    }
    const observed = readonly(target)

    expect(isReadonly(observed.nested)).toBe(true)
    expect(isReadonly(observed.b)).toBe(true)
    expect(isReadonly(observed.b[0])).toBe(true)
   })
   test('shallowReadonly ', () => { 
    const target = { 
      nested: {
        a: 1
      }
    }
    const observed = shallowReadonly(target)

    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(observed.nested)).toBe(false)
   })
})