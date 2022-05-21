import { isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
   test('normal ', () => { 
    const target = { 
      nested: {
        a: 1
      }
    }
    const observed = shallowReadonly(target)

    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(observed.nested)).toBe(false)
   })
   test('normal ', () => { 
    console.warn = jest.fn()
    const target = { 
      nested: 23
    }
    const observed = shallowReadonly(target)
    observed.nested = 88
    expect(isReadonly(console.warn)).toBe(false)
   })
})