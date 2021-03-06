import { reactive } from "../reactive"
import { effect, stop } from '../effect'

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
  // test('same val not triggter', () => {
  //   const user = reactive({
  //     age: 2
  //   })
  //   let nextAge
  //   let calls = 0
  //   effect(() => {
  //     calls++
  //     nextAge = user.age
  //   })
  //   expect(nextAge).toBe(2)
  //   user.age = 2
  //   expect(calls).toBe(1)
  // })
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
  
  it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })
  it('events: onStop', () => {
    const onStop = jest.fn()
    const runner = effect(() => {}, {
      onStop
    })

    stop(runner)
    expect(onStop).toHaveBeenCalled()
  })
})
