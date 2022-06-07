export function shouldComponentUpdate(n1:any, n2:any) {
  const newProps = n2.props
  const oldProps = n1.props
  for(let prop in newProps) {
    if(newProps[prop] !== oldProps[prop]) {
      return true
    }
  }
  return false

}