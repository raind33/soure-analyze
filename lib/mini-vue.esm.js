const extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === 'object';
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

let activeEffect; // 只有reactive配合effect使用时, 才会存在activeEffect
let shouldTrack = true; // stop后，避免再次收集依赖
class ReactiveEffect {
    fn;
    scheduler;
    onStop;
    active = true;
    deps = [];
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this.fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.onStop && this.onStop();
            this.active = false;
        }
    }
}
function effect(fn, options) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    trackEffects(deps);
}
function trackEffects(deps) {
    if (deps.has(activeEffect))
        return; // 避免重复收集
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
}
function isTracking() {
    return activeEffect && shouldTrack;
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    triggerEffects(deps);
}
function triggerEffects(deps) {
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function cleanupEffect(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const result = Reflect.get(target, key);
        if (shallow) {
            return result;
        }
        if (!isReadonly) {
            track(target, key);
        }
        if (isObject(result)) { // 嵌套对象取值时，响应化处理
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
    };
}
function createSetter() {
    return function (target, key, val) {
        const result = Reflect.set(target, key, val);
        trigger(target, key);
        return result;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, val) {
        console.warn('not set');
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, handlers) {
    return new Proxy(raw, handlers);
}
function isReadonly(obj) {
    return !!obj[ReactiveFlags.IS_READONLY];
}
function isReactive(obj) {
    return !!obj[ReactiveFlags.IS_REACTIVE];
}
function isProxy(obj) {
    return isReadonly(obj) || isReactive(obj);
}

class RefImpl {
    _value;
    deps = new Set();
    __v_isRef = true;
    _rawValue;
    constructor(value) {
        this._value = convert(value);
        this._rawValue = value;
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        if (!hasChanged(newVal, this._rawValue))
            return;
        this._value = convert(newVal);
        this._rawValue = newVal;
        triggerEffects(this.deps);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.deps);
    }
}
function hasChanged(newVal, oldVal) {
    return !Object.is(newVal, oldVal);
}
function ref(val) {
    return new RefImpl(val);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, val) {
            if (isRef(target[key]) && !isRef(val)) {
                return target[key].value = val;
            }
            else {
                return Reflect.set(target, key, val);
            }
        }
    });
}

class ComputedImpl {
    _getter;
    _effect;
    _dirty = true;
    _value;
    constructor(getter) {
        this._getter = getter;
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._dirty = false;
            return this._value = this._effect.run();
        }
        return this._value;
    }
}
function computed(getter) {
    return new ComputedImpl(getter);
}

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 16] = "SLOTS_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

function emit(instance, key, ...args) {
    const camelize = (key) => {
        return key.replace(/-(\w)/g, (a, b) => {
            return b ? b.toUpperCase() : '';
        });
    };
    const capitalize = (key) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };
    const onEvent = (key) => {
        return key ? 'on' + capitalize(key) : '';
    };
    const props = instance.props;
    const event = onEvent(camelize(key));
    props[event] && props[event](...args);
}

function initProps(instance, props) {
    instance.props = props || {};
}

const publicPropertiesMap = {
    $el: (instance) => {
        return instance.vnode.el;
    },
    $slots: (instance) => instance.slots
};
const publicInstanceProxyHandlers = {
    get(target, key) {
        if (hasOwn(target.setupState, key)) {
            return target.setupState[key];
        }
        else if (hasOwn(target.props, key)) {
            return target.props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(target);
        }
    }
};

function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (let key in children) {
        let val = children[key];
        if (typeof val === 'function') {
            slots[key] = (props) => normalizeSlotValue(val(props));
        }
    }
}
function normalizeSlotValue(val) {
    return Array.isArray(val) ? val : [val];
}

function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        slots: {},
        props: {},
        provides: parent ? parent.provides : {},
        parent,
        subTree: {},
        isMounted: false,
        emit: () => { }
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy(instance, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, result) {
    if (typeof result === 'object') {
        instance.setupState = proxyRefs(result);
    }
    finishSetupComponent(instance);
}
function finishSetupComponent(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(i) {
    currentInstance = i;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createTextVNode(str) {
    return createVNode(Text, {}, str);
}
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getType(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    normalizeChildren(vnode, children);
    return vnode;
}
function normalizeChildren(vnode, children) {
    if (typeof children === "object") {
        if (vnode.shapeFlag & ShapeFlags.ELEMENT) ;
        else {
            // 这里就必然是 component 了,
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
}
function h(type, props, children) {
    return createVNode(type, props, children);
}
function getType(type) {
    if (typeof type === 'string') {
        return ShapeFlags.ELEMENT;
    }
    else if (isObject(type)) {
        return ShapeFlags.STATEFUL_COMPONENT;
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        const app = {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
        return app;
    };
}

function createRenderer(options) {
    const { createElement, patchProps, insert } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parent) {
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
                }
                else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parent);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parent) {
        mountChildren(n2, container, parent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const text = document.createTextNode(children);
        container.appendChild(text);
    }
    function processComponent(n1, n2, container, parent) {
        mountComponent(n2, container, parent);
    }
    function processElement(n1, n2, container, parent) {
        if (!n1) {
            mountElement(n2, container, parent);
        }
        else {
            patchElement();
        }
    }
    function mountElement(vnode, container, parent) {
        const { type, children, props } = vnode;
        const el = (vnode.el = createElement(type));
        if (isObject(props)) {
            for (let prop in props) {
                const val = props[prop];
                patchProps(el, prop, val);
            }
        }
        if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parent);
        }
        insert(el, container);
    }
    function patchElement(n1, n2, container, parent) {
        console.log('patchElement');
    }
    function mountChildren(n2, container, parent) {
        n2.children.forEach((child) => {
            patch(null, child, container, parent);
        });
    }
    function mountComponent(initialVnode, container, parent) {
        const instance = createComponentInstance(initialVnode, parent);
        setupComponent(instance);
        setupRenderEffect(instance, container, initialVnode);
    }
    function setupRenderEffect(instance, container, initialVnode) {
        effect(() => {
            if (!instance.isMounted) { // 初始化
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance);
                // 组件vnode设置el
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const subTree = instance.render.call(instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                console.log(prevSubTree, subTree);
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function renderSlots(slots, key, params) {
    if (slots[key]) {
        return h(Fragment, null, slots[key](params));
    }
}

function provide(key, val) {
    const instance = getCurrentInstance();
    if (instance) {
        let { provides, parent } = instance;
        if (parent && (provides === parent.provides)) {
            provides = instance.provides = Object.create(parent.provides);
        }
        provides[key] = val;
    }
}
function inject(key, defaultVal) {
    const instance = getCurrentInstance();
    if (instance && instance.parent) {
        const provides = instance.parent.provides;
        return provides[key] || defaultVal;
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, prop, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(prop)) {
        const event = prop.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(prop, val);
    }
}
function insert(el, parent) {
    parent.appendChild(el);
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { Fragment, Text, computed, createApp, createElement, createRenderer, createTextVNode, createVNode, getCurrentInstance, h, inject, insert, isProxy, isReactive, isReadonly, isRef, normalizeChildren, patchProps, provide, proxyRefs, reactive, readonly, ref, renderSlots, shallowReadonly, unRef };
