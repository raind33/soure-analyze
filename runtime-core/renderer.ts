import { effect } from "../reactivity/effect";
import { isObject } from "../shared/";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import {  createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options:any):any {
  const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, setElementText: hostSetElementText, remove: hostRemove } = options
  function render(vnode: any, container: any) {
    patch(null, vnode, container, null, null);
  }

  function patch(n1:any, n2: any, container: any, parent: any, anchor:any) {
    const { type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (n2.shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parent, anchor);
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parent, anchor);
        }
        break;
    }
  }

  function processFragment(n1:any, n2: any, container: any, parent: any, anchor:any) {
    mountChildren(n2.children, container, parent, anchor);
  }
  function processText(n1:any,n2: any, container: any) {
    const { children } = n2;
    const text = document.createTextNode(children);
    container.appendChild(text);
  }
  function processComponent(n1:any, n2: any, container: any, parent: any, anchor:any) {
    mountComponent(n2, container, parent, anchor);
  }
  function processElement(n1:any, n2: any, container: any, parent: any, anchor:any) {
    if(!n1) {
      mountElement(n2, container, parent, anchor);
    } else {
      patchElement(n1, n2, container, parent, anchor)
    }
  }

  function mountElement(vnode: any, container: any, parent: any, anchor:any) {
    const { type, children, props } = vnode;
    const el: HTMLElement = (vnode.el = hostCreateElement(type));
    if (isObject(props)) {
      for (let prop in props) {
        const val = props[prop];
        hostPatchProps(el, prop, null, val)
      }
    }
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parent, anchor);
    }
    hostInsert(el, container, anchor)
  }
  function patchElement(n1:any,n2:any, container:any, parent:any, anchor:any) {
    console.log('patchElement')
    const newProps = n2.props || {}
    const oldProps = n1.props || {}
    const el = (n2.el = n1.el)
    patchChildren(n1, n2, el, parent, anchor)
    patchProps(el, oldProps, newProps)
  }
  function patchChildren(n1:any, n2:any, container:any, parent:any, anchor:any) {
    const prevShapeFlag = n1.shapeFlag
    const nextShapeFlag = n2.shapeFlag
    if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children)
      }
      if(n2.children !== n1.children) {
        hostSetElementText(container, n2.children)
      }
    } else {
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(n2.children, container, parent, anchor)
      } else {
        // todo children to children
        patchKeydChildren(n1,n2, container, parent, anchor)
      }
    }
  }
  function patchKeydChildren(n1:any, n2:any, container:any,parent:any, anchor:any) {
    const c1 = n1.children
    const c2 = n2.children
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    let i = 0
    // 左侧对比
    while(i <= e1 && i <= e2) {
      const child1 = c1[i]
      const child2 = c2[i]
      if(isSameNode(child1, child2)) {
        patch(child1, child2, container, parent, anchor)
      } else {
        break
      }
      i++
    }

    // 右侧对比
    while(i <= e1 && i <= e2) {
      const child1 = c1[e1]
      const child2 = c2[e2]
      if(isSameNode(child1, child2)) {
        patch(child1, child2, container, parent, anchor)
      } else {
        break
      }
      e1--
      e2--
    }
    // 当新的节点比老的节点多, 创建新节点并插入对应位置
     // 老a b 新a b c d， i =2, e1=1, e2=3         // 老 a b  新d c a b，   i=0, e1=-1, e2=1
    
    if(i>e1) {
      if(i<=e2) {
        while(i<=e2) {
          const nextPos = e2 + 1
          const anchor = nextPos < c2.length ? c2[nextPos].el : null
          patch(null, c2[i], container, parent, anchor)
          i++
        }
      }
    } else {
      // 老的节点比新的节点多, 删除老节点
      if(i>e2) {
        while(i <= e1) {
          hostRemove(c1[i].el)
          i++
        }
      }
    }
  }
  function isSameNode(c1:any, c2:any) {
    return (c1.type === c2.type) && (c1.key === c2.key)
  }
  function unmountChildren(children:any) {
    for(let i = 0;i<children.length;i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }
  function patchProps(el:any, oldProps:any, newProps:any) {
    for(const key in newProps) {
      const newVal = newProps[key]
      const oldVal = oldProps[key]
      if(newVal !== oldVal) {
        hostPatchProps(el, key, oldVal, newVal)
      }
    }

    for(const oldProp in oldProps) {
      if(!(oldProp in newProps)) {
        hostPatchProps(el, oldProp)
      }
    }
  }
  function mountChildren(children: any, container: any, parent: any, anchor:any) {
    children.forEach((child: any) => {
      patch(null, child, container, parent, anchor);
    });
  }
  function mountComponent(initialVnode: any, container: any, parent: any, anchor:any) {
    const instance = createComponentInstance(initialVnode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, container, initialVnode, anchor);
  }

  function setupRenderEffect(instance: any, container: any, initialVnode: any, anchor:any) {
    effect(() => {
      if(!instance.isMounted) { // 初始化

        const subTree: any = (instance.subTree = instance.render.call(instance.proxy))
        patch(null, subTree, container, instance, anchor);
        // 组件vnode设置el
        initialVnode.el = subTree.el;
        instance.isMounted = true
      } else {
        console.log('update')
        const subTree: any = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        console.log(prevSubTree, subTree)
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    })
  }

  return {
    createApp: createAppApi(render)
  }
}
