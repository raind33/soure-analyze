import { ReactiveEffect } from "./effect";
import { effect } from "./effect";
import { Effect, Fn } from "./types";

class ComputedImpl {
  private _getter: Fn
  private _effect: ReactiveEffect
  private _dirty: boolean = true
  private _value: any
  constructor(getter:Fn) {
    this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {
    if(this._dirty) {
      this._dirty = false
      return  this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter: Fn) {
  return new ComputedImpl(getter)
}