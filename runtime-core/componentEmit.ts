export function emit(instance:any, key:string, ...args:any) {

  const camelize = (key:string) => {
    return key.replace(/-(\w)/g, (a:any, b:string) => {
      return b? b.toUpperCase():''
    })
  }
  const capitalize = (key: string) => {
    return key.charAt(0).toUpperCase()+key.slice(1)
  }
  const onEvent = (key:string) => {
    return key ? 'on'+capitalize(key):''
  }
  const props = instance.props
  const event = onEvent(camelize(key))
  props[event] && props[event](...args)
}