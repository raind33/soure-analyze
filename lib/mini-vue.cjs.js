'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    if (!deps)
        return;
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
        if (!isReadonly) {
            track(target, key);
        }
        if (shallow) {
            return result;
        }
        if (isObject(result)) { // 嵌套对象取值时，响应化处理
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
    };
}
function createSetter(shallow = false) {
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
    ReactiveFlags["IS_SHALLOW"] = "__v_isShallow";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    if (isReadonly(raw))
        return raw;
    return createReactiveObject(raw, false, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, true, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, true, shallowReadonlyHandlers);
}
function createReactiveObject(raw, isReadonly, handlers) {
    return new Proxy(raw, handlers);
}
function isReadonly(value) {
    return !!(value && value[ReactiveFlags.IS_READONLY]);
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
    $slots: (instance) => instance.slots,
    $props: (instance) => instance.props
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
        next: null,
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

function shouldComponentUpdate(n1, n2) {
    const newProps = n2.props;
    const oldProps = n1.props;
    for (let prop in newProps) {
        if (newProps[prop] !== oldProps[prop]) {
            return true;
        }
    }
    return false;
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
        component: null,
        el: null,
        key: props?.key,
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

const queue = [];
const p = Promise.resolve();
let isFlushPending = false;
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job);
        queueFlush();
    }
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        if (job) {
            job();
        }
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, setElementText: hostSetElementText, remove: hostRemove } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, parent, anchor) {
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
                }
                else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parent, anchor);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parent, anchor) {
        mountChildren(n2.children, container, parent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const text = document.createTextNode(children);
        container.appendChild(text);
    }
    function processComponent(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        console.log(99);
        if (shouldComponentUpdate(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function processElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountElement(n2, container, parent, anchor);
        }
        else {
            patchElement(n1, n2, container, parent, anchor);
        }
    }
    function mountElement(vnode, container, parent, anchor) {
        const { type, children, props } = vnode;
        const el = (vnode.el = hostCreateElement(type));
        if (isObject(props)) {
            for (let prop in props) {
                const val = props[prop];
                hostPatchProps(el, prop, null, val);
            }
        }
        if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parent, anchor);
        }
        hostInsert(el, container, anchor);
    }
    function patchElement(n1, n2, container, parent, anchor) {
        const newProps = n2.props || {};
        const oldProps = n1.props || {};
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(n1.children);
            }
            if (n2.children !== n1.children) {
                hostSetElementText(container, n2.children);
            }
        }
        else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '');
                mountChildren(n2.children, container, parent, anchor);
            }
            else {
                // todo children to children
                patchKeydChildren(n1, n2, container, parent, anchor);
            }
        }
    }
    function patchKeydChildren(n1, n2, container, parent, anchor) {
        const c1 = n1.children;
        const c2 = n2.children;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        let i = 0;
        // 左侧对比
        while (i <= e1 && i <= e2) {
            const child1 = c1[i];
            const child2 = c2[i];
            if (isSameNode(child1, child2)) {
                patch(child1, child2, container, parent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        while (i <= e1 && i <= e2) {
            const child1 = c1[e1];
            const child2 = c2[e2];
            if (isSameNode(child1, child2)) {
                patch(child1, child2, container, parent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 当新的节点比老的节点多, 创建新节点并插入对应位置
        // 老a b 新a b c d， i =2, e1=1, e2=3         // 老 a b  新d c a b，   i=0, e1=-1, e2=1
        if (i > e1) {
            if (i <= e2) {
                while (i <= e2) {
                    const nextPos = e2 + 1;
                    const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                    patch(null, c2[i], container, parent, anchor);
                    i++;
                }
            }
        }
        else {
            // 老的节点比新的节点多, 删除老节点
            if (i > e2) {
                while (i <= e1) {
                    hostRemove(c1[i].el);
                    i++;
                }
            }
            else {
                // 新节点 a b  c d e f g  老节点 a b  e c l  f g
                // 删除不存在新节点中的老节点, 如果存在diff
                const keyToNewIndexMap = new Map();
                const toBePatched = e2 - i + 1;
                const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
                let move = false;
                let patched = 0;
                let lastIndex = 0;
                for (let j = i; j <= e2; j++) {
                    keyToNewIndexMap.set(c2[j].key, j);
                }
                for (let n = i; n <= e1; n++) {
                    const prevChild = c1[n];
                    // 优化 新节点patch完后，移除剩下的老节点,
                    if (patched >= toBePatched) {
                        hostRemove(prevChild.el);
                        continue;
                    }
                    let newIndex;
                    if (prevChild.key !== undefined) {
                        // 时间复杂度O(1)
                        newIndex = keyToNewIndexMap.get(prevChild.key);
                    }
                    else {
                        // 如果没key 的话，那么只能是遍历所有的新节点来确定当前节点存在不存在了
                        // 时间复杂度O(n)
                        for (let m = i; m <= e2; m++) {
                            if (isSameNode(prevChild, c2[m])) {
                                newIndex = m;
                                break;
                            }
                        }
                    }
                    if (newIndex === undefined) {
                        hostRemove(prevChild.el);
                    }
                    else {
                        if (newIndex >= lastIndex) {
                            lastIndex = newIndex;
                        }
                        else {
                            move = true;
                            console.log('move', move);
                        }
                        patched++;
                        newIndexToOldIndexMap[newIndex - i] = n + 1;
                        patch(prevChild, c2[newIndex], container, parent, null);
                    }
                }
                // 递增子序列，即稳定序列，不需要移动的新节点索引位置
                // 然后遍历要patch的节点，如果不在这个子序列中，就是要移动的节点
                const increasingNewIndexSequence = move ? getSequence(newIndexToOldIndexMap) : [];
                let j = increasingNewIndexSequence.length - 1;
                // 倒叙保证节点的正确插入
                for (let x = toBePatched - 1; x >= 0; x--) {
                    const nextIndex = i + x;
                    const nextChild = c2[nextIndex];
                    const anchorPos = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : anchor;
                    // 不存在老节点中的新节点
                    if (newIndexToOldIndexMap[x] === 0) {
                        patch(null, nextChild, container, parent, anchorPos);
                    }
                    else if (move) {
                        if (j < 0 || increasingNewIndexSequence[j] !== x) {
                            hostInsert(nextChild.el, container, anchorPos);
                        }
                        else {
                            j--;
                        }
                    }
                }
                console.log(newIndexToOldIndexMap, increasingNewIndexSequence);
            }
        }
    }
    function isSameNode(c1, c2) {
        return (c1.type === c2.type) && (c1.key === c2.key);
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        for (const key in newProps) {
            const newVal = newProps[key];
            const oldVal = oldProps[key];
            if (newVal !== oldVal) {
                hostPatchProps(el, key, oldVal, newVal);
            }
        }
        for (const oldProp in oldProps) {
            if (!(oldProp in newProps)) {
                hostPatchProps(el, oldProp);
            }
        }
    }
    function mountChildren(children, container, parent, anchor) {
        children.forEach((child) => {
            patch(null, child, container, parent, anchor);
        });
    }
    function mountComponent(initialVnode, container, parent, anchor) {
        const instance = (initialVnode.component = createComponentInstance(initialVnode, parent));
        setupComponent(instance);
        setupRenderEffect(instance, container, initialVnode, anchor);
    }
    function setupRenderEffect(instance, container, initialVnode, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) { // 初始化
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance, anchor);
                // 组件vnode设置el
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const subTree = instance.render.call(instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, null);
            }
        }, {
            scheduler() {
                console.log('scheduler 执行');
                queueJob(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVnode) {
        instance.vnode = nextVnode;
        instance.props = nextVnode.props;
        instance.next = null;
    }
    function getSequence(arr) {
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
                    }
                    else {
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
function patchProps(el, prop, oldVal, newVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(prop)) {
        const event = prop.slice(2).toLowerCase();
        el.addEventListener(event, newVal);
    }
    else {
        if (newVal === undefined || newVal === null) {
            el.removeAttribute(prop);
        }
        else {
            el.setAttribute(prop, newVal);
        }
    }
}
function insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}

exports.Fragment = Fragment;
exports.Text = Text;
exports.computed = computed;
exports.createApp = createApp;
exports.createElement = createElement;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.createVNode = createVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.nextTick = nextTick;
exports.normalizeChildren = normalizeChildren;
exports.patchProps = patchProps;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
exports.unRef = unRef;
