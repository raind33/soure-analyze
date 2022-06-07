import { effect } from "../reactivity/effect";
import { isObject } from "../shared/";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldComponentUpdate } from "./componentUpdateUtils";
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
    if(!n1) {
      mountComponent(n2, container, parent, anchor);
    } else {
      updateComponent(n1, n2)
    }
  }
  function updateComponent(n1:any, n2:any) {
    const instance = (n2.component = n1.component)
    if(shouldComponentUpdate(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
      instance.next = null
    }
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
      } else {
        // 新节点 a b  c d e f g  老节点 a b  e c l  f g
        // 删除不存在新节点中的老节点, 如果存在diff
        const keyToNewIndexMap = new Map()
        const toBePatched = e2 -i + 1
        const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
        let move = false
        let patched = 0
        let lastIndex = 0
         for(let j = i;j<= e2;j++) {
          keyToNewIndexMap.set(c2[j].key, j)
         }
         for(let n =i;n<=e1;n++) {
           const prevChild = c1[n]

           // 优化 新节点patch完后，移除剩下的老节点,
           if(patched >= toBePatched) {
            hostRemove(prevChild.el)
            continue
           }
           let newIndex
           if(prevChild.key !== undefined) {
             // 时间复杂度O(1)
            newIndex = keyToNewIndexMap.get(prevChild.key)
           } else {
            // 如果没key 的话，那么只能是遍历所有的新节点来确定当前节点存在不存在了
            // 时间复杂度O(n)
            for(let m=i;m<=e2;m++) {
              if(isSameNode(prevChild, c2[m])) {
                newIndex = m
                break
              }
            }
           }
           
           if(newIndex === undefined){
            hostRemove(prevChild.el)
           } else{
             if(newIndex >= lastIndex) {
              lastIndex = newIndex
             } else {
               move = true
               console.log('move',move)
             }
             patched++
             newIndexToOldIndexMap[newIndex-i] = n + 1
             patch(prevChild, c2[newIndex], container, parent, null)
           }
         }

         // 递增子序列，即稳定序列，不需要移动的新节点索引位置
         // 然后遍历要patch的节点，如果不在这个子序列中，就是要移动的节点
         const increasingNewIndexSequence = move ? getSequence(newIndexToOldIndexMap):[]
         let j = increasingNewIndexSequence.length - 1
         // 倒叙保证节点的正确插入
         for(let x=toBePatched-1;x>=0;x--) {
           const nextIndex = i + x
           const nextChild = c2[nextIndex]
           const anchorPos = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : anchor;
           // 不存在老节点中的新节点
          if(newIndexToOldIndexMap[x] === 0) {
            patch(null, nextChild, container, parent, anchorPos)
          } else if(move) {
            if(j < 0 || increasingNewIndexSequence[j] !== x) {
              hostInsert(nextChild.el, container, anchorPos);
            } else {
              j--
            }
          }
         }
         console.log(newIndexToOldIndexMap, increasingNewIndexSequence)
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
    const instance = (initialVnode.component = createComponentInstance(initialVnode, parent))
    setupComponent(instance);
    setupRenderEffect(instance, container, initialVnode, anchor);
  }

  function setupRenderEffect(instance: any, container: any, initialVnode: any, anchor:any) {
    instance.update = effect(() => {
      if(!instance.isMounted) { // 初始化

        const subTree: any = (instance.subTree = instance.render.call(instance.proxy))
        patch(null, subTree, container, instance, anchor);
        // 组件vnode设置el
        initialVnode.el = subTree.el;
        instance.isMounted = true
      } else {
        console.log('update')
        const { next, vnode } = instance
        if(next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
          
        }
        const subTree: any = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, null);
      }
    })
  }
  function updateComponentPreRender(instance:any, nextVnode:any) {
    instance.vnode = nextVnode
    instance.props = nextVnode.props
    instance.next = null
    
  }
  function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = (u + v) >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
  }
  return {
    createApp: createAppApi(render)
  }
}
