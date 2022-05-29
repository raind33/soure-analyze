import { effect } from "../reactivity/effect";
import { isObject } from "../shared/";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import {  createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options:any):any {
  const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert } = options
  function render(vnode: any, container: any) {
    patch(null, vnode, container, null);
  }

  function patch(n1:any, n2: any, container: any, parent: any) {
    const { type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (n2.shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parent);
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parent);
        }
        break;
    }
  }

  function processFragment(n1:any, n2: any, container: any, parent: any) {
    mountChildren(n2, container, parent);
  }
  function processText(n1:any,n2: any, container: any) {
    const { children } = n2;
    const text = document.createTextNode(children);
    container.appendChild(text);
  }
  function processComponent(n1:any, n2: any, container: any, parent: any) {
    mountComponent(n2, container, parent);
  }
  function processElement(n1:any, n2: any, container: any, parent: any) {
    if(!n1) {
      mountElement(n2, container, parent);
    } else {
      patchElement(n1, n2, container, parent)
    }
  }

  function mountElement(vnode: any, container: any, parent: any) {
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
      mountChildren(vnode, el, parent);
    }
    hostInsert(el, container)
  }
  function patchElement(n1:any,n2:any, container:any, parent:any) {
    console.log('patchElement')
    const newProps = n2.props || {}
    const oldProps = n1.props || {}
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
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
  function mountChildren(n2: any, container: any, parent: any) {
    n2.children.forEach((child: any) => {
      patch(null, child, container, parent);
    });
  }
  function mountComponent(initialVnode: any, container: any, parent: any) {
    const instance = createComponentInstance(initialVnode, parent);
    setupComponent(instance);
    setupRenderEffect(instance, container, initialVnode);
  }

  function setupRenderEffect(instance: any, container: any, initialVnode: any) {
    effect(() => {
      if(!instance.isMounted) { // 初始化

        const subTree: any = (instance.subTree = instance.render.call(instance.proxy))
        patch(null, subTree, container, instance);
        // 组件vnode设置el
        initialVnode.el = subTree.el;
        instance.isMounted = true
      } else {
        console.log('update')
        const subTree: any = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        console.log(prevSubTree, subTree)
        patch(prevSubTree, subTree, container, instance);
      }
    })
  }

  return {
    createApp: createAppApi(render)
  }
}
