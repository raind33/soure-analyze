import { readonly } from '../reactive'

describe('readonly', () => {
  test('normal', () => { 
    const target = { num: 1 }
    const observed = readonly(target)

    expect(target).not.toBe(observed)
    expect(observed.num).toBe(1)
   })

   test('warn when call set', () => { 
    console.warn = jest.fn()
    const target = readonly({ num: 1 })
    target.num = 8
    expect(console.warn).toHaveBeenCalled()
   })
})