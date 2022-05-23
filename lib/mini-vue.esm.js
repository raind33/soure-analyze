function isObject(val) {
    return val !== null && typeof val === 'object';
}

function createComponentInstance(vnode) {
    var instance = {
        vnode: vnode,
        type: vnode.type
    };
    return instance;
}
function setupComponent(instance) {
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
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
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
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
    var el = document.createElement(type);
    if (isObject(props)) {
        for (var prop in props) {
            el.setAttribute(prop, props[prop]);
        }
    }
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (child) {
        patch(child, container);
    });
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children
    };
    return vnode;
}
function h(type, props, children) {
    return createVNode(type, props, children);
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

export { createApp, createVNode, h, render };
