function isObject(val) {
    return val !== null && typeof val === 'object';
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

function initProps(instance) {
    instance.props = instance.vnode.props;
}

var publicPropertiesMap = {
    $el: function (instance) {
        return instance.vnode.el;
    },
    $slots: function (instance) { return instance.slots; }
};
var publicInstanceProxyHandlers = {
    get: function (target, key) {
        if (hasOwn(target.setupState, key)) {
            return target.setupState[key];
        }
        else if (hasOwn(target.props, key)) {
            return target.props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(target);
        }
    }
};

function initSlots(instance, children) {
    var slots = {};
    for (var key in children) {
        var val = children[key];
        slots[key] = Array.isArray(val) ? val : [val];
    }
    instance.slots = slots;
}

function createComponentInstance(vnode) {
    var instance = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        slots: {},
        props: {}
    };
    return instance;
}
function setupComponent(instance) {
    initProps(instance);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy(instance, publicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup(instance.props, emit.bind(null, instance));
        handleSetupResult(instance, setupResult);
    }
}
function emit(instance, key) {
    var captallize = function (key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };
    var onEvent = function (key) {
        var str = captallize(key);
        return 'on' + str;
    };
    var props = instance.props;
    var event = onEvent(key);
    props[event] && props[event]();
}
function handleSetupResult(instance, result) {
    if (typeof result === 'object') {
        instance.setupState = result;
    }
    finishSetupComponent(instance);
}
function finishSetupComponent(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var type = vnode.type, children = vnode.children, props = vnode.props;
    var el = (vnode.el = document.createElement(type));
    if (isObject(props)) {
        for (var prop in props) {
            var val = props[prop];
            var isOn = function (key) { return /^on[A-Z]/.test(key); };
            if (isOn(prop)) {
                var event_1 = prop.slice(2).toLowerCase();
                el.addEventListener(event_1, val);
            }
            else {
                el.setAttribute(prop, val);
            }
        }
    }
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el);
    }
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (child) {
        patch(child, container);
    });
}
function mountComponent(initialVnode, container) {
    var instance = createComponentInstance(initialVnode);
    setupComponent(instance);
    setupRenderEffect(instance, container, initialVnode);
}
function setupRenderEffect(instance, container, initialVnode) {
    var subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    // 组件vnode设置el
    initialVnode.el = subTree.el;
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
        shapeFlag: getType(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
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

function createApp(rootComponent) {
    var app = {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
    return app;
}

function renderSlots(slots, key) {
    if (slots[key]) {
        return h('div', null, slots[key]);
    }
}

export { createApp, createVNode, h, render, renderSlots };
