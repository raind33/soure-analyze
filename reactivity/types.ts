import { ReactiveEffect } from './effect'

export type Original = Record<string, any>
export type Fn = (...args: any[]) => any

export interface Effect{
  (fn: Fn, options?:any):any
  deps: Dep[]
}
export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}
export type Dep = Set<ReactiveEffect>
export interface EffectOptions {
  onStop?:Fn,
  scheduler?:Fn
}