import { computed } from "../computed"
import { ref } from "../ref"

describe('computed', () => {
 test('noraml', () => {
  const b = ref(1)
  const a = computed(() => {
    return b.value
  })

  expect(a.value).toBe(1)
 })
 test('lazy', () => {
  const b = ref(1)
  const fn = jest.fn(() => {
    return b.value
  })
  const a = computed(fn)

  expect(fn).not.toHaveBeenCalled()
  a.value;
  expect(fn).toHaveBeenCalledTimes(1)
 expect(a.value).toBe(1)
  expect(fn).toHaveBeenCalledTimes(1)
  b.value = 99
  expect(fn).toHaveBeenCalledTimes(1)
  expect(a.value).toBe(99)
  expect(fn).toHaveBeenCalledTimes(2)
 })
})