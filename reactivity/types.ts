import { ReactiveEffect } from './effect'

export type Original = Record<string, any>
export type Fn = (...args: any[]) => any

export interface Effect{
  (fn: Fn, options?:any):any
  deps: Set<ReactiveEffect>[]
}
export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}
