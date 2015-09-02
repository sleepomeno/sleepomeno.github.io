(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/create-element.js":[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/create-element.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/diff.js":[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vtree/diff.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/global/document.js":[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":"/usr/local/lib/node_modules/pulp/node_modules/browserify/node_modules/browser-resolve/empty.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/is-object/index.js":[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/x-is-array/index.js":[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/patch.js":[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/patch.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/apply-properties.js":[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vhook.js","is-object":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/is-object/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/create-element.js":[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/handle-thunk.js","../vnode/is-vnode.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vnode.js","../vnode/is-vtext.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vtext.js","../vnode/is-widget.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js","./apply-properties":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/apply-properties.js","global/document":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/global/document.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/dom-index.js":[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/patch-op.js":[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js","../vnode/vpatch.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vpatch.js","./apply-properties":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/apply-properties.js","./create-element":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/create-element.js","./update-widget":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/update-widget.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/patch.js":[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive }
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/dom-index.js","./patch-op":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/patch-op.js","global/document":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/global/document.js","x-is-array":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/x-is-array/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vdom/update-widget.js":[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/virtual-hyperscript/hooks/soft-set-hook.js":[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/handle-thunk.js":[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-thunk.js","./is-vnode":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vnode.js","./is-vtext":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vtext.js","./is-widget":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-thunk.js":[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vhook.js":[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vnode.js":[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/version.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vtext.js":[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/version.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js":[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/version.js":[function(require,module,exports){
module.exports = "2"

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vnode.js":[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-thunk.js","./is-vhook":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vhook.js","./is-vnode":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vnode.js","./is-widget":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js","./version":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/version.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vpatch.js":[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/version.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vtext.js":[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/version.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vtree/diff-props.js":[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vhook.js","is-object":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/is-object/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vtree/diff.js":[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free,     // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/handle-thunk.js","../vnode/is-thunk":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-thunk.js","../vnode/is-vnode":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vnode.js","../vnode/is-vtext":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-vtext.js","../vnode/is-widget":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/is-widget.js","../vnode/vpatch":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vpatch.js","./diff-props":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vtree/diff-props.js","x-is-array":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/node_modules/x-is-array/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Alt = function (__superclass_Prelude$dotFunctor_0, alt) {
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
    this.alt = alt;
};
var altArray = new Alt(function () {
    return Prelude.functorArray;
}, Prelude.append(Prelude.semigroupArray));
var alt = function (dict) {
    return dict.alt;
};
var $less$bar$greater = function (__dict_Alt_0) {
    return alt(__dict_Alt_0);
};
module.exports = {
    Alt: Alt, 
    "<|>": $less$bar$greater, 
    alt: alt, 
    altArray: altArray
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Lazy = require("Control.Lazy");
var Control_Plus = require("Control.Plus");
var Alternative = function (__superclass_Control$dotPlus$dotPlus_1, __superclass_Prelude$dotApplicative_0) {
    this["__superclass_Control.Plus.Plus_1"] = __superclass_Control$dotPlus$dotPlus_1;
    this["__superclass_Prelude.Applicative_0"] = __superclass_Prelude$dotApplicative_0;
};
var alternativeArray = new Alternative(function () {
    return Control_Plus.plusArray;
}, function () {
    return Prelude.applicativeArray;
});
module.exports = {
    Alternative: Alternative, 
    alternativeArray: alternativeArray
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Apply/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var $less$times = function (__dict_Apply_0) {
    return function (a) {
        return function (b) {
            return Prelude["<*>"](__dict_Apply_0)(Prelude["<$>"](__dict_Apply_0["__superclass_Prelude.Functor_0"]())(Prelude["const"])(a))(b);
        };
    };
};
var $times$greater = function (__dict_Apply_1) {
    return function (a) {
        return function (b) {
            return Prelude["<*>"](__dict_Apply_1)(Prelude["<$>"](__dict_Apply_1["__superclass_Prelude.Functor_0"]())(Prelude["const"](Prelude.id(Prelude.categoryFn)))(a))(b);
        };
    };
};
var lift5 = function (__dict_Apply_2) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return function (d) {
                        return function (e) {
                            return Prelude["<*>"](__dict_Apply_2)(Prelude["<*>"](__dict_Apply_2)(Prelude["<*>"](__dict_Apply_2)(Prelude["<*>"](__dict_Apply_2)(Prelude["<$>"](__dict_Apply_2["__superclass_Prelude.Functor_0"]())(f)(a))(b))(c))(d))(e);
                        };
                    };
                };
            };
        };
    };
};
var lift4 = function (__dict_Apply_3) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return function (d) {
                        return Prelude["<*>"](__dict_Apply_3)(Prelude["<*>"](__dict_Apply_3)(Prelude["<*>"](__dict_Apply_3)(Prelude["<$>"](__dict_Apply_3["__superclass_Prelude.Functor_0"]())(f)(a))(b))(c))(d);
                    };
                };
            };
        };
    };
};
var lift3 = function (__dict_Apply_4) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return Prelude["<*>"](__dict_Apply_4)(Prelude["<*>"](__dict_Apply_4)(Prelude["<$>"](__dict_Apply_4["__superclass_Prelude.Functor_0"]())(f)(a))(b))(c);
                };
            };
        };
    };
};
var lift2 = function (__dict_Apply_5) {
    return function (f) {
        return function (a) {
            return function (b) {
                return Prelude["<*>"](__dict_Apply_5)(Prelude["<$>"](__dict_Apply_5["__superclass_Prelude.Functor_0"]())(f)(a))(b);
            };
        };
    };
};
module.exports = {
    lift5: lift5, 
    lift4: lift4, 
    lift3: lift3, 
    lift2: lift2, 
    "*>": $times$greater, 
    "<*": $less$times
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Biapplicative/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Biapply = require("Control.Biapply");
var Biapplicative = function (__superclass_Control$dotBiapply$dotBiapply_0, bipure) {
    this["__superclass_Control.Biapply.Biapply_0"] = __superclass_Control$dotBiapply$dotBiapply_0;
    this.bipure = bipure;
};
var bipure = function (dict) {
    return dict.bipure;
};
module.exports = {
    Biapplicative: Biapplicative, 
    bipure: bipure
};

},{"Control.Biapply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Biapply/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Biapply/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Bifunctor = require("Data.Bifunctor");
var Biapply = function (__superclass_Data$dotBifunctor$dotBifunctor_0, biapply) {
    this["__superclass_Data.Bifunctor.Bifunctor_0"] = __superclass_Data$dotBifunctor$dotBifunctor_0;
    this.biapply = biapply;
};
var $less$less$dollar$greater$greater = Prelude.id(Prelude.categoryFn);
var biapply = function (dict) {
    return dict.biapply;
};
var $less$less$times$greater$greater = function (__dict_Biapply_0) {
    return biapply(__dict_Biapply_0);
};
var bilift2 = function (__dict_Biapply_1) {
    return function (f) {
        return function (g) {
            return function (a) {
                return function (b) {
                    return $less$less$times$greater$greater(__dict_Biapply_1)($less$less$dollar$greater$greater(Data_Bifunctor.bimap(__dict_Biapply_1["__superclass_Data.Bifunctor.Bifunctor_0"]())(f)(g))(a))(b);
                };
            };
        };
    };
};
var bilift3 = function (__dict_Biapply_2) {
    return function (f) {
        return function (g) {
            return function (a) {
                return function (b) {
                    return function (c) {
                        return $less$less$times$greater$greater(__dict_Biapply_2)($less$less$times$greater$greater(__dict_Biapply_2)($less$less$dollar$greater$greater(Data_Bifunctor.bimap(__dict_Biapply_2["__superclass_Data.Bifunctor.Bifunctor_0"]())(f)(g))(a))(b))(c);
                    };
                };
            };
        };
    };
};
var $times$greater$greater = function (__dict_Biapply_3) {
    return function (a) {
        return function (b) {
            return $less$less$times$greater$greater(__dict_Biapply_3)($less$less$dollar$greater$greater(Data_Bifunctor.bimap(__dict_Biapply_3["__superclass_Data.Bifunctor.Bifunctor_0"]())(Prelude["const"](Prelude.id(Prelude.categoryFn)))(Prelude["const"](Prelude.id(Prelude.categoryFn))))(a))(b);
        };
    };
};
var $less$less$times = function (__dict_Biapply_4) {
    return function (a) {
        return function (b) {
            return $less$less$times$greater$greater(__dict_Biapply_4)($less$less$dollar$greater$greater(Data_Bifunctor.bimap(__dict_Biapply_4["__superclass_Data.Bifunctor.Bifunctor_0"]())(Prelude["const"])(Prelude["const"]))(a))(b);
        };
    };
};
module.exports = {
    Biapply: Biapply, 
    bilift3: bilift3, 
    bilift2: bilift2, 
    "<<*": $less$less$times, 
    "*>>": $times$greater$greater, 
    "<<*>>": $less$less$times$greater$greater, 
    biapply: biapply, 
    "<<$>>": $less$less$dollar$greater$greater
};

},{"Data.Bifunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifunctor/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Bind/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var $greater$eq$greater = function (__dict_Bind_0) {
    return function (f) {
        return function (g) {
            return function (a) {
                return Prelude[">>="](__dict_Bind_0)(f(a))(g);
            };
        };
    };
};
var $eq$less$less = function (__dict_Bind_1) {
    return function (f) {
        return function (m) {
            return Prelude[">>="](__dict_Bind_1)(m)(f);
        };
    };
};
var $less$eq$less = function (__dict_Bind_2) {
    return function (f) {
        return function (g) {
            return function (a) {
                return $eq$less$less(__dict_Bind_2)(f)(g(a));
            };
        };
    };
};
var join = function (__dict_Bind_3) {
    return function (m) {
        return Prelude[">>="](__dict_Bind_3)(m)(Prelude.id(Prelude.categoryFn));
    };
};
var ifM = function (__dict_Bind_4) {
    return function (cond) {
        return function (t) {
            return function (f) {
                return Prelude[">>="](__dict_Bind_4)(cond)(function (cond$prime) {
                    if (cond$prime) {
                        return t;
                    };
                    if (!cond$prime) {
                        return f;
                    };
                    throw new Error("Failed pattern match at Control.Bind line 44, column 1 - line 45, column 1: " + [ cond$prime.constructor.name ]);
                });
            };
        };
    };
};
module.exports = {
    ifM: ifM, 
    join: join, 
    "<=<": $less$eq$less, 
    ">=>": $greater$eq$greater, 
    "=<<": $eq$less$less
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Extend = require("Control.Extend");
var Comonad = function (__superclass_Control$dotExtend$dotExtend_0, extract) {
    this["__superclass_Control.Extend.Extend_0"] = __superclass_Control$dotExtend$dotExtend_0;
    this.extract = extract;
};
var extract = function (dict) {
    return dict.extract;
};
module.exports = {
    Comonad: Comonad, 
    extract: extract
};

},{"Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Extend = function (__superclass_Prelude$dotFunctor_0, extend) {
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
    this.extend = extend;
};
var extendFn = function (__dict_Semigroup_0) {
    return new Extend(function () {
        return Prelude.functorFn;
    }, function (f) {
        return function (g) {
            return function (w) {
                return f(function (w$prime) {
                    return g(Prelude["<>"](__dict_Semigroup_0)(w)(w$prime));
                });
            };
        };
    });
};
var extend = function (dict) {
    return dict.extend;
};
var $less$less$eq = function (__dict_Extend_1) {
    return extend(__dict_Extend_1);
};
var $eq$less$eq = function (__dict_Extend_2) {
    return function (f) {
        return function (g) {
            return function (w) {
                return f($less$less$eq(__dict_Extend_2)(g)(w));
            };
        };
    };
};
var $eq$greater$eq = function (__dict_Extend_3) {
    return function (f) {
        return function (g) {
            return function (w) {
                return g($less$less$eq(__dict_Extend_3)(f)(w));
            };
        };
    };
};
var $eq$greater$greater = function (__dict_Extend_4) {
    return function (w) {
        return function (f) {
            return $less$less$eq(__dict_Extend_4)(f)(w);
        };
    };
};
var duplicate = function (__dict_Extend_5) {
    return extend(__dict_Extend_5)(Prelude.id(Prelude.categoryFn));
};
module.exports = {
    Extend: Extend, 
    duplicate: duplicate, 
    "=<=": $eq$less$eq, 
    "=>=": $eq$greater$eq, 
    "=>>": $eq$greater$greater, 
    "<<=": $less$less$eq, 
    extend: extend, 
    extendFn: extendFn
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Lazy = function (defer) {
    this.defer = defer;
};
var defer = function (dict) {
    return dict.defer;
};
var fix = function (__dict_Lazy_0) {
    return function (f) {
        return defer(__dict_Lazy_0)(function (_268) {
            return f(fix(__dict_Lazy_0)(f));
        });
    };
};
module.exports = {
    Lazy: Lazy, 
    fix: fix, 
    defer: defer
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Aff = require("Control.Monad.Aff");
var Control_Monad_Cont_Trans = require("Control.Monad.Cont.Trans");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_Except_Trans = require("Control.Monad.Except.Trans");
var Control_Monad_List_Trans = require("Control.Monad.List.Trans");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_RWS_Trans = require("Control.Monad.RWS.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Data_Monoid = require("Data.Monoid");
var MonadAff = function (liftAff) {
    this.liftAff = liftAff;
};
var monadAffAff = new MonadAff(Prelude.id(Prelude.categoryFn));
var liftAff = function (dict) {
    return dict.liftAff;
};
var monadAffContT = function (__dict_Monad_0) {
    return function (__dict_MonadAff_1) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_Cont_Trans.monadTransContT)(__dict_Monad_0))(liftAff(__dict_MonadAff_1)));
    };
};
var monadAffError = function (__dict_Monad_2) {
    return function (__dict_MonadAff_3) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_Error_Trans.monadTransErrorT)(__dict_Monad_2))(liftAff(__dict_MonadAff_3)));
    };
};
var monadAffExceptT = function (__dict_Monad_4) {
    return function (__dict_MonadAff_5) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_Except_Trans.monadTransExceptT)(__dict_Monad_4))(liftAff(__dict_MonadAff_5)));
    };
};
var monadAffListT = function (__dict_Monad_6) {
    return function (__dict_MonadAff_7) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_List_Trans.monadTransListT)(__dict_Monad_6))(liftAff(__dict_MonadAff_7)));
    };
};
var monadAffMaybe = function (__dict_Monad_8) {
    return function (__dict_MonadAff_9) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_Maybe_Trans.monadTransMaybeT)(__dict_Monad_8))(liftAff(__dict_MonadAff_9)));
    };
};
var monadAffRWS = function (__dict_Monad_10) {
    return function (__dict_Monoid_11) {
        return function (__dict_MonadAff_12) {
            return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_RWS_Trans.monadTransRWST(__dict_Monoid_11))(__dict_Monad_10))(liftAff(__dict_MonadAff_12)));
        };
    };
};
var monadAffReader = function (__dict_Monad_13) {
    return function (__dict_MonadAff_14) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_Reader_Trans.monadTransReaderT)(__dict_Monad_13))(liftAff(__dict_MonadAff_14)));
    };
};
var monadAffState = function (__dict_Monad_15) {
    return function (__dict_MonadAff_16) {
        return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_State_Trans.monadTransStateT)(__dict_Monad_15))(liftAff(__dict_MonadAff_16)));
    };
};
var monadAffWriter = function (__dict_Monad_17) {
    return function (__dict_Monoid_18) {
        return function (__dict_MonadAff_19) {
            return new MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_Writer_Trans.monadTransWriterT(__dict_Monoid_18))(__dict_Monad_17))(liftAff(__dict_MonadAff_19)));
        };
    };
};
module.exports = {
    MonadAff: MonadAff, 
    liftAff: liftAff, 
    monadAffAff: monadAffAff, 
    monadAffContT: monadAffContT, 
    monadAffError: monadAffError, 
    monadAffExceptT: monadAffExceptT, 
    monadAffListT: monadAffListT, 
    monadAffMaybe: monadAffMaybe, 
    monadAffReader: monadAffReader, 
    monadAffRWS: monadAffRWS, 
    monadAffState: monadAffState, 
    monadAffWriter: monadAffWriter
};

},{"Control.Monad.Aff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff/index.js","Control.Monad.Cont.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Cont.Trans/index.js","Control.Monad.Error.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Trans/index.js","Control.Monad.Except.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Except.Trans/index.js","Control.Monad.List.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.List.Trans/index.js","Control.Monad.Maybe.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Maybe.Trans/index.js","Control.Monad.RWS.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.RWS.Trans/index.js","Control.Monad.Reader.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Reader.Trans/index.js","Control.Monad.State.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.State.Trans/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.Monad.Writer.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Control.Monad.Aff

exports._cancelWith = function (nonCanceler, aff, canceler1) {
  return function(success, error) {
    var canceler2 = aff(success, error);

    return function(e) {
      return function(success, error) {
        var cancellations = 0;
        var result        = false;
        var errored       = false;

        var s = function(bool) {
          cancellations = cancellations + 1;
          result        = result || bool;

          if (cancellations === 2 && !errored) {
            try {
              success(result);
            } catch (e) {
              error(e);
            }
          }
        };

        var f = function(err) {
          if (!errored) {
            errored = true;

            error(err);
          }
        };

        canceler2(e)(s, f);
        canceler1(e)(s, f);

        return nonCanceler;
      };
    };
  };
}

exports._setTimeout = function (nonCanceler, millis, aff) {
  var set = setTimeout, clear = clearTimeout;
  if (millis <= 0 && typeof setImmediate === "function") {
    set = setImmediate;
    clear = clearImmediate;
  }
  return function(success, error) {
    var canceler;

    var timeout = set(function() {
      canceler = aff(success, error);
    }, millis);

    return function(e) {
      return function(s, f) {
        if (canceler !== undefined) {
          return canceler(e)(s, f);
        } else {
          clear(timeout);

          try {
            s(true);
          } catch (e) {
            f(e);
          }

          return nonCanceler;
        }
      };
    };
  };
}

exports._unsafeInterleaveAff = function (aff) {
  return aff;
}

exports._forkAff = function (nonCanceler, aff) {
  var voidF = function(){};

  return function(success, error) {
    var canceler = aff(voidF, voidF);

    try {
      success(canceler);
    } catch (e) {
      error(e);
    }

    return nonCanceler;
  };
}

exports._makeAff = function (cb) {
  return function(success, error) {
    return cb(function(e) {
      return function() {
        error(e);
      };
    })(function(v) {
      return function() {
        try {
          success(v);
        } catch (e) {
          error(e);
        }
      };
    })();
  }
}

exports._pure = function (nonCanceler, v) {
  return function(success, error) {
    try {
      success(v);
    } catch (e) {
      error(e);
    }

    return nonCanceler;
  };
}

exports._throwError = function (nonCanceler, e) {
  return function(success, error) {
    error(e);

    return nonCanceler;
  };
}

exports._fmap = function (f, aff) {
  return function(success, error) {
    return aff(function(v) {
      try {
        success(f(v));
      } catch (e) {
        error(e);
      }
    }, error);
  };
}

exports._bind = function (alwaysCanceler, aff, f) {
  return function(success, error) {
    var canceler1, canceler2;

    var isCanceled    = false;
    var requestCancel = false;

    var onCanceler = function(){};

    canceler1 = aff(function(v) {
      if (requestCancel) {
        isCanceled = true;

        return alwaysCanceler;
      } else {
        canceler2 = f(v)(success, error);

        onCanceler(canceler2);

        return canceler2;
      }
    }, error);

    return function(e) {
      return function(s, f) {
        requestCancel = true;

        if (canceler2 !== undefined) {
          return canceler2(e)(s, f);
        } else {
          return canceler1(e)(function(bool) {
            if (bool || isCanceled) {
              try {
                s(true);
              } catch (e) {
                f(e);
              }
            } else {
              onCanceler = function(canceler) {
                canceler(e)(s, f);
              };
            }
          }, f);
        }
      };
    };
  };
}

exports._attempt = function (Left, Right, aff) {
  return function(success, error) {
    return aff(function(v) {
      try {
        success(Right(v));
      } catch (e) {
        error(e);
      }
    }, function(e) {
      try {
        success(Left(e));
      } catch (e) {
        error(e);
      }
    });
  };
}

exports._runAff = function (errorT, successT, aff) {
  return function() {
    return aff(function(v) {
      try {
        successT(v)();
      } catch (e) {
        errorT(e)();
      }
    }, function(e) {
      errorT(e)();
    });
  };
}

exports._liftEff = function (nonCanceler, e) {
  return function(success, error) {
    try {
      success(e());
    } catch (e) {
      error(e);
    }

    return nonCanceler;
  };
}

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Cont_Class = require("Control.Monad.Cont.Class");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Monad_Eff_Exception = require("Control.Monad.Eff.Exception");
var Control_Monad_Eff_Unsafe = require("Control.Monad.Eff.Unsafe");
var Control_Monad_Error_Class = require("Control.Monad.Error.Class");
var Control_Monad_Rec_Class = require("Control.Monad.Rec.Class");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Either = require("Data.Either");
var Data_Function = require("Data.Function");
var Data_Monoid = require("Data.Monoid");
var Canceler = function (x) {
    return x;
};
var runAff = function (ex) {
    return function (f) {
        return function (aff) {
            return $foreign._runAff(ex, f, aff);
        };
    };
};
var makeAff$prime = function (h) {
    return $foreign._makeAff(h);
};
var launchAff = runAff(Prelude["const"](Prelude.pure(Control_Monad_Eff.applicativeEff)(Prelude.unit)))(Prelude["const"](Prelude.pure(Control_Monad_Eff.applicativeEff)(Prelude.unit)));
var functorAff = new Prelude.Functor(function (f) {
    return function (fa) {
        return $foreign._fmap(f, fa);
    };
});
var cancel = function (_638) {
    return _638;
};
var attempt = function (aff) {
    return $foreign._attempt(Data_Either.Left.create, Data_Either.Right.create, aff);
};
var apathize = function (a) {
    return Prelude["<$>"](functorAff)(Prelude["const"](Prelude.unit))(attempt(a));
};
var applyAff = new Prelude.Apply(function () {
    return functorAff;
}, function (ff) {
    return function (fa) {
        return $foreign._bind(alwaysCanceler, ff, function (f) {
            return Prelude["<$>"](functorAff)(f)(fa);
        });
    };
});
var applicativeAff = new Prelude.Applicative(function () {
    return applyAff;
}, function (v) {
    return $foreign._pure(nonCanceler, v);
});
var nonCanceler = Prelude["const"](Prelude.pure(applicativeAff)(false));
var alwaysCanceler = Prelude["const"](Prelude.pure(applicativeAff)(true));
var cancelWith = function (aff) {
    return function (c) {
        return $foreign._cancelWith(nonCanceler, aff, c);
    };
};
var forkAff = function (aff) {
    return $foreign._forkAff(nonCanceler, aff);
};
var later$prime = function (n) {
    return function (aff) {
        return $foreign._setTimeout(nonCanceler, n, aff);
    };
};
var later = later$prime(0);
var liftEff$prime = function (eff) {
    return attempt($foreign._unsafeInterleaveAff($foreign._liftEff(nonCanceler, eff)));
};
var makeAff = function (h) {
    return makeAff$prime(function (e) {
        return function (a) {
            return Prelude["<$>"](Control_Monad_Eff.functorEff)(Prelude["const"](nonCanceler))(h(e)(a));
        };
    });
};
var monadContAff = new Control_Monad_Cont_Class.MonadCont(function (f) {
    return makeAff(function (eb) {
        return function (cb) {
            return runAff(eb)(cb)(f(function (a) {
                return makeAff(function (_637) {
                    return function (_636) {
                        return cb(a);
                    };
                });
            }));
        };
    });
});
var semigroupAff = function (__dict_Semigroup_0) {
    return new Prelude.Semigroup(function (a) {
        return function (b) {
            return Prelude["<*>"](applyAff)(Prelude["<$>"](functorAff)(Prelude["<>"](__dict_Semigroup_0))(a))(b);
        };
    });
};
var monoidAff = function (__dict_Monoid_1) {
    return new Data_Monoid.Monoid(function () {
        return semigroupAff(__dict_Monoid_1["__superclass_Prelude.Semigroup_0"]());
    }, Prelude.pure(applicativeAff)(Data_Monoid.mempty(__dict_Monoid_1)));
};
var semigroupCanceler = new Prelude.Semigroup(function (_639) {
    return function (_640) {
        return function (e) {
            return Prelude["<*>"](applyAff)(Prelude["<$>"](functorAff)(Prelude["||"](Prelude.booleanAlgebraBoolean))(_639(e)))(_640(e));
        };
    };
});
var monoidCanceler = new Data_Monoid.Monoid(function () {
    return semigroupCanceler;
}, Prelude["const"](Prelude.pure(applicativeAff)(true)));
var bindAff = new Prelude.Bind(function () {
    return applyAff;
}, function (fa) {
    return function (f) {
        return $foreign._bind(alwaysCanceler, fa, f);
    };
});
var monadAff = new Prelude.Monad(function () {
    return applicativeAff;
}, function () {
    return bindAff;
});
var monadEffAff = new Control_Monad_Eff_Class.MonadEff(function () {
    return monadAff;
}, function (eff) {
    return $foreign._liftEff(nonCanceler, eff);
});
var monadErrorAff = new Control_Monad_Error_Class.MonadError(function (aff) {
    return function (ex) {
        return Prelude[">>="](bindAff)(attempt(aff))(Data_Either.either(ex)(Prelude.pure(applicativeAff)));
    };
}, function (e) {
    return $foreign._throwError(nonCanceler, e);
});
var $$finally = function (aff1) {
    return function (aff2) {
        return Prelude.bind(bindAff)(attempt(aff1))(function (_55) {
            return Prelude.bind(bindAff)(aff2)(function () {
                return Data_Either.either(Control_Monad_Error_Class.throwError(monadErrorAff))(Prelude.pure(applicativeAff))(_55);
            });
        });
    };
};
var monadRecAff = new Control_Monad_Rec_Class.MonadRec(function () {
    return monadAff;
}, function (f) {
    return function (a) {
        var go = function (size) {
            return function (f_1) {
                return function (a_1) {
                    return Prelude.bind(bindAff)(f_1(a_1))(function (_56) {
                        if (_56 instanceof Data_Either.Left) {
                            if (size < 100) {
                                return go(size + 1 | 0)(f_1)(_56.value0);
                            };
                            if (Prelude.otherwise) {
                                return later(Control_Monad_Rec_Class.tailRecM(monadRecAff)(f_1)(_56.value0));
                            };
                        };
                        if (_56 instanceof Data_Either.Right) {
                            return Prelude.pure(applicativeAff)(_56.value0);
                        };
                        throw new Error("Failed pattern match: " + [ _56.constructor.name ]);
                    });
                };
            };
        };
        return go(0)(f)(a);
    };
});
var altAff = new Control_Alt.Alt(function () {
    return functorAff;
}, function (a1) {
    return function (a2) {
        return Prelude[">>="](bindAff)(attempt(a1))(Data_Either.either(Prelude["const"](a2))(Prelude.pure(applicativeAff)));
    };
});
var plusAff = new Control_Plus.Plus(function () {
    return altAff;
}, Control_Monad_Error_Class.throwError(monadErrorAff)(Control_Monad_Eff_Exception.error("Always fails")));
var alternativeAff = new Control_Alternative.Alternative(function () {
    return plusAff;
}, function () {
    return applicativeAff;
});
var monadPlusAff = new Control_MonadPlus.MonadPlus(function () {
    return alternativeAff;
}, function () {
    return monadAff;
});
module.exports = {
    Canceler: Canceler, 
    runAff: runAff, 
    nonCanceler: nonCanceler, 
    "makeAff'": makeAff$prime, 
    makeAff: makeAff, 
    "liftEff'": liftEff$prime, 
    launchAff: launchAff, 
    "later'": later$prime, 
    later: later, 
    forkAff: forkAff, 
    "finally": $$finally, 
    cancelWith: cancelWith, 
    cancel: cancel, 
    attempt: attempt, 
    apathize: apathize, 
    semigroupAff: semigroupAff, 
    monoidAff: monoidAff, 
    functorAff: functorAff, 
    applyAff: applyAff, 
    applicativeAff: applicativeAff, 
    bindAff: bindAff, 
    monadAff: monadAff, 
    monadEffAff: monadEffAff, 
    monadErrorAff: monadErrorAff, 
    altAff: altAff, 
    plusAff: plusAff, 
    alternativeAff: alternativeAff, 
    monadPlusAff: monadPlusAff, 
    monadRecAff: monadRecAff, 
    monadContAff: monadContAff, 
    semigroupCanceler: semigroupCanceler, 
    monoidCanceler: monoidCanceler
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff/foreign.js","Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Monad.Cont.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Cont.Class/index.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Eff.Exception":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Exception/index.js","Control.Monad.Eff.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/index.js","Control.Monad.Error.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Class/index.js","Control.Monad.Rec.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Cont.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Error = require("Control.Monad.Error");
var Control_Monad_Cont_Trans = require("Control.Monad.Cont.Trans");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Data_Monoid = require("Data.Monoid");
var MonadCont = function (callCC) {
    this.callCC = callCC;
};
var monadContContT = function (__dict_Monad_0) {
    return new MonadCont(Control_Monad_Cont_Trans.callCC);
};
var callCC = function (dict) {
    return dict.callCC;
};
var monadContErrorT = function (__dict_MonadCont_1) {
    return new MonadCont(Control_Monad_Error_Trans.liftCallCCError(callCC(__dict_MonadCont_1)));
};
var monadContMaybeT = function (__dict_MonadCont_2) {
    return new MonadCont(Control_Monad_Maybe_Trans.liftCallCCMaybe(callCC(__dict_MonadCont_2)));
};
var monadContReaderT = function (__dict_MonadCont_3) {
    return new MonadCont(Control_Monad_Reader_Trans.liftCallCCReader(callCC(__dict_MonadCont_3)));
};
var monadContStateT = function (__dict_MonadCont_4) {
    return new MonadCont(Control_Monad_State_Trans["liftCallCCState'"](callCC(__dict_MonadCont_4)));
};
var monadWriterT = function (__dict_Monoid_5) {
    return function (__dict_MonadCont_6) {
        return new MonadCont(Control_Monad_Writer_Trans.liftCallCCWriter(__dict_Monoid_5)(callCC(__dict_MonadCont_6)));
    };
};
module.exports = {
    MonadCont: MonadCont, 
    callCC: callCC, 
    monadContContT: monadContContT, 
    monadContErrorT: monadContErrorT, 
    monadContMaybeT: monadContMaybeT, 
    monadContReaderT: monadContReaderT, 
    monadContStateT: monadContStateT, 
    monadWriterT: monadWriterT
};

},{"Control.Monad.Cont.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Cont.Trans/index.js","Control.Monad.Error":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error/index.js","Control.Monad.Error.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Trans/index.js","Control.Monad.Maybe.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Maybe.Trans/index.js","Control.Monad.Reader.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Reader.Trans/index.js","Control.Monad.State.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.State.Trans/index.js","Control.Monad.Writer.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Cont.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var ContT = function (x) {
    return x;
};
var runContT = function (_265) {
    return function (k) {
        return _265(k);
    };
};
var withContT = function (f) {
    return function (m) {
        return function (k) {
            return runContT(m)(f(k));
        };
    };
};
var monadTransContT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_0) {
    return function (m) {
        return function (k) {
            return Prelude[">>="](__dict_Monad_0["__superclass_Prelude.Bind_1"]())(m)(k);
        };
    };
});
var mapContT = function (f) {
    return function (m) {
        return function (k) {
            return f(runContT(m)(k));
        };
    };
};
var functorContT = function (__dict_Monad_4) {
    return new Prelude.Functor(function (f) {
        return function (m) {
            return function (k) {
                return runContT(m)(function (a) {
                    return k(f(a));
                });
            };
        };
    });
};
var callCC = function (f) {
    return function (k) {
        return runContT(f(function (a) {
            return function (_264) {
                return k(a);
            };
        }))(k);
    };
};
var applyContT = function (__dict_Functor_6) {
    return function (__dict_Monad_7) {
        return new Prelude.Apply(function () {
            return functorContT(__dict_Monad_7);
        }, function (f) {
            return function (v) {
                return function (k) {
                    return runContT(f)(function (g) {
                        return runContT(v)(function (a) {
                            return k(g(a));
                        });
                    });
                };
            };
        });
    };
};
var bindContT = function (__dict_Monad_5) {
    return new Prelude.Bind(function () {
        return applyContT(((__dict_Monad_5["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(__dict_Monad_5);
    }, function (m) {
        return function (k) {
            return function (k$prime) {
                return runContT(m)(function (a) {
                    return runContT(k(a))(k$prime);
                });
            };
        };
    });
};
var applicativeContT = function (__dict_Functor_8) {
    return function (__dict_Monad_9) {
        return new Prelude.Applicative(function () {
            return applyContT(__dict_Functor_8)(__dict_Monad_9);
        }, function (a) {
            return function (k) {
                return k(a);
            };
        });
    };
};
var monadContT = function (__dict_Monad_3) {
    return new Prelude.Monad(function () {
        return applicativeContT(((__dict_Monad_3["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(__dict_Monad_3);
    }, function () {
        return bindContT(__dict_Monad_3);
    });
};
var monadEffContT = function (__dict_Monad_1) {
    return function (__dict_MonadEff_2) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadContT(__dict_Monad_1);
        }, function (_1263) {
            return Control_Monad_Trans.lift(monadTransContT)(__dict_Monad_1)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_2)(_1263));
        });
    };
};
module.exports = {
    ContT: ContT, 
    callCC: callCC, 
    withContT: withContT, 
    mapContT: mapContT, 
    runContT: runContT, 
    functorContT: functorContT, 
    applyContT: applyContT, 
    applicativeContT: applicativeContT, 
    bindContT: bindContT, 
    monadContT: monadContT, 
    monadTransContT: monadTransContT, 
    monadEffContT: monadEffContT
};

},{"Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var MonadEff = function (__superclass_Prelude$dotMonad_0, liftEff) {
    this["__superclass_Prelude.Monad_0"] = __superclass_Prelude$dotMonad_0;
    this.liftEff = liftEff;
};
var monadEffEff = new MonadEff(function () {
    return Control_Monad_Eff.monadEff;
}, Prelude.id(Prelude.categoryFn));
var liftEff = function (dict) {
    return dict.liftEff;
};
module.exports = {
    MonadEff: MonadEff, 
    liftEff: liftEff, 
    monadEffEff: monadEffEff
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Console/foreign.js":[function(require,module,exports){
/* global exports, console */
"use strict";

// module Control.Monad.Eff.Console

exports.log = function (s) {
  return function () {
    console.log(s);
    return {};
  };
};

exports.error = function (s) {
  return function () {
    console.error(s);
    return {};
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Console/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var print = function (__dict_Show_0) {
    return function (_1259) {
        return $foreign.log(Prelude.show(__dict_Show_0)(_1259));
    };
};
module.exports = {
    print: print, 
    error: $foreign.error, 
    log: $foreign.log
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Console/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Exception/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Control.Monad.Eff.Exception

exports.showErrorImpl = function (err) {
  return err.stack || err.toString();
};

exports.error = function (msg) {
  return new Error(msg);
};

exports.message = function (e) {
  return e.message;
};

exports.throwException = function (e) {
  return function () {
    throw e;
  };
};

exports.catchException = function (c) {
  return function (t) {
    return function () {
      try {
        return t();
      } catch (e) {
        if (e instanceof Error || Object.prototype.toString.call(e) === "[object Error]") {
          return c(e)();
        } else {
          return c(new Error(e.toString()))();
        }
      }
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Exception/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var showError = new Prelude.Show($foreign.showErrorImpl);
module.exports = {
    showError: showError, 
    catchException: $foreign.catchException, 
    throwException: $foreign.throwException, 
    message: $foreign.message, 
    error: $foreign.error
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Exception/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Ref/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Control.Monad.Eff.Ref

exports.newRef = function (val) {
  return function () {
    return { value: val };
  };
};

exports.readRef = function (ref) {
  return function () {
    return ref.value;
  };
};

exports["modifyRef'"] = function (ref) {
  return function (f) {
    return function () {
      var t = f(ref.value);
      ref.value = t.state;
      return t.value;
    };
  };
};

exports.writeRef = function (ref) {
  return function (val) {
    return function () {
      ref.value = val;
      return {};
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Ref/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var modifyRef = function (ref) {
    return function (f) {
        return $foreign["modifyRef'"](ref)(function (s) {
            return {
                state: f(s), 
                value: Prelude.unit
            };
        });
    };
};
module.exports = {
    modifyRef: modifyRef, 
    writeRef: $foreign.writeRef, 
    "modifyRef'": $foreign["modifyRef'"], 
    readRef: $foreign.readRef, 
    newRef: $foreign.newRef
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Ref/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Control.Monad.Eff.Unsafe

exports.unsafeInterleaveEff = function (f) {
  return f;
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
module.exports = {
    unsafeInterleaveEff: $foreign.unsafeInterleaveEff
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Control.Monad.Eff

exports.returnE = function (a) {
  return function () {
    return a;
  };
};

exports.bindE = function (a) {
  return function (f) {
    return function () {
      return f(a())();
    };
  };
};

exports.runPure = function (f) {
  return f();
};

exports.untilE = function (f) {
  return function () {
    while (!f());
    return {};
  };
};

exports.whileE = function (f) {
  return function (a) {
    return function () {
      while (f()) {
        a();
      }
      return {};
    };
  };
};

exports.forE = function (lo) {
  return function (hi) {
    return function (f) {
      return function () {
        for (var i = lo; i < hi; i++) {
          f(i)();
        }
      };
    };
  };
};

exports.foreachE = function (as) {
  return function (f) {
    return function () {
      for (var i = 0, l = as.length; i < l; i++) {
        f(as[i])();
      }
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var monadEff = new Prelude.Monad(function () {
    return applicativeEff;
}, function () {
    return bindEff;
});
var bindEff = new Prelude.Bind(function () {
    return applyEff;
}, $foreign.bindE);
var applyEff = new Prelude.Apply(function () {
    return functorEff;
}, Prelude.ap(monadEff));
var applicativeEff = new Prelude.Applicative(function () {
    return applyEff;
}, $foreign.returnE);
var functorEff = new Prelude.Functor(Prelude.liftA1(applicativeEff));
module.exports = {
    functorEff: functorEff, 
    applyEff: applyEff, 
    applicativeEff: applicativeEff, 
    bindEff: bindEff, 
    monadEff: monadEff, 
    foreachE: $foreign.foreachE, 
    forE: $foreign.forE, 
    whileE: $foreign.whileE, 
    untilE: $foreign.untilE, 
    runPure: $foreign.runPure
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/foreign.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Error = require("Control.Monad.Error");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_Except_Trans = require("Control.Monad.Except.Trans");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var MonadError = function (catchError, throwError) {
    this.catchError = catchError;
    this.throwError = throwError;
};
var throwError = function (dict) {
    return dict.throwError;
};
var monadErrorMaybe = new MonadError(function (_635) {
    return function (f) {
        if (_635 instanceof Data_Maybe.Nothing) {
            return f(Prelude.unit);
        };
        if (_635 instanceof Data_Maybe.Just) {
            return new Data_Maybe.Just(_635.value0);
        };
        throw new Error("Failed pattern match at Control.Monad.Error.Class line 60, column 1 - line 65, column 1: " + [ _635.constructor.name, f.constructor.name ]);
    };
}, Prelude["const"](Data_Maybe.Nothing.value));
var monadErrorExceptT = function (__dict_Monad_0) {
    return new MonadError(Control_Monad_Except_Trans.catchE(__dict_Monad_0), Control_Monad_Except_Trans.throwE(__dict_Monad_0["__superclass_Prelude.Applicative_0"]()));
};
var monadErrorErrorT = function (__dict_Monad_1) {
    return new MonadError(function (m) {
        return function (h) {
            return Control_Monad_Error_Trans.ErrorT(Prelude.bind(__dict_Monad_1["__superclass_Prelude.Bind_1"]())(Control_Monad_Error_Trans.runErrorT(m))(function (_54) {
                if (_54 instanceof Data_Either.Left) {
                    return Control_Monad_Error_Trans.runErrorT(h(_54.value0));
                };
                if (_54 instanceof Data_Either.Right) {
                    return Prelude["return"](__dict_Monad_1["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_54.value0));
                };
                throw new Error("Failed pattern match at Control.Monad.Error.Class line 65, column 1 - line 73, column 1: " + [ _54.constructor.name ]);
            }));
        };
    }, function (e) {
        return Control_Monad_Error_Trans.ErrorT(Prelude["return"](__dict_Monad_1["__superclass_Prelude.Applicative_0"]())(new Data_Either.Left(e)));
    });
};
var monadErrorEither = new MonadError(function (_634) {
    return function (h) {
        if (_634 instanceof Data_Either.Left) {
            return h(_634.value0);
        };
        if (_634 instanceof Data_Either.Right) {
            return new Data_Either.Right(_634.value0);
        };
        throw new Error("Failed pattern match at Control.Monad.Error.Class line 55, column 1 - line 60, column 1: " + [ _634.constructor.name, h.constructor.name ]);
    };
}, Data_Either.Left.create);
var catchError = function (dict) {
    return dict.catchError;
};
var catchJust = function (__dict_MonadError_2) {
    return function (p) {
        return function (act) {
            return function (handler) {
                var handle = function (e) {
                    var _2321 = p(e);
                    if (_2321 instanceof Data_Maybe.Nothing) {
                        return throwError(__dict_MonadError_2)(e);
                    };
                    if (_2321 instanceof Data_Maybe.Just) {
                        return handler(_2321.value0);
                    };
                    throw new Error("Failed pattern match at Control.Monad.Error.Class line 50, column 3 - line 55, column 1: " + [ _2321.constructor.name ]);
                };
                return catchError(__dict_MonadError_2)(act)(handle);
            };
        };
    };
};
var monadErrorMaybeT = function (__dict_Monad_3) {
    return function (__dict_MonadError_4) {
        return new MonadError(Control_Monad_Maybe_Trans.liftCatchMaybe(catchError(__dict_MonadError_4)), function (e) {
            return Control_Monad_Trans.lift(Control_Monad_Maybe_Trans.monadTransMaybeT)(__dict_Monad_3)(throwError(__dict_MonadError_4)(e));
        });
    };
};
var monadErrorReaderT = function (__dict_Monad_5) {
    return function (__dict_MonadError_6) {
        return new MonadError(Control_Monad_Reader_Trans.liftCatchReader(catchError(__dict_MonadError_6)), function (e) {
            return Control_Monad_Trans.lift(Control_Monad_Reader_Trans.monadTransReaderT)(__dict_Monad_5)(throwError(__dict_MonadError_6)(e));
        });
    };
};
var monadErrorStateT = function (__dict_Monad_7) {
    return function (__dict_MonadError_8) {
        return new MonadError(Control_Monad_State_Trans.liftCatchState(catchError(__dict_MonadError_8)), function (e) {
            return Control_Monad_Trans.lift(Control_Monad_State_Trans.monadTransStateT)(__dict_Monad_7)(throwError(__dict_MonadError_8)(e));
        });
    };
};
var monadErrorWriterT = function (__dict_Monad_9) {
    return function (__dict_Monoid_10) {
        return function (__dict_MonadError_11) {
            return new MonadError(Control_Monad_Writer_Trans.liftCatchWriter(catchError(__dict_MonadError_11)), function (e) {
                return Control_Monad_Trans.lift(Control_Monad_Writer_Trans.monadTransWriterT(__dict_Monoid_10))(__dict_Monad_9)(throwError(__dict_MonadError_11)(e));
            });
        };
    };
};
module.exports = {
    MonadError: MonadError, 
    catchJust: catchJust, 
    catchError: catchError, 
    throwError: throwError, 
    monadErrorEither: monadErrorEither, 
    monadErrorMaybe: monadErrorMaybe, 
    monadErrorErrorT: monadErrorErrorT, 
    monadErrorExceptT: monadErrorExceptT, 
    monadErrorMaybeT: monadErrorMaybeT, 
    monadErrorReaderT: monadErrorReaderT, 
    monadErrorWriterT: monadErrorWriterT, 
    monadErrorStateT: monadErrorStateT
};

},{"Control.Monad.Error":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error/index.js","Control.Monad.Error.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Trans/index.js","Control.Monad.Except.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Except.Trans/index.js","Control.Monad.Maybe.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Maybe.Trans/index.js","Control.Monad.Reader.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Reader.Trans/index.js","Control.Monad.State.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.State.Trans/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.Monad.Writer.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Apply = require("Control.Apply");
var Control_Monad_Error = require("Control.Monad.Error");
var Control_Monad_Rec_Class = require("Control.Monad.Rec.Class");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Either = require("Data.Either");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");
var ErrorT = function (x) {
    return x;
};
var runErrorT = function (_607) {
    return _607;
};
var monadTransErrorT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_2) {
    return function (m) {
        return ErrorT(Prelude.bind(__dict_Monad_2["__superclass_Prelude.Bind_1"]())(m)(function (_37) {
            return Prelude["return"](__dict_Monad_2["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_37));
        }));
    };
});
var mapErrorT = function (f) {
    return function (m) {
        return ErrorT(f(runErrorT(m)));
    };
};
var liftPassError = function (__dict_Monad_10) {
    return function (pass) {
        return mapErrorT(function (m) {
            return pass(Prelude.bind(__dict_Monad_10["__superclass_Prelude.Bind_1"]())(m)(function (_39) {
                return Prelude["return"](__dict_Monad_10["__superclass_Prelude.Applicative_0"]())((function () {
                    if (_39 instanceof Data_Either.Left) {
                        return new Data_Tuple.Tuple(new Data_Either.Left(_39.value0), Prelude.id(Prelude.categoryFn));
                    };
                    if (_39 instanceof Data_Either.Right) {
                        return new Data_Tuple.Tuple(new Data_Either.Right(_39.value0.value0), _39.value0.value1);
                    };
                    throw new Error("Failed pattern match at Control.Monad.Error.Trans line 87, column 1 - line 88, column 1: " + [ _39.constructor.name ]);
                })());
            }));
        });
    };
};
var liftListenError = function (__dict_Monad_11) {
    return function (listen) {
        return mapErrorT(function (m) {
            return Prelude.bind(__dict_Monad_11["__superclass_Prelude.Bind_1"]())(listen(m))(function (_38) {
                return Prelude["return"](__dict_Monad_11["__superclass_Prelude.Applicative_0"]())(Prelude["<$>"](Data_Either.functorEither)(function (r) {
                    return new Data_Tuple.Tuple(r, _38.value1);
                })(_38.value0));
            });
        });
    };
};
var liftCallCCError = function (callCC) {
    return function (f) {
        return ErrorT(callCC(function (c) {
            return runErrorT(f(function (a) {
                return ErrorT(c(new Data_Either.Right(a)));
            }));
        }));
    };
};
var functorErrorT = function (__dict_Functor_12) {
    return new Prelude.Functor(function (f) {
        return function (_2176) {
            return ErrorT(Prelude["<$>"](__dict_Functor_12)(Prelude["<$>"](Data_Either.functorEither)(f))(runErrorT(_2176)));
        };
    });
};
var applyErrorT = function (__dict_Apply_14) {
    return new Prelude.Apply(function () {
        return functorErrorT(__dict_Apply_14["__superclass_Prelude.Functor_0"]());
    }, function (_608) {
        return function (_609) {
            return ErrorT(Prelude["<*>"](__dict_Apply_14)(Prelude["<$>"](__dict_Apply_14["__superclass_Prelude.Functor_0"]())(Control_Apply.lift2(Data_Either.applyEither)(Prelude["$"]))(_608))(_609));
        };
    });
};
var bindErrorT = function (__dict_Monad_13) {
    return new Prelude.Bind(function () {
        return applyErrorT((__dict_Monad_13["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]());
    }, function (m) {
        return function (f) {
            return ErrorT(Prelude.bind(__dict_Monad_13["__superclass_Prelude.Bind_1"]())(runErrorT(m))(function (_35) {
                if (_35 instanceof Data_Either.Left) {
                    return Prelude["return"](__dict_Monad_13["__superclass_Prelude.Applicative_0"]())(new Data_Either.Left(_35.value0));
                };
                if (_35 instanceof Data_Either.Right) {
                    return runErrorT(f(_35.value0));
                };
                throw new Error("Failed pattern match at Control.Monad.Error.Trans line 55, column 1 - line 62, column 1: " + [ _35.constructor.name ]);
            }));
        };
    });
};
var applicativeErrorT = function (__dict_Applicative_15) {
    return new Prelude.Applicative(function () {
        return applyErrorT(__dict_Applicative_15["__superclass_Prelude.Apply_0"]());
    }, function (a) {
        return ErrorT(Prelude.pure(__dict_Applicative_15)(new Data_Either.Right(a)));
    });
};
var monadErrorT = function (__dict_Monad_7) {
    return new Prelude.Monad(function () {
        return applicativeErrorT(__dict_Monad_7["__superclass_Prelude.Applicative_0"]());
    }, function () {
        return bindErrorT(__dict_Monad_7);
    });
};
var monadEffError = function (__dict_Monad_8) {
    return function (__dict_MonadEff_9) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadErrorT(__dict_Monad_8);
        }, function (_2177) {
            return Control_Monad_Trans.lift(monadTransErrorT)(__dict_Monad_8)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_9)(_2177));
        });
    };
};
var monadRecErrorT = function (__dict_Error_3) {
    return function (__dict_MonadRec_4) {
        return new Control_Monad_Rec_Class.MonadRec(function () {
            return monadErrorT(__dict_MonadRec_4["__superclass_Prelude.Monad_0"]());
        }, function (f) {
            return function (_2178) {
                return ErrorT(Control_Monad_Rec_Class.tailRecM(__dict_MonadRec_4)(function (a) {
                    return Prelude.bind((__dict_MonadRec_4["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Bind_1"]())(runErrorT(f(a)))(function (_36) {
                        return Prelude["return"]((__dict_MonadRec_4["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Applicative_0"]())((function () {
                            if (_36 instanceof Data_Either.Left) {
                                return new Data_Either.Right(new Data_Either.Left(_36.value0));
                            };
                            if (_36 instanceof Data_Either.Right && _36.value0 instanceof Data_Either.Left) {
                                return new Data_Either.Left(_36.value0.value0);
                            };
                            if (_36 instanceof Data_Either.Right && _36.value0 instanceof Data_Either.Right) {
                                return new Data_Either.Right(new Data_Either.Right(_36.value0.value0));
                            };
                            throw new Error("Failed pattern match at Control.Monad.Error.Trans line 64, column 1 - line 72, column 1: " + [ _36.constructor.name ]);
                        })());
                    });
                })(_2178));
            };
        });
    };
};
var altErrorT = function (__dict_Monad_18) {
    return new Control_Alt.Alt(function () {
        return functorErrorT(((__dict_Monad_18["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    }, function (x) {
        return function (y) {
            return ErrorT(Prelude[">>="](__dict_Monad_18["__superclass_Prelude.Bind_1"]())(runErrorT(x))(function (e) {
                if (e instanceof Data_Either.Left) {
                    return runErrorT(y);
                };
                return Prelude["return"](__dict_Monad_18["__superclass_Prelude.Applicative_0"]())(e);
            }));
        };
    });
};
var plusErrorT = function (__dict_Monad_0) {
    return function (__dict_Error_1) {
        return new Control_Plus.Plus(function () {
            return altErrorT(__dict_Monad_0);
        }, Prelude["return"](__dict_Monad_0["__superclass_Prelude.Applicative_0"]())(Data_Either.Left.create(Control_Monad_Error.strMsg(__dict_Error_1)("No alternative"))));
    };
};
var alternativeErrorT = function (__dict_Monad_16) {
    return function (__dict_Error_17) {
        return new Control_Alternative.Alternative(function () {
            return plusErrorT(__dict_Monad_16)(__dict_Error_17);
        }, function () {
            return applicativeErrorT(__dict_Monad_16["__superclass_Prelude.Applicative_0"]());
        });
    };
};
var monadPlusErrorT = function (__dict_Monad_5) {
    return function (__dict_Error_6) {
        return new Control_MonadPlus.MonadPlus(function () {
            return alternativeErrorT(__dict_Monad_5)(__dict_Error_6);
        }, function () {
            return monadErrorT(__dict_Monad_5);
        });
    };
};
module.exports = {
    ErrorT: ErrorT, 
    liftCallCCError: liftCallCCError, 
    liftPassError: liftPassError, 
    liftListenError: liftListenError, 
    mapErrorT: mapErrorT, 
    runErrorT: runErrorT, 
    functorErrorT: functorErrorT, 
    applyErrorT: applyErrorT, 
    applicativeErrorT: applicativeErrorT, 
    altErrorT: altErrorT, 
    plusErrorT: plusErrorT, 
    alternativeErrorT: alternativeErrorT, 
    bindErrorT: bindErrorT, 
    monadErrorT: monadErrorT, 
    monadRecErrorT: monadRecErrorT, 
    monadPlusErrorT: monadPlusErrorT, 
    monadTransErrorT: monadTransErrorT, 
    monadEffError: monadEffError
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Apply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Apply/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Error":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error/index.js","Control.Monad.Rec.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var $$Error = function (noMsg, strMsg) {
    this.noMsg = noMsg;
    this.strMsg = strMsg;
};
var strMsg = function (dict) {
    return dict.strMsg;
};
var noMsg = function (dict) {
    return dict.noMsg;
};
var errorString = new $$Error("", Prelude.id(Prelude.categoryFn));
module.exports = {
    "Error": $$Error, 
    strMsg: strMsg, 
    noMsg: noMsg, 
    errorString: errorString
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Except.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Rec_Class = require("Control.Monad.Rec.Class");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Either = require("Data.Either");
var Data_Monoid = require("Data.Monoid");
var ExceptT = function (x) {
    return x;
};
var throwE = function (__dict_Applicative_0) {
    return function (_1895) {
        return ExceptT(Prelude.pure(__dict_Applicative_0)(Data_Either.Left.create(_1895)));
    };
};
var runExceptT = function (_533) {
    return _533;
};
var withExceptT = function (__dict_Functor_1) {
    return function (f) {
        var mapLeft = function (f_1) {
            return function (_534) {
                if (_534 instanceof Data_Either.Right) {
                    return new Data_Either.Right(_534.value0);
                };
                if (_534 instanceof Data_Either.Left) {
                    return new Data_Either.Left(f_1(_534.value0));
                };
                throw new Error("Failed pattern match at Control.Monad.Except.Trans line 30, column 3 - line 31, column 3: " + [ f_1.constructor.name, _534.constructor.name ]);
            };
        };
        return function (_1896) {
            return ExceptT(Prelude["<$>"](__dict_Functor_1)(mapLeft(f))(runExceptT(_1896)));
        };
    };
};
var monadTransExceptT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_4) {
    return function (m) {
        return ExceptT(Prelude.bind(__dict_Monad_4["__superclass_Prelude.Bind_1"]())(m)(function (_33) {
            return Prelude["return"](__dict_Monad_4["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_33));
        }));
    };
});
var mapExceptT = function (f) {
    return function (m) {
        return f(runExceptT(m));
    };
};
var functorExceptT = function (__dict_Functor_12) {
    return new Prelude.Functor(function (f) {
        return mapExceptT(Prelude["<$>"](__dict_Functor_12)(Prelude["<$>"](Data_Either.functorEither)(f)));
    });
};
var catchE = function (__dict_Monad_13) {
    return function (m) {
        return function (handler) {
            return Prelude[">>="](__dict_Monad_13["__superclass_Prelude.Bind_1"]())(runExceptT(m))(Data_Either.either(function (_1897) {
                return runExceptT(handler(_1897));
            })(function (_1898) {
                return Prelude.pure(__dict_Monad_13["__superclass_Prelude.Applicative_0"]())(Data_Either.Right.create(_1898));
            }));
        };
    };
};
var applyExceptT = function (__dict_Apply_15) {
    return new Prelude.Apply(function () {
        return functorExceptT(__dict_Apply_15["__superclass_Prelude.Functor_0"]());
    }, function (_535) {
        return function (_536) {
            var f$prime = Prelude["<$>"](__dict_Apply_15["__superclass_Prelude.Functor_0"]())(Prelude["<*>"](Data_Either.applyEither))(_535);
            var x$prime = Prelude["<*>"](__dict_Apply_15)(f$prime)(_536);
            return x$prime;
        };
    });
};
var bindExceptT = function (__dict_Monad_14) {
    return new Prelude.Bind(function () {
        return applyExceptT((__dict_Monad_14["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]());
    }, function (m) {
        return function (k) {
            return Prelude[">>="](__dict_Monad_14["__superclass_Prelude.Bind_1"]())(runExceptT(m))(Data_Either.either(function (_1899) {
                return Prelude["return"](__dict_Monad_14["__superclass_Prelude.Applicative_0"]())(Data_Either.Left.create(_1899));
            })(function (_1900) {
                return runExceptT(k(_1900));
            }));
        };
    });
};
var applicativeExceptT = function (__dict_Applicative_16) {
    return new Prelude.Applicative(function () {
        return applyExceptT(__dict_Applicative_16["__superclass_Prelude.Apply_0"]());
    }, function (_1901) {
        return ExceptT(Prelude.pure(__dict_Applicative_16)(Data_Either.Right.create(_1901)));
    });
};
var monadExceptT = function (__dict_Monad_9) {
    return new Prelude.Monad(function () {
        return applicativeExceptT(__dict_Monad_9["__superclass_Prelude.Applicative_0"]());
    }, function () {
        return bindExceptT(__dict_Monad_9);
    });
};
var monadEffExceptT = function (__dict_Monad_10) {
    return function (__dict_MonadEff_11) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadExceptT(__dict_Monad_10);
        }, function (_1902) {
            return Control_Monad_Trans.lift(monadTransExceptT)(__dict_Monad_10)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_11)(_1902));
        });
    };
};
var monadRecErrorT = function (__dict_Semigroup_5) {
    return function (__dict_MonadRec_6) {
        return new Control_Monad_Rec_Class.MonadRec(function () {
            return monadExceptT(__dict_MonadRec_6["__superclass_Prelude.Monad_0"]());
        }, function (f) {
            return function (_1903) {
                return ExceptT(Control_Monad_Rec_Class.tailRecM(__dict_MonadRec_6)(function (a) {
                    return Prelude.bind((__dict_MonadRec_6["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Bind_1"]())(runExceptT(f(a)))(function (_30) {
                        return Prelude["return"]((__dict_MonadRec_6["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Applicative_0"]())((function () {
                            if (_30 instanceof Data_Either.Left) {
                                return new Data_Either.Right(new Data_Either.Left(_30.value0));
                            };
                            if (_30 instanceof Data_Either.Right && _30.value0 instanceof Data_Either.Left) {
                                return new Data_Either.Left(_30.value0.value0);
                            };
                            if (_30 instanceof Data_Either.Right && _30.value0 instanceof Data_Either.Right) {
                                return new Data_Either.Right(new Data_Either.Right(_30.value0.value0));
                            };
                            throw new Error("Failed pattern match at Control.Monad.Except.Trans line 55, column 1 - line 63, column 1: " + [ _30.constructor.name ]);
                        })());
                    });
                })(_1903));
            };
        });
    };
};
var altExceptT = function (__dict_Semigroup_19) {
    return function (__dict_Monad_20) {
        return new Control_Alt.Alt(function () {
            return functorExceptT(((__dict_Monad_20["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
        }, function (m) {
            return function (n) {
                return ExceptT(Prelude.bind(__dict_Monad_20["__superclass_Prelude.Bind_1"]())(runExceptT(m))(function (_32) {
                    if (_32 instanceof Data_Either.Right) {
                        return Prelude.pure(__dict_Monad_20["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_32.value0));
                    };
                    if (_32 instanceof Data_Either.Left) {
                        return Prelude.bind(__dict_Monad_20["__superclass_Prelude.Bind_1"]())(runExceptT(n))(function (_31) {
                            if (_31 instanceof Data_Either.Right) {
                                return Prelude.pure(__dict_Monad_20["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_31.value0));
                            };
                            if (_31 instanceof Data_Either.Left) {
                                return Prelude.pure(__dict_Monad_20["__superclass_Prelude.Applicative_0"]())(new Data_Either.Left(Prelude["<>"](__dict_Semigroup_19)(_32.value0)(_31.value0)));
                            };
                            throw new Error("Failed pattern match at Control.Monad.Except.Trans line 63, column 1 - line 74, column 1: " + [ _31.constructor.name ]);
                        });
                    };
                    throw new Error("Failed pattern match at Control.Monad.Except.Trans line 63, column 1 - line 74, column 1: " + [ _32.constructor.name ]);
                }));
            };
        });
    };
};
var plusExceptT = function (__dict_Monoid_2) {
    return function (__dict_Monad_3) {
        return new Control_Plus.Plus(function () {
            return altExceptT(__dict_Monoid_2["__superclass_Prelude.Semigroup_0"]())(__dict_Monad_3);
        }, throwE(__dict_Monad_3["__superclass_Prelude.Applicative_0"]())(Data_Monoid.mempty(__dict_Monoid_2)));
    };
};
var alternativeExceptT = function (__dict_Monoid_17) {
    return function (__dict_Monad_18) {
        return new Control_Alternative.Alternative(function () {
            return plusExceptT(__dict_Monoid_17)(__dict_Monad_18);
        }, function () {
            return applicativeExceptT(__dict_Monad_18["__superclass_Prelude.Applicative_0"]());
        });
    };
};
var monadPlusExceptT = function (__dict_Monoid_7) {
    return function (__dict_Monad_8) {
        return new Control_MonadPlus.MonadPlus(function () {
            return alternativeExceptT(__dict_Monoid_7)(__dict_Monad_8);
        }, function () {
            return monadExceptT(__dict_Monad_8);
        });
    };
};
module.exports = {
    ExceptT: ExceptT, 
    catchE: catchE, 
    throwE: throwE, 
    mapExceptT: mapExceptT, 
    withExceptT: withExceptT, 
    runExceptT: runExceptT, 
    functorExceptT: functorExceptT, 
    applyExceptT: applyExceptT, 
    applicativeExceptT: applicativeExceptT, 
    bindExceptT: bindExceptT, 
    monadExceptT: monadExceptT, 
    monadRecErrorT: monadRecErrorT, 
    altExceptT: altExceptT, 
    plusExceptT: plusExceptT, 
    alternativeExceptT: alternativeExceptT, 
    monadPlusExceptT: monadPlusExceptT, 
    monadTransExceptT: monadTransExceptT, 
    monadEffExceptT: monadEffExceptT
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Rec.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.List.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_Lazy = require("Data.Lazy");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Monoid = require("Data.Monoid");
var Data_Unfoldable = require("Data.Unfoldable");
var Yield = (function () {
    function Yield(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Yield.create = function (value0) {
        return function (value1) {
            return new Yield(value0, value1);
        };
    };
    return Yield;
})();
var Skip = (function () {
    function Skip(value0) {
        this.value0 = value0;
    };
    Skip.create = function (value0) {
        return new Skip(value0);
    };
    return Skip;
})();
var Done = (function () {
    function Done() {

    };
    Done.value = new Done();
    return Done;
})();
var ListT = (function () {
    function ListT(value0) {
        this.value0 = value0;
    };
    ListT.create = function (value0) {
        return new ListT(value0);
    };
    return ListT;
})();
var wrapLazy = function (__dict_Applicative_0) {
    return function (v) {
        return ListT.create(Prelude.pure(__dict_Applicative_0)(new Skip(v)));
    };
};
var wrapEffect = function (__dict_Functor_1) {
    return function (v) {
        return ListT.create(Prelude["<$>"](__dict_Functor_1)(Prelude["<<<"](Prelude.semigroupoidFn)(Skip.create)(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Lazy.defer)(Prelude["const"])))(v));
    };
};
var unfold = function (__dict_Monad_2) {
    return function (f) {
        return function (z) {
            var g = function (_119) {
                if (_119 instanceof Data_Maybe.Just) {
                    return new Yield(_119.value0.value1, Data_Lazy.defer(function (_112) {
                        return unfold(__dict_Monad_2)(f)(_119.value0.value0);
                    }));
                };
                if (_119 instanceof Data_Maybe.Nothing) {
                    return Done.value;
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 115, column 3 - line 116, column 3: " + [ _119.constructor.name ]);
            };
            return ListT.create(Prelude["<$>"](((__dict_Monad_2["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g)(f(z)));
        };
    };
};
var runListT = function (_115) {
    return _115.value0;
};
var scanl = function (__dict_Monad_3) {
    return function (f) {
        return function (b) {
            return function (l) {
                var g = function (_129) {
                    var h = function (_130) {
                        if (_130 instanceof Yield) {
                            var b$prime = f(_129.value0)(_130.value0);
                            return Data_Maybe.Just.create(new Data_Tuple.Tuple(new Data_Tuple.Tuple(b$prime, Data_Lazy.force(_130.value1)), b$prime));
                        };
                        if (_130 instanceof Skip) {
                            return Data_Maybe.Just.create(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_129.value0, Data_Lazy.force(_130.value0)), _129.value0));
                        };
                        if (_130 instanceof Done) {
                            return Data_Maybe.Nothing.value;
                        };
                        throw new Error("Failed pattern match at Control.Monad.List.Trans line 214, column 5 - line 216, column 5: " + [ _130.constructor.name ]);
                    };
                    return Prelude["<$>"](((__dict_Monad_3["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(h)(runListT(_129.value1));
                };
                return unfold(__dict_Monad_3)(g)(new Data_Tuple.Tuple(b, l));
            };
        };
    };
};
var stepMap = function (__dict_Functor_4) {
    return function (f) {
        return function (l) {
            return ListT.create(Prelude["<$>"](__dict_Functor_4)(f)(runListT(l)));
        };
    };
};
var takeWhile = function (__dict_Applicative_5) {
    return function (f) {
        var g = function (_121) {
            if (_121 instanceof Yield) {
                var _525 = f(_121.value0);
                if (_525) {
                    return new Yield(_121.value0, Prelude["<$>"](Data_Lazy.functorLazy)(takeWhile(__dict_Applicative_5)(f))(_121.value1));
                };
                if (!_525) {
                    return Done.value;
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 139, column 3 - line 140, column 3: " + [ _525.constructor.name ]);
            };
            if (_121 instanceof Skip) {
                return Skip.create(Prelude["<$>"](Data_Lazy.functorLazy)(takeWhile(__dict_Applicative_5)(f))(_121.value0));
            };
            if (_121 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match at Control.Monad.List.Trans line 139, column 3 - line 140, column 3: " + [ _121.constructor.name ]);
        };
        return stepMap((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g);
    };
};
var uncons = function (__dict_Monad_6) {
    return function (l) {
        var g = function (_126) {
            if (_126 instanceof Yield) {
                return Prelude.pure(__dict_Monad_6["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Just.create(new Data_Tuple.Tuple(_126.value0, Data_Lazy.force(_126.value1))));
            };
            if (_126 instanceof Skip) {
                return uncons(__dict_Monad_6)(Data_Lazy.force(_126.value0));
            };
            if (_126 instanceof Done) {
                return Prelude.pure(__dict_Monad_6["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Nothing.value);
            };
            throw new Error("Failed pattern match at Control.Monad.List.Trans line 180, column 3 - line 181, column 3: " + [ _126.constructor.name ]);
        };
        return Prelude[">>="](__dict_Monad_6["__superclass_Prelude.Bind_1"]())(runListT(l))(g);
    };
};
var tail = function (__dict_Monad_7) {
    return function (l) {
        return Prelude["<$>"](((__dict_Monad_7["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.snd))(uncons(__dict_Monad_7)(l));
    };
};
var prepend$prime = function (__dict_Applicative_8) {
    return function (h) {
        return function (t) {
            return ListT.create(Prelude.pure(__dict_Applicative_8)(new Yield(h, t)));
        };
    };
};
var prepend = function (__dict_Applicative_9) {
    return function (h) {
        return function (t) {
            return prepend$prime(__dict_Applicative_9)(h)(Data_Lazy.defer(Prelude["const"](t)));
        };
    };
};
var nil = function (__dict_Applicative_10) {
    return ListT.create(Prelude.pure(__dict_Applicative_10)(Done.value));
};
var singleton = function (__dict_Applicative_12) {
    return function (a) {
        return prepend(__dict_Applicative_12)(a)(nil(__dict_Applicative_12));
    };
};
var take = function (__dict_Applicative_13) {
    return function (_116) {
        return function (fa) {
            if (_116 === 0) {
                return nil(__dict_Applicative_13);
            };
            var f = function (_120) {
                if (_120 instanceof Yield) {
                    return new Yield(_120.value0, Prelude["<$>"](Data_Lazy.functorLazy)(take(__dict_Applicative_13)(_116 - 1))(_120.value1));
                };
                if (_120 instanceof Skip) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(take(__dict_Applicative_13)(_116))(_120.value0));
                };
                if (_120 instanceof Done) {
                    return Done.value;
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 132, column 3 - line 133, column 3: " + [ _120.constructor.name ]);
            };
            return stepMap((__dict_Applicative_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(fa);
        };
    };
};
var zipWith$prime = function (__dict_Monad_14) {
    return function (f) {
        var g = function (_131) {
            return function (_132) {
                if (_132 instanceof Data_Maybe.Nothing) {
                    return Prelude.pure(__dict_Monad_14["__superclass_Prelude.Applicative_0"]())(nil(__dict_Monad_14["__superclass_Prelude.Applicative_0"]()));
                };
                if (_131 instanceof Data_Maybe.Nothing) {
                    return Prelude.pure(__dict_Monad_14["__superclass_Prelude.Applicative_0"]())(nil(__dict_Monad_14["__superclass_Prelude.Applicative_0"]()));
                };
                if (_131 instanceof Data_Maybe.Just && _132 instanceof Data_Maybe.Just) {
                    return Prelude["<$>"](((__dict_Monad_14["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude.flip(prepend$prime(__dict_Monad_14["__superclass_Prelude.Applicative_0"]()))(Data_Lazy.defer(function (_113) {
                        return zipWith$prime(__dict_Monad_14)(f)(_131.value0.value1)(_132.value0.value1);
                    })))(f(_131.value0.value0)(_132.value0.value0));
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 222, column 3 - line 227, column 3: " + [ _131.constructor.name, _132.constructor.name ]);
            };
        };
        var loop = function (fa) {
            return function (fb) {
                return wrapEffect(((__dict_Monad_14["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude.bind(__dict_Monad_14["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_14)(fa))(function (_20) {
                    return Prelude.bind(__dict_Monad_14["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_14)(fb))(function (_19) {
                        return g(_20)(_19);
                    });
                }));
            };
        };
        return loop;
    };
};
var zipWith = function (__dict_Monad_15) {
    return function (f) {
        var g = function (a) {
            return function (b) {
                return Prelude.pure(__dict_Monad_15["__superclass_Prelude.Applicative_0"]())(f(a)(b));
            };
        };
        return zipWith$prime(__dict_Monad_15)(g);
    };
};
var mapMaybe = function (__dict_Functor_21) {
    return function (f) {
        var g = function (_125) {
            if (_125 instanceof Yield) {
                return Data_Maybe.fromMaybe(Skip.create)(Prelude["<$>"](Data_Maybe.functorMaybe)(Yield.create)(f(_125.value0)))(Prelude["<$>"](Data_Lazy.functorLazy)(mapMaybe(__dict_Functor_21)(f))(_125.value1));
            };
            if (_125 instanceof Skip) {
                return Skip.create(Prelude["<$>"](Data_Lazy.functorLazy)(mapMaybe(__dict_Functor_21)(f))(_125.value0));
            };
            if (_125 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match at Control.Monad.List.Trans line 168, column 3 - line 169, column 3: " + [ _125.constructor.name ]);
        };
        return stepMap(__dict_Functor_21)(g);
    };
};
var iterate = function (__dict_Monad_22) {
    return function (f) {
        return function (a) {
            var g = function (a_1) {
                return Prelude.pure(__dict_Monad_22["__superclass_Prelude.Applicative_0"]())(new Data_Maybe.Just(new Data_Tuple.Tuple(f(a_1), a_1)));
            };
            return unfold(__dict_Monad_22)(g)(a);
        };
    };
};
var repeat = function (__dict_Monad_23) {
    return iterate(__dict_Monad_23)(Prelude.id(Prelude.categoryFn));
};
var head = function (__dict_Monad_24) {
    return function (l) {
        return Prelude["<$>"](((__dict_Monad_24["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.fst))(uncons(__dict_Monad_24)(l));
    };
};
var functorListT = function (__dict_Functor_25) {
    return new Prelude.Functor(function (f) {
        var g = function (_133) {
            if (_133 instanceof Yield) {
                return new Yield(f(_133.value0), Prelude["<$>"](Data_Lazy.functorLazy)(Prelude["<$>"](functorListT(__dict_Functor_25))(f))(_133.value1));
            };
            if (_133 instanceof Skip) {
                return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(Prelude["<$>"](functorListT(__dict_Functor_25))(f))(_133.value0));
            };
            if (_133 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match at Control.Monad.List.Trans line 245, column 5 - line 246, column 5: " + [ _133.constructor.name ]);
        };
        return stepMap(__dict_Functor_25)(g);
    });
};
var fromEffect = function (__dict_Applicative_26) {
    return function (fa) {
        return ListT.create(Prelude["<$>"]((__dict_Applicative_26["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(function (_6) {
            return new Yield(_6, Data_Lazy.defer(function (_111) {
                return nil(__dict_Applicative_26);
            }));
        })(fa));
    };
};
var monadTransListT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_27) {
    return fromEffect(__dict_Monad_27["__superclass_Prelude.Applicative_0"]());
});
var foldl$prime = function (__dict_Monad_28) {
    return function (f) {
        var loop = function (b) {
            return function (l) {
                var g = function (_127) {
                    if (_127 instanceof Data_Maybe.Nothing) {
                        return Prelude.pure(__dict_Monad_28["__superclass_Prelude.Applicative_0"]())(b);
                    };
                    if (_127 instanceof Data_Maybe.Just) {
                        return Prelude[">>="](__dict_Monad_28["__superclass_Prelude.Bind_1"]())(f(b)(_127.value0.value0))(Prelude.flip(loop)(_127.value0.value1));
                    };
                    throw new Error("Failed pattern match at Control.Monad.List.Trans line 197, column 5 - line 198, column 5: " + [ _127.constructor.name ]);
                };
                return Prelude[">>="](__dict_Monad_28["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_28)(l))(g);
            };
        };
        return loop;
    };
};
var foldl = function (__dict_Monad_29) {
    return function (f) {
        var loop = function (b) {
            return function (l) {
                var g = function (_128) {
                    if (_128 instanceof Data_Maybe.Nothing) {
                        return Prelude.pure(__dict_Monad_29["__superclass_Prelude.Applicative_0"]())(b);
                    };
                    if (_128 instanceof Data_Maybe.Just) {
                        return loop(f(b)(_128.value0.value0))(_128.value0.value1);
                    };
                    throw new Error("Failed pattern match at Control.Monad.List.Trans line 205, column 5 - line 206, column 5: " + [ _128.constructor.name ]);
                };
                return Prelude[">>="](__dict_Monad_29["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_29)(l))(g);
            };
        };
        return loop;
    };
};
var filter = function (__dict_Functor_30) {
    return function (f) {
        var g = function (_124) {
            if (_124 instanceof Yield) {
                var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(filter(__dict_Functor_30)(f))(_124.value1);
                var _568 = f(_124.value0);
                if (_568) {
                    return new Yield(_124.value0, s$prime);
                };
                if (!_568) {
                    return new Skip(s$prime);
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 161, column 3 - line 162, column 3: " + [ _568.constructor.name ]);
            };
            if (_124 instanceof Skip) {
                var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(filter(__dict_Functor_30)(f))(_124.value0);
                return new Skip(s$prime);
            };
            if (_124 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match at Control.Monad.List.Trans line 161, column 3 - line 162, column 3: " + [ _124.constructor.name ]);
        };
        return stepMap(__dict_Functor_30)(g);
    };
};
var dropWhile = function (__dict_Applicative_31) {
    return function (f) {
        var g = function (_123) {
            if (_123 instanceof Yield) {
                var _573 = f(_123.value0);
                if (_573) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(dropWhile(__dict_Applicative_31)(f))(_123.value1));
                };
                if (!_573) {
                    return new Yield(_123.value0, _123.value1);
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 154, column 3 - line 155, column 3: " + [ _573.constructor.name ]);
            };
            if (_123 instanceof Skip) {
                return Skip.create(Prelude["<$>"](Data_Lazy.functorLazy)(dropWhile(__dict_Applicative_31)(f))(_123.value0));
            };
            if (_123 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match at Control.Monad.List.Trans line 154, column 3 - line 155, column 3: " + [ _123.constructor.name ]);
        };
        return stepMap((__dict_Applicative_31["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g);
    };
};
var drop = function (__dict_Applicative_32) {
    return function (_117) {
        return function (fa) {
            if (_117 === 0) {
                return fa;
            };
            var f = function (_122) {
                if (_122 instanceof Yield) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(drop(__dict_Applicative_32)(_117 - 1))(_122.value1));
                };
                if (_122 instanceof Skip) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(drop(__dict_Applicative_32)(_117))(_122.value0));
                };
                if (_122 instanceof Done) {
                    return Done.value;
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 147, column 3 - line 148, column 3: " + [ _122.constructor.name ]);
            };
            return stepMap((__dict_Applicative_32["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(fa);
        };
    };
};
var cons = function (__dict_Applicative_33) {
    return function (lh) {
        return function (t) {
            return ListT.create(Prelude.pure(__dict_Applicative_33)(new Yield(Data_Lazy.force(lh), t)));
        };
    };
};
var unfoldableListT = function (__dict_Monad_34) {
    return new Data_Unfoldable.Unfoldable(function (f) {
        return function (b) {
            var go = function (_134) {
                if (_134 instanceof Data_Maybe.Nothing) {
                    return nil(__dict_Monad_34["__superclass_Prelude.Applicative_0"]());
                };
                if (_134 instanceof Data_Maybe.Just) {
                    return cons(__dict_Monad_34["__superclass_Prelude.Applicative_0"]())(Prelude.pure(Data_Lazy.applicativeLazy)(_134.value0.value0))(Data_Lazy.defer(function (_114) {
                        return go(f(_134.value0.value1));
                    }));
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 249, column 1 - line 254, column 1: " + [ _134.constructor.name ]);
            };
            return go(f(b));
        };
    });
};
var semigroupListT = function (__dict_Applicative_36) {
    return new Prelude.Semigroup(concat(__dict_Applicative_36));
};
var concat = function (__dict_Applicative_35) {
    return function (x) {
        return function (y) {
            var f = function (_118) {
                if (_118 instanceof Yield) {
                    return new Yield(_118.value0, Prelude["<$>"](Data_Lazy.functorLazy)(function (_4) {
                        return Prelude["<>"](semigroupListT(__dict_Applicative_35))(_4)(y);
                    })(_118.value1));
                };
                if (_118 instanceof Skip) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(function (_5) {
                        return Prelude["<>"](semigroupListT(__dict_Applicative_35))(_5)(y);
                    })(_118.value0));
                };
                if (_118 instanceof Done) {
                    return new Skip(Data_Lazy.defer(Prelude["const"](y)));
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 91, column 3 - line 92, column 3: " + [ _118.constructor.name ]);
            };
            return stepMap((__dict_Applicative_35["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(x);
        };
    };
};
var monoidListT = function (__dict_Applicative_16) {
    return new Data_Monoid.Monoid(function () {
        return semigroupListT(__dict_Applicative_16);
    }, nil(__dict_Applicative_16));
};
var catMaybes = function (__dict_Functor_37) {
    return mapMaybe(__dict_Functor_37)(Prelude.id(Prelude.categoryFn));
};
var monadListT = function (__dict_Monad_18) {
    return new Prelude.Monad(function () {
        return applicativeListT(__dict_Monad_18);
    }, function () {
        return bindListT(__dict_Monad_18);
    });
};
var bindListT = function (__dict_Monad_38) {
    return new Prelude.Bind(function () {
        return applyListT(__dict_Monad_38);
    }, function (fa) {
        return function (f) {
            var g = function (_135) {
                if (_135 instanceof Yield) {
                    var h = function (s_1) {
                        return Prelude["<>"](semigroupListT(__dict_Monad_38["__superclass_Prelude.Applicative_0"]()))(f(_135.value0))(Prelude[">>="](bindListT(__dict_Monad_38))(s_1)(f));
                    };
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(h)(_135.value1));
                };
                if (_135 instanceof Skip) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(function (_7) {
                        return Prelude[">>="](bindListT(__dict_Monad_38))(_7)(f);
                    })(_135.value0));
                };
                if (_135 instanceof Done) {
                    return Done.value;
                };
                throw new Error("Failed pattern match at Control.Monad.List.Trans line 262, column 5 - line 265, column 5: " + [ _135.constructor.name ]);
            };
            return stepMap(((__dict_Monad_38["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g)(fa);
        };
    });
};
var applyListT = function (__dict_Monad_39) {
    return new Prelude.Apply(function () {
        return functorListT(((__dict_Monad_39["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    }, Prelude.ap(monadListT(__dict_Monad_39)));
};
var applicativeListT = function (__dict_Monad_40) {
    return new Prelude.Applicative(function () {
        return applyListT(__dict_Monad_40);
    }, singleton(__dict_Monad_40["__superclass_Prelude.Applicative_0"]()));
};
var monadEffListT = function (__dict_Monad_19) {
    return function (__dict_MonadEff_20) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadListT(__dict_Monad_19);
        }, Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(monadTransListT)(__dict_Monad_19))(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_20)));
    };
};
var altListT = function (__dict_Applicative_42) {
    return new Control_Alt.Alt(function () {
        return functorListT((__dict_Applicative_42["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    }, concat(__dict_Applicative_42));
};
var plusListT = function (__dict_Monad_11) {
    return new Control_Plus.Plus(function () {
        return altListT(__dict_Monad_11["__superclass_Prelude.Applicative_0"]());
    }, nil(__dict_Monad_11["__superclass_Prelude.Applicative_0"]()));
};
var alternativeListT = function (__dict_Monad_41) {
    return new Control_Alternative.Alternative(function () {
        return plusListT(__dict_Monad_41);
    }, function () {
        return applicativeListT(__dict_Monad_41);
    });
};
var monadPlusListT = function (__dict_Monad_17) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeListT(__dict_Monad_17);
    }, function () {
        return monadListT(__dict_Monad_17);
    });
};
module.exports = {
    "zipWith'": zipWith$prime, 
    zipWith: zipWith, 
    wrapLazy: wrapLazy, 
    wrapEffect: wrapEffect, 
    unfold: unfold, 
    uncons: uncons, 
    takeWhile: takeWhile, 
    take: take, 
    tail: tail, 
    singleton: singleton, 
    scanl: scanl, 
    repeat: repeat, 
    "prepend'": prepend$prime, 
    prepend: prepend, 
    nil: nil, 
    mapMaybe: mapMaybe, 
    iterate: iterate, 
    head: head, 
    fromEffect: fromEffect, 
    "foldl'": foldl$prime, 
    foldl: foldl, 
    filter: filter, 
    dropWhile: dropWhile, 
    drop: drop, 
    cons: cons, 
    catMaybes: catMaybes, 
    semigroupListT: semigroupListT, 
    monoidListT: monoidListT, 
    functorListT: functorListT, 
    unfoldableListT: unfoldableListT, 
    applyListT: applyListT, 
    applicativeListT: applicativeListT, 
    bindListT: bindListT, 
    monadListT: monadListT, 
    monadTransListT: monadTransListT, 
    altListT: altListT, 
    plusListT: plusListT, 
    alternativeListT: alternativeListT, 
    monadPlusListT: monadPlusListT, 
    monadEffListT: monadEffListT
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Lazy/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Data.Unfoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Unfoldable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Maybe.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Monad = require("Control.Monad");
var Control_Monad_Rec_Class = require("Control.Monad.Rec.Class");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var MaybeT = function (x) {
    return x;
};
var runMaybeT = function (_610) {
    return _610;
};
var monadTransMaybeT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_1) {
    return function (_2199) {
        return MaybeT(Prelude.liftM1(__dict_Monad_1)(Data_Maybe.Just.create)(_2199));
    };
});
var mapMaybeT = function (f) {
    return function (_2200) {
        return MaybeT(f(runMaybeT(_2200)));
    };
};
var liftPassMaybe = function (__dict_Monad_7) {
    return function (pass) {
        return mapMaybeT(function (m) {
            return pass(Prelude.bind(__dict_Monad_7["__superclass_Prelude.Bind_1"]())(m)(function (_44) {
                return Prelude["return"](__dict_Monad_7["__superclass_Prelude.Applicative_0"]())((function () {
                    if (_44 instanceof Data_Maybe.Nothing) {
                        return new Data_Tuple.Tuple(Data_Maybe.Nothing.value, Prelude.id(Prelude.categoryFn));
                    };
                    if (_44 instanceof Data_Maybe.Just) {
                        return new Data_Tuple.Tuple(new Data_Maybe.Just(_44.value0.value0), _44.value0.value1);
                    };
                    throw new Error("Failed pattern match at Control.Monad.Maybe.Trans line 87, column 1 - line 88, column 1: " + [ _44.constructor.name ]);
                })());
            }));
        });
    };
};
var liftListenMaybe = function (__dict_Monad_8) {
    return function (listen) {
        return mapMaybeT(function (m) {
            return Prelude.bind(__dict_Monad_8["__superclass_Prelude.Bind_1"]())(listen(m))(function (_43) {
                return Prelude["return"](__dict_Monad_8["__superclass_Prelude.Applicative_0"]())(Prelude["<$>"](Data_Maybe.functorMaybe)(function (r) {
                    return new Data_Tuple.Tuple(r, _43.value1);
                })(_43.value0));
            });
        });
    };
};
var liftCatchMaybe = function ($$catch) {
    return function (m) {
        return function (h) {
            return MaybeT($$catch(runMaybeT(m))(function (_2201) {
                return runMaybeT(h(_2201));
            }));
        };
    };
};
var liftCallCCMaybe = function (callCC) {
    return function (f) {
        return MaybeT(callCC(function (c) {
            return runMaybeT(f(function (a) {
                return MaybeT(c(new Data_Maybe.Just(a)));
            }));
        }));
    };
};
var monadMaybeT = function (__dict_Monad_4) {
    return new Prelude.Monad(function () {
        return applicativeMaybeT(__dict_Monad_4);
    }, function () {
        return bindMaybeT(__dict_Monad_4);
    });
};
var functorMaybeT = function (__dict_Monad_9) {
    return new Prelude.Functor(Prelude.liftA1(applicativeMaybeT(__dict_Monad_9)));
};
var bindMaybeT = function (__dict_Monad_10) {
    return new Prelude.Bind(function () {
        return applyMaybeT(__dict_Monad_10);
    }, function (x) {
        return function (f) {
            return MaybeT(Prelude.bind(__dict_Monad_10["__superclass_Prelude.Bind_1"]())(runMaybeT(x))(function (_40) {
                if (_40 instanceof Data_Maybe.Nothing) {
                    return Prelude["return"](__dict_Monad_10["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Nothing.value);
                };
                if (_40 instanceof Data_Maybe.Just) {
                    return runMaybeT(f(_40.value0));
                };
                throw new Error("Failed pattern match: " + [ _40.constructor.name ]);
            }));
        };
    });
};
var applyMaybeT = function (__dict_Monad_11) {
    return new Prelude.Apply(function () {
        return functorMaybeT(__dict_Monad_11);
    }, Prelude.ap(monadMaybeT(__dict_Monad_11)));
};
var applicativeMaybeT = function (__dict_Monad_12) {
    return new Prelude.Applicative(function () {
        return applyMaybeT(__dict_Monad_12);
    }, function (_2202) {
        return MaybeT(Prelude.pure(__dict_Monad_12["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Just.create(_2202)));
    });
};
var monadEffMaybe = function (__dict_Monad_5) {
    return function (__dict_MonadEff_6) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadMaybeT(__dict_Monad_5);
        }, function (_2203) {
            return Control_Monad_Trans.lift(monadTransMaybeT)(__dict_Monad_5)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_6)(_2203));
        });
    };
};
var monadRecMaybeT = function (__dict_MonadRec_2) {
    return new Control_Monad_Rec_Class.MonadRec(function () {
        return monadMaybeT(__dict_MonadRec_2["__superclass_Prelude.Monad_0"]());
    }, function (f) {
        return function (_2204) {
            return MaybeT(Control_Monad_Rec_Class.tailRecM(__dict_MonadRec_2)(function (a) {
                return Prelude.bind((__dict_MonadRec_2["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Bind_1"]())(runMaybeT(f(a)))(function (_42) {
                    return Prelude["return"]((__dict_MonadRec_2["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Applicative_0"]())((function () {
                        if (_42 instanceof Data_Maybe.Nothing) {
                            return new Data_Either.Right(Data_Maybe.Nothing.value);
                        };
                        if (_42 instanceof Data_Maybe.Just && _42.value0 instanceof Data_Either.Left) {
                            return new Data_Either.Left(_42.value0.value0);
                        };
                        if (_42 instanceof Data_Maybe.Just && _42.value0 instanceof Data_Either.Right) {
                            return new Data_Either.Right(new Data_Maybe.Just(_42.value0.value0));
                        };
                        throw new Error("Failed pattern match at Control.Monad.Maybe.Trans line 68, column 1 - line 76, column 1: " + [ _42.constructor.name ]);
                    })());
                });
            })(_2204));
        };
    });
};
var altMaybeT = function (__dict_Monad_14) {
    return new Control_Alt.Alt(function () {
        return functorMaybeT(__dict_Monad_14);
    }, function (m1) {
        return function (m2) {
            return Prelude.bind(__dict_Monad_14["__superclass_Prelude.Bind_1"]())(runMaybeT(m1))(function (_41) {
                if (_41 instanceof Data_Maybe.Nothing) {
                    return runMaybeT(m2);
                };
                return Prelude["return"](__dict_Monad_14["__superclass_Prelude.Applicative_0"]())(_41);
            });
        };
    });
};
var plusMaybeT = function (__dict_Monad_0) {
    return new Control_Plus.Plus(function () {
        return altMaybeT(__dict_Monad_0);
    }, Prelude.pure(__dict_Monad_0["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Nothing.value));
};
var alternativeMaybeT = function (__dict_Monad_13) {
    return new Control_Alternative.Alternative(function () {
        return plusMaybeT(__dict_Monad_13);
    }, function () {
        return applicativeMaybeT(__dict_Monad_13);
    });
};
var monadPlusMaybeT = function (__dict_Monad_3) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeMaybeT(__dict_Monad_3);
    }, function () {
        return monadMaybeT(__dict_Monad_3);
    });
};
module.exports = {
    MaybeT: MaybeT, 
    liftCallCCMaybe: liftCallCCMaybe, 
    liftPassMaybe: liftPassMaybe, 
    liftListenMaybe: liftListenMaybe, 
    liftCatchMaybe: liftCatchMaybe, 
    mapMaybeT: mapMaybeT, 
    runMaybeT: runMaybeT, 
    functorMaybeT: functorMaybeT, 
    applyMaybeT: applyMaybeT, 
    applicativeMaybeT: applicativeMaybeT, 
    bindMaybeT: bindMaybeT, 
    monadMaybeT: monadMaybeT, 
    monadTransMaybeT: monadTransMaybeT, 
    altMaybeT: altMaybeT, 
    plusMaybeT: plusMaybeT, 
    alternativeMaybeT: alternativeMaybeT, 
    monadPlusMaybeT: monadPlusMaybeT, 
    monadRecMaybeT: monadRecMaybeT, 
    monadEffMaybe: monadEffMaybe
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Monad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Rec.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.RWS.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");
var RWST = function (x) {
    return x;
};
var runRWST = function (_616) {
    return _616;
};
var withRWST = function (f) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Data_Tuple.uncurry(runRWST(m))(f(r)(s));
            };
        };
    };
};
var mkSee = function (__dict_Monoid_5) {
    return function (s) {
        return function (a) {
            return function (w) {
                return {
                    state: s, 
                    result: a, 
                    log: w
                };
            };
        };
    };
};
var monadTransRWST = function (__dict_Monoid_6) {
    return new Control_Monad_Trans.MonadTrans(function (__dict_Monad_7) {
        return function (m) {
            return function (_615) {
                return function (s) {
                    return Prelude[">>="](__dict_Monad_7["__superclass_Prelude.Bind_1"]())(m)(function (a) {
                        return Prelude["return"](__dict_Monad_7["__superclass_Prelude.Applicative_0"]())(mkSee(__dict_Monoid_6)(s)(a)(Data_Monoid.mempty(__dict_Monoid_6)));
                    });
                };
            };
        };
    });
};
var mapRWST = function (f) {
    return function (m) {
        return function (r) {
            return function (s) {
                return f(runRWST(m)(r)(s));
            };
        };
    };
};
var functorRWST = function (__dict_Functor_8) {
    return new Prelude.Functor(function (f) {
        return function (m) {
            return function (r) {
                return function (s) {
                    return Prelude["<$>"](__dict_Functor_8)(function (see) {
                        var _2207 = {};
                        for (var _2208 in see) {
                            if (see.hasOwnProperty(_2208)) {
                                _2207[_2208] = see[_2208];
                            };
                        };
                        _2207.result = f(see.result);
                        return _2207;
                    })(runRWST(m)(r)(s));
                };
            };
        };
    });
};
var execRWST = function (__dict_Monad_9) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_9["__superclass_Prelude.Bind_1"]())(runRWST(m)(r)(s))(function (see) {
                    return Prelude["return"](__dict_Monad_9["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(see.state, see.log));
                });
            };
        };
    };
};
var evalRWST = function (__dict_Monad_10) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_10["__superclass_Prelude.Bind_1"]())(runRWST(m)(r)(s))(function (see) {
                    return Prelude["return"](__dict_Monad_10["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(see.result, see.log));
                });
            };
        };
    };
};
var applyRWST = function (__dict_Bind_13) {
    return function (__dict_Monoid_14) {
        return new Prelude.Apply(function () {
            return functorRWST((__dict_Bind_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
        }, function (f) {
            return function (m) {
                return function (r) {
                    return function (s) {
                        return Prelude[">>="](__dict_Bind_13)(runRWST(f)(r)(s))(function (_612) {
                            return Prelude["<#>"]((__dict_Bind_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(runRWST(m)(r)(_612.state))(function (_611) {
                                return mkSee(__dict_Monoid_14)(_611.state)(_612.result(_611.result))(Prelude["++"](__dict_Monoid_14["__superclass_Prelude.Semigroup_0"]())(_612.log)(_611.log));
                            });
                        });
                    };
                };
            };
        });
    };
};
var bindRWST = function (__dict_Bind_11) {
    return function (__dict_Monoid_12) {
        return new Prelude.Bind(function () {
            return applyRWST(__dict_Bind_11)(__dict_Monoid_12);
        }, function (m) {
            return function (f) {
                return function (r) {
                    return function (s) {
                        return Prelude[">>="](__dict_Bind_11)(runRWST(m)(r)(s))(function (_613) {
                            return Prelude["<#>"]((__dict_Bind_11["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(runRWST(f(_613.result))(r)(_613.state))(function (see$prime) {
                                var _2218 = {};
                                for (var _2219 in see$prime) {
                                    if (see$prime.hasOwnProperty(_2219)) {
                                        _2218[_2219] = see$prime[_2219];
                                    };
                                };
                                _2218.log = Prelude["++"](__dict_Monoid_12["__superclass_Prelude.Semigroup_0"]())(_613.log)(see$prime.log);
                                return _2218;
                            });
                        });
                    };
                };
            };
        });
    };
};
var applicativeRWST = function (__dict_Monad_15) {
    return function (__dict_Monoid_16) {
        return new Prelude.Applicative(function () {
            return applyRWST(__dict_Monad_15["__superclass_Prelude.Bind_1"]())(__dict_Monoid_16);
        }, function (a) {
            return function (_614) {
                return function (s) {
                    return Prelude.pure(__dict_Monad_15["__superclass_Prelude.Applicative_0"]())(mkSee(__dict_Monoid_16)(s)(a)(Data_Monoid.mempty(__dict_Monoid_16)));
                };
            };
        });
    };
};
var monadRWST = function (__dict_Monad_0) {
    return function (__dict_Monoid_1) {
        return new Prelude.Monad(function () {
            return applicativeRWST(__dict_Monad_0)(__dict_Monoid_1);
        }, function () {
            return bindRWST(__dict_Monad_0["__superclass_Prelude.Bind_1"]())(__dict_Monoid_1);
        });
    };
};
var monadEffRWS = function (__dict_Monad_2) {
    return function (__dict_Monoid_3) {
        return function (__dict_MonadEff_4) {
            return new Control_Monad_Eff_Class.MonadEff(function () {
                return monadRWST(__dict_Monad_2)(__dict_Monoid_3);
            }, function (_2224) {
                return Control_Monad_Trans.lift(monadTransRWST(__dict_Monoid_3))(__dict_Monad_2)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_4)(_2224));
            });
        };
    };
};
module.exports = {
    RWST: RWST, 
    withRWST: withRWST, 
    mapRWST: mapRWST, 
    execRWST: execRWST, 
    evalRWST: evalRWST, 
    runRWST: runRWST, 
    mkSee: mkSee, 
    functorRWST: functorRWST, 
    applyRWST: applyRWST, 
    bindRWST: bindRWST, 
    applicativeRWST: applicativeRWST, 
    monadRWST: monadRWST, 
    monadTransRWST: monadTransRWST, 
    monadEffRWS: monadEffRWS
};

},{"Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.RWS/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_RWS_Trans = require("Control.Monad.RWS.Trans");
var Data_Identity = require("Data.Identity");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");
var writer = function (__dict_Applicative_0) {
    return function (_623) {
        return function (_617) {
            return function (s) {
                return Prelude.pure(__dict_Applicative_0)({
                    state: s, 
                    result: _623.value0, 
                    log: _623.value1
                });
            };
        };
    };
};
var withRWS = Control_Monad_RWS_Trans.withRWST;
var tell = function (__dict_Applicative_1) {
    return function (w) {
        return writer(__dict_Applicative_1)(new Data_Tuple.Tuple(Prelude.unit, w));
    };
};
var state = function (__dict_Applicative_2) {
    return function (__dict_Monoid_3) {
        return function (f) {
            return function (_621) {
                return function (s) {
                    var _2230 = f(s);
                    return Prelude.pure(__dict_Applicative_2)(Control_Monad_RWS_Trans.mkSee(__dict_Monoid_3)(_2230.value1)(_2230.value0)(Data_Monoid.mempty(__dict_Monoid_3)));
                };
            };
        };
    };
};
var rws = function (f) {
    return function (r) {
        return function (s) {
            return Prelude["return"](Data_Identity.applicativeIdentity)(f(r)(s));
        };
    };
};
var runRWS = function (m) {
    return function (r) {
        return function (s) {
            return Data_Identity.runIdentity(Control_Monad_RWS_Trans.runRWST(m)(r)(s));
        };
    };
};
var reader = function (__dict_Applicative_4) {
    return function (__dict_Monoid_5) {
        return function (f) {
            return function (r) {
                return function (s) {
                    return Prelude.pure(__dict_Applicative_4)(Control_Monad_RWS_Trans.mkSee(__dict_Monoid_5)(s)(f(r))(Data_Monoid.mempty(__dict_Monoid_5)));
                };
            };
        };
    };
};
var put = function (__dict_Applicative_6) {
    return function (__dict_Monoid_7) {
        return function (s) {
            return state(__dict_Applicative_6)(__dict_Monoid_7)(function (_622) {
                return new Data_Tuple.Tuple(Prelude.unit, s);
            });
        };
    };
};
var pass = function (__dict_Monad_8) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_8["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (_619) {
                    return Prelude.pure(__dict_Monad_8["__superclass_Prelude.Applicative_0"]())({
                        state: _619.state, 
                        result: _619.result.value0, 
                        log: _619.result.value1(_619.log)
                    });
                });
            };
        };
    };
};
var modify = function (__dict_Applicative_9) {
    return function (__dict_Monoid_10) {
        return function (f) {
            return state(__dict_Applicative_9)(__dict_Monoid_10)(function (s) {
                return new Data_Tuple.Tuple(Prelude.unit, f(s));
            });
        };
    };
};
var mapRWS = function (f) {
    return Control_Monad_RWS_Trans.mapRWST(Prelude[">>>"](Prelude.semigroupoidFn)(Data_Identity.runIdentity)(Prelude[">>>"](Prelude.semigroupoidFn)(f)(Data_Identity.Identity)));
};
var local = function (f) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Control_Monad_RWS_Trans.runRWST(m)(f(r))(s);
            };
        };
    };
};
var listens = function (__dict_Monad_11) {
    return function (f) {
        return function (m) {
            return function (r) {
                return function (s) {
                    return Prelude[">>="](__dict_Monad_11["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (_620) {
                        return Prelude.pure(__dict_Monad_11["__superclass_Prelude.Applicative_0"]())({
                            state: _620.state, 
                            result: new Data_Tuple.Tuple(_620.result, f(_620.log)), 
                            log: _620.log
                        });
                    });
                };
            };
        };
    };
};
var listen = function (__dict_Monad_12) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_12["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (_618) {
                    return Prelude.pure(__dict_Monad_12["__superclass_Prelude.Applicative_0"]())({
                        state: _618.state, 
                        result: new Data_Tuple.Tuple(_618.result, _618.log), 
                        log: _618.log
                    });
                });
            };
        };
    };
};
var gets = function (__dict_Applicative_13) {
    return function (__dict_Monoid_14) {
        return function (f) {
            return state(__dict_Applicative_13)(__dict_Monoid_14)(function (s) {
                return new Data_Tuple.Tuple(f(s), s);
            });
        };
    };
};
var get = function (__dict_Applicative_15) {
    return function (__dict_Monoid_16) {
        return state(__dict_Applicative_15)(__dict_Monoid_16)(function (s) {
            return new Data_Tuple.Tuple(s, s);
        });
    };
};
var execRWS = function (m) {
    return function (r) {
        return function (s) {
            return Data_Identity.runIdentity(Control_Monad_RWS_Trans.execRWST(Data_Identity.monadIdentity)(m)(r)(s));
        };
    };
};
var evalRWS = function (m) {
    return function (r) {
        return function (s) {
            return Data_Identity.runIdentity(Control_Monad_RWS_Trans.evalRWST(Data_Identity.monadIdentity)(m)(r)(s));
        };
    };
};
var censor = function (__dict_Monad_17) {
    return function (f) {
        return function (m) {
            return function (r) {
                return function (s) {
                    return Prelude[">>="](__dict_Monad_17["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (see) {
                        return Prelude.pure(__dict_Monad_17["__superclass_Prelude.Applicative_0"]())((function () {
                            var _2248 = {};
                            for (var _2249 in see) {
                                if (see.hasOwnProperty(_2249)) {
                                    _2248[_2249] = see[_2249];
                                };
                            };
                            _2248.log = f(see.log);
                            return _2248;
                        })());
                    });
                };
            };
        };
    };
};
var ask = function (__dict_Applicative_18) {
    return function (__dict_Monoid_19) {
        return function (r) {
            return function (s) {
                return Prelude.pure(__dict_Applicative_18)(Control_Monad_RWS_Trans.mkSee(__dict_Monoid_19)(s)(r)(Data_Monoid.mempty(__dict_Monoid_19)));
            };
        };
    };
};
module.exports = {
    modify: modify, 
    put: put, 
    gets: gets, 
    get: get, 
    state: state, 
    censor: censor, 
    listens: listens, 
    tell: tell, 
    pass: pass, 
    listen: listen, 
    writer: writer, 
    reader: reader, 
    local: local, 
    ask: ask, 
    withRWS: withRWS, 
    mapRWS: mapRWS, 
    execRWS: execRWS, 
    evalRWS: evalRWS, 
    runRWS: runRWS, 
    rws: rws
};

},{"Control.Monad.RWS.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.RWS.Trans/index.js","Data.Identity":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Identity/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Reader.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Distributive = require("Data.Distributive");
var ReaderT = function (x) {
    return x;
};
var runReaderT = function (_537) {
    return _537;
};
var withReaderT = function (f) {
    return function (m) {
        return ReaderT(function (_1914) {
            return runReaderT(m)(f(_1914));
        });
    };
};
var mapReaderT = function (f) {
    return function (m) {
        return ReaderT(function (_1915) {
            return f(runReaderT(m)(_1915));
        });
    };
};
var liftReaderT = function (m) {
    return Prelude["const"](m);
};
var monadTransReaderT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_4) {
    return liftReaderT;
});
var liftCatchReader = function ($$catch) {
    return function (m) {
        return function (h) {
            return ReaderT(function (r) {
                return $$catch(runReaderT(m)(r))(function (e) {
                    return runReaderT(h(e))(r);
                });
            });
        };
    };
};
var liftCallCCReader = function (callCC) {
    return function (f) {
        return ReaderT(function (r) {
            return callCC(function (c) {
                return runReaderT(f(function (a) {
                    return ReaderT(Prelude["const"](c(a)));
                }))(r);
            });
        });
    };
};
var functorReaderT = function (__dict_Functor_6) {
    return new Prelude.Functor(function (f) {
        return mapReaderT(Prelude["<$>"](__dict_Functor_6)(f));
    });
};
var distributiveReaderT = function (__dict_Distributive_7) {
    return new Data_Distributive.Distributive(function () {
        return functorReaderT(__dict_Distributive_7["__superclass_Prelude.Functor_0"]());
    }, function (__dict_Functor_9) {
        return function (f) {
            return function (_1916) {
                return Data_Distributive.distribute(distributiveReaderT(__dict_Distributive_7))(__dict_Functor_9)(Prelude.map(__dict_Functor_9)(f)(_1916));
            };
        };
    }, function (__dict_Functor_8) {
        return function (a) {
            return function (e) {
                return Data_Distributive.collect(__dict_Distributive_7)(__dict_Functor_8)(Prelude.flip(runReaderT)(e))(a);
            };
        };
    });
};
var applyReaderT = function (__dict_Applicative_11) {
    return new Prelude.Apply(function () {
        return functorReaderT((__dict_Applicative_11["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    }, function (f) {
        return function (v) {
            return function (r) {
                return Prelude["<*>"](__dict_Applicative_11["__superclass_Prelude.Apply_0"]())(runReaderT(f)(r))(runReaderT(v)(r));
            };
        };
    });
};
var bindReaderT = function (__dict_Monad_10) {
    return new Prelude.Bind(function () {
        return applyReaderT(__dict_Monad_10["__superclass_Prelude.Applicative_0"]());
    }, function (m) {
        return function (k) {
            return function (r) {
                return Prelude.bind(__dict_Monad_10["__superclass_Prelude.Bind_1"]())(runReaderT(m)(r))(function (_34) {
                    return runReaderT(k(_34))(r);
                });
            };
        };
    });
};
var applicativeReaderT = function (__dict_Applicative_12) {
    return new Prelude.Applicative(function () {
        return applyReaderT(__dict_Applicative_12);
    }, function (_1917) {
        return liftReaderT(Prelude.pure(__dict_Applicative_12)(_1917));
    });
};
var monadReaderT = function (__dict_Monad_0) {
    return new Prelude.Monad(function () {
        return applicativeReaderT(__dict_Monad_0["__superclass_Prelude.Applicative_0"]());
    }, function () {
        return bindReaderT(__dict_Monad_0);
    });
};
var monadEffReader = function (__dict_Monad_2) {
    return function (__dict_MonadEff_3) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadReaderT(__dict_Monad_2);
        }, function (_1918) {
            return Control_Monad_Trans.lift(monadTransReaderT)(__dict_Monad_2)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_3)(_1918));
        });
    };
};
var altReaderT = function (__dict_Alt_14) {
    return new Control_Alt.Alt(function () {
        return functorReaderT(__dict_Alt_14["__superclass_Prelude.Functor_0"]());
    }, function (m) {
        return function (n) {
            return function (r) {
                return Control_Alt["<|>"](__dict_Alt_14)(runReaderT(m)(r))(runReaderT(n)(r));
            };
        };
    });
};
var plusReaderT = function (__dict_Plus_5) {
    return new Control_Plus.Plus(function () {
        return altReaderT(__dict_Plus_5["__superclass_Control.Alt.Alt_0"]());
    }, liftReaderT(Control_Plus.empty(__dict_Plus_5)));
};
var alternativeReaderT = function (__dict_Alternative_13) {
    return new Control_Alternative.Alternative(function () {
        return plusReaderT(__dict_Alternative_13["__superclass_Control.Plus.Plus_1"]());
    }, function () {
        return applicativeReaderT(__dict_Alternative_13["__superclass_Prelude.Applicative_0"]());
    });
};
var monadPlusReaderT = function (__dict_MonadPlus_1) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeReaderT(__dict_MonadPlus_1["__superclass_Control.Alternative.Alternative_1"]());
    }, function () {
        return monadReaderT(__dict_MonadPlus_1["__superclass_Prelude.Monad_0"]());
    });
};
module.exports = {
    ReaderT: ReaderT, 
    liftCallCCReader: liftCallCCReader, 
    liftCatchReader: liftCatchReader, 
    liftReaderT: liftReaderT, 
    mapReaderT: mapReaderT, 
    withReaderT: withReaderT, 
    runReaderT: runReaderT, 
    functorReaderT: functorReaderT, 
    applyReaderT: applyReaderT, 
    applicativeReaderT: applicativeReaderT, 
    altReaderT: altReaderT, 
    plusReaderT: plusReaderT, 
    alternativeReaderT: alternativeReaderT, 
    bindReaderT: bindReaderT, 
    monadReaderT: monadReaderT, 
    monadPlusReaderT: monadPlusReaderT, 
    monadTransReaderT: monadTransReaderT, 
    monadEffReader: monadEffReader, 
    distributiveReaderT: distributiveReaderT
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Distributive":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Distributive/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");
var Data_Either = require("Data.Either");
var Data_Functor = require("Data.Functor");
var Data_Identity = require("Data.Identity");
var Control_Monad_Eff_Unsafe = require("Control.Monad.Eff.Unsafe");
var Data_Either_Unsafe = require("Data.Either.Unsafe");
var MonadRec = function (__superclass_Prelude$dotMonad_0, tailRecM) {
    this["__superclass_Prelude.Monad_0"] = __superclass_Prelude$dotMonad_0;
    this.tailRecM = tailRecM;
};
var tailRecM = function (dict) {
    return dict.tailRecM;
};
var tailRecM2 = function (__dict_MonadRec_0) {
    return function (f) {
        return function (a) {
            return function (b) {
                return tailRecM(__dict_MonadRec_0)(function (o) {
                    return f(o.a)(o.b);
                })({
                    a: a, 
                    b: b
                });
            };
        };
    };
};
var tailRecM3 = function (__dict_MonadRec_1) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return tailRecM(__dict_MonadRec_1)(function (o) {
                        return f(o.a)(o.b)(o.c);
                    })({
                        a: a, 
                        b: b, 
                        c: c
                    });
                };
            };
        };
    };
};
var tailRecEff = function (f) {
    return function (a) {
        var f$prime = function (_1869) {
            return Control_Monad_Eff_Unsafe.unsafeInterleaveEff(f(_1869));
        };
        return function __do() {
            var _29 = f$prime(a)();
            var _28 = {
                value: _29
            };
            (function () {
                while (!(function __do() {
                    var _27 = _28.value;
                    return (function () {
                        if (_27 instanceof Data_Either.Left) {
                            return function __do() {
                                var _26 = f$prime(_27.value0)();
                                _28.value = _26;
                                return Prelude["return"](Control_Monad_Eff.applicativeEff)(false)();
                            };
                        };
                        if (_27 instanceof Data_Either.Right) {
                            return Prelude["return"](Control_Monad_Eff.applicativeEff)(true);
                        };
                        throw new Error("Failed pattern match at Control.Monad.Rec.Class line 75, column 1 - line 76, column 1: " + [ _27.constructor.name ]);
                    })()();
                })()) {

                };
                return {};
            })();
            return Prelude["<$>"](Control_Monad_Eff.functorEff)(Data_Either_Unsafe.fromRight)(Control_Monad_ST.readSTRef(_28))();
        };
    };
};
var tailRec = function (f) {
    return function (a) {
        var go = function (__copy__532) {
            var _532 = __copy__532;
            tco: while (true) {
                if (_532 instanceof Data_Either.Left) {
                    var __tco__532 = f(_532.value0);
                    _532 = __tco__532;
                    continue tco;
                };
                if (_532 instanceof Data_Either.Right) {
                    return _532.value0;
                };
                throw new Error("Failed pattern match at Control.Monad.Rec.Class line 63, column 1 - line 64, column 1: " + [ _532.constructor.name ]);
            };
        };
        return go(f(a));
    };
};
var monadRecIdentity = new MonadRec(function () {
    return Data_Identity.monadIdentity;
}, function (f) {
    return function (_1870) {
        return Data_Identity.Identity(tailRec(function (_1871) {
            return Data_Identity.runIdentity(f(_1871));
        })(_1870));
    };
});
var monadRecEff = new MonadRec(function () {
    return Control_Monad_Eff.monadEff;
}, tailRecEff);
var forever = function (__dict_MonadRec_2) {
    return function (ma) {
        return tailRecM(__dict_MonadRec_2)(function (u) {
            return Data_Functor["<$"]((((__dict_MonadRec_2["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(new Data_Either.Left(u))(ma);
        })(Prelude.unit);
    };
};
module.exports = {
    MonadRec: MonadRec, 
    forever: forever, 
    tailRecM3: tailRecM3, 
    tailRecM2: tailRecM2, 
    tailRecM: tailRecM, 
    tailRec: tailRec, 
    monadRecIdentity: monadRecIdentity, 
    monadRecEff: monadRecEff
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Eff.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Either.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either.Unsafe/index.js","Data.Functor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor/index.js","Data.Identity":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Identity/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Control.Monad.ST

exports.newSTRef = function (val) {
  return function () {
    return { value: val };
  };
};

exports.readSTRef = function (ref) {
  return function () {
    return ref.value;
  };
};

exports.modifySTRef = function (ref) {
  return function (f) {
    return function () {
      /* jshint boss: true */
      return ref.value = f(ref.value);
    };
  };
};

exports.writeSTRef = function (ref) {
  return function (a) {
    return function () {
      /* jshint boss: true */
      return ref.value = a;
    };
  };
};

exports.runST = function (f) {
  return f;
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var pureST = function (st) {
    return Control_Monad_Eff.runPure($foreign.runST(st));
};
module.exports = {
    pureST: pureST, 
    runST: $foreign.runST, 
    writeSTRef: $foreign.writeSTRef, 
    modifySTRef: $foreign.modifySTRef, 
    readSTRef: $foreign.readSTRef, 
    newSTRef: $foreign.newSTRef
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.State.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Lazy = require("Control.Lazy");
var Control_Monad_Rec_Class = require("Control.Monad.Rec.Class");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Tuple = require("Data.Tuple");
var Data_Either = require("Data.Either");
var StateT = function (x) {
    return x;
};
var runStateT = function (_626) {
    return _626;
};
var withStateT = function (f) {
    return function (s) {
        return StateT(function (_2278) {
            return runStateT(s)(f(_2278));
        });
    };
};
var monadTransStateT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_2) {
    return function (m) {
        return function (s) {
            return Prelude.bind(__dict_Monad_2["__superclass_Prelude.Bind_1"]())(m)(function (_47) {
                return Prelude["return"](__dict_Monad_2["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(_47, s));
            });
        };
    };
});
var mapStateT = function (f) {
    return function (m) {
        return StateT(function (_2279) {
            return f(runStateT(m)(_2279));
        });
    };
};
var liftPassState = function (__dict_Monad_8) {
    return function (pass) {
        return function (m) {
            return StateT(function (s) {
                return pass(Prelude.bind(__dict_Monad_8["__superclass_Prelude.Bind_1"]())(runStateT(m)(s))(function (_49) {
                    return Prelude["return"](__dict_Monad_8["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_49.value0.value0, _49.value1), _49.value0.value1));
                }));
            });
        };
    };
};
var liftListenState = function (__dict_Monad_9) {
    return function (listen) {
        return function (m) {
            return StateT(function (s) {
                return Prelude.bind(__dict_Monad_9["__superclass_Prelude.Bind_1"]())(listen(runStateT(m)(s)))(function (_48) {
                    return Prelude["return"](__dict_Monad_9["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_48.value0.value0, _48.value1), _48.value0.value1));
                });
            });
        };
    };
};
var liftCatchState = function ($$catch) {
    return function (m) {
        return function (h) {
            return StateT(function (s) {
                return $$catch(runStateT(m)(s))(function (e) {
                    return runStateT(h(e))(s);
                });
            });
        };
    };
};
var liftCallCCState$prime = function (callCC) {
    return function (f) {
        return StateT(function (s) {
            return callCC(function (c) {
                return runStateT(f(function (a) {
                    return StateT(function (s$prime) {
                        return c(new Data_Tuple.Tuple(a, s$prime));
                    });
                }))(s);
            });
        });
    };
};
var liftCallCCState = function (callCC) {
    return function (f) {
        return StateT(function (s) {
            return callCC(function (c) {
                return runStateT(f(function (a) {
                    return StateT(function (_625) {
                        return c(new Data_Tuple.Tuple(a, s));
                    });
                }))(s);
            });
        });
    };
};
var lazyStateT = new Control_Lazy.Lazy(function (f) {
    return StateT(function (s) {
        return runStateT(f(Prelude.unit))(s);
    });
});
var execStateT = function (__dict_Apply_11) {
    return function (m) {
        return function (s) {
            return Prelude["<$>"](__dict_Apply_11["__superclass_Prelude.Functor_0"]())(Data_Tuple.snd)(runStateT(m)(s));
        };
    };
};
var evalStateT = function (__dict_Apply_12) {
    return function (m) {
        return function (s) {
            return Prelude["<$>"](__dict_Apply_12["__superclass_Prelude.Functor_0"]())(Data_Tuple.fst)(runStateT(m)(s));
        };
    };
};
var monadStateT = function (__dict_Monad_3) {
    return new Prelude.Monad(function () {
        return applicativeStateT(__dict_Monad_3);
    }, function () {
        return bindStateT(__dict_Monad_3);
    });
};
var functorStateT = function (__dict_Monad_10) {
    return new Prelude.Functor(Prelude.liftM1(monadStateT(__dict_Monad_10)));
};
var bindStateT = function (__dict_Monad_13) {
    return new Prelude.Bind(function () {
        return applyStateT(__dict_Monad_13);
    }, function (_627) {
        return function (f) {
            return function (s) {
                return Prelude.bind(__dict_Monad_13["__superclass_Prelude.Bind_1"]())(_627(s))(function (_45) {
                    return runStateT(f(_45.value0))(_45.value1);
                });
            };
        };
    });
};
var applyStateT = function (__dict_Monad_14) {
    return new Prelude.Apply(function () {
        return functorStateT(__dict_Monad_14);
    }, Prelude.ap(monadStateT(__dict_Monad_14)));
};
var applicativeStateT = function (__dict_Monad_15) {
    return new Prelude.Applicative(function () {
        return applyStateT(__dict_Monad_15);
    }, function (a) {
        return StateT(function (s) {
            return Prelude["return"](__dict_Monad_15["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(a, s));
        });
    });
};
var monadEffState = function (__dict_Monad_6) {
    return function (__dict_MonadEff_7) {
        return new Control_Monad_Eff_Class.MonadEff(function () {
            return monadStateT(__dict_Monad_6);
        }, function (_2280) {
            return Control_Monad_Trans.lift(monadTransStateT)(__dict_Monad_6)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_7)(_2280));
        });
    };
};
var monadRecStateT = function (__dict_MonadRec_4) {
    return new Control_Monad_Rec_Class.MonadRec(function () {
        return monadStateT(__dict_MonadRec_4["__superclass_Prelude.Monad_0"]());
    }, function (f) {
        return function (a) {
            var f$prime = function (_628) {
                return Prelude.bind((__dict_MonadRec_4["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Bind_1"]())(runStateT(f(_628.value0))(_628.value1))(function (_46) {
                    return Prelude["return"]((__dict_MonadRec_4["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Applicative_0"]())((function () {
                        if (_46.value0 instanceof Data_Either.Left) {
                            return new Data_Either.Left(new Data_Tuple.Tuple(_46.value0.value0, _46.value1));
                        };
                        if (_46.value0 instanceof Data_Either.Right) {
                            return new Data_Either.Right(new Data_Tuple.Tuple(_46.value0.value0, _46.value1));
                        };
                        throw new Error("Failed pattern match at Control.Monad.State.Trans line 73, column 5 - line 79, column 1: " + [ _46.value0.constructor.name ]);
                    })());
                });
            };
            return function (s) {
                return Control_Monad_Rec_Class.tailRecM(__dict_MonadRec_4)(f$prime)(new Data_Tuple.Tuple(a, s));
            };
        };
    });
};
var altStateT = function (__dict_Monad_18) {
    return function (__dict_Alt_19) {
        return new Control_Alt.Alt(function () {
            return functorStateT(__dict_Monad_18);
        }, function (x) {
            return function (y) {
                return StateT(function (s) {
                    return Control_Alt["<|>"](__dict_Alt_19)(runStateT(x)(s))(runStateT(y)(s));
                });
            };
        });
    };
};
var plusStateT = function (__dict_Monad_0) {
    return function (__dict_Plus_1) {
        return new Control_Plus.Plus(function () {
            return altStateT(__dict_Monad_0)(__dict_Plus_1["__superclass_Control.Alt.Alt_0"]());
        }, StateT(function (_624) {
            return Control_Plus.empty(__dict_Plus_1);
        }));
    };
};
var alternativeStateT = function (__dict_Monad_16) {
    return function (__dict_Alternative_17) {
        return new Control_Alternative.Alternative(function () {
            return plusStateT(__dict_Monad_16)(__dict_Alternative_17["__superclass_Control.Plus.Plus_1"]());
        }, function () {
            return applicativeStateT(__dict_Monad_16);
        });
    };
};
var monadPlusStateT = function (__dict_MonadPlus_5) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeStateT(__dict_MonadPlus_5["__superclass_Prelude.Monad_0"]())(__dict_MonadPlus_5["__superclass_Control.Alternative.Alternative_1"]());
    }, function () {
        return monadStateT(__dict_MonadPlus_5["__superclass_Prelude.Monad_0"]());
    });
};
module.exports = {
    StateT: StateT, 
    "liftCallCCState'": liftCallCCState$prime, 
    liftCallCCState: liftCallCCState, 
    liftPassState: liftPassState, 
    liftListenState: liftListenState, 
    liftCatchState: liftCatchState, 
    withStateT: withStateT, 
    mapStateT: mapStateT, 
    execStateT: execStateT, 
    evalStateT: evalStateT, 
    runStateT: runStateT, 
    functorStateT: functorStateT, 
    applyStateT: applyStateT, 
    applicativeStateT: applicativeStateT, 
    altStateT: altStateT, 
    plusStateT: plusStateT, 
    alternativeStateT: alternativeStateT, 
    bindStateT: bindStateT, 
    monadStateT: monadStateT, 
    monadRecStateT: monadRecStateT, 
    monadPlusStateT: monadPlusStateT, 
    monadTransStateT: monadTransStateT, 
    lazyStateT: lazyStateT, 
    monadEffState: monadEffState
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Rec.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var MonadTrans = function (lift) {
    this.lift = lift;
};
var lift = function (dict) {
    return dict.lift;
};
module.exports = {
    MonadTrans: MonadTrans, 
    lift: lift
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Control_Monad_Error = require("Control.Monad.Error");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_RWS_Trans = require("Control.Monad.RWS.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");
var Control_Monad_RWS = require("Control.Monad.RWS");
var MonadWriter = function (listen, pass, writer) {
    this.listen = listen;
    this.pass = pass;
    this.writer = writer;
};
var writer = function (dict) {
    return dict.writer;
};
var tell = function (__dict_Monoid_0) {
    return function (__dict_Monad_1) {
        return function (__dict_MonadWriter_2) {
            return function (w) {
                return writer(__dict_MonadWriter_2)(new Data_Tuple.Tuple(Prelude.unit, w));
            };
        };
    };
};
var pass = function (dict) {
    return dict.pass;
};
var monadWriterWriterT = function (__dict_Monoid_3) {
    return function (__dict_Monad_4) {
        return new MonadWriter(function (m) {
            return Control_Monad_Writer_Trans.WriterT(Prelude.bind(__dict_Monad_4["__superclass_Prelude.Bind_1"]())(Control_Monad_Writer_Trans.runWriterT(m))(function (_69) {
                return Prelude["return"](__dict_Monad_4["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_69.value0, _69.value1), _69.value1));
            }));
        }, function (m) {
            return Control_Monad_Writer_Trans.WriterT(Prelude.bind(__dict_Monad_4["__superclass_Prelude.Bind_1"]())(Control_Monad_Writer_Trans.runWriterT(m))(function (_70) {
                return Prelude["return"](__dict_Monad_4["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(_70.value0.value0, _70.value0.value1(_70.value1)));
            }));
        }, function (_2368) {
            return Control_Monad_Writer_Trans.WriterT(Prelude["return"](__dict_Monad_4["__superclass_Prelude.Applicative_0"]())(_2368));
        });
    };
};
var monadWriterRWST = function (__dict_Monad_5) {
    return function (__dict_Monoid_6) {
        return new MonadWriter(Control_Monad_RWS.listen(__dict_Monad_5), Control_Monad_RWS.pass(__dict_Monad_5), Control_Monad_RWS.writer(__dict_Monad_5["__superclass_Prelude.Applicative_0"]()));
    };
};
var listen = function (dict) {
    return dict.listen;
};
var listens = function (__dict_Monoid_7) {
    return function (__dict_Monad_8) {
        return function (__dict_MonadWriter_9) {
            return function (f) {
                return function (m) {
                    return Prelude.bind(__dict_Monad_8["__superclass_Prelude.Bind_1"]())(listen(__dict_MonadWriter_9)(m))(function (_67) {
                        return Prelude["return"](__dict_Monad_8["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(_67.value0, f(_67.value1)));
                    });
                };
            };
        };
    };
};
var monadWriterErrorT = function (__dict_Monad_10) {
    return function (__dict_MonadWriter_11) {
        return new MonadWriter(Control_Monad_Error_Trans.liftListenError(__dict_Monad_10)(listen(__dict_MonadWriter_11)), Control_Monad_Error_Trans.liftPassError(__dict_Monad_10)(pass(__dict_MonadWriter_11)), function (wd) {
            return Control_Monad_Trans.lift(Control_Monad_Error_Trans.monadTransErrorT)(__dict_Monad_10)(writer(__dict_MonadWriter_11)(wd));
        });
    };
};
var monadWriterMaybeT = function (__dict_Monad_12) {
    return function (__dict_MonadWriter_13) {
        return new MonadWriter(Control_Monad_Maybe_Trans.liftListenMaybe(__dict_Monad_12)(listen(__dict_MonadWriter_13)), Control_Monad_Maybe_Trans.liftPassMaybe(__dict_Monad_12)(pass(__dict_MonadWriter_13)), function (wd) {
            return Control_Monad_Trans.lift(Control_Monad_Maybe_Trans.monadTransMaybeT)(__dict_Monad_12)(writer(__dict_MonadWriter_13)(wd));
        });
    };
};
var monadWriterReaderT = function (__dict_Monad_14) {
    return function (__dict_MonadWriter_15) {
        return new MonadWriter(Control_Monad_Reader_Trans.mapReaderT(listen(__dict_MonadWriter_15)), Control_Monad_Reader_Trans.mapReaderT(pass(__dict_MonadWriter_15)), function (wd) {
            return Control_Monad_Trans.lift(Control_Monad_Reader_Trans.monadTransReaderT)(__dict_Monad_14)(writer(__dict_MonadWriter_15)(wd));
        });
    };
};
var monadWriterStateT = function (__dict_Monad_16) {
    return function (__dict_MonadWriter_17) {
        return new MonadWriter(Control_Monad_State_Trans.liftListenState(__dict_Monad_16)(listen(__dict_MonadWriter_17)), Control_Monad_State_Trans.liftPassState(__dict_Monad_16)(pass(__dict_MonadWriter_17)), function (wd) {
            return Control_Monad_Trans.lift(Control_Monad_State_Trans.monadTransStateT)(__dict_Monad_16)(writer(__dict_MonadWriter_17)(wd));
        });
    };
};
var censor = function (__dict_Monoid_18) {
    return function (__dict_Monad_19) {
        return function (__dict_MonadWriter_20) {
            return function (f) {
                return function (m) {
                    return pass(__dict_MonadWriter_20)(Prelude.bind(__dict_Monad_19["__superclass_Prelude.Bind_1"]())(m)(function (_68) {
                        return Prelude["return"](__dict_Monad_19["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(_68, f));
                    }));
                };
            };
        };
    };
};
module.exports = {
    MonadWriter: MonadWriter, 
    censor: censor, 
    listens: listens, 
    tell: tell, 
    pass: pass, 
    listen: listen, 
    writer: writer, 
    monadWriterWriterT: monadWriterWriterT, 
    monadWriterErrorT: monadWriterErrorT, 
    monadWriterMaybeT: monadWriterMaybeT, 
    monadWriterStateT: monadWriterStateT, 
    monadWriterReaderT: monadWriterReaderT, 
    monadWriterRWST: monadWriterRWST
};

},{"Control.Monad.Error":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error/index.js","Control.Monad.Error.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Error.Trans/index.js","Control.Monad.Maybe.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Maybe.Trans/index.js","Control.Monad.RWS":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.RWS/index.js","Control.Monad.RWS.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.RWS.Trans/index.js","Control.Monad.Reader.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Reader.Trans/index.js","Control.Monad.State.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.State.Trans/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.Monad.Writer.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Rec_Class = require("Control.Monad.Rec.Class");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Either = require("Data.Either");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");
var WriterT = function (x) {
    return x;
};
var runWriterT = function (_630) {
    return _630;
};
var monadTransWriterT = function (__dict_Monoid_4) {
    return new Control_Monad_Trans.MonadTrans(function (__dict_Monad_5) {
        return function (m) {
            return WriterT(Prelude.bind(__dict_Monad_5["__superclass_Prelude.Bind_1"]())(m)(function (_53) {
                return Prelude["return"](__dict_Monad_5["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(_53, Data_Monoid.mempty(__dict_Monoid_4)));
            }));
        };
    });
};
var mapWriterT = function (f) {
    return function (m) {
        return WriterT(f(runWriterT(m)));
    };
};
var liftCatchWriter = function ($$catch) {
    return function (m) {
        return function (h) {
            return WriterT($$catch(runWriterT(m))(function (e) {
                return runWriterT(h(e));
            }));
        };
    };
};
var liftCallCCWriter = function (__dict_Monoid_13) {
    return function (callCC) {
        return function (f) {
            return WriterT(callCC(function (c) {
                return runWriterT(f(function (a) {
                    return WriterT(c(new Data_Tuple.Tuple(a, Data_Monoid.mempty(__dict_Monoid_13))));
                }));
            }));
        };
    };
};
var functorWriterT = function (__dict_Functor_14) {
    return new Prelude.Functor(function (f) {
        return mapWriterT(Prelude["<$>"](__dict_Functor_14)(function (_629) {
            return new Data_Tuple.Tuple(f(_629.value0), _629.value1);
        }));
    });
};
var execWriterT = function (__dict_Apply_15) {
    return function (m) {
        return Prelude["<$>"](__dict_Apply_15["__superclass_Prelude.Functor_0"]())(Data_Tuple.snd)(runWriterT(m));
    };
};
var applyWriterT = function (__dict_Monoid_18) {
    return function (__dict_Apply_19) {
        return new Prelude.Apply(function () {
            return functorWriterT(__dict_Apply_19["__superclass_Prelude.Functor_0"]());
        }, function (f) {
            return function (v) {
                return WriterT((function () {
                    var k = function (_631) {
                        return function (_632) {
                            return new Data_Tuple.Tuple(_631.value0(_632.value0), Prelude["<>"](__dict_Monoid_18["__superclass_Prelude.Semigroup_0"]())(_631.value1)(_632.value1));
                        };
                    };
                    return Prelude["<*>"](__dict_Apply_19)(Prelude["<$>"](__dict_Apply_19["__superclass_Prelude.Functor_0"]())(k)(runWriterT(f)))(runWriterT(v));
                })());
            };
        });
    };
};
var bindWriterT = function (__dict_Monoid_16) {
    return function (__dict_Monad_17) {
        return new Prelude.Bind(function () {
            return applyWriterT(__dict_Monoid_16)((__dict_Monad_17["__superclass_Prelude.Bind_1"]())["__superclass_Prelude.Apply_0"]());
        }, function (m) {
            return function (k) {
                return WriterT(Prelude.bind(__dict_Monad_17["__superclass_Prelude.Bind_1"]())(runWriterT(m))(function (_51) {
                    return Prelude.bind(__dict_Monad_17["__superclass_Prelude.Bind_1"]())(runWriterT(k(_51.value0)))(function (_50) {
                        return Prelude["return"](__dict_Monad_17["__superclass_Prelude.Applicative_0"]())(new Data_Tuple.Tuple(_50.value0, Prelude["<>"](__dict_Monoid_16["__superclass_Prelude.Semigroup_0"]())(_51.value1)(_50.value1)));
                    });
                }));
            };
        });
    };
};
var applicativeWriterT = function (__dict_Monoid_20) {
    return function (__dict_Applicative_21) {
        return new Prelude.Applicative(function () {
            return applyWriterT(__dict_Monoid_20)(__dict_Applicative_21["__superclass_Prelude.Apply_0"]());
        }, function (a) {
            return WriterT(Prelude.pure(__dict_Applicative_21)(new Data_Tuple.Tuple(a, Data_Monoid.mempty(__dict_Monoid_20))));
        });
    };
};
var monadWriterT = function (__dict_Monoid_2) {
    return function (__dict_Monad_3) {
        return new Prelude.Monad(function () {
            return applicativeWriterT(__dict_Monoid_2)(__dict_Monad_3["__superclass_Prelude.Applicative_0"]());
        }, function () {
            return bindWriterT(__dict_Monoid_2)(__dict_Monad_3);
        });
    };
};
var monadEffWriter = function (__dict_Monad_10) {
    return function (__dict_Monoid_11) {
        return function (__dict_MonadEff_12) {
            return new Control_Monad_Eff_Class.MonadEff(function () {
                return monadWriterT(__dict_Monoid_11)(__dict_Monad_10);
            }, function (_2309) {
                return Control_Monad_Trans.lift(monadTransWriterT(__dict_Monoid_11))(__dict_Monad_10)(Control_Monad_Eff_Class.liftEff(__dict_MonadEff_12)(_2309));
            });
        };
    };
};
var monadRecWriterT = function (__dict_Monoid_6) {
    return function (__dict_MonadRec_7) {
        return new Control_Monad_Rec_Class.MonadRec(function () {
            return monadWriterT(__dict_Monoid_6)(__dict_MonadRec_7["__superclass_Prelude.Monad_0"]());
        }, function (f) {
            return function (a) {
                var f$prime = function (_633) {
                    return Prelude.bind((__dict_MonadRec_7["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Bind_1"]())(runWriterT(f(_633.value0)))(function (_52) {
                        return Prelude["return"]((__dict_MonadRec_7["__superclass_Prelude.Monad_0"]())["__superclass_Prelude.Applicative_0"]())((function () {
                            if (_52.value0 instanceof Data_Either.Left) {
                                return new Data_Either.Left(new Data_Tuple.Tuple(_52.value0.value0, Prelude["<>"](__dict_Monoid_6["__superclass_Prelude.Semigroup_0"]())(_633.value1)(_52.value1)));
                            };
                            if (_52.value0 instanceof Data_Either.Right) {
                                return new Data_Either.Right(new Data_Tuple.Tuple(_52.value0.value0, Prelude["<>"](__dict_Monoid_6["__superclass_Prelude.Semigroup_0"]())(_633.value1)(_52.value1)));
                            };
                            throw new Error("Failed pattern match at Control.Monad.Writer.Trans line 68, column 5 - line 74, column 1: " + [ _52.value0.constructor.name ]);
                        })());
                    });
                };
                return WriterT(Control_Monad_Rec_Class.tailRecM(__dict_MonadRec_7)(f$prime)(new Data_Tuple.Tuple(a, Data_Monoid.mempty(__dict_Monoid_6))));
            };
        });
    };
};
var altWriterT = function (__dict_Monoid_24) {
    return function (__dict_Alt_25) {
        return new Control_Alt.Alt(function () {
            return functorWriterT(__dict_Alt_25["__superclass_Prelude.Functor_0"]());
        }, function (m) {
            return function (n) {
                return WriterT(Control_Alt["<|>"](__dict_Alt_25)(runWriterT(m))(runWriterT(n)));
            };
        });
    };
};
var plusWriterT = function (__dict_Monoid_0) {
    return function (__dict_Plus_1) {
        return new Control_Plus.Plus(function () {
            return altWriterT(__dict_Monoid_0)(__dict_Plus_1["__superclass_Control.Alt.Alt_0"]());
        }, Control_Plus.empty(__dict_Plus_1));
    };
};
var alternativeWriterT = function (__dict_Monoid_22) {
    return function (__dict_Alternative_23) {
        return new Control_Alternative.Alternative(function () {
            return plusWriterT(__dict_Monoid_22)(__dict_Alternative_23["__superclass_Control.Plus.Plus_1"]());
        }, function () {
            return applicativeWriterT(__dict_Monoid_22)(__dict_Alternative_23["__superclass_Prelude.Applicative_0"]());
        });
    };
};
var monadPlusWriterT = function (__dict_Monoid_8) {
    return function (__dict_MonadPlus_9) {
        return new Control_MonadPlus.MonadPlus(function () {
            return alternativeWriterT(__dict_Monoid_8)(__dict_MonadPlus_9["__superclass_Control.Alternative.Alternative_1"]());
        }, function () {
            return monadWriterT(__dict_Monoid_8)(__dict_MonadPlus_9["__superclass_Prelude.Monad_0"]());
        });
    };
};
module.exports = {
    WriterT: WriterT, 
    liftCallCCWriter: liftCallCCWriter, 
    liftCatchWriter: liftCatchWriter, 
    mapWriterT: mapWriterT, 
    execWriterT: execWriterT, 
    runWriterT: runWriterT, 
    functorWriterT: functorWriterT, 
    applyWriterT: applyWriterT, 
    applicativeWriterT: applicativeWriterT, 
    altWriterT: altWriterT, 
    plusWriterT: plusWriterT, 
    alternativeWriterT: alternativeWriterT, 
    bindWriterT: bindWriterT, 
    monadWriterT: monadWriterT, 
    monadRecWriterT: monadRecWriterT, 
    monadPlusWriterT: monadPlusWriterT, 
    monadTransWriterT: monadTransWriterT, 
    monadEffWriter: monadEffWriter
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Rec.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Rec.Class/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Data_Identity = require("Data.Identity");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");
var runWriter = function (_2354) {
    return Data_Identity.runIdentity(Control_Monad_Writer_Trans.runWriterT(_2354));
};
var mapWriter = function (f) {
    return Control_Monad_Writer_Trans.mapWriterT(function (_2355) {
        return Data_Identity.Identity(f(Data_Identity.runIdentity(_2355)));
    });
};
var execWriter = function (m) {
    return Data_Tuple.snd(runWriter(m));
};
module.exports = {
    mapWriter: mapWriter, 
    execWriter: execWriter, 
    runWriter: runWriter
};

},{"Control.Monad.Writer.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js","Data.Identity":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Identity/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var when = function (__dict_Monad_0) {
    return function (_266) {
        return function (m) {
            if (_266) {
                return m;
            };
            if (!_266) {
                return Prelude["return"](__dict_Monad_0["__superclass_Prelude.Applicative_0"]())(Prelude.unit);
            };
            throw new Error("Failed pattern match at Control.Monad line 8, column 1 - line 9, column 1: " + [ _266.constructor.name, m.constructor.name ]);
        };
    };
};
var unless = function (__dict_Monad_1) {
    return function (_267) {
        return function (m) {
            if (!_267) {
                return m;
            };
            if (_267) {
                return Prelude["return"](__dict_Monad_1["__superclass_Prelude.Applicative_0"]())(Prelude.unit);
            };
            throw new Error("Failed pattern match at Control.Monad line 13, column 1 - line 14, column 1: " + [ _267.constructor.name, m.constructor.name ]);
        };
    };
};
module.exports = {
    unless: unless, 
    when: when
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alternative = require("Control.Alternative");
var Control_Plus = require("Control.Plus");
var MonadPlus = function (__superclass_Control$dotAlternative$dotAlternative_1, __superclass_Prelude$dotMonad_0) {
    this["__superclass_Control.Alternative.Alternative_1"] = __superclass_Control$dotAlternative$dotAlternative_1;
    this["__superclass_Prelude.Monad_0"] = __superclass_Prelude$dotMonad_0;
};
var monadPlusArray = new MonadPlus(function () {
    return Control_Alternative.alternativeArray;
}, function () {
    return Prelude.monadArray;
});
var guard = function (__dict_MonadPlus_0) {
    return function (_375) {
        if (_375) {
            return Prelude["return"]((__dict_MonadPlus_0["__superclass_Control.Alternative.Alternative_1"]())["__superclass_Prelude.Applicative_0"]())(Prelude.unit);
        };
        if (!_375) {
            return Control_Plus.empty((__dict_MonadPlus_0["__superclass_Control.Alternative.Alternative_1"]())["__superclass_Control.Plus.Plus_1"]());
        };
        throw new Error("Failed pattern match at Control.MonadPlus line 35, column 1 - line 36, column 1: " + [ _375.constructor.name ]);
    };
};
module.exports = {
    MonadPlus: MonadPlus, 
    guard: guard, 
    monadPlusArray: monadPlusArray
};

},{"Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Plus = function (__superclass_Control$dotAlt$dotAlt_0, empty) {
    this["__superclass_Control.Alt.Alt_0"] = __superclass_Control$dotAlt$dotAlt_0;
    this.empty = empty;
};
var plusArray = new Plus(function () {
    return Control_Alt.altArray;
}, [  ]);
var empty = function (dict) {
    return dict.empty;
};
module.exports = {
    Plus: Plus, 
    empty: empty, 
    plusArray: plusArray
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
module.exports = {};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.ST/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Array.ST

exports.runSTArray = function (f) {
  return f;
};

exports.emptySTArray = function () {
  return [];
};

exports.peekSTArrayImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function (i) {
        return function () {
          return i >= 0 && i < xs.length ? just(xs[i]) : nothing;
        };
      };
    };
  };
};

exports.pokeSTArray = function (xs) {
  return function (i) {
    return function (a) {
      return function () {
        var ret = i >= 0 && i < xs.length;
        if (ret) xs[i] = a;
        return ret;
      };
    };
  };
};

exports.pushAllSTArray = function (xs) {
  return function (as) {
    return function () {
      return xs.push.apply(xs, as);
    };
  };
};

exports.spliceSTArray = function (xs) {
  return function (i) {
    return function (howMany) {
      return function (bs) {
        return function () {
          return xs.splice.apply(xs, [i, howMany].concat(bs));
        };
      };
    };
  };
};

exports.copyImpl = function (xs) {
  return function () {
    return xs.slice();
  };
};

exports.toAssocArray = function (xs) {
  return function () {
    var n = xs.length;
    var as = new Array(n);
    for (var i = 0; i < n; i++) as[i] = { value: xs[i], index: i };
    return as;
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.ST/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");
var Data_Maybe = require("Data.Maybe");
var thaw = $foreign.copyImpl;
var pushSTArray = function (arr) {
    return function (a) {
        return $foreign.pushAllSTArray(arr)([ a ]);
    };
};
var peekSTArray = $foreign.peekSTArrayImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var freeze = $foreign.copyImpl;
module.exports = {
    thaw: thaw, 
    freeze: freeze, 
    pushSTArray: pushSTArray, 
    peekSTArray: peekSTArray, 
    toAssocArray: $foreign.toAssocArray, 
    spliceSTArray: $foreign.spliceSTArray, 
    pushAllSTArray: $foreign.pushAllSTArray, 
    pokeSTArray: $foreign.pokeSTArray, 
    emptySTArray: $foreign.emptySTArray, 
    runSTArray: $foreign.runSTArray
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.ST/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.Unsafe/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Array.Unsafe

exports.unsafeIndex = function (xs) {
  return function (n) {
    return xs[n];
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.Unsafe/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Array = require("Data.Array");
var tail = function (xs) {
    return Data_Array.slice(1)(Data_Array.length(xs))(xs);
};
var last = function (xs) {
    return $foreign.unsafeIndex(xs)(Data_Array.length(xs) - 1);
};
var init = function (xs) {
    return Data_Array.slice(0)(Data_Array.length(xs) - 1)(xs);
};
var head = function (xs) {
    return $foreign.unsafeIndex(xs)(0);
};
module.exports = {
    init: init, 
    last: last, 
    tail: tail, 
    head: head, 
    unsafeIndex: $foreign.unsafeIndex
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.Unsafe/foreign.js","Data.Array":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Array

//------------------------------------------------------------------------------
// Array creation --------------------------------------------------------------
//------------------------------------------------------------------------------

exports.range = function (start) {
  return function (end) {
    var step = start > end ? -1 : 1;
    var result = [];
    for (var i = start, n = 0; i !== end; i += step) {
      result[n++] = i;
    }
    result[n] = i;
    return result;
  };
};

exports.replicate = function (n) {
  return function (v) {
    if (n < 1) return [];
    var r = new Array(n);
    for (var i = 0; i < n; i++) r[i] = v;
    return r;
  };
};

//------------------------------------------------------------------------------
// Array size ------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.length = function (xs) {
  return xs.length;
};

//------------------------------------------------------------------------------
// Extending arrays ------------------------------------------------------------
//------------------------------------------------------------------------------

exports.cons = function (e) {
  return function (l) {
    return [e].concat(l);
  };
};

exports.snoc = function (l) {
  return function (e) {
    var l1 = l.slice();
    l1.push(e);
    return l1;
  };
};

//------------------------------------------------------------------------------
// Non-indexed reads -----------------------------------------------------------
//------------------------------------------------------------------------------

exports["uncons'"] = function (empty) {
  return function (next) {
    return function (xs) {
      return xs.length === 0 ? empty({}) : next(xs[0])(xs.slice(1));
    };
  };
};

//------------------------------------------------------------------------------
// Indexed operations ----------------------------------------------------------
//------------------------------------------------------------------------------

exports.indexImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function (i) {
        return i < 0 || i >= xs.length ? nothing :  just(xs[i]);
      };
    };
  };
};

exports.findIndexImpl = function (just) {
  return function (nothing) {
    return function (f) {
      return function (xs) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (f(xs[i])) return just(i);
        }
        return nothing;
      };
    };
  };
};

exports.findLastIndexImpl = function (just) {
  return function (nothing) {
    return function (f) {
      return function (xs) {
        for (var i = xs.length - 1; i >= 0; i--) {
          if (f(xs[i])) return just(i);
        }
        return nothing;
      };
    };
  };
};

exports._insertAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (a) {
        return function (l) {
          if (i < 0 || i > l.length) return nothing;
          var l1 = l.slice();
          l1.splice(i, 0, a);
          return just(l1);
        };
      };
    };
  };
};

exports._deleteAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (l) {
        if (i < 0 || i >= l.length) return nothing;
        var l1 = l.slice();
        l1.splice(i, 1);
        return just(l1);
      };
    };
  };
};

exports._updateAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (a) {
        return function (l) {
          if (i < 0 || i >= l.length) return nothing;
          var l1 = l.slice();
          l1[i] = a;
          return just(l1);
        };
      };
    };
  };
};

//------------------------------------------------------------------------------
// Transformations -------------------------------------------------------------
//------------------------------------------------------------------------------

exports.reverse = function (l) {
  return l.slice().reverse();
};

exports.concat = function (xss) {
  var result = [];
  for (var i = 0, l = xss.length; i < l; i++) {
    var xs = xss[i];
    for (var j = 0, m = xs.length; j < m; j++) {
      result.push(xs[j]);
    }
  }
  return result;
};

exports.filter = function (f) {
  return function (xs) {
    return xs.filter(f);
  };
};

//------------------------------------------------------------------------------
// Sorting ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.sortImpl = function (f) {
  return function (l) {
    /* jshint maxparams: 2 */
    return l.slice().sort(function (x, y) {
      return f(x)(y);
    });
  };
};

//------------------------------------------------------------------------------
// Subarrays -------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.slice = function (s) {
  return function (e) {
    return function (l) {
      return l.slice(s, e);
    };
  };
};

exports.drop = function (n) {
  return function (l) {
    return n < 1 ? l : l.slice(n);
  };
};

//------------------------------------------------------------------------------
// Zipping ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.zipWith = function (f) {
  return function (xs) {
    return function (ys) {
      var l = xs.length < ys.length ? xs.length : ys.length;
      var result = new Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(xs[i])(ys[i]);
      }
      return result;
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Lazy = require("Control.Lazy");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Foldable = require("Data.Foldable");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var Data_Traversable = require("Data.Traversable");
var Data_Tuple = require("Data.Tuple");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var $colon = $foreign.cons;
var $dot$dot = $foreign.range;
var zipWithA = function (__dict_Applicative_0) {
    return function (f) {
        return function (xs) {
            return function (ys) {
                return Data_Traversable.sequence(Data_Traversable.traversableArray)(__dict_Applicative_0)($foreign.zipWith(f)(xs)(ys));
            };
        };
    };
};
var zip = $foreign.zipWith(Data_Tuple.Tuple.create);
var updateAt = $foreign._updateAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var unzip = $foreign["uncons'"](function (_652) {
    return new Data_Tuple.Tuple([  ], [  ]);
})(function (_653) {
    return function (ts) {
        var _2371 = unzip(ts);
        return new Data_Tuple.Tuple($colon(_653.value0)(_2371.value0), $colon(_653.value1)(_2371.value1));
    };
});
var uncons = $foreign["uncons'"](Prelude["const"](Data_Maybe.Nothing.value))(function (x) {
    return function (xs) {
        return new Data_Maybe.Just({
            head: x, 
            tail: xs
        });
    };
});
var take = $foreign.slice(0);
var tail = $foreign["uncons'"](Prelude["const"](Data_Maybe.Nothing.value))(function (_650) {
    return function (xs) {
        return new Data_Maybe.Just(xs);
    };
});
var span = function (p) {
    var go = function (__copy_acc) {
        return function (__copy_xs) {
            var acc = __copy_acc;
            var xs = __copy_xs;
            tco: while (true) {
                var _2377 = uncons(xs);
                if (_2377 instanceof Data_Maybe.Just && p(_2377.value0.head)) {
                    var __tco_acc = $colon(_2377.value0.head)(acc);
                    acc = __tco_acc;
                    xs = _2377.value0.tail;
                    continue tco;
                };
                return {
                    init: $foreign.reverse(acc), 
                    rest: xs
                };
            };
        };
    };
    return go([  ]);
};
var takeWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).init;
    };
};
var sortBy = function (comp) {
    return function (xs) {
        var comp$prime = function (x) {
            return function (y) {
                var _2381 = comp(x)(y);
                if (_2381 instanceof Prelude.GT) {
                    return 1;
                };
                if (_2381 instanceof Prelude.EQ) {
                    return 0;
                };
                if (_2381 instanceof Prelude.LT) {
                    return -1;
                };
                throw new Error("Failed pattern match at Data.Array line 390, column 3 - line 395, column 1: " + [ _2381.constructor.name ]);
            };
        };
        return $foreign.sortImpl(comp$prime)(xs);
    };
};
var sort = function (__dict_Ord_1) {
    return function (xs) {
        return sortBy(Prelude.compare(__dict_Ord_1))(xs);
    };
};
var singleton = function (a) {
    return [ a ];
};
var replicateM = function (__dict_Monad_2) {
    return function (n) {
        return function (m) {
            if (n < 1) {
                return Prelude["return"](__dict_Monad_2["__superclass_Prelude.Applicative_0"]())([  ]);
            };
            if (Prelude.otherwise) {
                return Data_Traversable.sequence(Data_Traversable.traversableArray)(__dict_Monad_2["__superclass_Prelude.Applicative_0"]())($foreign.replicate(n)(m));
            };
            throw new Error("Failed pattern match at Data.Array line 117, column 1 - line 118, column 1: " + [ n.constructor.name, m.constructor.name ]);
        };
    };
};
var $$null = function (xs) {
    return $foreign.length(xs) === 0;
};
var nubBy = function (eq) {
    return function (xs) {
        var _2384 = uncons(xs);
        if (_2384 instanceof Data_Maybe.Just) {
            return $colon(_2384.value0.head)(nubBy(eq)($foreign.filter(function (y) {
                return !eq(_2384.value0.head)(y);
            })(_2384.value0.tail)));
        };
        if (_2384 instanceof Data_Maybe.Nothing) {
            return [  ];
        };
        throw new Error("Failed pattern match: " + [ _2384.constructor.name ]);
    };
};
var nub = function (__dict_Eq_3) {
    return nubBy(Prelude.eq(__dict_Eq_3));
};
var some = function (__dict_Alternative_4) {
    return function (__dict_Lazy_5) {
        return function (v) {
            return Prelude["<*>"]((__dict_Alternative_4["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())(Prelude["<$>"](((__dict_Alternative_4["__superclass_Control.Plus.Plus_1"]())["__superclass_Control.Alt.Alt_0"]())["__superclass_Prelude.Functor_0"]())($colon)(v))(Control_Lazy.defer(__dict_Lazy_5)(function (_648) {
                return many(__dict_Alternative_4)(__dict_Lazy_5)(v);
            }));
        };
    };
};
var many = function (__dict_Alternative_6) {
    return function (__dict_Lazy_7) {
        return function (v) {
            return Control_Alt["<|>"]((__dict_Alternative_6["__superclass_Control.Plus.Plus_1"]())["__superclass_Control.Alt.Alt_0"]())(some(__dict_Alternative_6)(__dict_Lazy_7)(v))(Prelude.pure(__dict_Alternative_6["__superclass_Prelude.Applicative_0"]())([  ]));
        };
    };
};
var insertAt = $foreign._insertAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var init = function (xs) {
    if ($$null(xs)) {
        return Data_Maybe.Nothing.value;
    };
    if (Prelude.otherwise) {
        return new Data_Maybe.Just($foreign.slice(0)($foreign.length(xs) - 1)(xs));
    };
    throw new Error("Failed pattern match at Data.Array line 207, column 1 - line 208, column 1: " + [ xs.constructor.name ]);
};
var index = $foreign.indexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var $bang$bang = index;
var last = function (xs) {
    return $bang$bang(xs)($foreign.length(xs) - 1);
};
var modifyAt = function (i) {
    return function (f) {
        return function (xs) {
            var go = function (x) {
                return updateAt(i)(f(x))(xs);
            };
            return Data_Maybe.maybe(Data_Maybe.Nothing.value)(go)($bang$bang(xs)(i));
        };
    };
};
var head = $foreign["uncons'"](Prelude["const"](Data_Maybe.Nothing.value))(function (x) {
    return function (_649) {
        return new Data_Maybe.Just(x);
    };
});
var groupBy = function (op) {
    var go = function (__copy_acc) {
        return function (__copy_xs) {
            var acc = __copy_acc;
            var xs = __copy_xs;
            tco: while (true) {
                var _2389 = uncons(xs);
                if (_2389 instanceof Data_Maybe.Just) {
                    var sp = span(op(_2389.value0.head))(_2389.value0.tail);
                    var __tco_acc = $colon($colon(_2389.value0.head)(sp.init))(acc);
                    acc = __tco_acc;
                    xs = sp.rest;
                    continue tco;
                };
                if (_2389 instanceof Data_Maybe.Nothing) {
                    return $foreign.reverse(acc);
                };
                throw new Error("Failed pattern match at Data.Array line 457, column 1 - line 458, column 1: " + [ _2389.constructor.name ]);
            };
        };
    };
    return go([  ]);
};
var group = function (__dict_Eq_8) {
    return function (xs) {
        return groupBy(Prelude.eq(__dict_Eq_8))(xs);
    };
};
var group$prime = function (__dict_Ord_9) {
    return function (_2403) {
        return group(__dict_Ord_9["__superclass_Prelude.Eq_0"]())(sort(__dict_Ord_9)(_2403));
    };
};
var foldM = function (__dict_Monad_10) {
    return function (f) {
        return function (a) {
            return $foreign["uncons'"](function (_654) {
                return Prelude["return"](__dict_Monad_10["__superclass_Prelude.Applicative_0"]())(a);
            })(function (b) {
                return function (bs) {
                    return Prelude[">>="](__dict_Monad_10["__superclass_Prelude.Bind_1"]())(f(a)(b))(function (a$prime) {
                        return foldM(__dict_Monad_10)(f)(a$prime)(bs);
                    });
                };
            });
        };
    };
};
var findLastIndex = $foreign.findLastIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var insertBy = function (cmp) {
    return function (x) {
        return function (ys) {
            var i = Data_Maybe.maybe(0)(function (_3) {
                return _3 + 1 | 0;
            })(findLastIndex(function (y) {
                return Prelude["=="](Prelude.eqOrdering)(cmp(x)(y))(Prelude.GT.value);
            })(ys));
            return Data_Maybe_Unsafe.fromJust(insertAt(i)(x)(ys));
        };
    };
};
var insert = function (__dict_Ord_11) {
    return insertBy(Prelude.compare(__dict_Ord_11));
};
var findIndex = $foreign.findIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var intersectBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return $foreign.filter(function (x) {
                return Data_Maybe.isJust(findIndex(eq(x))(ys));
            })(xs);
        };
    };
};
var intersect = function (__dict_Eq_12) {
    return intersectBy(Prelude.eq(__dict_Eq_12));
};
var filterM = function (__dict_Monad_13) {
    return function (p) {
        return $foreign["uncons'"](function (_651) {
            return Prelude.pure(__dict_Monad_13["__superclass_Prelude.Applicative_0"]())([  ]);
        })(function (x) {
            return function (xs) {
                return Prelude.bind(__dict_Monad_13["__superclass_Prelude.Bind_1"]())(p(x))(function (_72) {
                    return Prelude.bind(__dict_Monad_13["__superclass_Prelude.Bind_1"]())(filterM(__dict_Monad_13)(p)(xs))(function (_71) {
                        return Prelude["return"](__dict_Monad_13["__superclass_Prelude.Applicative_0"]())((function () {
                            if (_72) {
                                return $colon(x)(_71);
                            };
                            if (!_72) {
                                return _71;
                            };
                            throw new Error("Failed pattern match: " + [ _72.constructor.name ]);
                        })());
                    });
                });
            };
        });
    };
};
var elemLastIndex = function (__dict_Eq_14) {
    return function (x) {
        return findLastIndex(function (_5) {
            return Prelude["=="](__dict_Eq_14)(_5)(x);
        });
    };
};
var elemIndex = function (__dict_Eq_15) {
    return function (x) {
        return findIndex(function (_4) {
            return Prelude["=="](__dict_Eq_15)(_4)(x);
        });
    };
};
var dropWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).rest;
    };
};
var deleteAt = $foreign._deleteAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var deleteBy = function (eq) {
    return function (x) {
        return function (_655) {
            if (_655.length === 0) {
                return [  ];
            };
            return Data_Maybe.maybe(_655)(function (i) {
                return Data_Maybe_Unsafe.fromJust(deleteAt(i)(_655));
            })(findIndex(eq(x))(_655));
        };
    };
};
var unionBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return Prelude["++"](Prelude.semigroupArray)(xs)(Data_Foldable.foldl(Data_Foldable.foldableArray)(Prelude.flip(deleteBy(eq)))(nubBy(eq)(ys))(xs));
        };
    };
};
var union = function (__dict_Eq_16) {
    return unionBy(Prelude["=="](__dict_Eq_16));
};
var $$delete = function (__dict_Eq_17) {
    return deleteBy(Prelude.eq(__dict_Eq_17));
};
var $bslash$bslash = function (__dict_Eq_18) {
    return function (xs) {
        return function (ys) {
            if ($$null(xs)) {
                return [  ];
            };
            if (Prelude.otherwise) {
                return $foreign["uncons'"](Prelude["const"](xs))(function (y) {
                    return function (ys_2) {
                        return $bslash$bslash(__dict_Eq_18)($$delete(__dict_Eq_18)(y)(xs))(ys_2);
                    };
                })(ys);
            };
            throw new Error("Failed pattern match: " + [ xs.constructor.name, ys.constructor.name ]);
        };
    };
};
var concatMap = Prelude.flip(Prelude.bind(Prelude.bindArray));
var mapMaybe = function (f) {
    return concatMap(function (_2404) {
        return Data_Maybe.maybe([  ])(singleton)(f(_2404));
    });
};
var catMaybes = mapMaybe(Prelude.id(Prelude.categoryFn));
var alterAt = function (i) {
    return function (f) {
        return function (xs) {
            var go = function (x) {
                var _2401 = f(x);
                if (_2401 instanceof Data_Maybe.Nothing) {
                    return deleteAt(i)(xs);
                };
                if (_2401 instanceof Data_Maybe.Just) {
                    return updateAt(i)(_2401.value0)(xs);
                };
                throw new Error("Failed pattern match at Data.Array line 330, column 3 - line 339, column 1: " + [ _2401.constructor.name ]);
            };
            return Data_Maybe.maybe(Data_Maybe.Nothing.value)(go)($bang$bang(xs)(i));
        };
    };
};
module.exports = {
    foldM: foldM, 
    unzip: unzip, 
    zip: zip, 
    zipWithA: zipWithA, 
    intersectBy: intersectBy, 
    intersect: intersect, 
    "\\\\": $bslash$bslash, 
    deleteBy: deleteBy, 
    "delete": $$delete, 
    unionBy: unionBy, 
    union: union, 
    nubBy: nubBy, 
    nub: nub, 
    groupBy: groupBy, 
    "group'": group$prime, 
    group: group, 
    span: span, 
    dropWhile: dropWhile, 
    takeWhile: takeWhile, 
    take: take, 
    sortBy: sortBy, 
    sort: sort, 
    catMaybes: catMaybes, 
    mapMaybe: mapMaybe, 
    filterM: filterM, 
    concatMap: concatMap, 
    alterAt: alterAt, 
    modifyAt: modifyAt, 
    updateAt: updateAt, 
    deleteAt: deleteAt, 
    insertAt: insertAt, 
    findLastIndex: findLastIndex, 
    findIndex: findIndex, 
    elemLastIndex: elemLastIndex, 
    elemIndex: elemIndex, 
    index: index, 
    "!!": $bang$bang, 
    uncons: uncons, 
    init: init, 
    tail: tail, 
    last: last, 
    head: head, 
    insertBy: insertBy, 
    insert: insert, 
    ":": $colon, 
    "null": $$null, 
    many: many, 
    some: some, 
    replicateM: replicateM, 
    "..": $dot$dot, 
    singleton: singleton, 
    zipWith: $foreign.zipWith, 
    drop: $foreign.drop, 
    slice: $foreign.slice, 
    filter: $foreign.filter, 
    concat: $foreign.concat, 
    reverse: $foreign.reverse, 
    snoc: $foreign.snoc, 
    cons: $foreign.cons, 
    length: $foreign.length, 
    replicate: $foreign.replicate, 
    range: $foreign.range
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/foreign.js","Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifoldable/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Apply = require("Control.Apply");
var Data_Monoid = require("Data.Monoid");
var Data_Monoid_Disj = require("Data.Monoid.Disj");
var Data_Monoid_Conj = require("Data.Monoid.Conj");
var Bifoldable = function (bifoldMap, bifoldl, bifoldr) {
    this.bifoldMap = bifoldMap;
    this.bifoldl = bifoldl;
    this.bifoldr = bifoldr;
};
var bifoldr = function (dict) {
    return dict.bifoldr;
};
var bitraverse_ = function (__dict_Bifoldable_0) {
    return function (__dict_Applicative_1) {
        return function (f) {
            return function (g) {
                return bifoldr(__dict_Bifoldable_0)(function (_1416) {
                    return Control_Apply["*>"](__dict_Applicative_1["__superclass_Prelude.Apply_0"]())(f(_1416));
                })(function (_1417) {
                    return Control_Apply["*>"](__dict_Applicative_1["__superclass_Prelude.Apply_0"]())(g(_1417));
                })(Prelude.pure(__dict_Applicative_1)(Prelude.unit));
            };
        };
    };
};
var bifor_ = function (__dict_Bifoldable_2) {
    return function (__dict_Applicative_3) {
        return function (t) {
            return function (f) {
                return function (g) {
                    return bitraverse_(__dict_Bifoldable_2)(__dict_Applicative_3)(f)(g)(t);
                };
            };
        };
    };
};
var bisequence_ = function (__dict_Bifoldable_4) {
    return function (__dict_Applicative_5) {
        return bitraverse_(__dict_Bifoldable_4)(__dict_Applicative_5)(Prelude.id(Prelude.categoryFn))(Prelude.id(Prelude.categoryFn));
    };
};
var bifoldl = function (dict) {
    return dict.bifoldl;
};
var bifoldMap = function (dict) {
    return dict.bifoldMap;
};
var bifold = function (__dict_Bifoldable_6) {
    return function (__dict_Monoid_7) {
        return bifoldMap(__dict_Bifoldable_6)(__dict_Monoid_7)(Prelude.id(Prelude.categoryFn))(Prelude.id(Prelude.categoryFn));
    };
};
var biany = function (__dict_Bifoldable_8) {
    return function (__dict_BooleanAlgebra_9) {
        return function (p) {
            return function (q) {
                return function (_1418) {
                    return Data_Monoid_Disj.runDisj(bifoldMap(__dict_Bifoldable_8)(Data_Monoid_Disj.monoidDisj(__dict_BooleanAlgebra_9))(function (_1419) {
                        return Data_Monoid_Disj.Disj(p(_1419));
                    })(function (_1420) {
                        return Data_Monoid_Disj.Disj(q(_1420));
                    })(_1418));
                };
            };
        };
    };
};
var biall = function (__dict_Bifoldable_10) {
    return function (__dict_BooleanAlgebra_11) {
        return function (p) {
            return function (q) {
                return function (_1421) {
                    return Data_Monoid_Conj.runConj(bifoldMap(__dict_Bifoldable_10)(Data_Monoid_Conj.monoidConj(__dict_BooleanAlgebra_11))(function (_1422) {
                        return Data_Monoid_Conj.Conj(p(_1422));
                    })(function (_1423) {
                        return Data_Monoid_Conj.Conj(q(_1423));
                    })(_1421));
                };
            };
        };
    };
};
module.exports = {
    Bifoldable: Bifoldable, 
    biall: biall, 
    biany: biany, 
    bisequence_: bisequence_, 
    bifor_: bifor_, 
    bitraverse_: bitraverse_, 
    bifold: bifold, 
    bifoldMap: bifoldMap, 
    bifoldl: bifoldl, 
    bifoldr: bifoldr
};

},{"Control.Apply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Apply/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Monoid.Conj":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Conj/index.js","Data.Monoid.Disj":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Disj/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifunctor/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Bifunctor = function (bimap) {
    this.bimap = bimap;
};
var bimap = function (dict) {
    return dict.bimap;
};
var lmap = function (__dict_Bifunctor_0) {
    return function (f) {
        return bimap(__dict_Bifunctor_0)(f)(Prelude.id(Prelude.categoryFn));
    };
};
var rmap = function (__dict_Bifunctor_1) {
    return bimap(__dict_Bifunctor_1)(Prelude.id(Prelude.categoryFn));
};
module.exports = {
    Bifunctor: Bifunctor, 
    rmap: rmap, 
    lmap: lmap, 
    bimap: bimap
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bitraversable/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Bifoldable = require("Data.Bifoldable");
var Data_Bifunctor = require("Data.Bifunctor");
var Bitraversable = function (__superclass_Data$dotBifoldable$dotBifoldable_1, __superclass_Data$dotBifunctor$dotBifunctor_0, bisequence, bitraverse) {
    this["__superclass_Data.Bifoldable.Bifoldable_1"] = __superclass_Data$dotBifoldable$dotBifoldable_1;
    this["__superclass_Data.Bifunctor.Bifunctor_0"] = __superclass_Data$dotBifunctor$dotBifunctor_0;
    this.bisequence = bisequence;
    this.bitraverse = bitraverse;
};
var bitraverse = function (dict) {
    return dict.bitraverse;
};
var bisequence = function (dict) {
    return dict.bisequence;
};
var bifor = function (__dict_Bitraversable_0) {
    return function (__dict_Applicative_1) {
        return function (t) {
            return function (f) {
                return function (g) {
                    return bitraverse(__dict_Bitraversable_0)(__dict_Applicative_1)(f)(g)(t);
                };
            };
        };
    };
};
module.exports = {
    Bitraversable: Bitraversable, 
    bifor: bifor, 
    bisequence: bisequence, 
    bitraverse: bitraverse
};

},{"Data.Bifoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifoldable/index.js","Data.Bifunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifunctor/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Char/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Char

exports.toString = function (c) {
  return c;
};

exports.toCharCode = function (c) {
  return c.charCodeAt(0);
};

exports.fromCharCode = function (c) {
  return String.fromCharCode(c);
};

exports.toLower = function (c) {
  return c.toLowerCase();
};

exports.toUpper = function (c) {
  return c.toUpperCase();
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Char/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
module.exports = {
    toUpper: $foreign.toUpper, 
    toLower: $foreign.toLower, 
    toCharCode: $foreign.toCharCode, 
    fromCharCode: $foreign.fromCharCode, 
    toString: $foreign.toString
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Char/foreign.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Document/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_DOM_Simple_Unsafe_Element = require("Data.DOM.Simple.Unsafe.Element");
var Data_DOM_Simple_Unsafe_Utils = require("Data.DOM.Simple.Unsafe.Utils");
var Data_DOM_Simple_Unsafe_Document = require("Data.DOM.Simple.Unsafe.Document");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_DOM_Simple_Element = require("Data.DOM.Simple.Element");
var Document = function (body, createElement, setBody, setTitle, title) {
    this.body = body;
    this.createElement = createElement;
    this.setBody = setBody;
    this.setTitle = setTitle;
    this.title = title;
};
var title = function (dict) {
    return dict.title;
};
var showHtmlDocument = new Prelude.Show(Data_DOM_Simple_Unsafe_Utils.showImpl);
var setTitle = function (dict) {
    return dict.setTitle;
};
var setBody = function (dict) {
    return dict.setBody;
};
var htmlDocumentElement = new Data_DOM_Simple_Element.Element(Data_DOM_Simple_Unsafe_Element.unsafeAppendChild, Data_DOM_Simple_Unsafe_Element.unsafeChildren, Data_DOM_Simple_Unsafe_Element.unsafeClassAdd, Data_DOM_Simple_Unsafe_Element.unsafeClassContains, Data_DOM_Simple_Unsafe_Element.unsafeClassRemove, Data_DOM_Simple_Unsafe_Element.unsafeClassToggle, Data_DOM_Simple_Unsafe_Element.unsafeContentWindow, Data_DOM_Simple_Unsafe_Element.unsafeGetAttribute, function (id) {
    return function (el) {
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeGetElementById(id)(el))(Prelude["<<<"](Prelude.semigroupoidFn)(Prelude["return"](Control_Monad_Eff.applicativeEff))(Data_DOM_Simple_Unsafe_Utils.ensure));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByClassName, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByName, Data_DOM_Simple_Unsafe_Element.unsafeGetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeHasAttribute, Data_DOM_Simple_Unsafe_Element.unsafeInnerHTML, function (sel) {
    return function (el) {
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeQuerySelector(sel)(el))(Prelude["<<<"](Prelude.semigroupoidFn)(Prelude["return"](Control_Monad_Eff.applicativeEff))(Data_DOM_Simple_Unsafe_Utils.ensure));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeQuerySelectorAll, Data_DOM_Simple_Unsafe_Element.unsafeRemoveAttribute, Data_DOM_Simple_Unsafe_Element.unsafeSetAttribute, Data_DOM_Simple_Unsafe_Element.unsafeSetInnerHTML, Data_DOM_Simple_Unsafe_Element.unsafeSetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeSetTextContent, Data_DOM_Simple_Unsafe_Element.unsafeSetValue, Data_DOM_Simple_Unsafe_Element.unsafeTextContent, Data_DOM_Simple_Unsafe_Element.unsafeValue);
var htmlDocument = new Document(Data_DOM_Simple_Unsafe_Document.unsafeBody, Data_DOM_Simple_Unsafe_Document.unsafeCreateElement, Data_DOM_Simple_Unsafe_Document.unsafeSetBody, Data_DOM_Simple_Unsafe_Document.unsafeSetTitle, Data_DOM_Simple_Unsafe_Document.unsafeTitle);
var createElement = function (dict) {
    return dict.createElement;
};
var body = function (dict) {
    return dict.body;
};
module.exports = {
    Document: Document, 
    createElement: createElement, 
    setBody: setBody, 
    body: body, 
    setTitle: setTitle, 
    title: title, 
    htmlDocumentElement: htmlDocumentElement, 
    htmlDocument: htmlDocument, 
    showHtmlDocument: showHtmlDocument
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.DOM.Simple.Element":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Element/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.DOM.Simple.Unsafe.Document":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Document/index.js","Data.DOM.Simple.Unsafe.Element":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Element/index.js","Data.DOM.Simple.Unsafe.Utils":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Utils/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Element/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_DOM_Simple_Unsafe_Element = require("Data.DOM.Simple.Unsafe.Element");
var Data_DOM_Simple_Unsafe_Utils = require("Data.DOM.Simple.Unsafe.Utils");
var Data_Foldable = require("Data.Foldable");
var Data_Tuple = require("Data.Tuple");
var Control_Monad_Eff = require("Control.Monad.Eff");
var DOM = require("DOM");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_Maybe = require("Data.Maybe");
var Data_Array = require("Data.Array");
var Element = function (appendChild, children, classAdd, classContains, classRemove, classToggle, contentWindow, getAttribute, getElementById, getElementsByClassName, getElementsByName, getStyleAttr, hasAttribute, innerHTML, querySelector, querySelectorAll, removeAttribute, setAttribute, setInnerHTML, setStyleAttr, setTextContent, setValue, textContent, value) {
    this.appendChild = appendChild;
    this.children = children;
    this.classAdd = classAdd;
    this.classContains = classContains;
    this.classRemove = classRemove;
    this.classToggle = classToggle;
    this.contentWindow = contentWindow;
    this.getAttribute = getAttribute;
    this.getElementById = getElementById;
    this.getElementsByClassName = getElementsByClassName;
    this.getElementsByName = getElementsByName;
    this.getStyleAttr = getStyleAttr;
    this.hasAttribute = hasAttribute;
    this.innerHTML = innerHTML;
    this.querySelector = querySelector;
    this.querySelectorAll = querySelectorAll;
    this.removeAttribute = removeAttribute;
    this.setAttribute = setAttribute;
    this.setInnerHTML = setInnerHTML;
    this.setStyleAttr = setStyleAttr;
    this.setTextContent = setTextContent;
    this.setValue = setValue;
    this.textContent = textContent;
    this.value = value;
};
var value = function (dict) {
    return dict.value;
};
var textContent = function (dict) {
    return dict.textContent;
};
var showHtmlElement = new Prelude.Show(Data_DOM_Simple_Unsafe_Utils.showImpl);
var setValue = function (dict) {
    return dict.setValue;
};
var setTextContent = function (dict) {
    return dict.setTextContent;
};
var setStyleAttr = function (dict) {
    return dict.setStyleAttr;
};
var setStyleAttrs = function (__dict_Element_0) {
    return function (xs) {
        return function (el) {
            return Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_Foldable.foldableArray)(xs)(function (kv) {
                return setStyleAttr(__dict_Element_0)(Data_Tuple.fst(kv))(Data_Tuple.snd(kv))(el);
            });
        };
    };
};
var setInnerHTML = function (dict) {
    return dict.setInnerHTML;
};
var setAttribute = function (dict) {
    return dict.setAttribute;
};
var setAttributes = function (__dict_Element_1) {
    return function (xs) {
        return function (el) {
            return Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_Foldable.foldableArray)(xs)(function (kv) {
                return setAttribute(__dict_Element_1)(Data_Tuple.fst(kv))(Data_Tuple.snd(kv))(el);
            });
        };
    };
};
var removeAttribute = function (dict) {
    return dict.removeAttribute;
};
var querySelectorAll = function (dict) {
    return dict.querySelectorAll;
};
var querySelector = function (dict) {
    return dict.querySelector;
};
var innerHTML = function (dict) {
    return dict.innerHTML;
};
var htmlElement = new Element(Data_DOM_Simple_Unsafe_Element.unsafeAppendChild, Data_DOM_Simple_Unsafe_Element.unsafeChildren, Data_DOM_Simple_Unsafe_Element.unsafeClassAdd, Data_DOM_Simple_Unsafe_Element.unsafeClassContains, Data_DOM_Simple_Unsafe_Element.unsafeClassRemove, Data_DOM_Simple_Unsafe_Element.unsafeClassToggle, Data_DOM_Simple_Unsafe_Element.unsafeContentWindow, Data_DOM_Simple_Unsafe_Element.unsafeGetAttribute, function (id) {
    return function (el) {
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeGetElementById(id)(el))(Prelude[">>>"](Prelude.semigroupoidFn)(Data_DOM_Simple_Unsafe_Utils.ensure)(Prelude["return"](Control_Monad_Eff.applicativeEff)));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByClassName, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByName, Data_DOM_Simple_Unsafe_Element.unsafeGetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeHasAttribute, Data_DOM_Simple_Unsafe_Element.unsafeInnerHTML, function (sel) {
    return function (el) {
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeQuerySelector(sel)(el))(Prelude[">>>"](Prelude.semigroupoidFn)(Data_DOM_Simple_Unsafe_Utils.ensure)(Prelude["return"](Control_Monad_Eff.applicativeEff)));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeQuerySelectorAll, Data_DOM_Simple_Unsafe_Element.unsafeRemoveAttribute, Data_DOM_Simple_Unsafe_Element.unsafeSetAttribute, Data_DOM_Simple_Unsafe_Element.unsafeSetInnerHTML, Data_DOM_Simple_Unsafe_Element.unsafeSetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeSetTextContent, Data_DOM_Simple_Unsafe_Element.unsafeSetValue, Data_DOM_Simple_Unsafe_Element.unsafeTextContent, Data_DOM_Simple_Unsafe_Element.unsafeValue);
var hasAttribute = function (dict) {
    return dict.hasAttribute;
};
var getStyleAttr = function (dict) {
    return dict.getStyleAttr;
};
var getElementsByName = function (dict) {
    return dict.getElementsByName;
};
var getElementsByClassName = function (dict) {
    return dict.getElementsByClassName;
};
var getElementById = function (dict) {
    return dict.getElementById;
};
var getAttribute = function (dict) {
    return dict.getAttribute;
};
var focus = Data_DOM_Simple_Unsafe_Element.unsafeFocus;
var contentWindow = function (dict) {
    return dict.contentWindow;
};
var click = Data_DOM_Simple_Unsafe_Element.unsafeClick;
var classToggle = function (dict) {
    return dict.classToggle;
};
var classRemove = function (dict) {
    return dict.classRemove;
};
var classContains = function (dict) {
    return dict.classContains;
};
var classAdd = function (dict) {
    return dict.classAdd;
};
var children = function (dict) {
    return dict.children;
};
var blur = Data_DOM_Simple_Unsafe_Element.unsafeBlur;
var appendChild = function (dict) {
    return dict.appendChild;
};
module.exports = {
    Element: Element, 
    blur: blur, 
    focus: focus, 
    click: click, 
    setStyleAttrs: setStyleAttrs, 
    setAttributes: setAttributes, 
    classContains: classContains, 
    classToggle: classToggle, 
    classAdd: classAdd, 
    classRemove: classRemove, 
    contentWindow: contentWindow, 
    setValue: setValue, 
    value: value, 
    setTextContent: setTextContent, 
    textContent: textContent, 
    setInnerHTML: setInnerHTML, 
    innerHTML: innerHTML, 
    appendChild: appendChild, 
    children: children, 
    setStyleAttr: setStyleAttr, 
    getStyleAttr: getStyleAttr, 
    removeAttribute: removeAttribute, 
    hasAttribute: hasAttribute, 
    setAttribute: setAttribute, 
    getAttribute: getAttribute, 
    querySelectorAll: querySelectorAll, 
    querySelector: querySelector, 
    getElementsByName: getElementsByName, 
    getElementsByClassName: getElementsByClassName, 
    getElementById: getElementById, 
    htmlElement: htmlElement, 
    showHtmlElement: showHtmlElement
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.Array":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.DOM.Simple.Unsafe.Element":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Element/index.js","Data.DOM.Simple.Unsafe.Utils":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Utils/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Control_Monad_Eff = require("Control.Monad.Eff");
module.exports = {};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Document/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.DOM.Simple.Unsafe.Document

exports.unsafeTitle = function (src) {
  return function () {
    return src.title;
  };
};

exports.unsafeSetTitle = function (value) {
  return function (src) {
    return function () {
      src.title = value;
    };
  };
};

exports.unsafeBody = function (src) {
  return function () {
    return src.body;
  };
};

exports.unsafeSetBody = function (value) {
  return function (src) {
    return function () {
      src.body = value;
    };
  };
};

exports.unsafeCreateElement = function (tagName) {
  return function (src) {
    return function () {
      return src.createElement(tagName);
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Document/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
module.exports = {
    unsafeCreateElement: $foreign.unsafeCreateElement, 
    unsafeSetBody: $foreign.unsafeSetBody, 
    unsafeBody: $foreign.unsafeBody, 
    unsafeSetTitle: $foreign.unsafeSetTitle, 
    unsafeTitle: $foreign.unsafeTitle
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Document/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Element/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.DOM.Simple.Unsafe.Element

exports.unsafeGetElementById = function (targId) {
  return function (src) {
    return function () {
      return src.getElementById(targId);
    };
  };
};

exports.unsafeGetElementsByClassName = function (targId) {
  return function (src) {
    return function () {
      return Array.prototype.slice.call(src.getElementsByClassName(targId));
    };
  };
};

exports.unsafeGetElementsByName = function (targId) {
  return function (src) {
    return function () {
      return Array.prototype.slice.call(src.getElementsByName(targId));
    };
  };
};

exports.unsafeQuerySelector = function (selector) {
  return function (src) {
    return function () {
      return src.querySelector(selector);
    };
  };
};

exports.unsafeQuerySelectorAll = function (selector) {
  return function (src) {
    return function () {
      return src.querySelectorAll(selector);
    };
  };
};

exports.unsafeGetAttribute = function (name) {
  return function (src) {
    return function () {
      return src.getAttribute(name);
    };
  };
};

exports.unsafeSetAttribute = function (name) {
  return function (value) {
    return function (src) {
      return function () {
        src.setAttribute(name, value);
        return {};
      };
    };
  };
};

exports.unsafeHasAttribute = function (name) {
  return function (src) {
    return function () {
      return src.hasAttribute(name);
    };
  };
};

exports.unsafeRemoveAttribute = function (name) {
  return function (src) {
    return function () {
      src.removeAttribute(name);
      return {};
    };
  };
};

exports.unsafeGetStyleAttr = function (name) {
  return function (src) {
    return function () {
      return src.style[name];
    };
  };
};

exports.unsafeSetStyleAttr = function (name) {
  return function (value) {
    return function (src) {
      return function () {
        src.style[name] = value;
        return {};
      };
    };
  };
};

exports.unsafeChildren = function (src) {
  return function () {
    return Array.prototype.slice.call(src.children);
  };
};

exports.unsafeAppendChild = function (src) {
  return function (child) {
    return function () {
      return src.appendChild(child);
    };
  };
};

exports.unsafeInnerHTML = function (src) {
  return function () {
    return src.innerHTML;
  };
};

exports.unsafeSetInnerHTML = function (value) {
  return function (src) {
    return function () {
      src.innerHTML = value;
      return {};
    };
  };
};

exports.unsafeTextContent = function (src) {
  return function () {
    return src.textContent;
  };
};

exports.unsafeSetTextContent = function (value) {
  return function (src) {
    return function () {
      src.textContent = value;
      return {};
    };
  };
};

exports.unsafeValue = function (src) {
  return function () {
    return src.value;
  };
};

exports.unsafeSetValue = function (value) {
  return function (src) {
    return function () {
      src.value = value;
      return {};
    };
  };
};

exports.unsafeContentWindow = function (obj) {
  return function () {
    return obj.contentWindow;
  };
};

exports.unsafeClassAdd = function (value) {
  return function (src) {
    return function () {
      src.classList.add(value);
      return {};
    };
  };
};

exports.unsafeClassRemove = function (value) {
  return function (src) {
    return function () {
      src.classList.remove(value);
      return {};
    };
  };
};

exports.unsafeClassToggle = function (value) {
  return function (src) {
    return function () {
      src.classList.toggle(value);
      return {};
    };
  };
};

exports.unsafeClassContains = function (value) {
  return function (src) {
    return function () {
      return src.classList.contains(value);
    };
  };
};

exports.unsafeClick = function (src) {
  return function () {
    src.click();
    return {};
  };
};

exports.unsafeFocus = function (src) {
  return function () {
    src.focus();
    return {};
  };
};

exports.unsafeBlur = function (src) {
  return function () {
    src.blur();
    return {};
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Element/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
module.exports = {
    unsafeBlur: $foreign.unsafeBlur, 
    unsafeFocus: $foreign.unsafeFocus, 
    unsafeClick: $foreign.unsafeClick, 
    unsafeClassContains: $foreign.unsafeClassContains, 
    unsafeClassToggle: $foreign.unsafeClassToggle, 
    unsafeClassRemove: $foreign.unsafeClassRemove, 
    unsafeClassAdd: $foreign.unsafeClassAdd, 
    unsafeContentWindow: $foreign.unsafeContentWindow, 
    unsafeSetValue: $foreign.unsafeSetValue, 
    unsafeValue: $foreign.unsafeValue, 
    unsafeSetTextContent: $foreign.unsafeSetTextContent, 
    unsafeTextContent: $foreign.unsafeTextContent, 
    unsafeSetInnerHTML: $foreign.unsafeSetInnerHTML, 
    unsafeInnerHTML: $foreign.unsafeInnerHTML, 
    unsafeAppendChild: $foreign.unsafeAppendChild, 
    unsafeChildren: $foreign.unsafeChildren, 
    unsafeSetStyleAttr: $foreign.unsafeSetStyleAttr, 
    unsafeGetStyleAttr: $foreign.unsafeGetStyleAttr, 
    unsafeRemoveAttribute: $foreign.unsafeRemoveAttribute, 
    unsafeHasAttribute: $foreign.unsafeHasAttribute, 
    unsafeSetAttribute: $foreign.unsafeSetAttribute, 
    unsafeGetAttribute: $foreign.unsafeGetAttribute, 
    unsafeQuerySelectorAll: $foreign.unsafeQuerySelectorAll, 
    unsafeQuerySelector: $foreign.unsafeQuerySelector, 
    unsafeGetElementsByName: $foreign.unsafeGetElementsByName, 
    unsafeGetElementsByClassName: $foreign.unsafeGetElementsByClassName, 
    unsafeGetElementById: $foreign.unsafeGetElementById
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Element/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Utils/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.DOM.Simple.Unsafe.Utils

exports.ensure3 = function (nothing) {
  return function (just) {
    return function (v) {
      if (v === undefined || v === null) {
        return nothing;
      } else {
        return just(v);
      }
    };
  };
};

exports.showImpl = function (v) {
  return function () {
    return v.toString();
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Utils/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Data_Maybe = require("Data.Maybe");
var ensure = $foreign.ensure3(Data_Maybe.Nothing.value)(Data_Maybe.Just.create);
module.exports = {
    ensure: ensure, 
    showImpl: $foreign.showImpl, 
    ensure3: $foreign.ensure3
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Utils/foreign.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Window/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.DOM.Simple.Unsafe.Window

exports.unsafeDocument = function (win) {
  return function () {
    return win.document;
  };
};

exports.unsafeNavigator = function (win) {
  return function () {
    return win.navigator;
  };
};

exports.unsafeLocation = function (win) {
  return function () {
    return win.location;
  };
};

exports.unsafeGetLocation = function (loc) {
  return function () {
    return loc;
  };
};

exports.unsafeSetLocation = function (value) {
  return function (loc) {
    return function () {
      loc.assign(value);
    };
  };
};

exports.unsafeGetSearchLocation = function (loc) {
  return function () {
    return loc.search;
  };
};

exports.unsafeSetTimeout = function (win) {
  return function (delay) {
    return function (func) {
      return function () {
        return win.setTimeout(func, delay);
      };
    };
  };
};

exports.unsafeSetInterval = function (win) {
  return function (delay) {
    return function (func) {
      return function () {
        return win.setInterval(func, delay);
      };
    };
  };
};

exports.unsafeClearTimeout = function (win) {
  return function (timeout) {
    return function () {
      win.clearTimeout(timeout);
    };
  };
};

exports.unsafeInnerWidth = function (win) {
  return function () {
    return win.innerWidth;
  };
};

exports.unsafeInnerHeight = function (win) {
  return function () {
    return win.innerHeight;
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Window/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
module.exports = {
    unsafeInnerHeight: $foreign.unsafeInnerHeight, 
    unsafeInnerWidth: $foreign.unsafeInnerWidth, 
    unsafeClearTimeout: $foreign.unsafeClearTimeout, 
    unsafeSetInterval: $foreign.unsafeSetInterval, 
    unsafeSetTimeout: $foreign.unsafeSetTimeout, 
    unsafeGetSearchLocation: $foreign.unsafeGetSearchLocation, 
    unsafeSetLocation: $foreign.unsafeSetLocation, 
    unsafeGetLocation: $foreign.unsafeGetLocation, 
    unsafeLocation: $foreign.unsafeLocation, 
    unsafeNavigator: $foreign.unsafeNavigator, 
    unsafeDocument: $foreign.unsafeDocument
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Window/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Window/foreign.js":[function(require,module,exports){
/* global exports, window */
"use strict";

// module Data.DOM.Simple.Window

exports.globalWindow = window;

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Window/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_DOM_Simple_Unsafe_Window = require("Data.DOM.Simple.Unsafe.Window");
var Data_Maybe = require("Data.Maybe");
var Data_Array = require("Data.Array");
var Data_String = require("Data.String");
var Location = function (getLocation, search, setLocation) {
    this.getLocation = getLocation;
    this.search = search;
    this.setLocation = setLocation;
};
var Window = function (clearTimeout, document, innerHeight, innerWidth, location, navigator, setInterval, setTimeout) {
    this.clearTimeout = clearTimeout;
    this.document = document;
    this.innerHeight = innerHeight;
    this.innerWidth = innerWidth;
    this.location = location;
    this.navigator = navigator;
    this.setInterval = setInterval;
    this.setTimeout = setTimeout;
};
var setTimeout = function (dict) {
    return dict.setTimeout;
};
var setLocation = function (dict) {
    return dict.setLocation;
};
var setInterval = function (dict) {
    return dict.setInterval;
};
var search = function (dict) {
    return dict.search;
};
var navigator = function (dict) {
    return dict.navigator;
};
var location = function (dict) {
    return dict.location;
};
var innerWidth = function (dict) {
    return dict.innerWidth;
};
var innerHeight = function (dict) {
    return dict.innerHeight;
};
var htmlWindow = new Window(Data_DOM_Simple_Unsafe_Window.unsafeClearTimeout, Data_DOM_Simple_Unsafe_Window.unsafeDocument, Data_DOM_Simple_Unsafe_Window.unsafeInnerHeight, Data_DOM_Simple_Unsafe_Window.unsafeInnerWidth, Data_DOM_Simple_Unsafe_Window.unsafeLocation, Data_DOM_Simple_Unsafe_Window.unsafeNavigator, Data_DOM_Simple_Unsafe_Window.unsafeSetInterval, Data_DOM_Simple_Unsafe_Window.unsafeSetTimeout);
var getLocationValue = function (input) {
    return function (key) {
        var kvParser = function (value) {
            if (value.length === 2 && Prelude["=="](Prelude.eqString)(value[0])(key)) {
                return new Data_Maybe.Just(value[1]);
            };
            return Data_Maybe.Nothing.value;
        };
        var sanitizedInput = (function () {
            var _2410 = Prelude["=="](Data_Maybe.eqMaybe(Prelude.eqInt))(Data_String.indexOf("?")(input))(new Data_Maybe.Just(0));
            if (_2410) {
                return Data_String.drop(1)(input);
            };
            if (!_2410) {
                return input;
            };
            throw new Error("Failed pattern match at Data.DOM.Simple.Window line 53, column 7 - line 53, column 104: " + [ _2410.constructor.name ]);
        })();
        var kv = Prelude.map(Prelude.functorArray)(Data_String.split("="))(Data_String.split("&")(sanitizedInput));
        return Data_Array.head(Data_Array.mapMaybe(kvParser)(kv));
    };
};
var getLocation = function (dict) {
    return dict.getLocation;
};
var domLocation = new Location(Data_DOM_Simple_Unsafe_Window.unsafeGetLocation, Data_DOM_Simple_Unsafe_Window.unsafeGetSearchLocation, Data_DOM_Simple_Unsafe_Window.unsafeSetLocation);
var document = function (dict) {
    return dict.document;
};
var clearTimeout = function (dict) {
    return dict.clearTimeout;
};
module.exports = {
    Window: Window, 
    Location: Location, 
    getLocationValue: getLocationValue, 
    innerHeight: innerHeight, 
    innerWidth: innerWidth, 
    clearTimeout: clearTimeout, 
    setInterval: setInterval, 
    setTimeout: setTimeout, 
    location: location, 
    navigator: navigator, 
    document: document, 
    search: search, 
    setLocation: setLocation, 
    getLocation: getLocation, 
    htmlWindow: htmlWindow, 
    domLocation: domLocation, 
    globalWindow: $foreign.globalWindow
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Window/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.Array":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.DOM.Simple.Unsafe.Window":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Unsafe.Window/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.String":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date.UTC/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Date.UTC

// jshint maxparams: 2
exports.dateMethod = function (method, date) {
  return date[method]();
};

// jshint maxparams: 7
exports.jsDateFromValues = function (y, mo, d, h, mi, s, ms) {
  return new Date(Date.UTC(y, mo, d, h, mi, s, ms));
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date.UTC/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var $foreign = require("./foreign");
var Data_Date = require("Data.Date");
var Data_Function = require("Data.Function");
var Data_Enum = require("Data.Enum");
var Prelude = require("Prelude");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var Data_Maybe = require("Data.Maybe");
var Data_Time = require("Data.Time");
var year = function (d) {
    return $foreign.dateMethod("getUTCFullYear", d);
};
var secondOfMinute = function (d) {
    return $foreign.dateMethod("getUTCSeconds", d);
};
var month = function (d) {
    return Data_Maybe_Unsafe.fromJust(Data_Enum.toEnum(Data_Date.enumMonth)($foreign.dateMethod("getUTCMonth", d)));
};
var minuteOfHour = function (d) {
    return $foreign.dateMethod("getUTCMinutes", d);
};
var millisecondOfSecond = function (d) {
    return $foreign.dateMethod("getUTCMilliseconds", d);
};
var hourOfDay = function (d) {
    return $foreign.dateMethod("getUTCHours", d);
};
var dayOfWeek = function (d) {
    return Data_Maybe_Unsafe.fromJust(Data_Enum.toEnum(Data_Date.enumDayOfWeek)($foreign.dateMethod("getUTCDay", d)));
};
var dayOfMonth = function (d) {
    return $foreign.dateMethod("getUTCDate", d);
};
var dateTime = function (y) {
    return function (mo) {
        return function (d) {
            return function (h) {
                return function (mi) {
                    return function (s) {
                        return function (ms) {
                            return Data_Date.fromJSDate($foreign.jsDateFromValues(y, Data_Enum.fromEnum(Data_Date.enumMonth)(mo), d, h, mi, s, ms));
                        };
                    };
                };
            };
        };
    };
};
var date = function (y) {
    return function (m) {
        return function (d) {
            return dateTime(y)(m)(d)(0)(0)(0)(0);
        };
    };
};
module.exports = {
    millisecondOfSecond: millisecondOfSecond, 
    secondOfMinute: secondOfMinute, 
    minuteOfHour: minuteOfHour, 
    hourOfDay: hourOfDay, 
    dayOfWeek: dayOfWeek, 
    dayOfMonth: dayOfMonth, 
    month: month, 
    year: year, 
    date: date, 
    dateTime: dateTime
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date.UTC/foreign.js","Data.Date":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date/index.js","Data.Enum":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Enum/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/index.js","Data.Time":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Time/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Date

exports.nowEpochMilliseconds = function () {
  return Date.now();
};

exports.nowImpl = function (ctor) {
  return function () {
    return ctor(new Date());
  };
};

exports.jsDateConstructor = function (x) {
  return new Date(x);
};

// jshint maxparams: 2
exports.jsDateMethod = function (method, date) {
  return date[method]();
};

// jshint maxparams: 3
exports.strictJsDate = function (just, nothing, s) {
  var epoch = Date.parse(s);
  if (isNaN(epoch)) return nothing;
  var date = new Date(epoch);
  var s2 = date.toISOString();
  var idx = s2.indexOf(s);
  return idx < 0 ? nothing : just(date);
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Global = require("Global");
var Data_Function = require("Data.Function");
var Data_Enum = require("Data.Enum");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_Maybe = require("Data.Maybe");
var Data_Time = require("Data.Time");
var Year = function (x) {
    return x;
};
var January = (function () {
    function January() {

    };
    January.value = new January();
    return January;
})();
var February = (function () {
    function February() {

    };
    February.value = new February();
    return February;
})();
var March = (function () {
    function March() {

    };
    March.value = new March();
    return March;
})();
var April = (function () {
    function April() {

    };
    April.value = new April();
    return April;
})();
var May = (function () {
    function May() {

    };
    May.value = new May();
    return May;
})();
var June = (function () {
    function June() {

    };
    June.value = new June();
    return June;
})();
var July = (function () {
    function July() {

    };
    July.value = new July();
    return July;
})();
var August = (function () {
    function August() {

    };
    August.value = new August();
    return August;
})();
var September = (function () {
    function September() {

    };
    September.value = new September();
    return September;
})();
var October = (function () {
    function October() {

    };
    October.value = new October();
    return October;
})();
var November = (function () {
    function November() {

    };
    November.value = new November();
    return November;
})();
var December = (function () {
    function December() {

    };
    December.value = new December();
    return December;
})();
var LocaleOffset = function (x) {
    return x;
};
var Sunday = (function () {
    function Sunday() {

    };
    Sunday.value = new Sunday();
    return Sunday;
})();
var Monday = (function () {
    function Monday() {

    };
    Monday.value = new Monday();
    return Monday;
})();
var Tuesday = (function () {
    function Tuesday() {

    };
    Tuesday.value = new Tuesday();
    return Tuesday;
})();
var Wednesday = (function () {
    function Wednesday() {

    };
    Wednesday.value = new Wednesday();
    return Wednesday;
})();
var Thursday = (function () {
    function Thursday() {

    };
    Thursday.value = new Thursday();
    return Thursday;
})();
var Friday = (function () {
    function Friday() {

    };
    Friday.value = new Friday();
    return Friday;
})();
var Saturday = (function () {
    function Saturday() {

    };
    Saturday.value = new Saturday();
    return Saturday;
})();
var DayOfMonth = function (x) {
    return x;
};
var DateTime = function (x) {
    return x;
};
var toJSDate = function (_148) {
    return _148;
};
var toEpochMilliseconds = function (_149) {
    return $foreign.jsDateMethod("getTime", _149);
};
var timezoneOffset = function (_150) {
    return $foreign.jsDateMethod("getTimezoneOffset", _150);
};
var showYear = new Prelude.Show(function (_165) {
    return "(Year " + (Prelude.show(Prelude.showInt)(_165) + ")");
});
var showMonth = new Prelude.Show(function (_168) {
    if (_168 instanceof January) {
        return "January";
    };
    if (_168 instanceof February) {
        return "February";
    };
    if (_168 instanceof March) {
        return "March";
    };
    if (_168 instanceof April) {
        return "April";
    };
    if (_168 instanceof May) {
        return "May";
    };
    if (_168 instanceof June) {
        return "June";
    };
    if (_168 instanceof July) {
        return "July";
    };
    if (_168 instanceof August) {
        return "August";
    };
    if (_168 instanceof September) {
        return "September";
    };
    if (_168 instanceof October) {
        return "October";
    };
    if (_168 instanceof November) {
        return "November";
    };
    if (_168 instanceof December) {
        return "December";
    };
    throw new Error("Failed pattern match at Data.Date line 161, column 1 - line 175, column 1: " + [ _168.constructor.name ]);
});
var showDayOfWeek = new Prelude.Show(function (_175) {
    if (_175 instanceof Sunday) {
        return "Sunday";
    };
    if (_175 instanceof Monday) {
        return "Monday";
    };
    if (_175 instanceof Tuesday) {
        return "Tuesday";
    };
    if (_175 instanceof Wednesday) {
        return "Wednesday";
    };
    if (_175 instanceof Thursday) {
        return "Thursday";
    };
    if (_175 instanceof Friday) {
        return "Friday";
    };
    if (_175 instanceof Saturday) {
        return "Saturday";
    };
    throw new Error("Failed pattern match at Data.Date line 249, column 1 - line 258, column 1: " + [ _175.constructor.name ]);
});
var showDate = new Prelude.Show(function (d) {
    return "(fromEpochMilliseconds " + (Prelude.show(Data_Time.showMilliseconds)(toEpochMilliseconds(d)) + ")");
});
var semiringYear = new Prelude.Semiring(function (_159) {
    return function (_160) {
        return _159 + _160 | 0;
    };
}, function (_161) {
    return function (_162) {
        return _161 * _162 | 0;
    };
}, 1, 0);
var ringYear = new Prelude.Ring(function () {
    return semiringYear;
}, function (_163) {
    return function (_164) {
        return _163 - _164;
    };
});
var now = $foreign.nowImpl(DateTime);
var monthToEnum = function (_151) {
    if (_151 === 0) {
        return new Data_Maybe.Just(January.value);
    };
    if (_151 === 1) {
        return new Data_Maybe.Just(February.value);
    };
    if (_151 === 2) {
        return new Data_Maybe.Just(March.value);
    };
    if (_151 === 3) {
        return new Data_Maybe.Just(April.value);
    };
    if (_151 === 4) {
        return new Data_Maybe.Just(May.value);
    };
    if (_151 === 5) {
        return new Data_Maybe.Just(June.value);
    };
    if (_151 === 6) {
        return new Data_Maybe.Just(July.value);
    };
    if (_151 === 7) {
        return new Data_Maybe.Just(August.value);
    };
    if (_151 === 8) {
        return new Data_Maybe.Just(September.value);
    };
    if (_151 === 9) {
        return new Data_Maybe.Just(October.value);
    };
    if (_151 === 10) {
        return new Data_Maybe.Just(November.value);
    };
    if (_151 === 11) {
        return new Data_Maybe.Just(December.value);
    };
    return Data_Maybe.Nothing.value;
};
var monthFromEnum = function (_152) {
    if (_152 instanceof January) {
        return 0;
    };
    if (_152 instanceof February) {
        return 1;
    };
    if (_152 instanceof March) {
        return 2;
    };
    if (_152 instanceof April) {
        return 3;
    };
    if (_152 instanceof May) {
        return 4;
    };
    if (_152 instanceof June) {
        return 5;
    };
    if (_152 instanceof July) {
        return 6;
    };
    if (_152 instanceof August) {
        return 7;
    };
    if (_152 instanceof September) {
        return 8;
    };
    if (_152 instanceof October) {
        return 9;
    };
    if (_152 instanceof November) {
        return 10;
    };
    if (_152 instanceof December) {
        return 11;
    };
    throw new Error("Failed pattern match at Data.Date line 197, column 1 - line 198, column 1: " + [ _152.constructor.name ]);
};
var fromJSDate = function (d) {
    var _527 = Global.isNaN($foreign.jsDateMethod("getTime", d));
    if (_527) {
        return Data_Maybe.Nothing.value;
    };
    if (!_527) {
        return new Data_Maybe.Just(d);
    };
    throw new Error("Failed pattern match at Data.Date line 50, column 1 - line 51, column 1: " + [ _527.constructor.name ]);
};
var fromString = Prelude["<<<"](Prelude.semigroupoidFn)(fromJSDate)($foreign.jsDateConstructor);
var fromStringStrict = function (s) {
    return Prelude[">>="](Data_Maybe.bindMaybe)($foreign.strictJsDate(Data_Maybe.Just.create, Data_Maybe.Nothing.value, s))(fromJSDate);
};
var fromEpochMilliseconds = Prelude["<<<"](Prelude.semigroupoidFn)(fromJSDate)($foreign.jsDateConstructor);
var eqYear = new Prelude.Eq(function (_155) {
    return function (_156) {
        return _155 === _156;
    };
});
var ordYear = new Prelude.Ord(function () {
    return eqYear;
}, function (_157) {
    return function (_158) {
        return Prelude.compare(Prelude.ordInt)(_157)(_158);
    };
});
var eqMonth = new Prelude.Eq(function (_166) {
    return function (_167) {
        if (_166 instanceof January && _167 instanceof January) {
            return true;
        };
        if (_166 instanceof February && _167 instanceof February) {
            return true;
        };
        if (_166 instanceof March && _167 instanceof March) {
            return true;
        };
        if (_166 instanceof April && _167 instanceof April) {
            return true;
        };
        if (_166 instanceof May && _167 instanceof May) {
            return true;
        };
        if (_166 instanceof June && _167 instanceof June) {
            return true;
        };
        if (_166 instanceof July && _167 instanceof July) {
            return true;
        };
        if (_166 instanceof August && _167 instanceof August) {
            return true;
        };
        if (_166 instanceof September && _167 instanceof September) {
            return true;
        };
        if (_166 instanceof October && _167 instanceof October) {
            return true;
        };
        if (_166 instanceof November && _167 instanceof November) {
            return true;
        };
        if (_166 instanceof December && _167 instanceof December) {
            return true;
        };
        return false;
    };
});
var eqDayOfWeek = new Prelude.Eq(function (_173) {
    return function (_174) {
        if (_173 instanceof Sunday && _174 instanceof Sunday) {
            return true;
        };
        if (_173 instanceof Monday && _174 instanceof Monday) {
            return true;
        };
        if (_173 instanceof Tuesday && _174 instanceof Tuesday) {
            return true;
        };
        if (_173 instanceof Wednesday && _174 instanceof Wednesday) {
            return true;
        };
        if (_173 instanceof Thursday && _174 instanceof Thursday) {
            return true;
        };
        if (_173 instanceof Friday && _174 instanceof Friday) {
            return true;
        };
        if (_173 instanceof Saturday && _174 instanceof Saturday) {
            return true;
        };
        return false;
    };
});
var eqDayOfMonth = new Prelude.Eq(function (_169) {
    return function (_170) {
        return _169 === _170;
    };
});
var ordDayOfMonth = new Prelude.Ord(function () {
    return eqDayOfMonth;
}, function (_171) {
    return function (_172) {
        return Prelude.compare(Prelude.ordInt)(_171)(_172);
    };
});
var eqDate = new Prelude.Eq(Data_Function.on(Prelude.eq(Data_Time.eqMilliseconds))(toEpochMilliseconds));
var ordDate = new Prelude.Ord(function () {
    return eqDate;
}, Data_Function.on(Prelude.compare(Data_Time.ordMilliseconds))(toEpochMilliseconds));
var dayOfWeekToEnum = function (_153) {
    if (_153 === 0) {
        return new Data_Maybe.Just(Sunday.value);
    };
    if (_153 === 1) {
        return new Data_Maybe.Just(Monday.value);
    };
    if (_153 === 2) {
        return new Data_Maybe.Just(Tuesday.value);
    };
    if (_153 === 3) {
        return new Data_Maybe.Just(Wednesday.value);
    };
    if (_153 === 4) {
        return new Data_Maybe.Just(Thursday.value);
    };
    if (_153 === 5) {
        return new Data_Maybe.Just(Friday.value);
    };
    if (_153 === 6) {
        return new Data_Maybe.Just(Saturday.value);
    };
    return Data_Maybe.Nothing.value;
};
var dayOfWeekFromEnum = function (_154) {
    if (_154 instanceof Sunday) {
        return 0;
    };
    if (_154 instanceof Monday) {
        return 1;
    };
    if (_154 instanceof Tuesday) {
        return 2;
    };
    if (_154 instanceof Wednesday) {
        return 3;
    };
    if (_154 instanceof Thursday) {
        return 4;
    };
    if (_154 instanceof Friday) {
        return 5;
    };
    if (_154 instanceof Saturday) {
        return 6;
    };
    throw new Error("Failed pattern match at Data.Date line 275, column 1 - line 276, column 1: " + [ _154.constructor.name ]);
};
var boundedMonth = new Prelude.Bounded(January.value, December.value);
var enumMonth = new Data_Enum.Enum(function () {
    return boundedMonth;
}, 12, monthFromEnum, Data_Enum.defaultPred(monthToEnum)(monthFromEnum), Data_Enum.defaultSucc(monthToEnum)(monthFromEnum), monthToEnum);
var ordMonth = new Prelude.Ord(function () {
    return eqMonth;
}, Data_Function.on(Prelude.compare(Prelude.ordInt))(Data_Enum.fromEnum(enumMonth)));
var boundedOrdMonth = new Prelude.BoundedOrd(function () {
    return boundedMonth;
}, function () {
    return ordMonth;
});
var boundedDayOfWeek = new Prelude.Bounded(Sunday.value, Saturday.value);
var enumDayOfWeek = new Data_Enum.Enum(function () {
    return boundedDayOfWeek;
}, 7, dayOfWeekFromEnum, Data_Enum.defaultPred(dayOfWeekToEnum)(dayOfWeekFromEnum), Data_Enum.defaultSucc(dayOfWeekToEnum)(dayOfWeekFromEnum), dayOfWeekToEnum);
var ordDayOfWeek = new Prelude.Ord(function () {
    return eqDayOfWeek;
}, Data_Function.on(Prelude.compare(Prelude.ordInt))(Data_Enum.fromEnum(enumDayOfWeek)));
var boundedOrdDayOfWeek = new Prelude.BoundedOrd(function () {
    return boundedDayOfWeek;
}, function () {
    return ordDayOfWeek;
});
module.exports = {
    Sunday: Sunday, 
    Monday: Monday, 
    Tuesday: Tuesday, 
    Wednesday: Wednesday, 
    Thursday: Thursday, 
    Friday: Friday, 
    Saturday: Saturday, 
    DayOfMonth: DayOfMonth, 
    January: January, 
    February: February, 
    March: March, 
    April: April, 
    May: May, 
    June: June, 
    July: July, 
    August: August, 
    September: September, 
    October: October, 
    November: November, 
    December: December, 
    Year: Year, 
    LocaleOffset: LocaleOffset, 
    timezoneOffset: timezoneOffset, 
    now: now, 
    fromStringStrict: fromStringStrict, 
    fromString: fromString, 
    toEpochMilliseconds: toEpochMilliseconds, 
    fromEpochMilliseconds: fromEpochMilliseconds, 
    toJSDate: toJSDate, 
    fromJSDate: fromJSDate, 
    eqDate: eqDate, 
    ordDate: ordDate, 
    showDate: showDate, 
    eqYear: eqYear, 
    ordYear: ordYear, 
    semiringYear: semiringYear, 
    ringYear: ringYear, 
    showYear: showYear, 
    eqMonth: eqMonth, 
    ordMonth: ordMonth, 
    boundedMonth: boundedMonth, 
    boundedOrdMonth: boundedOrdMonth, 
    showMonth: showMonth, 
    enumMonth: enumMonth, 
    eqDayOfMonth: eqDayOfMonth, 
    ordDayOfMonth: ordDayOfMonth, 
    eqDayOfWeek: eqDayOfWeek, 
    ordDayOfWeek: ordDayOfWeek, 
    boundedDayOfWeek: boundedDayOfWeek, 
    boundedOrdDayOfWeek: boundedOrdDayOfWeek, 
    showDayOfWeek: showDayOfWeek, 
    enumDayOfWeek: enumDayOfWeek, 
    nowEpochMilliseconds: $foreign.nowEpochMilliseconds
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Data.Enum":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Enum/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Time":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Time/index.js","Global":"/home/greg/haskell/snooker-statistics/frontend-new/output/Global/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Distributive/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Identity = require("Data.Identity");
var Distributive = function (__superclass_Prelude$dotFunctor_0, collect, distribute) {
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
    this.collect = collect;
    this.distribute = distribute;
};
var distributiveIdentity = new Distributive(function () {
    return Data_Identity.functorIdentity;
}, function (__dict_Functor_1) {
    return function (f) {
        return function (_1907) {
            return Data_Identity.Identity(Prelude.map(__dict_Functor_1)(function (_1908) {
                return Data_Identity.runIdentity(f(_1908));
            })(_1907));
        };
    };
}, function (__dict_Functor_0) {
    return function (_1909) {
        return Data_Identity.Identity(Prelude.map(__dict_Functor_0)(Data_Identity.runIdentity)(_1909));
    };
});
var distribute = function (dict) {
    return dict.distribute;
};
var distributiveFunction = new Distributive(function () {
    return Prelude.functorFn;
}, function (__dict_Functor_3) {
    return function (f) {
        return function (_1910) {
            return distribute(distributiveFunction)(__dict_Functor_3)(Prelude.map(__dict_Functor_3)(f)(_1910));
        };
    };
}, function (__dict_Functor_2) {
    return function (a) {
        return function (e) {
            return Prelude.map(__dict_Functor_2)(function (_2) {
                return _2(e);
            })(a);
        };
    };
});
var cotraverse = function (__dict_Distributive_4) {
    return function (__dict_Functor_5) {
        return function (f) {
            return function (_1911) {
                return Prelude.map(__dict_Distributive_4["__superclass_Prelude.Functor_0"]())(f)(distribute(__dict_Distributive_4)(__dict_Functor_5)(_1911));
            };
        };
    };
};
var collect = function (dict) {
    return dict.collect;
};
module.exports = {
    Distributive: Distributive, 
    cotraverse: cotraverse, 
    collect: collect, 
    distribute: distribute, 
    distributiveIdentity: distributiveIdentity, 
    distributiveFunction: distributiveFunction
};

},{"Data.Identity":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Identity/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either.Unsafe/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Either.Unsafe

exports.unsafeThrow = function (msg) {
  throw new Error(msg);
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either.Unsafe/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Either = require("Data.Either");
var fromRight = function (_491) {
    if (_491 instanceof Data_Either.Right) {
        return _491.value0;
    };
    return $foreign.unsafeThrow("Data.Either.Unsafe.fromLeft called on Left value");
};
var fromLeft = function (_490) {
    if (_490 instanceof Data_Either.Left) {
        return _490.value0;
    };
    return $foreign.unsafeThrow("Data.Either.Unsafe.fromLeft called on Right value");
};
module.exports = {
    fromRight: fromRight, 
    fromLeft: fromLeft
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either.Unsafe/foreign.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Extend = require("Control.Extend");
var Data_Bifoldable = require("Data.Bifoldable");
var Data_Bifunctor = require("Data.Bifunctor");
var Data_Bitraversable = require("Data.Bitraversable");
var Data_Foldable = require("Data.Foldable");
var Data_Monoid = require("Data.Monoid");
var Data_Traversable = require("Data.Traversable");
var Left = (function () {
    function Left(value0) {
        this.value0 = value0;
    };
    Left.create = function (value0) {
        return new Left(value0);
    };
    return Left;
})();
var Right = (function () {
    function Right(value0) {
        this.value0 = value0;
    };
    Right.create = function (value0) {
        return new Right(value0);
    };
    return Right;
})();
var showEither = function (__dict_Show_2) {
    return function (__dict_Show_3) {
        return new Prelude.Show(function (_475) {
            if (_475 instanceof Left) {
                return "Left (" + (Prelude.show(__dict_Show_2)(_475.value0) + ")");
            };
            if (_475 instanceof Right) {
                return "Right (" + (Prelude.show(__dict_Show_3)(_475.value0) + ")");
            };
            throw new Error("Failed pattern match at Data.Either line 174, column 1 - line 181, column 1: " + [ _475.constructor.name ]);
        });
    };
};
var functorEither = new Prelude.Functor(function (f) {
    return function (_470) {
        if (_470 instanceof Left) {
            return new Left(_470.value0);
        };
        if (_470 instanceof Right) {
            return new Right(f(_470.value0));
        };
        throw new Error("Failed pattern match at Data.Either line 52, column 1 - line 56, column 1: " + [ f.constructor.name, _470.constructor.name ]);
    };
});
var foldableEither = new Data_Foldable.Foldable(function (__dict_Monoid_8) {
    return function (f) {
        return function (_482) {
            if (_482 instanceof Left) {
                return Data_Monoid.mempty(__dict_Monoid_8);
            };
            if (_482 instanceof Right) {
                return f(_482.value0);
            };
            throw new Error("Failed pattern match at Data.Either line 201, column 1 - line 209, column 1: " + [ f.constructor.name, _482.constructor.name ]);
        };
    };
}, function (f) {
    return function (z) {
        return function (_481) {
            if (_481 instanceof Left) {
                return z;
            };
            if (_481 instanceof Right) {
                return f(z)(_481.value0);
            };
            throw new Error("Failed pattern match at Data.Either line 201, column 1 - line 209, column 1: " + [ f.constructor.name, z.constructor.name, _481.constructor.name ]);
        };
    };
}, function (f) {
    return function (z) {
        return function (_480) {
            if (_480 instanceof Left) {
                return z;
            };
            if (_480 instanceof Right) {
                return f(_480.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Either line 201, column 1 - line 209, column 1: " + [ f.constructor.name, z.constructor.name, _480.constructor.name ]);
        };
    };
});
var traversableEither = new Data_Traversable.Traversable(function () {
    return foldableEither;
}, function () {
    return functorEither;
}, function (__dict_Applicative_1) {
    return function (_487) {
        if (_487 instanceof Left) {
            return Prelude.pure(__dict_Applicative_1)(new Left(_487.value0));
        };
        if (_487 instanceof Right) {
            return Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Right.create)(_487.value0);
        };
        throw new Error("Failed pattern match at Data.Either line 217, column 1 - line 223, column 1: " + [ _487.constructor.name ]);
    };
}, function (__dict_Applicative_0) {
    return function (f) {
        return function (_486) {
            if (_486 instanceof Left) {
                return Prelude.pure(__dict_Applicative_0)(new Left(_486.value0));
            };
            if (_486 instanceof Right) {
                return Prelude["<$>"]((__dict_Applicative_0["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Right.create)(f(_486.value0));
            };
            throw new Error("Failed pattern match at Data.Either line 217, column 1 - line 223, column 1: " + [ f.constructor.name, _486.constructor.name ]);
        };
    };
});
var extendEither = new Control_Extend.Extend(function () {
    return functorEither;
}, function (f) {
    return function (_474) {
        if (_474 instanceof Left) {
            return new Left(_474.value0);
        };
        return new Right(f(_474));
    };
});
var eqEither = function (__dict_Eq_9) {
    return function (__dict_Eq_10) {
        return new Prelude.Eq(function (_476) {
            return function (_477) {
                if (_476 instanceof Left && _477 instanceof Left) {
                    return Prelude["=="](__dict_Eq_9)(_476.value0)(_477.value0);
                };
                if (_476 instanceof Right && _477 instanceof Right) {
                    return Prelude["=="](__dict_Eq_10)(_476.value0)(_477.value0);
                };
                return false;
            };
        });
    };
};
var ordEither = function (__dict_Ord_6) {
    return function (__dict_Ord_7) {
        return new Prelude.Ord(function () {
            return eqEither(__dict_Ord_6["__superclass_Prelude.Eq_0"]())(__dict_Ord_7["__superclass_Prelude.Eq_0"]());
        }, function (_478) {
            return function (_479) {
                if (_478 instanceof Left && _479 instanceof Left) {
                    return Prelude.compare(__dict_Ord_6)(_478.value0)(_479.value0);
                };
                if (_478 instanceof Right && _479 instanceof Right) {
                    return Prelude.compare(__dict_Ord_7)(_478.value0)(_479.value0);
                };
                if (_478 instanceof Left) {
                    return Prelude.LT.value;
                };
                if (_479 instanceof Left) {
                    return Prelude.GT.value;
                };
                throw new Error("Failed pattern match at Data.Either line 191, column 1 - line 197, column 1: " + [ _478.constructor.name, _479.constructor.name ]);
            };
        });
    };
};
var either = function (f) {
    return function (g) {
        return function (_469) {
            if (_469 instanceof Left) {
                return f(_469.value0);
            };
            if (_469 instanceof Right) {
                return g(_469.value0);
            };
            throw new Error("Failed pattern match at Data.Either line 28, column 1 - line 29, column 1: " + [ f.constructor.name, g.constructor.name, _469.constructor.name ]);
        };
    };
};
var isLeft = either(Prelude["const"](true))(Prelude["const"](false));
var isRight = either(Prelude["const"](false))(Prelude["const"](true));
var boundedEither = function (__dict_Bounded_11) {
    return function (__dict_Bounded_12) {
        return new Prelude.Bounded(new Left(Prelude.bottom(__dict_Bounded_11)), new Right(Prelude.top(__dict_Bounded_12)));
    };
};
var bifunctorEither = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
        return function (_471) {
            if (_471 instanceof Left) {
                return new Left(f(_471.value0));
            };
            if (_471 instanceof Right) {
                return new Right(g(_471.value0));
            };
            throw new Error("Failed pattern match at Data.Either line 56, column 1 - line 92, column 1: " + [ f.constructor.name, g.constructor.name, _471.constructor.name ]);
        };
    };
});
var bifoldableEither = new Data_Bifoldable.Bifoldable(function (__dict_Monoid_15) {
    return function (f) {
        return function (g) {
            return function (_485) {
                if (_485 instanceof Left) {
                    return f(_485.value0);
                };
                if (_485 instanceof Right) {
                    return g(_485.value0);
                };
                throw new Error("Failed pattern match at Data.Either line 209, column 1 - line 217, column 1: " + [ f.constructor.name, g.constructor.name, _485.constructor.name ]);
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (_484) {
                if (_484 instanceof Left) {
                    return f(z)(_484.value0);
                };
                if (_484 instanceof Right) {
                    return g(z)(_484.value0);
                };
                throw new Error("Failed pattern match at Data.Either line 209, column 1 - line 217, column 1: " + [ f.constructor.name, g.constructor.name, z.constructor.name, _484.constructor.name ]);
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (_483) {
                if (_483 instanceof Left) {
                    return f(_483.value0)(z);
                };
                if (_483 instanceof Right) {
                    return g(_483.value0)(z);
                };
                throw new Error("Failed pattern match at Data.Either line 209, column 1 - line 217, column 1: " + [ f.constructor.name, g.constructor.name, z.constructor.name, _483.constructor.name ]);
            };
        };
    };
});
var bitraversableEither = new Data_Bitraversable.Bitraversable(function () {
    return bifoldableEither;
}, function () {
    return bifunctorEither;
}, function (__dict_Applicative_14) {
    return function (_489) {
        if (_489 instanceof Left) {
            return Prelude["<$>"]((__dict_Applicative_14["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Left.create)(_489.value0);
        };
        if (_489 instanceof Right) {
            return Prelude["<$>"]((__dict_Applicative_14["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Right.create)(_489.value0);
        };
        throw new Error("Failed pattern match at Data.Either line 223, column 1 - line 229, column 1: " + [ _489.constructor.name ]);
    };
}, function (__dict_Applicative_13) {
    return function (f) {
        return function (g) {
            return function (_488) {
                if (_488 instanceof Left) {
                    return Prelude["<$>"]((__dict_Applicative_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Left.create)(f(_488.value0));
                };
                if (_488 instanceof Right) {
                    return Prelude["<$>"]((__dict_Applicative_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Right.create)(g(_488.value0));
                };
                throw new Error("Failed pattern match at Data.Either line 223, column 1 - line 229, column 1: " + [ f.constructor.name, g.constructor.name, _488.constructor.name ]);
            };
        };
    };
});
var applyEither = new Prelude.Apply(function () {
    return functorEither;
}, function (_472) {
    return function (r) {
        if (_472 instanceof Left) {
            return new Left(_472.value0);
        };
        if (_472 instanceof Right) {
            return Prelude["<$>"](functorEither)(_472.value0)(r);
        };
        throw new Error("Failed pattern match at Data.Either line 92, column 1 - line 116, column 1: " + [ _472.constructor.name, r.constructor.name ]);
    };
});
var bindEither = new Prelude.Bind(function () {
    return applyEither;
}, either(function (e) {
    return function (_468) {
        return new Left(e);
    };
})(function (a) {
    return function (f) {
        return f(a);
    };
}));
var semigroupEither = function (__dict_Semigroup_5) {
    return new Prelude.Semigroup(function (x) {
        return function (y) {
            return Prelude["<*>"](applyEither)(Prelude["<$>"](functorEither)(Prelude.append(__dict_Semigroup_5))(x))(y);
        };
    });
};
var semiringEither = function (__dict_Semiring_4) {
    return new Prelude.Semiring(function (x) {
        return function (y) {
            return Prelude["<*>"](applyEither)(Prelude["<$>"](functorEither)(Prelude.add(__dict_Semiring_4))(x))(y);
        };
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyEither)(Prelude["<$>"](functorEither)(Prelude.mul(__dict_Semiring_4))(x))(y);
        };
    }, new Right(Prelude.one(__dict_Semiring_4)), new Right(Prelude.zero(__dict_Semiring_4)));
};
var applicativeEither = new Prelude.Applicative(function () {
    return applyEither;
}, Right.create);
var monadEither = new Prelude.Monad(function () {
    return applicativeEither;
}, function () {
    return bindEither;
});
var altEither = new Control_Alt.Alt(function () {
    return functorEither;
}, function (_473) {
    return function (r) {
        if (_473 instanceof Left) {
            return r;
        };
        return _473;
    };
});
module.exports = {
    Left: Left, 
    Right: Right, 
    isRight: isRight, 
    isLeft: isLeft, 
    either: either, 
    functorEither: functorEither, 
    bifunctorEither: bifunctorEither, 
    applyEither: applyEither, 
    applicativeEither: applicativeEither, 
    altEither: altEither, 
    bindEither: bindEither, 
    monadEither: monadEither, 
    extendEither: extendEither, 
    showEither: showEither, 
    eqEither: eqEither, 
    ordEither: ordEither, 
    boundedEither: boundedEither, 
    foldableEither: foldableEither, 
    bifoldableEither: bifoldableEither, 
    traversableEither: traversableEither, 
    bitraversableEither: bitraversableEither, 
    semiringEither: semiringEither, 
    semigroupEither: semigroupEither
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Bifoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifoldable/index.js","Data.Bifunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifunctor/index.js","Data.Bitraversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bitraversable/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Enum/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var Data_Unfoldable = require("Data.Unfoldable");
var Data_Char = require("Data.Char");
var Data_Either = require("Data.Either");
var Data_Tuple = require("Data.Tuple");
var Cardinality = function (x) {
    return x;
};
var Enum = function (__superclass_Prelude$dotBounded_0, cardinality, fromEnum, pred, succ, toEnum) {
    this["__superclass_Prelude.Bounded_0"] = __superclass_Prelude$dotBounded_0;
    this.cardinality = cardinality;
    this.fromEnum = fromEnum;
    this.pred = pred;
    this.succ = succ;
    this.toEnum = toEnum;
};
var toEnum = function (dict) {
    return dict.toEnum;
};
var succ = function (dict) {
    return dict.succ;
};
var runCardinality = function (_136) {
    return _136;
};
var tupleCardinality = function (__dict_Enum_0) {
    return function (__dict_Enum_1) {
        return function (l) {
            return function (r) {
                return Cardinality(runCardinality(l) * runCardinality(r) | 0);
            };
        };
    };
};
var tupleToEnum = function (__dict_Enum_2) {
    return function (__dict_Enum_3) {
        return function (cardb) {
            return function (n) {
                return Prelude["<*>"](Data_Maybe.applyMaybe)(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.Tuple.create)(toEnum(__dict_Enum_2)(n / runCardinality(cardb) | 0)))(toEnum(__dict_Enum_3)(n % runCardinality(cardb)));
            };
        };
    };
};
var pred = function (dict) {
    return dict.pred;
};
var maybeCardinality = function (__dict_Enum_4) {
    return function (c) {
        return Cardinality(1 + runCardinality(c) | 0);
    };
};
var maybeToEnum = function (__dict_Enum_5) {
    return function (carda) {
        return function (n) {
            if (n <= runCardinality(maybeCardinality(__dict_Enum_5)(carda))) {
                var _515 = n === 0;
                if (_515) {
                    return Data_Maybe.Just.create(Data_Maybe.Nothing.value);
                };
                if (!_515) {
                    return Data_Maybe.Just.create(toEnum(__dict_Enum_5)(n - 1));
                };
                throw new Error("Failed pattern match at Data.Enum line 138, column 1 - line 139, column 1: " + [ _515.constructor.name ]);
            };
            return Data_Maybe.Nothing.value;
        };
    };
};
var intStepFromTo = function (step) {
    return function (from) {
        return function (to) {
            return Data_Unfoldable.unfoldr(Data_Unfoldable.unfoldableArray)(function (e) {
                var _516 = e <= to;
                if (_516) {
                    return Data_Maybe.Just.create(new Data_Tuple.Tuple(e, e + step | 0));
                };
                if (!_516) {
                    return Data_Maybe.Nothing.value;
                };
                throw new Error("Failed pattern match at Data.Enum line 103, column 1 - line 104, column 1: " + [ _516.constructor.name ]);
            })(from);
        };
    };
};
var intFromTo = intStepFromTo(1);
var fromEnum = function (dict) {
    return dict.fromEnum;
};
var tupleFromEnum = function (__dict_Enum_6) {
    return function (__dict_Enum_7) {
        return function (cardb) {
            return function (_139) {
                return (fromEnum(__dict_Enum_6)(_139.value0) * runCardinality(cardb) | 0) + fromEnum(__dict_Enum_7)(_139.value1) | 0;
            };
        };
    };
};
var enumFromTo = function (__dict_Enum_8) {
    return function (a) {
        return function (b) {
            var b$prime = fromEnum(__dict_Enum_8)(b);
            var a$prime = fromEnum(__dict_Enum_8)(a);
            return Prelude["<$>"](Prelude.functorArray)(Prelude[">>>"](Prelude.semigroupoidFn)(toEnum(__dict_Enum_8))(Data_Maybe_Unsafe.fromJust))(intFromTo(a$prime)(b$prime));
        };
    };
};
var enumFromThenTo = function (__dict_Enum_9) {
    return function (a) {
        return function (b) {
            return function (c) {
                var c$prime = fromEnum(__dict_Enum_9)(c);
                var b$prime = fromEnum(__dict_Enum_9)(b);
                var a$prime = fromEnum(__dict_Enum_9)(a);
                return Prelude["<$>"](Prelude.functorArray)(Prelude[">>>"](Prelude.semigroupoidFn)(toEnum(__dict_Enum_9))(Data_Maybe_Unsafe.fromJust))(intStepFromTo(b$prime - a$prime)(a$prime)(c$prime));
            };
        };
    };
};
var eitherFromEnum = function (__dict_Enum_10) {
    return function (__dict_Enum_11) {
        return function (carda) {
            return function (_140) {
                if (_140 instanceof Data_Either.Left) {
                    return fromEnum(__dict_Enum_10)(_140.value0);
                };
                if (_140 instanceof Data_Either.Right) {
                    return fromEnum(__dict_Enum_11)(_140.value0) + runCardinality(carda) | 0;
                };
                throw new Error("Failed pattern match at Data.Enum line 197, column 1 - line 198, column 1: " + [ carda.constructor.name, _140.constructor.name ]);
            };
        };
    };
};
var eitherCardinality = function (__dict_Enum_12) {
    return function (__dict_Enum_13) {
        return function (l) {
            return function (r) {
                return Cardinality(runCardinality(l) + runCardinality(r) | 0);
            };
        };
    };
};
var eitherToEnum = function (__dict_Enum_14) {
    return function (__dict_Enum_15) {
        return function (carda) {
            return function (cardb) {
                return function (n) {
                    var _525 = n >= 0 && n < runCardinality(carda);
                    if (_525) {
                        return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Either.Left.create)(toEnum(__dict_Enum_14)(n));
                    };
                    if (!_525) {
                        var _526 = n >= runCardinality(carda) && n < runCardinality(eitherCardinality(__dict_Enum_14)(__dict_Enum_15)(carda)(cardb));
                        if (_526) {
                            return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Either.Right.create)(toEnum(__dict_Enum_15)(n - runCardinality(carda)));
                        };
                        if (!_526) {
                            return Data_Maybe.Nothing.value;
                        };
                        throw new Error("Failed pattern match: " + [ _526.constructor.name ]);
                    };
                    throw new Error("Failed pattern match at Data.Enum line 189, column 1 - line 190, column 1: " + [ _525.constructor.name ]);
                };
            };
        };
    };
};
var defaultToEnum = function (succ$prime) {
    return function (bottom$prime) {
        return function (n) {
            if (n < 0) {
                return Data_Maybe.Nothing.value;
            };
            if (n === 0) {
                return new Data_Maybe.Just(bottom$prime);
            };
            if (Prelude.otherwise) {
                return Prelude[">>="](Data_Maybe.bindMaybe)(defaultToEnum(succ$prime)(bottom$prime)(n - 1))(succ$prime);
            };
            throw new Error("Failed pattern match: " + [ succ$prime.constructor.name, bottom$prime.constructor.name, n.constructor.name ]);
        };
    };
};
var defaultSucc = function (toEnum$prime) {
    return function (fromEnum$prime) {
        return function (a) {
            return toEnum$prime(fromEnum$prime(a) + 1 | 0);
        };
    };
};
var defaultPred = function (toEnum$prime) {
    return function (fromEnum$prime) {
        return function (a) {
            return toEnum$prime(fromEnum$prime(a) - 1);
        };
    };
};
var defaultFromEnum = function (pred$prime) {
    return function (e) {
        return Data_Maybe.maybe(0)(function (prd) {
            return defaultFromEnum(pred$prime)(prd) + 1 | 0;
        })(pred$prime(e));
    };
};
var charToEnum = function (n) {
    if (n >= 0 && n <= 65535) {
        return Data_Maybe.Just.create(Data_Char.fromCharCode(n));
    };
    return Data_Maybe.Nothing.value;
};
var charFromEnum = Data_Char.toCharCode;
var enumChar = new Enum(function () {
    return Prelude.boundedChar;
}, 65536, charFromEnum, defaultPred(charToEnum)(charFromEnum), defaultSucc(charToEnum)(charFromEnum), charToEnum);
var cardinality = function (dict) {
    return dict.cardinality;
};
var enumEither = function (__dict_Enum_16) {
    return function (__dict_Enum_17) {
        return new Enum(function () {
            return Data_Either.boundedEither(__dict_Enum_16["__superclass_Prelude.Bounded_0"]())(__dict_Enum_17["__superclass_Prelude.Bounded_0"]());
        }, eitherCardinality(__dict_Enum_16)(__dict_Enum_17)(cardinality(__dict_Enum_16))(cardinality(__dict_Enum_17)), eitherFromEnum(__dict_Enum_16)(__dict_Enum_17)(cardinality(__dict_Enum_16)), function (_147) {
            if (_147 instanceof Data_Either.Left) {
                return Data_Maybe.maybe(Data_Maybe.Nothing.value)(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Either.Left.create))(pred(__dict_Enum_16)(_147.value0));
            };
            if (_147 instanceof Data_Either.Right) {
                return Data_Maybe.maybe(Data_Maybe.Just.create(new Data_Either.Left(Prelude.top(__dict_Enum_16["__superclass_Prelude.Bounded_0"]()))))(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Either.Right.create))(pred(__dict_Enum_17)(_147.value0));
            };
            throw new Error("Failed pattern match at Data.Enum line 180, column 1 - line 189, column 1: " + [ _147.constructor.name ]);
        }, function (_146) {
            if (_146 instanceof Data_Either.Left) {
                return Data_Maybe.maybe(Data_Maybe.Just.create(new Data_Either.Right(Prelude.bottom(__dict_Enum_17["__superclass_Prelude.Bounded_0"]()))))(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Either.Left.create))(succ(__dict_Enum_16)(_146.value0));
            };
            if (_146 instanceof Data_Either.Right) {
                return Data_Maybe.maybe(Data_Maybe.Nothing.value)(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Either.Right.create))(succ(__dict_Enum_17)(_146.value0));
            };
            throw new Error("Failed pattern match at Data.Enum line 180, column 1 - line 189, column 1: " + [ _146.constructor.name ]);
        }, eitherToEnum(__dict_Enum_16)(__dict_Enum_17)(cardinality(__dict_Enum_16))(cardinality(__dict_Enum_17)));
    };
};
var enumMaybe = function (__dict_Enum_18) {
    return new Enum(function () {
        return Data_Maybe.boundedMaybe(__dict_Enum_18["__superclass_Prelude.Bounded_0"]());
    }, maybeCardinality(__dict_Enum_18)(cardinality(__dict_Enum_18)), function (_143) {
        if (_143 instanceof Data_Maybe.Nothing) {
            return 0;
        };
        if (_143 instanceof Data_Maybe.Just) {
            return fromEnum(__dict_Enum_18)(_143.value0) + 1 | 0;
        };
        throw new Error("Failed pattern match at Data.Enum line 128, column 1 - line 138, column 1: " + [ _143.constructor.name ]);
    }, function (_142) {
        if (_142 instanceof Data_Maybe.Nothing) {
            return Data_Maybe.Nothing.value;
        };
        if (_142 instanceof Data_Maybe.Just) {
            return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Maybe.Just.create)(pred(__dict_Enum_18)(_142.value0));
        };
        throw new Error("Failed pattern match at Data.Enum line 128, column 1 - line 138, column 1: " + [ _142.constructor.name ]);
    }, function (_141) {
        if (_141 instanceof Data_Maybe.Nothing) {
            return Data_Maybe.Just.create(Prelude.bottom(Data_Maybe.boundedMaybe(__dict_Enum_18["__superclass_Prelude.Bounded_0"]())));
        };
        if (_141 instanceof Data_Maybe.Just) {
            return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Maybe.Just.create)(succ(__dict_Enum_18)(_141.value0));
        };
        throw new Error("Failed pattern match at Data.Enum line 128, column 1 - line 138, column 1: " + [ _141.constructor.name ]);
    }, maybeToEnum(__dict_Enum_18)(cardinality(__dict_Enum_18)));
};
var enumTuple = function (__dict_Enum_19) {
    return function (__dict_Enum_20) {
        return new Enum(function () {
            return Data_Tuple.boundedTuple(__dict_Enum_19["__superclass_Prelude.Bounded_0"]())(__dict_Enum_20["__superclass_Prelude.Bounded_0"]());
        }, tupleCardinality(__dict_Enum_19)(__dict_Enum_20)(cardinality(__dict_Enum_19))(cardinality(__dict_Enum_20)), tupleFromEnum(__dict_Enum_19)(__dict_Enum_20)(cardinality(__dict_Enum_20)), function (_145) {
            return Data_Maybe.maybe(Prelude["<$>"](Data_Maybe.functorMaybe)(Prelude.flip(Data_Tuple.Tuple.create)(Prelude.bottom(__dict_Enum_20["__superclass_Prelude.Bounded_0"]())))(pred(__dict_Enum_19)(_145.value0)))(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Tuple.Tuple.create(_145.value0)))(pred(__dict_Enum_20)(_145.value1));
        }, function (_144) {
            return Data_Maybe.maybe(Prelude["<$>"](Data_Maybe.functorMaybe)(Prelude.flip(Data_Tuple.Tuple.create)(Prelude.bottom(__dict_Enum_20["__superclass_Prelude.Bounded_0"]())))(succ(__dict_Enum_19)(_144.value0)))(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Tuple.Tuple.create(_144.value0)))(succ(__dict_Enum_20)(_144.value1));
        }, tupleToEnum(__dict_Enum_19)(__dict_Enum_20)(cardinality(__dict_Enum_20)));
    };
};
var booleanSucc = function (_137) {
    if (!_137) {
        return new Data_Maybe.Just(true);
    };
    return Data_Maybe.Nothing.value;
};
var booleanPred = function (_138) {
    if (_138) {
        return new Data_Maybe.Just(false);
    };
    return Data_Maybe.Nothing.value;
};
var enumBoolean = new Enum(function () {
    return Prelude.boundedBoolean;
}, 2, defaultFromEnum(booleanPred), booleanPred, booleanSucc, defaultToEnum(booleanSucc)(false));
module.exports = {
    Cardinality: Cardinality, 
    Enum: Enum, 
    enumFromThenTo: enumFromThenTo, 
    enumFromTo: enumFromTo, 
    intStepFromTo: intStepFromTo, 
    intFromTo: intFromTo, 
    defaultFromEnum: defaultFromEnum, 
    defaultToEnum: defaultToEnum, 
    defaultPred: defaultPred, 
    defaultSucc: defaultSucc, 
    toEnum: toEnum, 
    succ: succ, 
    runCardinality: runCardinality, 
    pred: pred, 
    fromEnum: fromEnum, 
    cardinality: cardinality, 
    enumChar: enumChar, 
    enumMaybe: enumMaybe, 
    enumBoolean: enumBoolean, 
    enumTuple: enumTuple, 
    enumEither: enumEither
};

},{"Data.Char":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Char/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Data.Unfoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Unfoldable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Exists/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Exists

exports.mkExists = function (fa) {
  return fa;
};

exports.runExists = function (f) {
  return function (fa) {
    return f(fa);
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Exists/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
module.exports = {
    runExists: $foreign.runExists, 
    mkExists: $foreign.mkExists
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Exists/foreign.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Foldable

exports.foldrArray = function (f) {
  return function (init) {
    return function (xs) {
      var acc = init;
      var len = xs.length;
      for (var i = len - 1; i >= 0; i--) {
        acc = f(xs[i])(acc);
      }
      return acc;
    };
  };
};

exports.foldlArray = function (f) {
  return function (init) {
    return function (xs) {
      var acc = init;
      var len = xs.length;
      for (var i = 0; i < len; i++) {
        acc = f(acc)(xs[i]);
      }
      return acc;
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Apply = require("Control.Apply");
var Data_Maybe = require("Data.Maybe");
var Data_Maybe_First = require("Data.Maybe.First");
var Data_Maybe_Last = require("Data.Maybe.Last");
var Data_Monoid = require("Data.Monoid");
var Data_Monoid_Additive = require("Data.Monoid.Additive");
var Data_Monoid_Dual = require("Data.Monoid.Dual");
var Data_Monoid_Disj = require("Data.Monoid.Disj");
var Data_Monoid_Conj = require("Data.Monoid.Conj");
var Data_Monoid_Multiplicative = require("Data.Monoid.Multiplicative");
var Foldable = function (foldMap, foldl, foldr) {
    this.foldMap = foldMap;
    this.foldl = foldl;
    this.foldr = foldr;
};
var foldr = function (dict) {
    return dict.foldr;
};
var traverse_ = function (__dict_Applicative_0) {
    return function (__dict_Foldable_1) {
        return function (f) {
            return foldr(__dict_Foldable_1)(function (_1590) {
                return Control_Apply["*>"](__dict_Applicative_0["__superclass_Prelude.Apply_0"]())(f(_1590));
            })(Prelude.pure(__dict_Applicative_0)(Prelude.unit));
        };
    };
};
var for_ = function (__dict_Applicative_2) {
    return function (__dict_Foldable_3) {
        return Prelude.flip(traverse_(__dict_Applicative_2)(__dict_Foldable_3));
    };
};
var sequence_ = function (__dict_Applicative_4) {
    return function (__dict_Foldable_5) {
        return traverse_(__dict_Applicative_4)(__dict_Foldable_5)(Prelude.id(Prelude.categoryFn));
    };
};
var foldl = function (dict) {
    return dict.foldl;
};
var intercalate = function (__dict_Foldable_6) {
    return function (__dict_Monoid_7) {
        return function (sep) {
            return function (xs) {
                var go = function (_441) {
                    return function (x) {
                        if (_441.init) {
                            return {
                                init: false, 
                                acc: x
                            };
                        };
                        return {
                            init: false, 
                            acc: Prelude["<>"](__dict_Monoid_7["__superclass_Prelude.Semigroup_0"]())(_441.acc)(Prelude["<>"](__dict_Monoid_7["__superclass_Prelude.Semigroup_0"]())(sep)(x))
                        };
                    };
                };
                return (foldl(__dict_Foldable_6)(go)({
                    init: true, 
                    acc: Data_Monoid.mempty(__dict_Monoid_7)
                })(xs)).acc;
            };
        };
    };
};
var mconcat = function (__dict_Foldable_8) {
    return function (__dict_Monoid_9) {
        return foldl(__dict_Foldable_8)(Prelude["<>"](__dict_Monoid_9["__superclass_Prelude.Semigroup_0"]()))(Data_Monoid.mempty(__dict_Monoid_9));
    };
};
var product = function (__dict_Foldable_10) {
    return function (__dict_Semiring_11) {
        return foldl(__dict_Foldable_10)(Prelude["*"](__dict_Semiring_11))(Prelude.one(__dict_Semiring_11));
    };
};
var sum = function (__dict_Foldable_12) {
    return function (__dict_Semiring_13) {
        return foldl(__dict_Foldable_12)(Prelude["+"](__dict_Semiring_13))(Prelude.zero(__dict_Semiring_13));
    };
};
var foldableMultiplicative = new Foldable(function (__dict_Monoid_14) {
    return function (f) {
        return function (_440) {
            return f(_440);
        };
    };
}, function (f) {
    return function (z) {
        return function (_439) {
            return f(z)(_439);
        };
    };
}, function (f) {
    return function (z) {
        return function (_438) {
            return f(_438)(z);
        };
    };
});
var foldableMaybe = new Foldable(function (__dict_Monoid_15) {
    return function (f) {
        return function (_419) {
            if (_419 instanceof Data_Maybe.Nothing) {
                return Data_Monoid.mempty(__dict_Monoid_15);
            };
            if (_419 instanceof Data_Maybe.Just) {
                return f(_419.value0);
            };
            throw new Error("Failed pattern match at Data.Foldable line 51, column 1 - line 59, column 1: " + [ f.constructor.name, _419.constructor.name ]);
        };
    };
}, function (f) {
    return function (z) {
        return function (_418) {
            if (_418 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (_418 instanceof Data_Maybe.Just) {
                return f(z)(_418.value0);
            };
            throw new Error("Failed pattern match at Data.Foldable line 51, column 1 - line 59, column 1: " + [ f.constructor.name, z.constructor.name, _418.constructor.name ]);
        };
    };
}, function (f) {
    return function (z) {
        return function (_417) {
            if (_417 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (_417 instanceof Data_Maybe.Just) {
                return f(_417.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Foldable line 51, column 1 - line 59, column 1: " + [ f.constructor.name, z.constructor.name, _417.constructor.name ]);
        };
    };
});
var foldableDual = new Foldable(function (__dict_Monoid_16) {
    return function (f) {
        return function (_431) {
            return f(_431);
        };
    };
}, function (f) {
    return function (z) {
        return function (_430) {
            return f(z)(_430);
        };
    };
}, function (f) {
    return function (z) {
        return function (_429) {
            return f(_429)(z);
        };
    };
});
var foldableDisj = new Foldable(function (__dict_Monoid_17) {
    return function (f) {
        return function (_434) {
            return f(_434);
        };
    };
}, function (f) {
    return function (z) {
        return function (_433) {
            return f(z)(_433);
        };
    };
}, function (f) {
    return function (z) {
        return function (_432) {
            return f(_432)(z);
        };
    };
});
var foldableConj = new Foldable(function (__dict_Monoid_18) {
    return function (f) {
        return function (_437) {
            return f(_437);
        };
    };
}, function (f) {
    return function (z) {
        return function (_436) {
            return f(z)(_436);
        };
    };
}, function (f) {
    return function (z) {
        return function (_435) {
            return f(_435)(z);
        };
    };
});
var foldableArray = new Foldable(function (__dict_Monoid_19) {
    return function (f) {
        return function (xs) {
            return foldr(foldableArray)(function (x) {
                return function (acc) {
                    return Prelude["<>"](__dict_Monoid_19["__superclass_Prelude.Semigroup_0"]())(f(x))(acc);
                };
            })(Data_Monoid.mempty(__dict_Monoid_19))(xs);
        };
    };
}, $foreign.foldlArray, $foreign.foldrArray);
var foldableAdditive = new Foldable(function (__dict_Monoid_20) {
    return function (f) {
        return function (_428) {
            return f(_428);
        };
    };
}, function (f) {
    return function (z) {
        return function (_427) {
            return f(z)(_427);
        };
    };
}, function (f) {
    return function (z) {
        return function (_426) {
            return f(_426)(z);
        };
    };
});
var foldMap = function (dict) {
    return dict.foldMap;
};
var foldableFirst = new Foldable(function (__dict_Monoid_21) {
    return function (f) {
        return function (_422) {
            return foldMap(foldableMaybe)(__dict_Monoid_21)(f)(_422);
        };
    };
}, function (f) {
    return function (z) {
        return function (_421) {
            return foldl(foldableMaybe)(f)(z)(_421);
        };
    };
}, function (f) {
    return function (z) {
        return function (_420) {
            return foldr(foldableMaybe)(f)(z)(_420);
        };
    };
});
var foldableLast = new Foldable(function (__dict_Monoid_22) {
    return function (f) {
        return function (_425) {
            return foldMap(foldableMaybe)(__dict_Monoid_22)(f)(_425);
        };
    };
}, function (f) {
    return function (z) {
        return function (_424) {
            return foldl(foldableMaybe)(f)(z)(_424);
        };
    };
}, function (f) {
    return function (z) {
        return function (_423) {
            return foldr(foldableMaybe)(f)(z)(_423);
        };
    };
});
var fold = function (__dict_Foldable_23) {
    return function (__dict_Monoid_24) {
        return foldMap(__dict_Foldable_23)(__dict_Monoid_24)(Prelude.id(Prelude.categoryFn));
    };
};
var find = function (__dict_Foldable_25) {
    return function (p) {
        return foldl(__dict_Foldable_25)(function (r) {
            return function (x) {
                var _1589 = p(x);
                if (_1589) {
                    return new Data_Maybe.Just(x);
                };
                if (!_1589) {
                    return r;
                };
                throw new Error("Failed pattern match at Data.Foldable line 181, column 1 - line 182, column 1: " + [ _1589.constructor.name ]);
            };
        })(Data_Maybe.Nothing.value);
    };
};
var any = function (__dict_Foldable_26) {
    return function (__dict_BooleanAlgebra_27) {
        return function (p) {
            return function (_1591) {
                return Data_Monoid_Disj.runDisj(foldMap(__dict_Foldable_26)(Data_Monoid_Disj.monoidDisj(__dict_BooleanAlgebra_27))(function (_1592) {
                    return Data_Monoid_Disj.Disj(p(_1592));
                })(_1591));
            };
        };
    };
};
var elem = function (__dict_Foldable_28) {
    return function (__dict_Eq_29) {
        return function (_1593) {
            return any(__dict_Foldable_28)(Prelude.booleanAlgebraBoolean)(Prelude["=="](__dict_Eq_29)(_1593));
        };
    };
};
var notElem = function (__dict_Foldable_30) {
    return function (__dict_Eq_31) {
        return function (x) {
            return function (_1594) {
                return !elem(__dict_Foldable_30)(__dict_Eq_31)(x)(_1594);
            };
        };
    };
};
var or = function (__dict_Foldable_32) {
    return function (__dict_BooleanAlgebra_33) {
        return any(__dict_Foldable_32)(__dict_BooleanAlgebra_33)(Prelude.id(Prelude.categoryFn));
    };
};
var all = function (__dict_Foldable_34) {
    return function (__dict_BooleanAlgebra_35) {
        return function (p) {
            return function (_1595) {
                return Data_Monoid_Conj.runConj(foldMap(__dict_Foldable_34)(Data_Monoid_Conj.monoidConj(__dict_BooleanAlgebra_35))(function (_1596) {
                    return Data_Monoid_Conj.Conj(p(_1596));
                })(_1595));
            };
        };
    };
};
var and = function (__dict_Foldable_36) {
    return function (__dict_BooleanAlgebra_37) {
        return all(__dict_Foldable_36)(__dict_BooleanAlgebra_37)(Prelude.id(Prelude.categoryFn));
    };
};
module.exports = {
    Foldable: Foldable, 
    find: find, 
    notElem: notElem, 
    elem: elem, 
    product: product, 
    sum: sum, 
    all: all, 
    any: any, 
    or: or, 
    and: and, 
    intercalate: intercalate, 
    mconcat: mconcat, 
    sequence_: sequence_, 
    for_: for_, 
    traverse_: traverse_, 
    fold: fold, 
    foldMap: foldMap, 
    foldl: foldl, 
    foldr: foldr, 
    foldableArray: foldableArray, 
    foldableMaybe: foldableMaybe, 
    foldableFirst: foldableFirst, 
    foldableLast: foldableLast, 
    foldableAdditive: foldableAdditive, 
    foldableDual: foldableDual, 
    foldableDisj: foldableDisj, 
    foldableConj: foldableConj, 
    foldableMultiplicative: foldableMultiplicative
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/foreign.js","Control.Apply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Apply/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.First":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.First/index.js","Data.Maybe.Last":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Last/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Monoid.Additive":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Additive/index.js","Data.Monoid.Conj":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Conj/index.js","Data.Monoid.Disj":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Disj/index.js","Data.Monoid.Dual":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Dual/index.js","Data.Monoid.Multiplicative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Multiplicative/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Class/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Array = require("Data.Array");
var Data_Either = require("Data.Either");
var Data_Foreign = require("Data.Foreign");
var Data_Foreign_Index = require("Data.Foreign.Index");
var Data_Foreign_Null = require("Data.Foreign.Null");
var Data_Foreign_NullOrUndefined = require("Data.Foreign.NullOrUndefined");
var Data_Foreign_Undefined = require("Data.Foreign.Undefined");
var Data_Int = require("Data.Int");
var Data_Traversable = require("Data.Traversable");
var IsForeign = function (read) {
    this.read = read;
};
var stringIsForeign = new IsForeign(Data_Foreign.readString);
var read = function (dict) {
    return dict.read;
};
var readJSON = function (__dict_IsForeign_0) {
    return function (json) {
        return Prelude[">>="](Data_Either.bindEither)(Data_Foreign.parseJSON(json))(read(__dict_IsForeign_0));
    };
};
var readWith = function (__dict_IsForeign_1) {
    return function (f) {
        return function (value) {
            return Data_Either.either(function (_2418) {
                return Data_Either.Left.create(f(_2418));
            })(Data_Either.Right.create)(read(__dict_IsForeign_1)(value));
        };
    };
};
var readProp = function (__dict_IsForeign_2) {
    return function (__dict_Index_3) {
        return function (prop) {
            return function (value) {
                return Prelude[">>="](Data_Either.bindEither)(Data_Foreign_Index["!"](__dict_Index_3)(value)(prop))(readWith(__dict_IsForeign_2)(Data_Foreign_Index.errorAt(__dict_Index_3)(prop)));
            };
        };
    };
};
var undefinedIsForeign = function (__dict_IsForeign_4) {
    return new IsForeign(Data_Foreign_Undefined.readUndefined(read(__dict_IsForeign_4)));
};
var numberIsForeign = new IsForeign(Data_Foreign.readNumber);
var nullOrUndefinedIsForeign = function (__dict_IsForeign_5) {
    return new IsForeign(Data_Foreign_NullOrUndefined.readNullOrUndefined(read(__dict_IsForeign_5)));
};
var nullIsForeign = function (__dict_IsForeign_6) {
    return new IsForeign(Data_Foreign_Null.readNull(read(__dict_IsForeign_6)));
};
var intIsForeign = new IsForeign(Data_Foreign.readInt);
var foreignIsForeign = new IsForeign(function (f) {
    return Prelude["return"](Data_Either.applicativeEither)(f);
});
var charIsForeign = new IsForeign(Data_Foreign.readChar);
var booleanIsForeign = new IsForeign(Data_Foreign.readBoolean);
var arrayIsForeign = function (__dict_IsForeign_7) {
    return new IsForeign(function (value) {
        var readElement = function (i) {
            return function (value_1) {
                return readWith(__dict_IsForeign_7)(Data_Foreign.ErrorAtIndex.create(i))(value_1);
            };
        };
        var readElements = function (arr) {
            return Data_Traversable.sequence(Data_Traversable.traversableArray)(Data_Either.applicativeEither)(Data_Array.zipWith(readElement)(Data_Array.range(0)(Data_Array.length(arr)))(arr));
        };
        return Prelude[">>="](Data_Either.bindEither)(Data_Foreign.readArray(value))(readElements);
    });
};
module.exports = {
    IsForeign: IsForeign, 
    readProp: readProp, 
    readWith: readWith, 
    readJSON: readJSON, 
    read: read, 
    foreignIsForeign: foreignIsForeign, 
    stringIsForeign: stringIsForeign, 
    charIsForeign: charIsForeign, 
    booleanIsForeign: booleanIsForeign, 
    numberIsForeign: numberIsForeign, 
    intIsForeign: intIsForeign, 
    arrayIsForeign: arrayIsForeign, 
    nullIsForeign: nullIsForeign, 
    undefinedIsForeign: undefinedIsForeign, 
    nullOrUndefinedIsForeign: nullOrUndefinedIsForeign
};

},{"Data.Array":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Foreign.Index":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Index/index.js","Data.Foreign.Null":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Null/index.js","Data.Foreign.NullOrUndefined":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.NullOrUndefined/index.js","Data.Foreign.Undefined":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Undefined/index.js","Data.Int":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Index/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Foreign.Index

// jshint maxparams: 4
exports.unsafeReadPropImpl = function (f, s, key, value) {
  return value == null ? f : s(value[key]);
};

// jshint maxparams: 2
exports.unsafeHasOwnProperty = function (prop, value) {
  return Object.prototype.hasOwnProperty.call(value, prop);
};

exports.unsafeHasProperty = function (prop, value) {
  return prop in value;
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Index/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Either = require("Data.Either");
var Data_Foreign = require("Data.Foreign");
var Data_Function = require("Data.Function");
var Data_Int = require("Data.Int");
var Index = function (errorAt, hasOwnProperty, hasProperty, ix) {
    this.errorAt = errorAt;
    this.hasOwnProperty = hasOwnProperty;
    this.hasProperty = hasProperty;
    this.ix = ix;
};
var unsafeReadProp = function (k) {
    return function (value) {
        return $foreign.unsafeReadPropImpl(new Data_Either.Left(new Data_Foreign.TypeMismatch("object", Data_Foreign.typeOf(value))), Prelude.pure(Data_Either.applicativeEither), k, value);
    };
};
var prop = unsafeReadProp;
var ix = function (dict) {
    return dict.ix;
};
var $bang = function (__dict_Index_0) {
    return ix(__dict_Index_0);
};
var index = unsafeReadProp;
var hasPropertyImpl = function (p) {
    return function (value) {
        if (Data_Foreign.isNull(value)) {
            return false;
        };
        if (Data_Foreign.isUndefined(value)) {
            return false;
        };
        if (Prelude["=="](Prelude.eqString)(Data_Foreign.typeOf(value))("object") || Prelude["=="](Prelude.eqString)(Data_Foreign.typeOf(value))("function")) {
            return $foreign.unsafeHasProperty(p, value);
        };
        return false;
    };
};
var hasProperty = function (dict) {
    return dict.hasProperty;
};
var hasOwnPropertyImpl = function (p) {
    return function (value) {
        if (Data_Foreign.isNull(value)) {
            return false;
        };
        if (Data_Foreign.isUndefined(value)) {
            return false;
        };
        if (Prelude["=="](Prelude.eqString)(Data_Foreign.typeOf(value))("object") || Prelude["=="](Prelude.eqString)(Data_Foreign.typeOf(value))("function")) {
            return $foreign.unsafeHasOwnProperty(p, value);
        };
        return false;
    };
};
var indexInt = new Index(Data_Foreign.ErrorAtIndex.create, hasOwnPropertyImpl, hasPropertyImpl, Prelude.flip(index));
var indexString = new Index(Data_Foreign.ErrorAtProperty.create, hasOwnPropertyImpl, hasPropertyImpl, Prelude.flip(prop));
var hasOwnProperty = function (dict) {
    return dict.hasOwnProperty;
};
var errorAt = function (dict) {
    return dict.errorAt;
};
module.exports = {
    Index: Index, 
    errorAt: errorAt, 
    hasOwnProperty: hasOwnProperty, 
    hasProperty: hasProperty, 
    "!": $bang, 
    ix: ix, 
    index: index, 
    prop: prop, 
    indexString: indexString, 
    indexInt: indexInt
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Index/foreign.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Int":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Null/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Foreign = require("Data.Foreign");
var Data_Either = require("Data.Either");
var Null = function (x) {
    return x;
};
var runNull = function (_495) {
    return _495;
};
var readNull = function (f) {
    return function (value) {
        if (Data_Foreign.isNull(value)) {
            return Prelude.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
        };
        return Prelude["<$>"](Data_Either.functorEither)(function (_1800) {
            return Null(Data_Maybe.Just.create(_1800));
        })(f(value));
    };
};
module.exports = {
    Null: Null, 
    readNull: readNull, 
    runNull: runNull
};

},{"Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.NullOrUndefined/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Foreign = require("Data.Foreign");
var Data_Either = require("Data.Either");
var NullOrUndefined = function (x) {
    return x;
};
var runNullOrUndefined = function (_496) {
    return _496;
};
var readNullOrUndefined = function (f) {
    return function (value) {
        if (Data_Foreign.isNull(value) || Data_Foreign.isUndefined(value)) {
            return Prelude.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
        };
        return Prelude["<$>"](Data_Either.functorEither)(function (_1804) {
            return NullOrUndefined(Data_Maybe.Just.create(_1804));
        })(f(value));
    };
};
module.exports = {
    NullOrUndefined: NullOrUndefined, 
    readNullOrUndefined: readNullOrUndefined, 
    runNullOrUndefined: runNullOrUndefined
};

},{"Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Undefined/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Foreign = require("Data.Foreign");
var Data_Either = require("Data.Either");
var Undefined = function (x) {
    return x;
};
var runUndefined = function (_497) {
    return _497;
};
var readUndefined = function (f) {
    return function (value) {
        if (Data_Foreign.isUndefined(value)) {
            return Prelude.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
        };
        return Prelude["<$>"](Data_Either.functorEither)(function (_1808) {
            return Undefined(Data_Maybe.Just.create(_1808));
        })(f(value));
    };
};
module.exports = {
    Undefined: Undefined, 
    readUndefined: readUndefined, 
    runUndefined: runUndefined
};

},{"Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Foreign

// jshint maxparams: 3
exports.parseJSONImpl = function (left, right, str) {
  try {
    return right(JSON.parse(str));
  } catch (e) {
    return left(e.toString());
  }
};

// jshint maxparams: 1
exports.toForeign = function (value) {
  return value;
};

exports.unsafeFromForeign = function (value) {
  return value;
};

exports.typeOf = function (value) {
  return typeof value;
};

exports.tagOf = function (value) {
  return Object.prototype.toString.call(value).slice(8, -1);
};

exports.isNull = function (value) {
  return value === null;
};

exports.isUndefined = function (value) {
  return value === undefined;
};

exports.isArray = Array.isArray || function (value) {
  return Object.prototype.toString.call(value) === "[object Array]";
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Function = require("Data.Function");
var Data_Int = require("Data.Int");
var Data_String = require("Data.String");
var TypeMismatch = (function () {
    function TypeMismatch(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    TypeMismatch.create = function (value0) {
        return function (value1) {
            return new TypeMismatch(value0, value1);
        };
    };
    return TypeMismatch;
})();
var ErrorAtIndex = (function () {
    function ErrorAtIndex(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    ErrorAtIndex.create = function (value0) {
        return function (value1) {
            return new ErrorAtIndex(value0, value1);
        };
    };
    return ErrorAtIndex;
})();
var ErrorAtProperty = (function () {
    function ErrorAtProperty(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    ErrorAtProperty.create = function (value0) {
        return function (value1) {
            return new ErrorAtProperty(value0, value1);
        };
    };
    return ErrorAtProperty;
})();
var JSONError = (function () {
    function JSONError(value0) {
        this.value0 = value0;
    };
    JSONError.create = function (value0) {
        return new JSONError(value0);
    };
    return JSONError;
})();
var unsafeReadTagged = function (tag) {
    return function (value) {
        if (Prelude["=="](Prelude.eqString)($foreign.tagOf(value))(tag)) {
            return Prelude.pure(Data_Either.applicativeEither)($foreign.unsafeFromForeign(value));
        };
        return new Data_Either.Left(new TypeMismatch(tag, $foreign.tagOf(value)));
    };
};
var showForeignError = new Prelude.Show(function (_492) {
    if (_492 instanceof TypeMismatch) {
        return "Type mismatch: expected " + (_492.value0 + (", found " + _492.value1));
    };
    if (_492 instanceof ErrorAtIndex) {
        return "Error at array index " + (Prelude.show(Prelude.showInt)(_492.value0) + (": " + Prelude.show(showForeignError)(_492.value1)));
    };
    if (_492 instanceof ErrorAtProperty) {
        return "Error at property " + (Prelude.show(Prelude.showString)(_492.value0) + (": " + Prelude.show(showForeignError)(_492.value1)));
    };
    if (_492 instanceof JSONError) {
        return "JSON error: " + _492.value0;
    };
    throw new Error("Failed pattern match: " + [ _492.constructor.name ]);
});
var readString = unsafeReadTagged("String");
var readNumber = unsafeReadTagged("Number");
var readInt = function (value) {
    var error = Data_Either.Left.create(new TypeMismatch("Int", $foreign.tagOf(value)));
    var fromNumber = function (_1794) {
        return Data_Maybe.maybe(error)(Prelude.pure(Data_Either.applicativeEither))(Data_Int.fromNumber(_1794));
    };
    return Data_Either.either(Prelude["const"](error))(fromNumber)(readNumber(value));
};
var readChar = function (value) {
    var error = Data_Either.Left.create(new TypeMismatch("Char", $foreign.tagOf(value)));
    var fromString = function (_1795) {
        return Data_Maybe.maybe(error)(Prelude.pure(Data_Either.applicativeEither))(Data_String.toChar(_1795));
    };
    return Data_Either.either(Prelude["const"](error))(fromString)(readString(value));
};
var readBoolean = unsafeReadTagged("Boolean");
var readArray = function (value) {
    if ($foreign.isArray(value)) {
        return Prelude.pure(Data_Either.applicativeEither)($foreign.unsafeFromForeign(value));
    };
    return new Data_Either.Left(new TypeMismatch("array", $foreign.tagOf(value)));
};
var parseJSON = function (json) {
    return $foreign.parseJSONImpl(function (_1796) {
        return Data_Either.Left.create(JSONError.create(_1796));
    }, Data_Either.Right.create, json);
};
var eqForeignError = new Prelude.Eq(function (_493) {
    return function (_494) {
        if (_493 instanceof TypeMismatch && _494 instanceof TypeMismatch) {
            return Prelude["=="](Prelude.eqString)(_493.value0)(_494.value0) && Prelude["=="](Prelude.eqString)(_493.value1)(_494.value1);
        };
        if (_493 instanceof ErrorAtIndex && _494 instanceof ErrorAtIndex) {
            return _493.value0 === _494.value0 && Prelude["=="](eqForeignError)(_493.value1)(_494.value1);
        };
        if (_493 instanceof ErrorAtProperty && _494 instanceof ErrorAtProperty) {
            return Prelude["=="](Prelude.eqString)(_493.value0)(_494.value0) && Prelude["=="](eqForeignError)(_493.value1)(_494.value1);
        };
        if (_493 instanceof JSONError && _494 instanceof JSONError) {
            return Prelude["=="](Prelude.eqString)(_493.value0)(_494.value0);
        };
        return false;
    };
});
module.exports = {
    TypeMismatch: TypeMismatch, 
    ErrorAtIndex: ErrorAtIndex, 
    ErrorAtProperty: ErrorAtProperty, 
    JSONError: JSONError, 
    readArray: readArray, 
    readInt: readInt, 
    readNumber: readNumber, 
    readBoolean: readBoolean, 
    readChar: readChar, 
    readString: readString, 
    unsafeReadTagged: unsafeReadTagged, 
    parseJSON: parseJSON, 
    showForeignError: showForeignError, 
    eqForeignError: eqForeignError, 
    isArray: $foreign.isArray, 
    isUndefined: $foreign.isUndefined, 
    isNull: $foreign.isNull, 
    tagOf: $foreign.tagOf, 
    typeOf: $foreign.typeOf, 
    unsafeFromForeign: $foreign.unsafeFromForeign, 
    toForeign: $foreign.toForeign
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/foreign.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Int":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.String":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Function

exports.mkFn0 = function (fn) {
  return function () {
    return fn({});
  };
};

exports.mkFn1 = function (fn) {
  return function (a) {
    return fn(a);
  };
};

exports.mkFn2 = function (fn) {
  /* jshint maxparams: 2 */
  return function (a, b) {
    return fn(a)(b);
  };
};

exports.mkFn3 = function (fn) {
  /* jshint maxparams: 3 */
  return function (a, b, c) {
    return fn(a)(b)(c);
  };
};

exports.mkFn4 = function (fn) {
  /* jshint maxparams: 4 */
  return function (a, b, c, d) {
    return fn(a)(b)(c)(d);
  };
};

exports.mkFn5 = function (fn) {
  /* jshint maxparams: 5 */
  return function (a, b, c, d, e) {
    return fn(a)(b)(c)(d)(e);
  };
};

exports.mkFn6 = function (fn) {
  /* jshint maxparams: 6 */
  return function (a, b, c, d, e, f) {
    return fn(a)(b)(c)(d)(e)(f);
  };
};

exports.mkFn7 = function (fn) {
  /* jshint maxparams: 7 */
  return function (a, b, c, d, e, f, g) {
    return fn(a)(b)(c)(d)(e)(f)(g);
  };
};

exports.mkFn8 = function (fn) {
  /* jshint maxparams: 8 */
  return function (a, b, c, d, e, f, g, h) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h);
  };
};

exports.mkFn9 = function (fn) {
  /* jshint maxparams: 9 */
  return function (a, b, c, d, e, f, g, h, i) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i);
  };
};

exports.mkFn10 = function (fn) {
  /* jshint maxparams: 10 */
  return function (a, b, c, d, e, f, g, h, i, j) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)(j);
  };
};

exports.runFn0 = function (fn) {
  return fn();
};

exports.runFn1 = function (fn) {
  return function (a) {
    return fn(a);
  };
};

exports.runFn2 = function (fn) {
  return function (a) {
    return function (b) {
      return fn(a, b);
    };
  };
};

exports.runFn3 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return fn(a, b, c);
      };
    };
  };
};

exports.runFn4 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return fn(a, b, c, d);
        };
      };
    };
  };
};

exports.runFn5 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return fn(a, b, c, d, e);
          };
        };
      };
    };
  };
};

exports.runFn6 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return fn(a, b, c, d, e, f);
            };
          };
        };
      };
    };
  };
};

exports.runFn7 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return fn(a, b, c, d, e, f, g);
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn8 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return fn(a, b, c, d, e, f, g, h);
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn9 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return function (i) {
                    return fn(a, b, c, d, e, f, g, h, i);
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn10 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return function (i) {
                    return function (j) {
                      return fn(a, b, c, d, e, f, g, h, i, j);
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var on = function (f) {
    return function (g) {
        return function (x) {
            return function (y) {
                return f(g(x))(g(y));
            };
        };
    };
};
module.exports = {
    on: on, 
    runFn10: $foreign.runFn10, 
    runFn9: $foreign.runFn9, 
    runFn8: $foreign.runFn8, 
    runFn7: $foreign.runFn7, 
    runFn6: $foreign.runFn6, 
    runFn5: $foreign.runFn5, 
    runFn4: $foreign.runFn4, 
    runFn3: $foreign.runFn3, 
    runFn2: $foreign.runFn2, 
    runFn1: $foreign.runFn1, 
    runFn0: $foreign.runFn0, 
    mkFn10: $foreign.mkFn10, 
    mkFn9: $foreign.mkFn9, 
    mkFn8: $foreign.mkFn8, 
    mkFn7: $foreign.mkFn7, 
    mkFn6: $foreign.mkFn6, 
    mkFn5: $foreign.mkFn5, 
    mkFn4: $foreign.mkFn4, 
    mkFn3: $foreign.mkFn3, 
    mkFn2: $foreign.mkFn2, 
    mkFn1: $foreign.mkFn1, 
    mkFn0: $foreign.mkFn0
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/foreign.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Contravariant/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Contravariant = function (cmap) {
    this.cmap = cmap;
};
var cmap = function (dict) {
    return dict.cmap;
};
var $greater$dollar$less = function (__dict_Contravariant_0) {
    return cmap(__dict_Contravariant_0);
};
var $greater$hash$less = function (__dict_Contravariant_1) {
    return function (x) {
        return function (f) {
            return $greater$dollar$less(__dict_Contravariant_1)(f)(x);
        };
    };
};
module.exports = {
    Contravariant: Contravariant, 
    ">#<": $greater$hash$less, 
    ">$<": $greater$dollar$less, 
    cmap: cmap
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Invariant = function (imap) {
    this.imap = imap;
};
var imapF = function (__dict_Functor_0) {
    return function (_1223) {
        return Prelude["const"](Prelude.map(__dict_Functor_0)(_1223));
    };
};
var invariantArray = new Invariant(imapF(Prelude.functorArray));
var invariantFn = new Invariant(imapF(Prelude.functorFn));
var imap = function (dict) {
    return dict.imap;
};
module.exports = {
    Invariant: Invariant, 
    imapF: imapF, 
    imap: imap, 
    invariantFn: invariantFn, 
    invariantArray: invariantArray
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var $less$dollar = function (__dict_Functor_0) {
    return function (x) {
        return function (f) {
            return Prelude["<$>"](__dict_Functor_0)(Prelude["const"](x))(f);
        };
    };
};
var $dollar$greater = function (__dict_Functor_1) {
    return function (f) {
        return function (x) {
            return Prelude["<$>"](__dict_Functor_1)(Prelude["const"](x))(f);
        };
    };
};
module.exports = {
    "$>": $dollar$greater, 
    "<$": $less$dollar
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Identity/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Foldable = require("Data.Foldable");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Monoid = require("Data.Monoid");
var Data_Traversable = require("Data.Traversable");
var Identity = function (x) {
    return x;
};
var showIdentity = function (__dict_Show_2) {
    return new Prelude.Show(function (_521) {
        return "Identity (" + (Prelude.show(__dict_Show_2)(_521) + ")");
    });
};
var semiringIdentity = function (__dict_Semiring_3) {
    return new Prelude.Semiring(function (_511) {
        return function (_512) {
            return Prelude["+"](__dict_Semiring_3)(_511)(_512);
        };
    }, function (_513) {
        return function (_514) {
            return Prelude["*"](__dict_Semiring_3)(_513)(_514);
        };
    }, Prelude.one(__dict_Semiring_3), Prelude.zero(__dict_Semiring_3));
};
var semigroupIdenity = function (__dict_Semigroup_4) {
    return new Prelude.Semigroup(function (_509) {
        return function (_510) {
            return Prelude["<>"](__dict_Semigroup_4)(_509)(_510);
        };
    });
};
var runIdentity = function (_499) {
    return _499;
};
var ringIdentity = function (__dict_Ring_5) {
    return new Prelude.Ring(function () {
        return semiringIdentity(__dict_Ring_5["__superclass_Prelude.Semiring_0"]());
    }, function (_519) {
        return function (_520) {
            return Prelude["-"](__dict_Ring_5)(_519)(_520);
        };
    });
};
var monoidIdentity = function (__dict_Monoid_8) {
    return new Data_Monoid.Monoid(function () {
        return semigroupIdenity(__dict_Monoid_8["__superclass_Prelude.Semigroup_0"]());
    }, Data_Monoid.mempty(__dict_Monoid_8));
};
var moduloSemiringIdentity = function (__dict_ModuloSemiring_9) {
    return new Prelude.ModuloSemiring(function () {
        return semiringIdentity(__dict_ModuloSemiring_9["__superclass_Prelude.Semiring_0"]());
    }, function (_517) {
        return function (_518) {
            return Prelude["/"](__dict_ModuloSemiring_9)(_517)(_518);
        };
    }, function (_515) {
        return function (_516) {
            return Prelude.mod(__dict_ModuloSemiring_9)(_515)(_516);
        };
    });
};
var functorIdentity = new Prelude.Functor(function (f) {
    return function (_522) {
        return f(_522);
    };
});
var invariantIdentity = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorIdentity));
var foldableIdentity = new Data_Foldable.Foldable(function (__dict_Monoid_10) {
    return function (f) {
        return function (_529) {
            return f(_529);
        };
    };
}, function (f) {
    return function (z) {
        return function (_528) {
            return f(z)(_528);
        };
    };
}, function (f) {
    return function (z) {
        return function (_527) {
            return f(_527)(z);
        };
    };
});
var traversableIdentity = new Data_Traversable.Traversable(function () {
    return foldableIdentity;
}, function () {
    return functorIdentity;
}, function (__dict_Applicative_1) {
    return function (_531) {
        return Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Identity)(_531);
    };
}, function (__dict_Applicative_0) {
    return function (f) {
        return function (_530) {
            return Prelude["<$>"]((__dict_Applicative_0["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Identity)(f(_530));
        };
    };
});
var extendIdentity = new Control_Extend.Extend(function () {
    return functorIdentity;
}, function (f) {
    return function (m) {
        return f(m);
    };
});
var eqIdentity = function (__dict_Eq_11) {
    return new Prelude.Eq(function (_500) {
        return function (_501) {
            return Prelude["=="](__dict_Eq_11)(_500)(_501);
        };
    });
};
var ordIdentity = function (__dict_Ord_6) {
    return new Prelude.Ord(function () {
        return eqIdentity(__dict_Ord_6["__superclass_Prelude.Eq_0"]());
    }, function (_502) {
        return function (_503) {
            return Prelude.compare(__dict_Ord_6)(_502)(_503);
        };
    });
};
var divisionRingIdentity = function (__dict_DivisionRing_12) {
    return new Prelude.DivisionRing(function () {
        return moduloSemiringIdentity(__dict_DivisionRing_12["__superclass_Prelude.ModuloSemiring_1"]());
    }, function () {
        return ringIdentity(__dict_DivisionRing_12["__superclass_Prelude.Ring_0"]());
    });
};
var numIdentity = function (__dict_Num_7) {
    return new Prelude.Num(function () {
        return divisionRingIdentity(__dict_Num_7["__superclass_Prelude.DivisionRing_0"]());
    });
};
var comonadIdentity = new Control_Comonad.Comonad(function () {
    return extendIdentity;
}, function (_526) {
    return _526;
});
var boundedIdentity = function (__dict_Bounded_14) {
    return new Prelude.Bounded(Prelude.bottom(__dict_Bounded_14), Prelude.top(__dict_Bounded_14));
};
var boundedOrdIdentity = function (__dict_BoundedOrd_13) {
    return new Prelude.BoundedOrd(function () {
        return boundedIdentity(__dict_BoundedOrd_13["__superclass_Prelude.Bounded_0"]());
    }, function () {
        return ordIdentity(__dict_BoundedOrd_13["__superclass_Prelude.Ord_1"]());
    });
};
var booleanAlgebraIdentity = function (__dict_BooleanAlgebra_15) {
    return new Prelude.BooleanAlgebra(function () {
        return boundedIdentity(__dict_BooleanAlgebra_15["__superclass_Prelude.Bounded_0"]());
    }, function (_504) {
        return function (_505) {
            return Prelude.conj(__dict_BooleanAlgebra_15)(_504)(_505);
        };
    }, function (_506) {
        return function (_507) {
            return Prelude.disj(__dict_BooleanAlgebra_15)(_506)(_507);
        };
    }, function (_508) {
        return Prelude.not(__dict_BooleanAlgebra_15)(_508);
    });
};
var applyIdentity = new Prelude.Apply(function () {
    return functorIdentity;
}, function (_523) {
    return function (_524) {
        return _523(_524);
    };
});
var bindIdentity = new Prelude.Bind(function () {
    return applyIdentity;
}, function (_525) {
    return function (f) {
        return f(_525);
    };
});
var applicativeIdentity = new Prelude.Applicative(function () {
    return applyIdentity;
}, Identity);
var monadIdentity = new Prelude.Monad(function () {
    return applicativeIdentity;
}, function () {
    return bindIdentity;
});
module.exports = {
    Identity: Identity, 
    runIdentity: runIdentity, 
    eqIdentity: eqIdentity, 
    ordIdentity: ordIdentity, 
    boundedIdentity: boundedIdentity, 
    boundedOrdIdentity: boundedOrdIdentity, 
    booleanAlgebraIdentity: booleanAlgebraIdentity, 
    semigroupIdenity: semigroupIdenity, 
    monoidIdentity: monoidIdentity, 
    semiringIdentity: semiringIdentity, 
    moduloSemiringIdentity: moduloSemiringIdentity, 
    ringIdentity: ringIdentity, 
    divisionRingIdentity: divisionRingIdentity, 
    numIdentity: numIdentity, 
    showIdentity: showIdentity, 
    functorIdentity: functorIdentity, 
    invariantIdentity: invariantIdentity, 
    applyIdentity: applyIdentity, 
    applicativeIdentity: applicativeIdentity, 
    bindIdentity: bindIdentity, 
    monadIdentity: monadIdentity, 
    extendIdentity: extendIdentity, 
    comonadIdentity: comonadIdentity, 
    foldableIdentity: foldableIdentity, 
    traversableIdentity: traversableIdentity
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int.Bits/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Int.Bits

exports.andImpl = function (n1) {
  return function (n2) {
    /* jshint bitwise: false */
    return n1 & n2;
  };
};

exports.orImpl = function (n1) {
  return function (n2) {
    /* jshint bitwise: false */
    return n1 | n2;
  };
};

exports.xorImpl = function (n1) {
  return function (n2) {
    /* jshint bitwise: false */
    return n1 ^ n2;
  };
};

exports.shl = function (n1) {
  return function (n2) {
    /* jshint bitwise: false */
    return n1 << n2;
  };
};

exports.shr = function (n1) {
  return function (n2) {
    /* jshint bitwise: false */
    return n1 >> n2;
  };
};

exports.zshr = function (n1) {
  return function (n2) {
    /* jshint bitwise: false */
    return n1 >>> n2;
  };
};

exports.complement = function (n) {
  /* jshint bitwise: false */
  return ~n;
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int.Bits/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var $dot$bar$dot = $foreign.orImpl;
var $dot$up$dot = $foreign.xorImpl;
var $dot$amp$dot = $foreign.andImpl;
module.exports = {
    ".^.": $dot$up$dot, 
    ".|.": $dot$bar$dot, 
    ".&.": $dot$amp$dot, 
    complement: $foreign.complement, 
    zshr: $foreign.zshr, 
    shr: $foreign.shr, 
    shl: $foreign.shl
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int.Bits/foreign.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Int

exports.fromNumberImpl = function (just) {
  return function (nothing) {
    return function (n) {
      /* jshint bitwise: false */
      return (n | 0) === n ? just(n) : nothing;
    };
  };
};

exports.toNumber = function (n) {
  return n;
};

exports.fromStringImpl = function (just) {
  return function (nothing) {
    return function (s) {
      /* jshint bitwise: false */
      var i = parseFloat(s);
      return (i | 0) === i ? just(i) : nothing;
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Int_Bits = require("Data.Int.Bits");
var Data_Maybe = require("Data.Maybe");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var $$Math = require("Math");
var odd = function (x) {
    return (x & 1) !== 0;
};
var fromString = $foreign.fromStringImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var fromNumber = $foreign.fromNumberImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var unsafeClamp = function (x) {
    if (x >= $foreign.toNumber(Prelude.top(Prelude.boundedInt))) {
        return Prelude.top(Prelude.boundedInt);
    };
    if (x <= $foreign.toNumber(Prelude.bottom(Prelude.boundedInt))) {
        return Prelude.bottom(Prelude.boundedInt);
    };
    if (Prelude.otherwise) {
        return Data_Maybe_Unsafe.fromJust(fromNumber(x));
    };
    throw new Error("Failed pattern match at Data.Int line 48, column 1 - line 49, column 1: " + [ x.constructor.name ]);
};
var round = function (_1600) {
    return unsafeClamp($$Math.round(_1600));
};
var floor = function (_1601) {
    return unsafeClamp($$Math.floor(_1601));
};
var even = function (x) {
    return (x & 1) === 0;
};
var ceil = function (_1602) {
    return unsafeClamp($$Math.ceil(_1602));
};
module.exports = {
    odd: odd, 
    even: even, 
    fromString: fromString, 
    round: round, 
    floor: floor, 
    ceil: ceil, 
    fromNumber: fromNumber, 
    toNumber: $foreign.toNumber
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/foreign.js","Data.Int.Bits":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int.Bits/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/index.js","Math":"/home/greg/haskell/snooker-statistics/frontend-new/output/Math/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Lazy/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Lazy

exports.defer = function () {

  function Defer (thunk) {
    if (this instanceof Defer) {
      this.thunk = thunk;
      return this;
    } else {
      return new Defer(thunk);
    }
  }

  Defer.prototype.force = function () {
    var value = this.thunk();
    delete this.thunk;
    this.force = function () {
      return value;
    };
    return value;
  };

  return Defer;

}();

exports.force = function (l) {
  return l.force();
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Lazy/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Monoid = require("Data.Monoid");
var Control_Lazy = require("Control.Lazy");
var showLazy = function (__dict_Show_0) {
    return new Prelude.Show(function (x) {
        return "Lazy " + Prelude.show(__dict_Show_0)($foreign.force(x));
    });
};
var semiringLazy = function (__dict_Semiring_1) {
    return new Prelude.Semiring(function (a) {
        return function (b) {
            return $foreign.defer(function (_269) {
                return Prelude["+"](__dict_Semiring_1)($foreign.force(a))($foreign.force(b));
            });
        };
    }, function (a) {
        return function (b) {
            return $foreign.defer(function (_271) {
                return Prelude["*"](__dict_Semiring_1)($foreign.force(a))($foreign.force(b));
            });
        };
    }, $foreign.defer(function (_272) {
        return Prelude.one(__dict_Semiring_1);
    }), $foreign.defer(function (_270) {
        return Prelude.zero(__dict_Semiring_1);
    }));
};
var semigroupLazy = function (__dict_Semigroup_2) {
    return new Prelude.Semigroup(function (a) {
        return function (b) {
            return $foreign.defer(function (_278) {
                return Prelude["<>"](__dict_Semigroup_2)($foreign.force(a))($foreign.force(b));
            });
        };
    });
};
var ringLazy = function (__dict_Ring_3) {
    return new Prelude.Ring(function () {
        return semiringLazy(__dict_Ring_3["__superclass_Prelude.Semiring_0"]());
    }, function (a) {
        return function (b) {
            return $foreign.defer(function (_273) {
                return Prelude["-"](__dict_Ring_3)($foreign.force(a))($foreign.force(b));
            });
        };
    });
};
var monoidLazy = function (__dict_Monoid_6) {
    return new Data_Monoid.Monoid(function () {
        return semigroupLazy(__dict_Monoid_6["__superclass_Prelude.Semigroup_0"]());
    }, $foreign.defer(function (_279) {
        return Data_Monoid.mempty(__dict_Monoid_6);
    }));
};
var moduloSemiringLazy = function (__dict_ModuloSemiring_7) {
    return new Prelude.ModuloSemiring(function () {
        return semiringLazy(__dict_ModuloSemiring_7["__superclass_Prelude.Semiring_0"]());
    }, function (a) {
        return function (b) {
            return $foreign.defer(function (_274) {
                return Prelude["/"](__dict_ModuloSemiring_7)($foreign.force(a))($foreign.force(b));
            });
        };
    }, function (a) {
        return function (b) {
            return $foreign.defer(function (_275) {
                return Prelude.mod(__dict_ModuloSemiring_7)($foreign.force(a))($foreign.force(b));
            });
        };
    });
};
var lazyLazy = new Control_Lazy.Lazy(function (f) {
    return $foreign.defer(function (_285) {
        return $foreign.force(f(Prelude.unit));
    });
});
var functorLazy = new Prelude.Functor(function (f) {
    return function (l) {
        return $foreign.defer(function (_280) {
            return f($foreign.force(l));
        });
    };
});
var extendLazy = new Control_Extend.Extend(function () {
    return functorLazy;
}, function (f) {
    return function (x) {
        return $foreign.defer(function (_284) {
            return f(x);
        });
    };
});
var eqLazy = function (__dict_Eq_8) {
    return new Prelude.Eq(function (x) {
        return function (y) {
            return Prelude["=="](__dict_Eq_8)($foreign.force(x))($foreign.force(y));
        };
    });
};
var ordLazy = function (__dict_Ord_4) {
    return new Prelude.Ord(function () {
        return eqLazy(__dict_Ord_4["__superclass_Prelude.Eq_0"]());
    }, function (x) {
        return function (y) {
            return Prelude.compare(__dict_Ord_4)($foreign.force(x))($foreign.force(y));
        };
    });
};
var divisionRingLazy = function (__dict_DivisionRing_9) {
    return new Prelude.DivisionRing(function () {
        return moduloSemiringLazy(__dict_DivisionRing_9["__superclass_Prelude.ModuloSemiring_1"]());
    }, function () {
        return ringLazy(__dict_DivisionRing_9["__superclass_Prelude.Ring_0"]());
    });
};
var numLazy = function (__dict_Num_5) {
    return new Prelude.Num(function () {
        return divisionRingLazy(__dict_Num_5["__superclass_Prelude.DivisionRing_0"]());
    });
};
var comonadLazy = new Control_Comonad.Comonad(function () {
    return extendLazy;
}, $foreign.force);
var boundedLazy = function (__dict_Bounded_11) {
    return new Prelude.Bounded($foreign.defer(function (_277) {
        return Prelude.bottom(__dict_Bounded_11);
    }), $foreign.defer(function (_276) {
        return Prelude.top(__dict_Bounded_11);
    }));
};
var boundedOrdLazy = function (__dict_BoundedOrd_10) {
    return new Prelude.BoundedOrd(function () {
        return boundedLazy(__dict_BoundedOrd_10["__superclass_Prelude.Bounded_0"]());
    }, function () {
        return ordLazy(__dict_BoundedOrd_10["__superclass_Prelude.Ord_1"]());
    });
};
var applyLazy = new Prelude.Apply(function () {
    return functorLazy;
}, function (f) {
    return function (x) {
        return $foreign.defer(function (_281) {
            return $foreign.force(f)($foreign.force(x));
        });
    };
});
var bindLazy = new Prelude.Bind(function () {
    return applyLazy;
}, function (l) {
    return function (f) {
        return $foreign.defer(function (_283) {
            return $foreign.force(f($foreign.force(l)));
        });
    };
});
var booleanAlgebraLazy = function (__dict_BooleanAlgebra_12) {
    return new Prelude.BooleanAlgebra(function () {
        return boundedLazy(__dict_BooleanAlgebra_12["__superclass_Prelude.Bounded_0"]());
    }, function (a) {
        return function (b) {
            return Prelude["<*>"](applyLazy)(Prelude["<$>"](functorLazy)(Prelude.conj(__dict_BooleanAlgebra_12))(a))(b);
        };
    }, function (a) {
        return function (b) {
            return Prelude["<*>"](applyLazy)(Prelude["<$>"](functorLazy)(Prelude.disj(__dict_BooleanAlgebra_12))(a))(b);
        };
    }, function (a) {
        return Prelude["<$>"](functorLazy)(Prelude.not(__dict_BooleanAlgebra_12))(a);
    });
};
var applicativeLazy = new Prelude.Applicative(function () {
    return applyLazy;
}, function (a) {
    return $foreign.defer(function (_282) {
        return a;
    });
});
var monadLazy = new Prelude.Monad(function () {
    return applicativeLazy;
}, function () {
    return bindLazy;
});
module.exports = {
    semiringLazy: semiringLazy, 
    ringLazy: ringLazy, 
    moduloSemiringLazy: moduloSemiringLazy, 
    divisionRingLazy: divisionRingLazy, 
    numLazy: numLazy, 
    eqLazy: eqLazy, 
    ordLazy: ordLazy, 
    boundedLazy: boundedLazy, 
    boundedOrdLazy: boundedOrdLazy, 
    semigroupLazy: semigroupLazy, 
    monoidLazy: monoidLazy, 
    booleanAlgebraLazy: booleanAlgebraLazy, 
    functorLazy: functorLazy, 
    applyLazy: applyLazy, 
    applicativeLazy: applicativeLazy, 
    bindLazy: bindLazy, 
    monadLazy: monadLazy, 
    extendLazy: extendLazy, 
    comonadLazy: comonadLazy, 
    showLazy: showLazy, 
    lazyLazy: lazyLazy, 
    force: $foreign.force, 
    defer: $foreign.defer
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Lazy/foreign.js","Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Control.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.List/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Data_Unfoldable = require("Data.Unfoldable");
var Prelude = require("Prelude");
var Data_Foldable = require("Data.Foldable");
var Control_Lazy = require("Control.Lazy");
var Control_Alt = require("Control.Alt");
var Data_Traversable = require("Data.Traversable");
var Data_Monoid = require("Data.Monoid");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");
var Nil = (function () {
    function Nil() {

    };
    Nil.value = new Nil();
    return Nil;
})();
var Cons = (function () {
    function Cons(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Cons.create = function (value0) {
        return function (value1) {
            return new Cons(value0, value1);
        };
    };
    return Cons;
})();
var $colon = Cons.create;
var zipWith = function (f) {
    return function (_207) {
        return function (_208) {
            if (_207 instanceof Nil) {
                return Nil.value;
            };
            if (_208 instanceof Nil) {
                return Nil.value;
            };
            if (_207 instanceof Cons && _208 instanceof Cons) {
                return new Cons(f(_207.value0)(_208.value0), zipWith(f)(_207.value1)(_208.value1));
            };
            throw new Error("Failed pattern match: " + [ f.constructor.name, _207.constructor.name, _208.constructor.name ]);
        };
    };
};
var zip = zipWith(Data_Tuple.Tuple.create);
var updateAt = function (_193) {
    return function (x) {
        return function (_194) {
            if (_193 === 0 && _194 instanceof Cons) {
                return new Data_Maybe.Just(new Cons(x, _194.value1));
            };
            if (_194 instanceof Cons) {
                return Prelude["<$>"](Data_Maybe.functorMaybe)(Cons.create(_194.value0))(updateAt(_193 - 1)(x)(_194.value1));
            };
            return Data_Maybe.Nothing.value;
        };
    };
};
var unfoldableList = new Data_Unfoldable.Unfoldable(function (f) {
    return function (b) {
        var go = function (_234) {
            if (_234 instanceof Data_Maybe.Nothing) {
                return Nil.value;
            };
            if (_234 instanceof Data_Maybe.Just) {
                return new Cons(_234.value0.value0, go(f(_234.value0.value1)));
            };
            throw new Error("Failed pattern match at Data.List line 720, column 1 - line 726, column 1: " + [ _234.constructor.name ]);
        };
        return go(f(b));
    };
});
var uncons = function (_186) {
    if (_186 instanceof Nil) {
        return Data_Maybe.Nothing.value;
    };
    if (_186 instanceof Cons) {
        return new Data_Maybe.Just({
            head: _186.value0, 
            tail: _186.value1
        });
    };
    throw new Error("Failed pattern match at Data.List line 264, column 1 - line 265, column 1: " + [ _186.constructor.name ]);
};
var toList = function (__dict_Foldable_3) {
    return Data_Foldable.foldr(__dict_Foldable_3)(Cons.create)(Nil.value);
};
var tail = function (_184) {
    if (_184 instanceof Nil) {
        return Data_Maybe.Nothing.value;
    };
    if (_184 instanceof Cons) {
        return new Data_Maybe.Just(_184.value1);
    };
    throw new Error("Failed pattern match at Data.List line 248, column 1 - line 249, column 1: " + [ _184.constructor.name ]);
};
var span = function (p) {
    return function (_201) {
        if (_201 instanceof Cons && p(_201.value0)) {
            var _542 = span(p)(_201.value1);
            return {
                init: new Cons(_201.value0, _542.init), 
                rest: _542.rest
            };
        };
        return {
            init: Nil.value, 
            rest: _201
        };
    };
};
var singleton = function (a) {
    return new Cons(a, Nil.value);
};
var sortBy = function (cmp) {
    var merge = function (_219) {
        return function (_220) {
            if (_219 instanceof Cons && _220 instanceof Cons) {
                if (Prelude["=="](Prelude.eqOrdering)(cmp(_219.value0)(_220.value0))(Prelude.GT.value)) {
                    return new Cons(_220.value0, merge(_219)(_220.value1));
                };
                if (Prelude.otherwise) {
                    return new Cons(_219.value0, merge(_219.value1)(_220));
                };
            };
            if (_219 instanceof Nil) {
                return _220;
            };
            if (_220 instanceof Nil) {
                return _219;
            };
            throw new Error("Failed pattern match at Data.List line 438, column 1 - line 439, column 1: " + [ _219.constructor.name, _220.constructor.name ]);
        };
    };
    var mergePairs = function (_218) {
        if (_218 instanceof Cons && _218.value1 instanceof Cons) {
            return new Cons(merge(_218.value0)(_218.value1.value0), mergePairs(_218.value1.value1));
        };
        return _218;
    };
    var mergeAll = function (__copy__217) {
        var _217 = __copy__217;
        tco: while (true) {
            if (_217 instanceof Cons && _217.value1 instanceof Nil) {
                return _217.value0;
            };
            var __tco__217 = mergePairs(_217);
            _217 = __tco__217;
            continue tco;
        };
    };
    var sequences = function (_214) {
        if (_214 instanceof Cons && _214.value1 instanceof Cons) {
            if (Prelude["=="](Prelude.eqOrdering)(cmp(_214.value0)(_214.value1.value0))(Prelude.GT.value)) {
                return descending(_214.value1.value0)(singleton(_214.value0))(_214.value1.value1);
            };
            if (Prelude.otherwise) {
                return ascending(_214.value1.value0)(Cons.create(_214.value0))(_214.value1.value1);
            };
        };
        return singleton(_214);
    };
    var descending = function (__copy_a) {
        return function (__copy_as) {
            return function (__copy__215) {
                var a = __copy_a;
                var as = __copy_as;
                var _215 = __copy__215;
                tco: while (true) {
                    var a_1 = a;
                    var as_1 = as;
                    if (_215 instanceof Cons && Prelude["=="](Prelude.eqOrdering)(cmp(a_1)(_215.value0))(Prelude.GT.value)) {
                        var __tco_a = _215.value0;
                        var __tco_as = new Cons(a_1, as_1);
                        var __tco__215 = _215.value1;
                        a = __tco_a;
                        as = __tco_as;
                        _215 = __tco__215;
                        continue tco;
                    };
                    return new Cons(new Cons(a, as), sequences(_215));
                };
            };
        };
    };
    var ascending = function (a) {
        return function (as) {
            return function (_216) {
                if (_216 instanceof Cons && Prelude["/="](Prelude.eqOrdering)(cmp(a)(_216.value0))(Prelude.GT.value)) {
                    return ascending(_216.value0)(function (ys) {
                        return as(new Cons(a, ys));
                    })(_216.value1);
                };
                return new Cons(as(singleton(a)), sequences(_216));
            };
        };
    };
    return Prelude["<<<"](Prelude.semigroupoidFn)(mergeAll)(sequences);
};
var sort = function (__dict_Ord_4) {
    return function (xs) {
        return sortBy(Prelude.compare(__dict_Ord_4))(xs);
    };
};
var showList = function (__dict_Show_5) {
    return new Prelude.Show(function (_225) {
        if (_225 instanceof Nil) {
            return "Nil";
        };
        if (_225 instanceof Cons) {
            return "Cons (" + (Prelude.show(__dict_Show_5)(_225.value0) + (") (" + (Prelude.show(showList(__dict_Show_5))(_225.value1) + ")")));
        };
        throw new Error("Failed pattern match: " + [ _225.constructor.name ]);
    });
};
var semigroupList = new Prelude.Semigroup(function (_230) {
    return function (ys) {
        if (_230 instanceof Nil) {
            return ys;
        };
        if (_230 instanceof Cons) {
            return new Cons(_230.value0, Prelude["<>"](semigroupList)(_230.value1)(ys));
        };
        throw new Error("Failed pattern match: " + [ _230.constructor.name, ys.constructor.name ]);
    };
});
var reverse = (function () {
    var go = function (__copy_acc) {
        return function (__copy__211) {
            var acc = __copy_acc;
            var _211 = __copy__211;
            tco: while (true) {
                var acc_1 = acc;
                if (_211 instanceof Nil) {
                    return acc_1;
                };
                if (_211 instanceof Cons) {
                    var __tco_acc = new Cons(_211.value0, acc);
                    var __tco__211 = _211.value1;
                    acc = __tco_acc;
                    _211 = __tco__211;
                    continue tco;
                };
                throw new Error("Failed pattern match at Data.List line 362, column 1 - line 363, column 1: " + [ acc.constructor.name, _211.constructor.name ]);
            };
        };
    };
    return go(Nil.value);
})();
var snoc = function (xs) {
    return function (x) {
        return reverse(new Cons(x, reverse(xs)));
    };
};
var take = (function () {
    var go = function (__copy_acc) {
        return function (__copy__221) {
            return function (__copy__222) {
                var acc = __copy_acc;
                var _221 = __copy__221;
                var _222 = __copy__222;
                tco: while (true) {
                    var acc_1 = acc;
                    if (_221 === 0) {
                        return reverse(acc_1);
                    };
                    var acc_1 = acc;
                    if (_222 instanceof Nil) {
                        return reverse(acc_1);
                    };
                    if (_222 instanceof Cons) {
                        var __tco_acc = new Cons(_222.value0, acc);
                        var __tco__221 = _221 - 1;
                        var __tco__222 = _222.value1;
                        acc = __tco_acc;
                        _221 = __tco__221;
                        _222 = __tco__222;
                        continue tco;
                    };
                    throw new Error("Failed pattern match at Data.List line 484, column 1 - line 485, column 1: " + [ acc.constructor.name, _221.constructor.name, _222.constructor.name ]);
                };
            };
        };
    };
    return go(Nil.value);
})();
var takeWhile = function (p) {
    var go = function (__copy_acc) {
        return function (__copy__223) {
            var acc = __copy_acc;
            var _223 = __copy__223;
            tco: while (true) {
                var acc_1 = acc;
                if (_223 instanceof Cons && p(_223.value0)) {
                    var __tco_acc = new Cons(_223.value0, acc_1);
                    var __tco__223 = _223.value1;
                    acc = __tco_acc;
                    _223 = __tco__223;
                    continue tco;
                };
                return reverse(acc);
            };
        };
    };
    return go(Nil.value);
};
var replicateM = function (__dict_Monad_6) {
    return function (n) {
        return function (m) {
            if (n < 1) {
                return Prelude["return"](__dict_Monad_6["__superclass_Prelude.Applicative_0"]())(Nil.value);
            };
            if (Prelude.otherwise) {
                return Prelude.bind(__dict_Monad_6["__superclass_Prelude.Bind_1"]())(m)(function (_22) {
                    return Prelude.bind(__dict_Monad_6["__superclass_Prelude.Bind_1"]())(replicateM(__dict_Monad_6)(n - 1)(m))(function (_21) {
                        return Prelude["return"](__dict_Monad_6["__superclass_Prelude.Applicative_0"]())(new Cons(_22, _21));
                    });
                });
            };
            throw new Error("Failed pattern match: " + [ n.constructor.name, m.constructor.name ]);
        };
    };
};
var replicate = function (n) {
    return function (value) {
        var go = function (__copy_n_1) {
            return function (__copy_rest) {
                var n_1 = __copy_n_1;
                var rest = __copy_rest;
                tco: while (true) {
                    if (n_1 <= 0) {
                        return rest;
                    };
                    if (Prelude.otherwise) {
                        var __tco_n_1 = n_1 - 1;
                        var __tco_rest = new Cons(value, rest);
                        n_1 = __tco_n_1;
                        rest = __tco_rest;
                        continue tco;
                    };
                    throw new Error("Failed pattern match at Data.List line 145, column 1 - line 146, column 1: " + [ n_1.constructor.name, rest.constructor.name ]);
                };
            };
        };
        return go(n)(Nil.value);
    };
};
var range = function (start) {
    return function (end) {
        if (start === end) {
            return singleton(start);
        };
        if (Prelude.otherwise) {
            var go = function (__copy_s) {
                return function (__copy_e) {
                    return function (__copy_step) {
                        return function (__copy_rest) {
                            var s = __copy_s;
                            var e = __copy_e;
                            var step = __copy_step;
                            var rest = __copy_rest;
                            tco: while (true) {
                                if (s === e) {
                                    return new Cons(s, rest);
                                };
                                if (Prelude.otherwise) {
                                    var __tco_s = s + step | 0;
                                    var __tco_e = e;
                                    var __tco_step = step;
                                    var __tco_rest = new Cons(s, rest);
                                    s = __tco_s;
                                    e = __tco_e;
                                    step = __tco_step;
                                    rest = __tco_rest;
                                    continue tco;
                                };
                                throw new Error("Failed pattern match at Data.List line 137, column 1 - line 138, column 1: " + [ s.constructor.name, e.constructor.name, step.constructor.name, rest.constructor.name ]);
                            };
                        };
                    };
                };
            };
            return go(end)(start)((function () {
                var _608 = start > end;
                if (_608) {
                    return 1;
                };
                if (!_608) {
                    return -1;
                };
                throw new Error("Failed pattern match at Data.List line 137, column 1 - line 138, column 1: " + [ _608.constructor.name ]);
            })())(Nil.value);
        };
        throw new Error("Failed pattern match at Data.List line 137, column 1 - line 138, column 1: " + [ start.constructor.name, end.constructor.name ]);
    };
};
var $dot$dot = range;
var $$null = function (_180) {
    if (_180 instanceof Nil) {
        return true;
    };
    return false;
};
var monoidList = new Data_Monoid.Monoid(function () {
    return semigroupList;
}, Nil.value);
var mapMaybe = function (f) {
    var go = function (__copy_acc) {
        return function (__copy__213) {
            var acc = __copy_acc;
            var _213 = __copy__213;
            tco: while (true) {
                var acc_1 = acc;
                if (_213 instanceof Nil) {
                    return reverse(acc_1);
                };
                if (_213 instanceof Cons) {
                    var _612 = f(_213.value0);
                    if (_612 instanceof Data_Maybe.Nothing) {
                        var __tco_acc = acc;
                        var __tco__213 = _213.value1;
                        acc = __tco_acc;
                        _213 = __tco__213;
                        continue tco;
                    };
                    if (_612 instanceof Data_Maybe.Just) {
                        var __tco_acc = new Cons(_612.value0, acc);
                        var __tco__213 = _213.value1;
                        acc = __tco_acc;
                        _213 = __tco__213;
                        continue tco;
                    };
                    throw new Error("Failed pattern match at Data.List line 414, column 1 - line 415, column 1: " + [ _612.constructor.name ]);
                };
                throw new Error("Failed pattern match at Data.List line 414, column 1 - line 415, column 1: " + [ acc.constructor.name, _213.constructor.name ]);
            };
        };
    };
    return go(Nil.value);
};
var some = function (__dict_Alternative_8) {
    return function (__dict_Lazy_9) {
        return function (v) {
            return Prelude["<*>"]((__dict_Alternative_8["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())(Prelude["<$>"](((__dict_Alternative_8["__superclass_Control.Plus.Plus_1"]())["__superclass_Control.Alt.Alt_0"]())["__superclass_Prelude.Functor_0"]())(Cons.create)(v))(Control_Lazy.defer(__dict_Lazy_9)(function (_176) {
                return many(__dict_Alternative_8)(__dict_Lazy_9)(v);
            }));
        };
    };
};
var many = function (__dict_Alternative_10) {
    return function (__dict_Lazy_11) {
        return function (v) {
            return Control_Alt["<|>"]((__dict_Alternative_10["__superclass_Control.Plus.Plus_1"]())["__superclass_Control.Alt.Alt_0"]())(some(__dict_Alternative_10)(__dict_Lazy_11)(v))(Prelude.pure(__dict_Alternative_10["__superclass_Prelude.Applicative_0"]())(Nil.value));
        };
    };
};
var last = function (__copy__183) {
    var _183 = __copy__183;
    tco: while (true) {
        if (_183 instanceof Cons && _183.value1 instanceof Nil) {
            return new Data_Maybe.Just(_183.value0);
        };
        if (_183 instanceof Cons) {
            var __tco__183 = _183.value1;
            _183 = __tco__183;
            continue tco;
        };
        return Data_Maybe.Nothing.value;
    };
};
var insertBy = function (cmp) {
    return function (x) {
        return function (_181) {
            if (_181 instanceof Nil) {
                return new Cons(x, Nil.value);
            };
            if (_181 instanceof Cons) {
                var _625 = cmp(x)(_181.value0);
                if (_625 instanceof Prelude.GT) {
                    return new Cons(_181.value0, insertBy(cmp)(x)(_181.value1));
                };
                return new Cons(x, _181);
            };
            throw new Error("Failed pattern match: " + [ cmp.constructor.name, x.constructor.name, _181.constructor.name ]);
        };
    };
};
var insertAt = function (_189) {
    return function (x) {
        return function (_190) {
            if (_189 === 0) {
                return new Data_Maybe.Just(new Cons(x, _190));
            };
            if (_190 instanceof Cons) {
                return Prelude["<$>"](Data_Maybe.functorMaybe)(Cons.create(_190.value0))(insertAt(_189 - 1)(x)(_190.value1));
            };
            return Data_Maybe.Nothing.value;
        };
    };
};
var insert = function (__dict_Ord_12) {
    return insertBy(Prelude.compare(__dict_Ord_12));
};
var init = function (_185) {
    if (_185 instanceof Cons && _185.value1 instanceof Nil) {
        return new Data_Maybe.Just(Nil.value);
    };
    if (_185 instanceof Cons) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(Cons.create(_185.value0))(init(_185.value1));
    };
    return Data_Maybe.Nothing.value;
};
var index = function (__copy__187) {
    return function (__copy__188) {
        var _187 = __copy__187;
        var _188 = __copy__188;
        tco: while (true) {
            if (_187 instanceof Nil) {
                return Data_Maybe.Nothing.value;
            };
            if (_187 instanceof Cons && _188 === 0) {
                return new Data_Maybe.Just(_187.value0);
            };
            if (_187 instanceof Cons) {
                var __tco__187 = _187.value1;
                var __tco__188 = _188 - 1;
                _187 = __tco__187;
                _188 = __tco__188;
                continue tco;
            };
            throw new Error("Failed pattern match: " + [ _187.constructor.name, _188.constructor.name ]);
        };
    };
};
var $bang$bang = index;
var head = function (_182) {
    if (_182 instanceof Nil) {
        return Data_Maybe.Nothing.value;
    };
    if (_182 instanceof Cons) {
        return new Data_Maybe.Just(_182.value0);
    };
    throw new Error("Failed pattern match at Data.List line 233, column 1 - line 234, column 1: " + [ _182.constructor.name ]);
};
var groupBy = function (eq) {
    return function (_202) {
        if (_202 instanceof Nil) {
            return Nil.value;
        };
        if (_202 instanceof Cons) {
            var _649 = span(eq(_202.value0))(_202.value1);
            return new Cons(new Cons(_202.value0, _649.init), groupBy(eq)(_649.rest));
        };
        throw new Error("Failed pattern match: " + [ eq.constructor.name, _202.constructor.name ]);
    };
};
var group = function (__dict_Eq_13) {
    return groupBy(Prelude["=="](__dict_Eq_13));
};
var group$prime = function (__dict_Ord_14) {
    return Prelude["<<<"](Prelude.semigroupoidFn)(group(__dict_Ord_14["__superclass_Prelude.Eq_0"]()))(sort(__dict_Ord_14));
};
var functorList = new Prelude.Functor(function (f) {
    return function (_231) {
        if (_231 instanceof Nil) {
            return Nil.value;
        };
        if (_231 instanceof Cons) {
            return new Cons(f(_231.value0), Prelude["<$>"](functorList)(f)(_231.value1));
        };
        throw new Error("Failed pattern match: " + [ f.constructor.name, _231.constructor.name ]);
    };
});
var fromList = function (__dict_Unfoldable_15) {
    return Data_Unfoldable.unfoldr(__dict_Unfoldable_15)(function (xs) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(function (rec) {
            return new Data_Tuple.Tuple(rec.head, rec.tail);
        })(uncons(xs));
    });
};
var foldableList = new Data_Foldable.Foldable(function (__dict_Monoid_16) {
    return function (f) {
        return Data_Foldable.foldl(foldableList)(function (acc) {
            return Prelude["<<<"](Prelude.semigroupoidFn)(Prelude.append(__dict_Monoid_16["__superclass_Prelude.Semigroup_0"]())(acc))(f);
        })(Data_Monoid.mempty(__dict_Monoid_16));
    };
}, (function () {
    var go = function (__copy_o) {
        return function (__copy_b) {
            return function (__copy__233) {
                var o = __copy_o;
                var b = __copy_b;
                var _233 = __copy__233;
                tco: while (true) {
                    var b_1 = b;
                    if (_233 instanceof Nil) {
                        return b_1;
                    };
                    if (_233 instanceof Cons) {
                        var __tco_o = o;
                        var __tco_b = o(b)(_233.value0);
                        var __tco__233 = _233.value1;
                        o = __tco_o;
                        b = __tco_b;
                        _233 = __tco__233;
                        continue tco;
                    };
                    throw new Error("Failed pattern match: " + [ o.constructor.name, b.constructor.name, _233.constructor.name ]);
                };
            };
        };
    };
    return go;
})(), function (o) {
    return function (b) {
        return function (_232) {
            if (_232 instanceof Nil) {
                return b;
            };
            if (_232 instanceof Cons) {
                return o(_232.value0)(Data_Foldable.foldr(foldableList)(o)(b)(_232.value1));
            };
            throw new Error("Failed pattern match: " + [ o.constructor.name, b.constructor.name, _232.constructor.name ]);
        };
    };
});
var length = Data_Foldable.foldl(foldableList)(function (acc) {
    return function (_177) {
        return acc + 1 | 0;
    };
})(0);
var traversableList = new Data_Traversable.Traversable(function () {
    return foldableList;
}, function () {
    return functorList;
}, function (__dict_Applicative_2) {
    return function (_236) {
        if (_236 instanceof Nil) {
            return Prelude.pure(__dict_Applicative_2)(Nil.value);
        };
        if (_236 instanceof Cons) {
            return Prelude["<*>"](__dict_Applicative_2["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_2["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Cons.create)(_236.value0))(Data_Traversable.sequence(traversableList)(__dict_Applicative_2)(_236.value1));
        };
        throw new Error("Failed pattern match: " + [ _236.constructor.name ]);
    };
}, function (__dict_Applicative_1) {
    return function (f) {
        return function (_235) {
            if (_235 instanceof Nil) {
                return Prelude.pure(__dict_Applicative_1)(Nil.value);
            };
            if (_235 instanceof Cons) {
                return Prelude["<*>"](__dict_Applicative_1["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Cons.create)(f(_235.value0)))(Data_Traversable.traverse(traversableList)(__dict_Applicative_1)(f)(_235.value1));
            };
            throw new Error("Failed pattern match: " + [ f.constructor.name, _235.constructor.name ]);
        };
    };
});
var zipWithA = function (__dict_Applicative_0) {
    return function (f) {
        return function (xs) {
            return function (ys) {
                return Data_Traversable.sequence(traversableList)(__dict_Applicative_0)(zipWith(f)(xs)(ys));
            };
        };
    };
};
var unzip = Data_Foldable.foldr(foldableList)(function (_179) {
    return function (_178) {
        return new Data_Tuple.Tuple(new Cons(_179.value0, _178.value0), new Cons(_179.value1, _178.value1));
    };
})(new Data_Tuple.Tuple(Nil.value, Nil.value));
var foldM = function (__dict_Monad_17) {
    return function (f) {
        return function (a) {
            return function (_209) {
                if (_209 instanceof Nil) {
                    return Prelude["return"](__dict_Monad_17["__superclass_Prelude.Applicative_0"]())(a);
                };
                if (_209 instanceof Cons) {
                    return Prelude[">>="](__dict_Monad_17["__superclass_Prelude.Bind_1"]())(f(a)(_209.value0))(function (a$prime) {
                        return foldM(__dict_Monad_17)(f)(a$prime)(_209.value1);
                    });
                };
                throw new Error("Failed pattern match: " + [ f.constructor.name, a.constructor.name, _209.constructor.name ]);
            };
        };
    };
};
var findIndex = function (fn) {
    var go = function (__copy_n) {
        return function (__copy__210) {
            var n = __copy_n;
            var _210 = __copy__210;
            tco: while (true) {
                if (_210 instanceof Cons) {
                    if (fn(_210.value0)) {
                        return new Data_Maybe.Just(n);
                    };
                    if (Prelude.otherwise) {
                        var __tco_n = n + 1 | 0;
                        var __tco__210 = _210.value1;
                        n = __tco_n;
                        _210 = __tco__210;
                        continue tco;
                    };
                };
                if (_210 instanceof Nil) {
                    return Data_Maybe.Nothing.value;
                };
                throw new Error("Failed pattern match at Data.List line 295, column 1 - line 296, column 1: " + [ n.constructor.name, _210.constructor.name ]);
            };
        };
    };
    return go(0);
};
var findLastIndex = function (fn) {
    return function (xs) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(Prelude["-"](Prelude.ringInt)(length(xs) - 1))(findIndex(fn)(reverse(xs)));
    };
};
var filterM = function (__dict_Monad_18) {
    return function (p) {
        return function (_198) {
            if (_198 instanceof Nil) {
                return Prelude["return"](__dict_Monad_18["__superclass_Prelude.Applicative_0"]())(Nil.value);
            };
            if (_198 instanceof Cons) {
                return Prelude.bind(__dict_Monad_18["__superclass_Prelude.Bind_1"]())(p(_198.value0))(function (_24) {
                    return Prelude.bind(__dict_Monad_18["__superclass_Prelude.Bind_1"]())(filterM(__dict_Monad_18)(p)(_198.value1))(function (_23) {
                        return Prelude["return"](__dict_Monad_18["__superclass_Prelude.Applicative_0"]())((function () {
                            if (_24) {
                                return new Cons(_198.value0, _23);
                            };
                            if (!_24) {
                                return _23;
                            };
                            throw new Error("Failed pattern match: " + [ _24.constructor.name ]);
                        })());
                    });
                });
            };
            throw new Error("Failed pattern match: " + [ p.constructor.name, _198.constructor.name ]);
        };
    };
};
var filter = function (p) {
    var go = function (__copy_acc) {
        return function (__copy__212) {
            var acc = __copy_acc;
            var _212 = __copy__212;
            tco: while (true) {
                var acc_1 = acc;
                if (_212 instanceof Nil) {
                    return reverse(acc_1);
                };
                if (_212 instanceof Cons) {
                    if (p(_212.value0)) {
                        var __tco_acc = new Cons(_212.value0, acc);
                        var __tco__212 = _212.value1;
                        acc = __tco_acc;
                        _212 = __tco__212;
                        continue tco;
                    };
                    if (Prelude.otherwise) {
                        var __tco_acc = acc;
                        var __tco__212 = _212.value1;
                        acc = __tco_acc;
                        _212 = __tco__212;
                        continue tco;
                    };
                };
                throw new Error("Failed pattern match at Data.List line 385, column 1 - line 386, column 1: " + [ acc.constructor.name, _212.constructor.name ]);
            };
        };
    };
    return go(Nil.value);
};
var intersectBy = function (eq) {
    return function (_205) {
        return function (_206) {
            if (_205 instanceof Nil) {
                return Nil.value;
            };
            if (_206 instanceof Nil) {
                return Nil.value;
            };
            return filter(function (x) {
                return Data_Foldable.any(foldableList)(Prelude.booleanAlgebraBoolean)(eq(x))(_206);
            })(_205);
        };
    };
};
var intersect = function (__dict_Eq_19) {
    return intersectBy(Prelude["=="](__dict_Eq_19));
};
var nubBy = function ($eq$eq) {
    return function (_203) {
        if (_203 instanceof Nil) {
            return Nil.value;
        };
        if (_203 instanceof Cons) {
            return new Cons(_203.value0, nubBy($eq$eq)(filter(function (y) {
                return !$eq$eq(_203.value0)(y);
            })(_203.value1)));
        };
        throw new Error("Failed pattern match: " + [ $eq$eq.constructor.name, _203.constructor.name ]);
    };
};
var nub = function (__dict_Eq_20) {
    return nubBy(Prelude["=="](__dict_Eq_20));
};
var eqList = function (__dict_Eq_21) {
    return new Prelude.Eq(function (_226) {
        return function (_227) {
            if (_226 instanceof Nil && _227 instanceof Nil) {
                return true;
            };
            if (_226 instanceof Cons && _227 instanceof Cons) {
                return Prelude["=="](__dict_Eq_21)(_226.value0)(_227.value0) && Prelude["=="](eqList(__dict_Eq_21))(_226.value1)(_227.value1);
            };
            return false;
        };
    });
};
var ordList = function (__dict_Ord_7) {
    return new Prelude.Ord(function () {
        return eqList(__dict_Ord_7["__superclass_Prelude.Eq_0"]());
    }, function (_228) {
        return function (_229) {
            if (_228 instanceof Nil && _229 instanceof Nil) {
                return Prelude.EQ.value;
            };
            if (_228 instanceof Nil) {
                return Prelude.LT.value;
            };
            if (_229 instanceof Nil) {
                return Prelude.GT.value;
            };
            if (_228 instanceof Cons && _229 instanceof Cons) {
                var _717 = Prelude.compare(__dict_Ord_7)(_228.value0)(_229.value0);
                if (_717 instanceof Prelude.EQ) {
                    return Prelude.compare(ordList(__dict_Ord_7))(_228.value1)(_229.value1);
                };
                return _717;
            };
            throw new Error("Failed pattern match: " + [ _228.constructor.name, _229.constructor.name ]);
        };
    });
};
var elemLastIndex = function (__dict_Eq_22) {
    return function (x) {
        return findLastIndex(function (_9) {
            return Prelude["=="](__dict_Eq_22)(_9)(x);
        });
    };
};
var elemIndex = function (__dict_Eq_23) {
    return function (x) {
        return findIndex(function (_8) {
            return Prelude["=="](__dict_Eq_23)(_8)(x);
        });
    };
};
var dropWhile = function (p) {
    var go = function (__copy__224) {
        var _224 = __copy__224;
        tco: while (true) {
            if (_224 instanceof Cons && p(_224.value0)) {
                var __tco__224 = _224.value1;
                _224 = __tco__224;
                continue tco;
            };
            return _224;
        };
    };
    return go;
};
var drop = function (__copy__199) {
    return function (__copy__200) {
        var _199 = __copy__199;
        var _200 = __copy__200;
        tco: while (true) {
            if (_199 === 0) {
                return _200;
            };
            if (_200 instanceof Nil) {
                return Nil.value;
            };
            if (_200 instanceof Cons) {
                var __tco__199 = _199 - 1;
                var __tco__200 = _200.value1;
                _199 = __tco__199;
                _200 = __tco__200;
                continue tco;
            };
            throw new Error("Failed pattern match: " + [ _199.constructor.name, _200.constructor.name ]);
        };
    };
};
var slice = function (start) {
    return function (end) {
        return function (xs) {
            return take(end - start)(drop(start)(xs));
        };
    };
};
var deleteBy = function ($eq$eq) {
    return function (x) {
        return function (_204) {
            if (_204 instanceof Nil) {
                return Nil.value;
            };
            if (_204 instanceof Cons && $eq$eq(x)(_204.value0)) {
                return _204.value1;
            };
            if (_204 instanceof Cons) {
                return new Cons(_204.value0, deleteBy($eq$eq)(x)(_204.value1));
            };
            throw new Error("Failed pattern match: " + [ $eq$eq.constructor.name, x.constructor.name, _204.constructor.name ]);
        };
    };
};
var unionBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return Prelude["<>"](semigroupList)(xs)(Data_Foldable.foldl(foldableList)(Prelude.flip(deleteBy(eq)))(nubBy(eq)(ys))(xs));
        };
    };
};
var union = function (__dict_Eq_24) {
    return unionBy(Prelude["=="](__dict_Eq_24));
};
var deleteAt = function (_191) {
    return function (_192) {
        if (_191 === 0 && _192 instanceof Cons) {
            return new Data_Maybe.Just(_192.value1);
        };
        if (_192 instanceof Cons) {
            return Prelude["<$>"](Data_Maybe.functorMaybe)(Cons.create(_192.value0))(deleteAt(_191 - 1)(_192.value1));
        };
        return Data_Maybe.Nothing.value;
    };
};
var $$delete = function (__dict_Eq_25) {
    return deleteBy(Prelude["=="](__dict_Eq_25));
};
var $bslash$bslash = function (__dict_Eq_26) {
    return Data_Foldable.foldl(foldableList)(Prelude.flip($$delete(__dict_Eq_26)));
};
var concatMap = function (f) {
    return function (_197) {
        if (_197 instanceof Nil) {
            return Nil.value;
        };
        if (_197 instanceof Cons) {
            return Prelude["<>"](semigroupList)(f(_197.value0))(concatMap(f)(_197.value1));
        };
        throw new Error("Failed pattern match: " + [ f.constructor.name, _197.constructor.name ]);
    };
};
var catMaybes = mapMaybe(Prelude.id(Prelude.categoryFn));
var applyList = new Prelude.Apply(function () {
    return functorList;
}, function (_237) {
    return function (xs) {
        if (_237 instanceof Nil) {
            return Nil.value;
        };
        if (_237 instanceof Cons) {
            return Prelude["<>"](semigroupList)(Prelude["<$>"](functorList)(_237.value0)(xs))(Prelude["<*>"](applyList)(_237.value1)(xs));
        };
        throw new Error("Failed pattern match: " + [ _237.constructor.name, xs.constructor.name ]);
    };
});
var bindList = new Prelude.Bind(function () {
    return applyList;
}, Prelude.flip(concatMap));
var concat = function (_10) {
    return Prelude[">>="](bindList)(_10)(Prelude.id(Prelude.categoryFn));
};
var applicativeList = new Prelude.Applicative(function () {
    return applyList;
}, function (a) {
    return new Cons(a, Nil.value);
});
var monadList = new Prelude.Monad(function () {
    return applicativeList;
}, function () {
    return bindList;
});
var alterAt = function (_195) {
    return function (f) {
        return function (_196) {
            if (_195 === 0 && _196 instanceof Cons) {
                return Data_Maybe.Just.create((function () {
                    var _753 = f(_196.value0);
                    if (_753 instanceof Data_Maybe.Nothing) {
                        return _196.value1;
                    };
                    if (_753 instanceof Data_Maybe.Just) {
                        return new Cons(_753.value0, _196.value1);
                    };
                    throw new Error("Failed pattern match: " + [ _753.constructor.name ]);
                })());
            };
            if (_196 instanceof Cons) {
                return Prelude["<$>"](Data_Maybe.functorMaybe)(Cons.create(_196.value0))(alterAt(_195 - 1)(f)(_196.value1));
            };
            return Data_Maybe.Nothing.value;
        };
    };
};
var modifyAt = function (n) {
    return function (f) {
        return alterAt(n)(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(f));
    };
};
var altList = new Control_Alt.Alt(function () {
    return functorList;
}, Prelude.append(semigroupList));
var plusList = new Control_Plus.Plus(function () {
    return altList;
}, Nil.value);
var alternativeList = new Control_Alternative.Alternative(function () {
    return plusList;
}, function () {
    return applicativeList;
});
var monadPlusList = new Control_MonadPlus.MonadPlus(function () {
    return alternativeList;
}, function () {
    return monadList;
});
module.exports = {
    Nil: Nil, 
    Cons: Cons, 
    foldM: foldM, 
    unzip: unzip, 
    zip: zip, 
    zipWithA: zipWithA, 
    zipWith: zipWith, 
    intersectBy: intersectBy, 
    intersect: intersect, 
    "\\\\": $bslash$bslash, 
    deleteBy: deleteBy, 
    "delete": $$delete, 
    unionBy: unionBy, 
    union: union, 
    nubBy: nubBy, 
    nub: nub, 
    groupBy: groupBy, 
    "group'": group$prime, 
    group: group, 
    span: span, 
    dropWhile: dropWhile, 
    drop: drop, 
    takeWhile: takeWhile, 
    take: take, 
    slice: slice, 
    sortBy: sortBy, 
    sort: sort, 
    catMaybes: catMaybes, 
    mapMaybe: mapMaybe, 
    filterM: filterM, 
    filter: filter, 
    concatMap: concatMap, 
    concat: concat, 
    reverse: reverse, 
    alterAt: alterAt, 
    modifyAt: modifyAt, 
    updateAt: updateAt, 
    deleteAt: deleteAt, 
    insertAt: insertAt, 
    findLastIndex: findLastIndex, 
    findIndex: findIndex, 
    elemLastIndex: elemLastIndex, 
    elemIndex: elemIndex, 
    index: index, 
    "!!": $bang$bang, 
    uncons: uncons, 
    init: init, 
    tail: tail, 
    last: last, 
    head: head, 
    insertBy: insertBy, 
    insert: insert, 
    snoc: snoc, 
    ":": $colon, 
    length: length, 
    "null": $$null, 
    many: many, 
    some: some, 
    replicateM: replicateM, 
    replicate: replicate, 
    range: range, 
    "..": $dot$dot, 
    singleton: singleton, 
    toList: toList, 
    fromList: fromList, 
    showList: showList, 
    eqList: eqList, 
    ordList: ordList, 
    semigroupList: semigroupList, 
    monoidList: monoidList, 
    functorList: functorList, 
    foldableList: foldableList, 
    unfoldableList: unfoldableList, 
    traversableList: traversableList, 
    applyList: applyList, 
    applicativeList: applicativeList, 
    bindList: bindList, 
    monadList: monadList, 
    altList: altList, 
    plusList: plusList, 
    alternativeList: alternativeList, 
    monadPlusList: monadPlusList
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Data.Unfoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Unfoldable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Map/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_Foldable = require("Data.Foldable");
var Data_Tuple = require("Data.Tuple");
var Data_Traversable = require("Data.Traversable");
var Data_List = require("Data.List");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var Leaf = (function () {
    function Leaf() {

    };
    Leaf.value = new Leaf();
    return Leaf;
})();
var Two = (function () {
    function Two(value0, value1, value2, value3) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
    };
    Two.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return function (value3) {
                    return new Two(value0, value1, value2, value3);
                };
            };
        };
    };
    return Two;
})();
var Three = (function () {
    function Three(value0, value1, value2, value3, value4, value5, value6) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
        this.value4 = value4;
        this.value5 = value5;
        this.value6 = value6;
    };
    Three.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return function (value3) {
                    return function (value4) {
                        return function (value5) {
                            return function (value6) {
                                return new Three(value0, value1, value2, value3, value4, value5, value6);
                            };
                        };
                    };
                };
            };
        };
    };
    return Three;
})();
var TwoLeft = (function () {
    function TwoLeft(value0, value1, value2) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
    };
    TwoLeft.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return new TwoLeft(value0, value1, value2);
            };
        };
    };
    return TwoLeft;
})();
var TwoRight = (function () {
    function TwoRight(value0, value1, value2) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
    };
    TwoRight.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return new TwoRight(value0, value1, value2);
            };
        };
    };
    return TwoRight;
})();
var ThreeLeft = (function () {
    function ThreeLeft(value0, value1, value2, value3, value4, value5) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
        this.value4 = value4;
        this.value5 = value5;
    };
    ThreeLeft.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return function (value3) {
                    return function (value4) {
                        return function (value5) {
                            return new ThreeLeft(value0, value1, value2, value3, value4, value5);
                        };
                    };
                };
            };
        };
    };
    return ThreeLeft;
})();
var ThreeMiddle = (function () {
    function ThreeMiddle(value0, value1, value2, value3, value4, value5) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
        this.value4 = value4;
        this.value5 = value5;
    };
    ThreeMiddle.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return function (value3) {
                    return function (value4) {
                        return function (value5) {
                            return new ThreeMiddle(value0, value1, value2, value3, value4, value5);
                        };
                    };
                };
            };
        };
    };
    return ThreeMiddle;
})();
var ThreeRight = (function () {
    function ThreeRight(value0, value1, value2, value3, value4, value5) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
        this.value4 = value4;
        this.value5 = value5;
    };
    ThreeRight.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return function (value3) {
                    return function (value4) {
                        return function (value5) {
                            return new ThreeRight(value0, value1, value2, value3, value4, value5);
                        };
                    };
                };
            };
        };
    };
    return ThreeRight;
})();
var KickUp = (function () {
    function KickUp(value0, value1, value2, value3) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
    };
    KickUp.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return function (value3) {
                    return new KickUp(value0, value1, value2, value3);
                };
            };
        };
    };
    return KickUp;
})();
var values = function (_251) {
    if (_251 instanceof Leaf) {
        return Data_List.Nil.value;
    };
    if (_251 instanceof Two) {
        return Prelude["++"](Data_List.semigroupList)(values(_251.value0))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(_251.value2))(values(_251.value3)));
    };
    if (_251 instanceof Three) {
        return Prelude["++"](Data_List.semigroupList)(values(_251.value0))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(_251.value2))(Prelude["++"](Data_List.semigroupList)(values(_251.value3))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(_251.value5))(values(_251.value6)))));
    };
    throw new Error("Failed pattern match: " + [ _251.constructor.name ]);
};
var toList = function (_249) {
    if (_249 instanceof Leaf) {
        return Data_List.Nil.value;
    };
    if (_249 instanceof Two) {
        return Prelude["++"](Data_List.semigroupList)(toList(_249.value0))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(new Data_Tuple.Tuple(_249.value1, _249.value2)))(toList(_249.value3)));
    };
    if (_249 instanceof Three) {
        return Prelude["++"](Data_List.semigroupList)(toList(_249.value0))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(new Data_Tuple.Tuple(_249.value1, _249.value2)))(Prelude["++"](Data_List.semigroupList)(toList(_249.value3))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(new Data_Tuple.Tuple(_249.value4, _249.value5)))(toList(_249.value6)))));
    };
    throw new Error("Failed pattern match: " + [ _249.constructor.name ]);
};
var size = Prelude["<<<"](Prelude.semigroupoidFn)(Data_List.length)(values);
var singleton = function (k) {
    return function (v) {
        return new Two(Leaf.value, k, v, Leaf.value);
    };
};
var showTree = function (__dict_Show_0) {
    return function (__dict_Show_1) {
        return function (_244) {
            if (_244 instanceof Leaf) {
                return "Leaf";
            };
            if (_244 instanceof Two) {
                return "Two (" + (showTree(__dict_Show_0)(__dict_Show_1)(_244.value0) + (") (" + (Prelude.show(__dict_Show_0)(_244.value1) + (") (" + (Prelude.show(__dict_Show_1)(_244.value2) + (") (" + (showTree(__dict_Show_0)(__dict_Show_1)(_244.value3) + ")")))))));
            };
            if (_244 instanceof Three) {
                return "Three (" + (showTree(__dict_Show_0)(__dict_Show_1)(_244.value0) + (") (" + (Prelude.show(__dict_Show_0)(_244.value1) + (") (" + (Prelude.show(__dict_Show_1)(_244.value2) + (") (" + (showTree(__dict_Show_0)(__dict_Show_1)(_244.value3) + (") (" + (Prelude.show(__dict_Show_0)(_244.value4) + (") (" + (Prelude.show(__dict_Show_1)(_244.value5) + (") (" + (showTree(__dict_Show_0)(__dict_Show_1)(_244.value6) + ")")))))))))))));
            };
            throw new Error("Failed pattern match: " + [ _244.constructor.name ]);
        };
    };
};
var showMap = function (__dict_Show_2) {
    return function (__dict_Show_3) {
        return new Prelude.Show(function (m) {
            return "fromList " + Prelude.show(Data_List.showList(Data_Tuple.showTuple(__dict_Show_2)(__dict_Show_3)))(toList(m));
        });
    };
};
var lookup = function (__copy___dict_Ord_6) {
    return function (__copy_k) {
        return function (__copy__246) {
            var __dict_Ord_6 = __copy___dict_Ord_6;
            var k = __copy_k;
            var _246 = __copy__246;
            tco: while (true) {
                if (_246 instanceof Leaf) {
                    return Data_Maybe.Nothing.value;
                };
                var k_1 = k;
                if (_246 instanceof Two && Prelude["=="](__dict_Ord_6["__superclass_Prelude.Eq_0"]())(k_1)(_246.value1)) {
                    return new Data_Maybe.Just(_246.value2);
                };
                var k_1 = k;
                if (_246 instanceof Two && Prelude["<"](__dict_Ord_6)(k_1)(_246.value1)) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco__246 = _246.value0;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = k_1;
                    _246 = __tco__246;
                    continue tco;
                };
                var k_1 = k;
                if (_246 instanceof Two) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco__246 = _246.value3;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = k_1;
                    _246 = __tco__246;
                    continue tco;
                };
                var k_1 = k;
                if (_246 instanceof Three && Prelude["=="](__dict_Ord_6["__superclass_Prelude.Eq_0"]())(k_1)(_246.value1)) {
                    return new Data_Maybe.Just(_246.value2);
                };
                var k_1 = k;
                if (_246 instanceof Three && Prelude["=="](__dict_Ord_6["__superclass_Prelude.Eq_0"]())(k_1)(_246.value4)) {
                    return new Data_Maybe.Just(_246.value5);
                };
                var k_1 = k;
                if (_246 instanceof Three && Prelude["<"](__dict_Ord_6)(k_1)(_246.value1)) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco__246 = _246.value0;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = k_1;
                    _246 = __tco__246;
                    continue tco;
                };
                var k_1 = k;
                if (_246 instanceof Three && (Prelude["<"](__dict_Ord_6)(_246.value1)(k_1) && Prelude["<="](__dict_Ord_6)(k_1)(_246.value4))) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco__246 = _246.value3;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = k_1;
                    _246 = __tco__246;
                    continue tco;
                };
                if (_246 instanceof Three) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco_k = k;
                    var __tco__246 = _246.value6;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = __tco_k;
                    _246 = __tco__246;
                    continue tco;
                };
                throw new Error("Failed pattern match: " + [ k.constructor.name, _246.constructor.name ]);
            };
        };
    };
};
var member = function (__dict_Ord_7) {
    return function (k) {
        return function (m) {
            return Data_Maybe.isJust(lookup(__dict_Ord_7)(k)(m));
        };
    };
};
var keys = function (_250) {
    if (_250 instanceof Leaf) {
        return Data_List.Nil.value;
    };
    if (_250 instanceof Two) {
        return Prelude["++"](Data_List.semigroupList)(keys(_250.value0))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(_250.value1))(keys(_250.value3)));
    };
    if (_250 instanceof Three) {
        return Prelude["++"](Data_List.semigroupList)(keys(_250.value0))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(_250.value1))(Prelude["++"](Data_List.semigroupList)(keys(_250.value3))(Prelude["++"](Data_List.semigroupList)(Prelude.pure(Data_List.applicativeList)(_250.value4))(keys(_250.value6)))));
    };
    throw new Error("Failed pattern match: " + [ _250.constructor.name ]);
};
var isEmpty = function (_245) {
    if (_245 instanceof Leaf) {
        return true;
    };
    return false;
};
var functorMap = new Prelude.Functor(function (f) {
    return function (_252) {
        if (_252 instanceof Leaf) {
            return Leaf.value;
        };
        if (_252 instanceof Two) {
            return new Two(Prelude.map(functorMap)(f)(_252.value0), _252.value1, f(_252.value2), Prelude.map(functorMap)(f)(_252.value3));
        };
        if (_252 instanceof Three) {
            return new Three(Prelude.map(functorMap)(f)(_252.value0), _252.value1, f(_252.value2), Prelude.map(functorMap)(f)(_252.value3), _252.value4, f(_252.value5), Prelude.map(functorMap)(f)(_252.value6));
        };
        throw new Error("Failed pattern match: " + [ f.constructor.name, _252.constructor.name ]);
    };
});
var fromZipper = function (__copy___dict_Ord_8) {
    return function (__copy__247) {
        return function (__copy__248) {
            var __dict_Ord_8 = __copy___dict_Ord_8;
            var _247 = __copy__247;
            var _248 = __copy__248;
            tco: while (true) {
                if (_247 instanceof Data_List.Nil) {
                    return _248;
                };
                if (_247 instanceof Data_List.Cons && _247.value0 instanceof TwoLeft) {
                    var __tco___dict_Ord_8 = __dict_Ord_8;
                    var __tco__247 = _247.value1;
                    var __tco__248 = new Two(_248, _247.value0.value0, _247.value0.value1, _247.value0.value2);
                    __dict_Ord_8 = __tco___dict_Ord_8;
                    _247 = __tco__247;
                    _248 = __tco__248;
                    continue tco;
                };
                if (_247 instanceof Data_List.Cons && _247.value0 instanceof TwoRight) {
                    var __tco___dict_Ord_8 = __dict_Ord_8;
                    var __tco__247 = _247.value1;
                    var __tco__248 = new Two(_247.value0.value0, _247.value0.value1, _247.value0.value2, _248);
                    __dict_Ord_8 = __tco___dict_Ord_8;
                    _247 = __tco__247;
                    _248 = __tco__248;
                    continue tco;
                };
                if (_247 instanceof Data_List.Cons && _247.value0 instanceof ThreeLeft) {
                    var __tco___dict_Ord_8 = __dict_Ord_8;
                    var __tco__247 = _247.value1;
                    var __tco__248 = new Three(_248, _247.value0.value0, _247.value0.value1, _247.value0.value2, _247.value0.value3, _247.value0.value4, _247.value0.value5);
                    __dict_Ord_8 = __tco___dict_Ord_8;
                    _247 = __tco__247;
                    _248 = __tco__248;
                    continue tco;
                };
                if (_247 instanceof Data_List.Cons && _247.value0 instanceof ThreeMiddle) {
                    var __tco___dict_Ord_8 = __dict_Ord_8;
                    var __tco__247 = _247.value1;
                    var __tco__248 = new Three(_247.value0.value0, _247.value0.value1, _247.value0.value2, _248, _247.value0.value3, _247.value0.value4, _247.value0.value5);
                    __dict_Ord_8 = __tco___dict_Ord_8;
                    _247 = __tco__247;
                    _248 = __tco__248;
                    continue tco;
                };
                if (_247 instanceof Data_List.Cons && _247.value0 instanceof ThreeRight) {
                    var __tco___dict_Ord_8 = __dict_Ord_8;
                    var __tco__247 = _247.value1;
                    var __tco__248 = new Three(_247.value0.value0, _247.value0.value1, _247.value0.value2, _247.value0.value3, _247.value0.value4, _247.value0.value5, _248);
                    __dict_Ord_8 = __tco___dict_Ord_8;
                    _247 = __tco__247;
                    _248 = __tco__248;
                    continue tco;
                };
                throw new Error("Failed pattern match: " + [ _247.constructor.name, _248.constructor.name ]);
            };
        };
    };
};
var insert = function (__dict_Ord_9) {
    var up = function (__copy___dict_Ord_10) {
        return function (__copy__255) {
            return function (__copy__256) {
                var __dict_Ord_10 = __copy___dict_Ord_10;
                var _255 = __copy__255;
                var _256 = __copy__256;
                tco: while (true) {
                    if (_255 instanceof Data_List.Nil) {
                        return new Two(_256.value0, _256.value1, _256.value2, _256.value3);
                    };
                    if (_255 instanceof Data_List.Cons && _255.value0 instanceof TwoLeft) {
                        return fromZipper(__dict_Ord_10)(_255.value1)(new Three(_256.value0, _256.value1, _256.value2, _256.value3, _255.value0.value0, _255.value0.value1, _255.value0.value2));
                    };
                    if (_255 instanceof Data_List.Cons && _255.value0 instanceof TwoRight) {
                        return fromZipper(__dict_Ord_10)(_255.value1)(new Three(_255.value0.value0, _255.value0.value1, _255.value0.value2, _256.value0, _256.value1, _256.value2, _256.value3));
                    };
                    if (_255 instanceof Data_List.Cons && _255.value0 instanceof ThreeLeft) {
                        var __tco___dict_Ord_10 = __dict_Ord_10;
                        var __tco__255 = _255.value1;
                        var __tco__256 = new KickUp(new Two(_256.value0, _256.value1, _256.value2, _256.value3), _255.value0.value0, _255.value0.value1, new Two(_255.value0.value2, _255.value0.value3, _255.value0.value4, _255.value0.value5));
                        __dict_Ord_10 = __tco___dict_Ord_10;
                        _255 = __tco__255;
                        _256 = __tco__256;
                        continue tco;
                    };
                    if (_255 instanceof Data_List.Cons && _255.value0 instanceof ThreeMiddle) {
                        var __tco___dict_Ord_10 = __dict_Ord_10;
                        var __tco__255 = _255.value1;
                        var __tco__256 = new KickUp(new Two(_255.value0.value0, _255.value0.value1, _255.value0.value2, _256.value0), _256.value1, _256.value2, new Two(_256.value3, _255.value0.value3, _255.value0.value4, _255.value0.value5));
                        __dict_Ord_10 = __tco___dict_Ord_10;
                        _255 = __tco__255;
                        _256 = __tco__256;
                        continue tco;
                    };
                    if (_255 instanceof Data_List.Cons && _255.value0 instanceof ThreeRight) {
                        var __tco___dict_Ord_10 = __dict_Ord_10;
                        var __tco__255 = _255.value1;
                        var __tco__256 = new KickUp(new Two(_255.value0.value0, _255.value0.value1, _255.value0.value2, _255.value0.value3), _255.value0.value4, _255.value0.value5, new Two(_256.value0, _256.value1, _256.value2, _256.value3));
                        __dict_Ord_10 = __tco___dict_Ord_10;
                        _255 = __tco__255;
                        _256 = __tco__256;
                        continue tco;
                    };
                    throw new Error("Failed pattern match at Data.Map line 147, column 1 - line 148, column 1: " + [ _255.constructor.name, _256.constructor.name ]);
                };
            };
        };
    };
    var down = function (__copy___dict_Ord_11) {
        return function (__copy_ctx) {
            return function (__copy_k) {
                return function (__copy_v) {
                    return function (__copy__254) {
                        var __dict_Ord_11 = __copy___dict_Ord_11;
                        var ctx = __copy_ctx;
                        var k = __copy_k;
                        var v = __copy_v;
                        var _254 = __copy__254;
                        tco: while (true) {
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Leaf) {
                                return up(__dict_Ord_11)(ctx_1)(new KickUp(Leaf.value, k_1, v_1, Leaf.value));
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Two && Prelude["=="](__dict_Ord_11["__superclass_Prelude.Eq_0"]())(k_1)(_254.value1)) {
                                return fromZipper(__dict_Ord_11)(ctx_1)(new Two(_254.value0, k_1, v_1, _254.value3));
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Two && Prelude["<"](__dict_Ord_11)(k_1)(_254.value1)) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = new Data_List.Cons(new TwoLeft(_254.value1, _254.value2, _254.value3), ctx_1);
                                var __tco__254 = _254.value0;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = k_1;
                                v = v_1;
                                _254 = __tco__254;
                                continue tco;
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Two) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = new Data_List.Cons(new TwoRight(_254.value0, _254.value1, _254.value2), ctx_1);
                                var __tco__254 = _254.value3;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = k_1;
                                v = v_1;
                                _254 = __tco__254;
                                continue tco;
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Three && Prelude["=="](__dict_Ord_11["__superclass_Prelude.Eq_0"]())(k_1)(_254.value1)) {
                                return fromZipper(__dict_Ord_11)(ctx_1)(new Three(_254.value0, k_1, v_1, _254.value3, _254.value4, _254.value5, _254.value6));
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Three && Prelude["=="](__dict_Ord_11["__superclass_Prelude.Eq_0"]())(k_1)(_254.value4)) {
                                return fromZipper(__dict_Ord_11)(ctx_1)(new Three(_254.value0, _254.value1, _254.value2, _254.value3, k_1, v_1, _254.value6));
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Three && Prelude["<"](__dict_Ord_11)(k_1)(_254.value1)) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = new Data_List.Cons(new ThreeLeft(_254.value1, _254.value2, _254.value3, _254.value4, _254.value5, _254.value6), ctx_1);
                                var __tco__254 = _254.value0;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = k_1;
                                v = v_1;
                                _254 = __tco__254;
                                continue tco;
                            };
                            var ctx_1 = ctx;
                            var k_1 = k;
                            var v_1 = v;
                            if (_254 instanceof Three && (Prelude["<"](__dict_Ord_11)(_254.value1)(k_1) && Prelude["<="](__dict_Ord_11)(k_1)(_254.value4))) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = new Data_List.Cons(new ThreeMiddle(_254.value0, _254.value1, _254.value2, _254.value4, _254.value5, _254.value6), ctx_1);
                                var __tco__254 = _254.value3;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = k_1;
                                v = v_1;
                                _254 = __tco__254;
                                continue tco;
                            };
                            if (_254 instanceof Three) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = new Data_List.Cons(new ThreeRight(_254.value0, _254.value1, _254.value2, _254.value3, _254.value4, _254.value5), ctx);
                                var __tco_k = k;
                                var __tco_v = v;
                                var __tco__254 = _254.value6;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                v = __tco_v;
                                _254 = __tco__254;
                                continue tco;
                            };
                            throw new Error("Failed pattern match at Data.Map line 147, column 1 - line 148, column 1: " + [ ctx.constructor.name, k.constructor.name, v.constructor.name, _254.constructor.name ]);
                        };
                    };
                };
            };
        };
    };
    return down(__dict_Ord_9)(Data_List.Nil.value);
};
var foldableMap = new Data_Foldable.Foldable(function (__dict_Monoid_12) {
    return function (f) {
        return function (m) {
            return Data_Foldable.foldMap(Data_List.foldableList)(__dict_Monoid_12)(f)(values(m));
        };
    };
}, function (f) {
    return function (z) {
        return function (m) {
            return Data_Foldable.foldl(Data_List.foldableList)(f)(z)(values(m));
        };
    };
}, function (f) {
    return function (z) {
        return function (m) {
            return Data_Foldable.foldr(Data_List.foldableList)(f)(z)(values(m));
        };
    };
});
var eqMap = function (__dict_Eq_13) {
    return function (__dict_Eq_14) {
        return new Prelude.Eq(function (m1) {
            return function (m2) {
                return Prelude["=="](Data_List.eqList(Data_Tuple.eqTuple(__dict_Eq_13)(__dict_Eq_14)))(toList(m1))(toList(m2));
            };
        });
    };
};
var ordMap = function (__dict_Ord_4) {
    return function (__dict_Ord_5) {
        return new Prelude.Ord(function () {
            return eqMap(__dict_Ord_4["__superclass_Prelude.Eq_0"]())(__dict_Ord_5["__superclass_Prelude.Eq_0"]());
        }, function (m1) {
            return function (m2) {
                return Prelude.compare(Data_List.ordList(Data_Tuple.ordTuple(__dict_Ord_4)(__dict_Ord_5)))(toList(m1))(toList(m2));
            };
        });
    };
};
var empty = Leaf.value;
var fromList = function (__dict_Ord_15) {
    return Data_Foldable.foldl(Data_List.foldableList)(function (m) {
        return function (_242) {
            return insert(__dict_Ord_15)(_242.value0)(_242.value1)(m);
        };
    })(empty);
};
var $$delete = function (__dict_Ord_17) {
    var up = function (__copy___dict_Ord_18) {
        return function (__copy__258) {
            return function (__copy__259) {
                var __dict_Ord_18 = __copy___dict_Ord_18;
                var _258 = __copy__258;
                var _259 = __copy__259;
                tco: while (true) {
                    if (_258 instanceof Data_List.Nil) {
                        return _259;
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof TwoLeft && (_258.value0.value2 instanceof Leaf && _259 instanceof Leaf))) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(Leaf.value, _258.value0.value0, _258.value0.value1, Leaf.value));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof TwoRight && (_258.value0.value0 instanceof Leaf && _259 instanceof Leaf))) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(Leaf.value, _258.value0.value1, _258.value0.value2, Leaf.value));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof TwoLeft && _258.value0.value2 instanceof Two)) {
                        var __tco___dict_Ord_18 = __dict_Ord_18;
                        var __tco__258 = _258.value1;
                        var __tco__259 = new Three(_259, _258.value0.value0, _258.value0.value1, _258.value0.value2.value0, _258.value0.value2.value1, _258.value0.value2.value2, _258.value0.value2.value3);
                        __dict_Ord_18 = __tco___dict_Ord_18;
                        _258 = __tco__258;
                        _259 = __tco__259;
                        continue tco;
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof TwoRight && _258.value0.value0 instanceof Two)) {
                        var __tco___dict_Ord_18 = __dict_Ord_18;
                        var __tco__258 = _258.value1;
                        var __tco__259 = new Three(_258.value0.value0.value0, _258.value0.value0.value1, _258.value0.value0.value2, _258.value0.value0.value3, _258.value0.value1, _258.value0.value2, _259);
                        __dict_Ord_18 = __tco___dict_Ord_18;
                        _258 = __tco__258;
                        _259 = __tco__259;
                        continue tco;
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof TwoLeft && _258.value0.value2 instanceof Three)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(new Two(_259, _258.value0.value0, _258.value0.value1, _258.value0.value2.value0), _258.value0.value2.value1, _258.value0.value2.value2, new Two(_258.value0.value2.value3, _258.value0.value2.value4, _258.value0.value2.value5, _258.value0.value2.value6)));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof TwoRight && _258.value0.value0 instanceof Three)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(new Two(_258.value0.value0.value0, _258.value0.value0.value1, _258.value0.value0.value2, _258.value0.value0.value3), _258.value0.value0.value4, _258.value0.value0.value5, new Two(_258.value0.value0.value6, _258.value0.value1, _258.value0.value2, _259)));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeLeft && (_258.value0.value2 instanceof Leaf && (_258.value0.value5 instanceof Leaf && _259 instanceof Leaf)))) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(Leaf.value, _258.value0.value0, _258.value0.value1, Leaf.value, _258.value0.value3, _258.value0.value4, Leaf.value));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeMiddle && (_258.value0.value0 instanceof Leaf && (_258.value0.value5 instanceof Leaf && _259 instanceof Leaf)))) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(Leaf.value, _258.value0.value1, _258.value0.value2, Leaf.value, _258.value0.value3, _258.value0.value4, Leaf.value));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeRight && (_258.value0.value0 instanceof Leaf && (_258.value0.value3 instanceof Leaf && _259 instanceof Leaf)))) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(Leaf.value, _258.value0.value1, _258.value0.value2, Leaf.value, _258.value0.value4, _258.value0.value5, Leaf.value));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeLeft && _258.value0.value2 instanceof Two)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(new Three(_259, _258.value0.value0, _258.value0.value1, _258.value0.value2.value0, _258.value0.value2.value1, _258.value0.value2.value2, _258.value0.value2.value3), _258.value0.value3, _258.value0.value4, _258.value0.value5));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeMiddle && _258.value0.value0 instanceof Two)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(new Three(_258.value0.value0.value0, _258.value0.value0.value1, _258.value0.value0.value2, _258.value0.value0.value3, _258.value0.value1, _258.value0.value2, _259), _258.value0.value3, _258.value0.value4, _258.value0.value5));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeMiddle && _258.value0.value5 instanceof Two)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(_258.value0.value0, _258.value0.value1, _258.value0.value2, new Three(_259, _258.value0.value3, _258.value0.value4, _258.value0.value5.value0, _258.value0.value5.value1, _258.value0.value5.value2, _258.value0.value5.value3)));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeRight && _258.value0.value3 instanceof Two)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Two(_258.value0.value0, _258.value0.value1, _258.value0.value2, new Three(_258.value0.value3.value0, _258.value0.value3.value1, _258.value0.value3.value2, _258.value0.value3.value3, _258.value0.value4, _258.value0.value5, _259)));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeLeft && _258.value0.value2 instanceof Three)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(new Two(_259, _258.value0.value0, _258.value0.value1, _258.value0.value2.value0), _258.value0.value2.value1, _258.value0.value2.value2, new Two(_258.value0.value2.value3, _258.value0.value2.value4, _258.value0.value2.value5, _258.value0.value2.value6), _258.value0.value3, _258.value0.value4, _258.value0.value5));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeMiddle && _258.value0.value0 instanceof Three)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(new Two(_258.value0.value0.value0, _258.value0.value0.value1, _258.value0.value0.value2, _258.value0.value0.value3), _258.value0.value0.value4, _258.value0.value0.value5, new Two(_258.value0.value0.value6, _258.value0.value1, _258.value0.value2, _259), _258.value0.value3, _258.value0.value4, _258.value0.value5));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeMiddle && _258.value0.value5 instanceof Three)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(_258.value0.value0, _258.value0.value1, _258.value0.value2, new Two(_259, _258.value0.value3, _258.value0.value4, _258.value0.value5.value0), _258.value0.value5.value1, _258.value0.value5.value2, new Two(_258.value0.value5.value3, _258.value0.value5.value4, _258.value0.value5.value5, _258.value0.value5.value6)));
                    };
                    if (_258 instanceof Data_List.Cons && (_258.value0 instanceof ThreeRight && _258.value0.value3 instanceof Three)) {
                        return fromZipper(__dict_Ord_18)(_258.value1)(new Three(_258.value0.value0, _258.value0.value1, _258.value0.value2, new Two(_258.value0.value3.value0, _258.value0.value3.value1, _258.value0.value3.value2, _258.value0.value3.value3), _258.value0.value3.value4, _258.value0.value3.value5, new Two(_258.value0.value3.value6, _258.value0.value4, _258.value0.value5, _259)));
                    };
                    throw new Error("Failed pattern match at Data.Map line 170, column 1 - line 171, column 1: " + [ _258.constructor.name, _259.constructor.name ]);
                };
            };
        };
    };
    var removeMaxNode = function (__copy___dict_Ord_19) {
        return function (__copy_ctx) {
            return function (__copy__261) {
                var __dict_Ord_19 = __copy___dict_Ord_19;
                var ctx = __copy_ctx;
                var _261 = __copy__261;
                tco: while (true) {
                    var ctx_1 = ctx;
                    if (_261 instanceof Two && (_261.value0 instanceof Leaf && _261.value3 instanceof Leaf)) {
                        return up(__dict_Ord_19)(ctx_1)(Leaf.value);
                    };
                    var ctx_1 = ctx;
                    if (_261 instanceof Two) {
                        var __tco___dict_Ord_19 = __dict_Ord_19;
                        var __tco_ctx = new Data_List.Cons(new TwoRight(_261.value0, _261.value1, _261.value2), ctx_1);
                        var __tco__261 = _261.value3;
                        __dict_Ord_19 = __tco___dict_Ord_19;
                        ctx = __tco_ctx;
                        _261 = __tco__261;
                        continue tco;
                    };
                    var ctx_1 = ctx;
                    if (_261 instanceof Three && (_261.value0 instanceof Leaf && (_261.value3 instanceof Leaf && _261.value6 instanceof Leaf))) {
                        return up(__dict_Ord_19)(new Data_List.Cons(new TwoRight(Leaf.value, _261.value1, _261.value2), ctx_1))(Leaf.value);
                    };
                    if (_261 instanceof Three) {
                        var __tco___dict_Ord_19 = __dict_Ord_19;
                        var __tco_ctx = new Data_List.Cons(new ThreeRight(_261.value0, _261.value1, _261.value2, _261.value3, _261.value4, _261.value5), ctx);
                        var __tco__261 = _261.value6;
                        __dict_Ord_19 = __tco___dict_Ord_19;
                        ctx = __tco_ctx;
                        _261 = __tco__261;
                        continue tco;
                    };
                    throw new Error("Failed pattern match at Data.Map line 170, column 1 - line 171, column 1: " + [ ctx.constructor.name, _261.constructor.name ]);
                };
            };
        };
    };
    var maxNode = function (__copy___dict_Ord_20) {
        return function (__copy__260) {
            var __dict_Ord_20 = __copy___dict_Ord_20;
            var _260 = __copy__260;
            tco: while (true) {
                if (_260 instanceof Two && _260.value3 instanceof Leaf) {
                    return {
                        key: _260.value1, 
                        value: _260.value2
                    };
                };
                if (_260 instanceof Two) {
                    var __tco___dict_Ord_20 = __dict_Ord_20;
                    var __tco__260 = _260.value3;
                    __dict_Ord_20 = __tco___dict_Ord_20;
                    _260 = __tco__260;
                    continue tco;
                };
                if (_260 instanceof Three && _260.value6 instanceof Leaf) {
                    return {
                        key: _260.value4, 
                        value: _260.value5
                    };
                };
                if (_260 instanceof Three) {
                    var __tco___dict_Ord_20 = __dict_Ord_20;
                    var __tco__260 = _260.value6;
                    __dict_Ord_20 = __tco___dict_Ord_20;
                    _260 = __tco__260;
                    continue tco;
                };
                throw new Error("Failed pattern match at Data.Map line 170, column 1 - line 171, column 1: " + [ _260.constructor.name ]);
            };
        };
    };
    var down = function (__copy___dict_Ord_21) {
        return function (__copy_ctx) {
            return function (__copy_k) {
                return function (__copy__257) {
                    var __dict_Ord_21 = __copy___dict_Ord_21;
                    var ctx = __copy_ctx;
                    var k = __copy_k;
                    var _257 = __copy__257;
                    tco: while (true) {
                        var ctx_1 = ctx;
                        if (_257 instanceof Leaf) {
                            return fromZipper(__dict_Ord_21)(ctx_1)(Leaf.value);
                        };
                        var ctx_1 = ctx;
                        var k_1 = k;
                        if (_257 instanceof Two && (_257.value0 instanceof Leaf && (_257.value3 instanceof Leaf && Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k_1)(_257.value1)))) {
                            return up(__dict_Ord_21)(ctx_1)(Leaf.value);
                        };
                        var ctx_1 = ctx;
                        var k_1 = k;
                        if (_257 instanceof Two) {
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k_1)(_257.value1)) {
                                var max = maxNode(__dict_Ord_21)(_257.value0);
                                return removeMaxNode(__dict_Ord_21)(new Data_List.Cons(new TwoLeft(max.key, max.value, _257.value3), ctx_1))(_257.value0);
                            };
                            if (Prelude["<"](__dict_Ord_21)(k_1)(_257.value1)) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = new Data_List.Cons(new TwoLeft(_257.value1, _257.value2, _257.value3), ctx_1);
                                var __tco__257 = _257.value0;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = k_1;
                                _257 = __tco__257;
                                continue tco;
                            };
                            if (Prelude.otherwise) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = new Data_List.Cons(new TwoRight(_257.value0, _257.value1, _257.value2), ctx_1);
                                var __tco__257 = _257.value3;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = k_1;
                                _257 = __tco__257;
                                continue tco;
                            };
                        };
                        var ctx_1 = ctx;
                        var k_1 = k;
                        if (_257 instanceof Three && (_257.value0 instanceof Leaf && (_257.value3 instanceof Leaf && _257.value6 instanceof Leaf))) {
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k_1)(_257.value1)) {
                                return fromZipper(__dict_Ord_21)(ctx_1)(new Two(Leaf.value, _257.value4, _257.value5, Leaf.value));
                            };
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k_1)(_257.value4)) {
                                return fromZipper(__dict_Ord_21)(ctx_1)(new Two(Leaf.value, _257.value1, _257.value2, Leaf.value));
                            };
                        };
                        if (_257 instanceof Three) {
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_257.value1)) {
                                var max = maxNode(__dict_Ord_21)(_257.value0);
                                return removeMaxNode(__dict_Ord_21)(new Data_List.Cons(new ThreeLeft(max.key, max.value, _257.value3, _257.value4, _257.value5, _257.value6), ctx))(_257.value0);
                            };
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_257.value4)) {
                                var max = maxNode(__dict_Ord_21)(_257.value3);
                                return removeMaxNode(__dict_Ord_21)(new Data_List.Cons(new ThreeMiddle(_257.value0, _257.value1, _257.value2, max.key, max.value, _257.value6), ctx))(_257.value3);
                            };
                            if (Prelude["<"](__dict_Ord_21)(k)(_257.value1)) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = new Data_List.Cons(new ThreeLeft(_257.value1, _257.value2, _257.value3, _257.value4, _257.value5, _257.value6), ctx);
                                var __tco_k = k;
                                var __tco__257 = _257.value0;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _257 = __tco__257;
                                continue tco;
                            };
                            if (Prelude["<"](__dict_Ord_21)(_257.value1)(k) && Prelude["<"](__dict_Ord_21)(k)(_257.value4)) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = new Data_List.Cons(new ThreeMiddle(_257.value0, _257.value1, _257.value2, _257.value4, _257.value5, _257.value6), ctx);
                                var __tco_k = k;
                                var __tco__257 = _257.value3;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _257 = __tco__257;
                                continue tco;
                            };
                            if (Prelude.otherwise) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = new Data_List.Cons(new ThreeRight(_257.value0, _257.value1, _257.value2, _257.value3, _257.value4, _257.value5), ctx);
                                var __tco_k = k;
                                var __tco__257 = _257.value6;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _257 = __tco__257;
                                continue tco;
                            };
                        };
                        throw new Error("Failed pattern match at Data.Map line 170, column 1 - line 171, column 1: " + [ ctx.constructor.name, k.constructor.name, _257.constructor.name ]);
                    };
                };
            };
        };
    };
    return down(__dict_Ord_17)(Data_List.Nil.value);
};
var checkValid = function (tree) {
    var allHeights = function (_253) {
        if (_253 instanceof Leaf) {
            return Prelude.pure(Data_List.applicativeList)(0);
        };
        if (_253 instanceof Two) {
            return Prelude.map(Data_List.functorList)(function (n) {
                return n + 1 | 0;
            })(Prelude["++"](Data_List.semigroupList)(allHeights(_253.value0))(allHeights(_253.value3)));
        };
        if (_253 instanceof Three) {
            return Prelude.map(Data_List.functorList)(function (n) {
                return n + 1 | 0;
            })(Prelude["++"](Data_List.semigroupList)(allHeights(_253.value0))(Prelude["++"](Data_List.semigroupList)(allHeights(_253.value3))(allHeights(_253.value6))));
        };
        throw new Error("Failed pattern match at Data.Map line 105, column 1 - line 106, column 1: " + [ _253.constructor.name ]);
    };
    return Data_List.length(Data_List.nub(Prelude.eqInt)(allHeights(tree))) === 1;
};
var alter = function (__dict_Ord_22) {
    return function (f) {
        return function (k) {
            return function (m) {
                var _1049 = f(lookup(__dict_Ord_22)(k)(m));
                if (_1049 instanceof Data_Maybe.Nothing) {
                    return $$delete(__dict_Ord_22)(k)(m);
                };
                if (_1049 instanceof Data_Maybe.Just) {
                    return insert(__dict_Ord_22)(k)(_1049.value0)(m);
                };
                throw new Error("Failed pattern match at Data.Map line 227, column 1 - line 228, column 1: " + [ _1049.constructor.name ]);
            };
        };
    };
};
var fromListWith = function (__dict_Ord_23) {
    return function (f) {
        var combine = function (v) {
            return function (_262) {
                if (_262 instanceof Data_Maybe.Just) {
                    return Data_Maybe.Just.create(f(v)(_262.value0));
                };
                if (_262 instanceof Data_Maybe.Nothing) {
                    return new Data_Maybe.Just(v);
                };
                throw new Error("Failed pattern match at Data.Map line 250, column 3 - line 251, column 3: " + [ v.constructor.name, _262.constructor.name ]);
            };
        };
        return Data_Foldable.foldl(Data_List.foldableList)(function (m) {
            return function (_243) {
                return alter(__dict_Ord_23)(combine(_243.value1))(_243.value0)(m);
            };
        })(empty);
    };
};
var unionWith = function (__dict_Ord_24) {
    return function (f) {
        return function (m1) {
            return function (m2) {
                var go = function (m) {
                    return function (_263) {
                        return alter(__dict_Ord_24)(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Maybe.Just.create)(Data_Maybe.maybe(_263.value1)(f(_263.value1))))(_263.value0)(m);
                    };
                };
                return Data_Foldable.foldl(Data_List.foldableList)(go)(m2)(toList(m1));
            };
        };
    };
};
var union = function (__dict_Ord_25) {
    return unionWith(__dict_Ord_25)(Prelude["const"]);
};
var semigroupMap = function (__dict_Ord_26) {
    return new Prelude.Semigroup(union(__dict_Ord_26));
};
var monoidMap = function (__dict_Ord_16) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMap(__dict_Ord_16);
    }, empty);
};
var traversableMap = function (__dict_Ord_27) {
    return new Data_Traversable.Traversable(function () {
        return foldableMap;
    }, function () {
        return functorMap;
    }, function (__dict_Applicative_29) {
        return Data_Traversable.traverse(traversableMap(__dict_Ord_27))(__dict_Applicative_29)(Prelude.id(Prelude.categoryFn));
    }, function (__dict_Applicative_28) {
        return function (f) {
            return function (ms) {
                return Data_Foldable.foldr(Data_List.foldableList)(function (x) {
                    return function (acc) {
                        return Prelude["<*>"](__dict_Applicative_28["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_28["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(union(__dict_Ord_27))(x))(acc);
                    };
                })(Prelude.pure(__dict_Applicative_28)(empty))(Prelude["<$>"](Data_List.functorList)(Prelude["<$>"]((__dict_Applicative_28["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Tuple.uncurry(singleton)))(Prelude["<$>"](Data_List.functorList)(Data_Traversable.traverse(Data_Tuple.traversableTuple)(__dict_Applicative_28)(f))(toList(ms))));
            };
        };
    });
};
var unions = function (__dict_Ord_30) {
    return function (__dict_Foldable_31) {
        return Data_Foldable.foldl(__dict_Foldable_31)(union(__dict_Ord_30))(empty);
    };
};
var update = function (__dict_Ord_32) {
    return function (f) {
        return function (k) {
            return function (m) {
                return alter(__dict_Ord_32)(Data_Maybe.maybe(Data_Maybe.Nothing.value)(f))(k)(m);
            };
        };
    };
};
module.exports = {
    size: size, 
    unions: unions, 
    unionWith: unionWith, 
    union: union, 
    values: values, 
    keys: keys, 
    update: update, 
    alter: alter, 
    member: member, 
    "delete": $$delete, 
    fromListWith: fromListWith, 
    fromList: fromList, 
    toList: toList, 
    lookup: lookup, 
    insert: insert, 
    checkValid: checkValid, 
    singleton: singleton, 
    isEmpty: isEmpty, 
    empty: empty, 
    showTree: showTree, 
    eqMap: eqMap, 
    showMap: showMap, 
    ordMap: ordMap, 
    semigroupMap: semigroupMap, 
    monoidMap: monoidMap, 
    functorMap: functorMap, 
    foldableMap: foldableMap, 
    traversableMap: traversableMap
};

},{"Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.List":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.List/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.First/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var First = function (x) {
    return x;
};
var showFirst = function (__dict_Show_0) {
    return new Prelude.Show(function (_403) {
        return "First (" + (Prelude.show(Data_Maybe.showMaybe(__dict_Show_0))(_403) + ")");
    });
};
var semigroupFirst = new Prelude.Semigroup(function (_404) {
    return function (second) {
        if (_404 instanceof Data_Maybe.Just) {
            return _404;
        };
        return second;
    };
});
var runFirst = function (_393) {
    return _393;
};
var monoidFirst = new Data_Monoid.Monoid(function () {
    return semigroupFirst;
}, Data_Maybe.Nothing.value);
var functorFirst = new Prelude.Functor(function (f) {
    return function (_398) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(f)(_398);
    };
});
var invariantFirst = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorFirst));
var extendFirst = new Control_Extend.Extend(function () {
    return functorFirst;
}, function (f) {
    return function (_402) {
        return Control_Extend.extend(Data_Maybe.extendMaybe)(function (_1495) {
            return f(First(_1495));
        })(_402);
    };
});
var eqFirst = function (__dict_Eq_2) {
    return new Prelude.Eq(function (_394) {
        return function (_395) {
            return Prelude["=="](Data_Maybe.eqMaybe(__dict_Eq_2))(_394)(_395);
        };
    });
};
var ordFirst = function (__dict_Ord_1) {
    return new Prelude.Ord(function () {
        return eqFirst(__dict_Ord_1["__superclass_Prelude.Eq_0"]());
    }, function (_396) {
        return function (_397) {
            return Prelude.compare(Data_Maybe.ordMaybe(__dict_Ord_1))(_396)(_397);
        };
    });
};
var boundedFirst = function (__dict_Bounded_3) {
    return new Prelude.Bounded(Prelude.bottom(Data_Maybe.boundedMaybe(__dict_Bounded_3)), Prelude.top(Data_Maybe.boundedMaybe(__dict_Bounded_3)));
};
var applyFirst = new Prelude.Apply(function () {
    return functorFirst;
}, function (_399) {
    return function (_400) {
        return Prelude["<*>"](Data_Maybe.applyMaybe)(_399)(_400);
    };
});
var bindFirst = new Prelude.Bind(function () {
    return applyFirst;
}, function (_401) {
    return function (f) {
        return Prelude.bind(Data_Maybe.bindMaybe)(_401)(function (_1496) {
            return runFirst(f(_1496));
        });
    };
});
var applicativeFirst = new Prelude.Applicative(function () {
    return applyFirst;
}, function (_1497) {
    return First(Prelude.pure(Data_Maybe.applicativeMaybe)(_1497));
});
var monadFirst = new Prelude.Monad(function () {
    return applicativeFirst;
}, function () {
    return bindFirst;
});
module.exports = {
    First: First, 
    runFirst: runFirst, 
    eqFirst: eqFirst, 
    ordFirst: ordFirst, 
    boundedFirst: boundedFirst, 
    functorFirst: functorFirst, 
    applyFirst: applyFirst, 
    applicativeFirst: applicativeFirst, 
    bindFirst: bindFirst, 
    monadFirst: monadFirst, 
    extendFirst: extendFirst, 
    invariantFirst: invariantFirst, 
    showFirst: showFirst, 
    semigroupFirst: semigroupFirst, 
    monoidFirst: monoidFirst
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Last/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var Last = function (x) {
    return x;
};
var showLast = function (__dict_Show_0) {
    return new Prelude.Show(function (_415) {
        return "Last (" + (Prelude.show(Data_Maybe.showMaybe(__dict_Show_0))(_415) + ")");
    });
};
var semigroupLast = new Prelude.Semigroup(function (last) {
    return function (_416) {
        if (_416 instanceof Data_Maybe.Just) {
            return _416;
        };
        if (_416 instanceof Data_Maybe.Nothing) {
            return last;
        };
        throw new Error("Failed pattern match at Data.Maybe.Last line 57, column 1 - line 61, column 1: " + [ last.constructor.name, _416.constructor.name ]);
    };
});
var runLast = function (_405) {
    return _405;
};
var monoidLast = new Data_Monoid.Monoid(function () {
    return semigroupLast;
}, Data_Maybe.Nothing.value);
var functorLast = new Prelude.Functor(function (f) {
    return function (_410) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(f)(_410);
    };
});
var invariantLast = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorLast));
var extendLast = new Control_Extend.Extend(function () {
    return functorLast;
}, function (f) {
    return function (_414) {
        return Control_Extend.extend(Data_Maybe.extendMaybe)(function (_1515) {
            return f(Last(_1515));
        })(_414);
    };
});
var eqLast = function (__dict_Eq_2) {
    return new Prelude.Eq(function (_406) {
        return function (_407) {
            return Prelude["=="](Data_Maybe.eqMaybe(__dict_Eq_2))(_406)(_407);
        };
    });
};
var ordLast = function (__dict_Ord_1) {
    return new Prelude.Ord(function () {
        return eqLast(__dict_Ord_1["__superclass_Prelude.Eq_0"]());
    }, function (_408) {
        return function (_409) {
            return Prelude.compare(Data_Maybe.ordMaybe(__dict_Ord_1))(_408)(_409);
        };
    });
};
var boundedLast = function (__dict_Bounded_3) {
    return new Prelude.Bounded(Prelude.bottom(Data_Maybe.boundedMaybe(__dict_Bounded_3)), Prelude.top(Data_Maybe.boundedMaybe(__dict_Bounded_3)));
};
var applyLast = new Prelude.Apply(function () {
    return functorLast;
}, function (_411) {
    return function (_412) {
        return Prelude["<*>"](Data_Maybe.applyMaybe)(_411)(_412);
    };
});
var bindLast = new Prelude.Bind(function () {
    return applyLast;
}, function (_413) {
    return function (f) {
        return Prelude.bind(Data_Maybe.bindMaybe)(_413)(function (_1516) {
            return runLast(f(_1516));
        });
    };
});
var applicativeLast = new Prelude.Applicative(function () {
    return applyLast;
}, function (_1517) {
    return Last(Prelude.pure(Data_Maybe.applicativeMaybe)(_1517));
});
var monadLast = new Prelude.Monad(function () {
    return applicativeLast;
}, function () {
    return bindLast;
});
module.exports = {
    Last: Last, 
    runLast: runLast, 
    eqLast: eqLast, 
    ordLast: ordLast, 
    boundedLast: boundedLast, 
    functorLast: functorLast, 
    applyLast: applyLast, 
    applicativeLast: applicativeLast, 
    bindLast: bindLast, 
    monadLast: monadLast, 
    extendLast: extendLast, 
    invariantLast: invariantLast, 
    showLast: showLast, 
    semigroupLast: semigroupLast, 
    monoidLast: monoidLast
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Maybe.Unsafe

exports.unsafeThrow = function (msg) {
  throw new Error(msg);
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var fromJust = function (_442) {
    if (_442 instanceof Data_Maybe.Just) {
        return _442.value0;
    };
    if (_442 instanceof Data_Maybe.Nothing) {
        return $foreign.unsafeThrow("Data.Maybe.Unsafe.fromJust called on Nothing");
    };
    throw new Error("Failed pattern match at Data.Maybe.Unsafe line 10, column 1 - line 11, column 1: " + [ _442.constructor.name ]);
};
module.exports = {
    fromJust: fromJust, 
    unsafeThrow: $foreign.unsafeThrow
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/foreign.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Extend = require("Control.Extend");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Monoid = require("Data.Monoid");
var Nothing = (function () {
    function Nothing() {

    };
    Nothing.value = new Nothing();
    return Nothing;
})();
var Just = (function () {
    function Just(value0) {
        this.value0 = value0;
    };
    Just.create = function (value0) {
        return new Just(value0);
    };
    return Just;
})();
var showMaybe = function (__dict_Show_0) {
    return new Prelude.Show(function (_389) {
        if (_389 instanceof Just) {
            return "Just (" + (Prelude.show(__dict_Show_0)(_389.value0) + ")");
        };
        if (_389 instanceof Nothing) {
            return "Nothing";
        };
        throw new Error("Failed pattern match at Data.Maybe line 289, column 1 - line 291, column 19: " + [ _389.constructor.name ]);
    });
};
var semigroupMaybe = function (__dict_Semigroup_2) {
    return new Prelude.Semigroup(function (_383) {
        return function (_384) {
            if (_383 instanceof Nothing) {
                return _384;
            };
            if (_384 instanceof Nothing) {
                return _383;
            };
            if (_383 instanceof Just && _384 instanceof Just) {
                return new Just(Prelude["<>"](__dict_Semigroup_2)(_383.value0)(_384.value0));
            };
            throw new Error("Failed pattern match at Data.Maybe line 231, column 1 - line 236, column 1: " + [ _383.constructor.name, _384.constructor.name ]);
        };
    });
};
var monoidMaybe = function (__dict_Semigroup_6) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMaybe(__dict_Semigroup_6);
    }, Nothing.value);
};
var maybe$prime = function (g) {
    return function (f) {
        return function (_377) {
            if (_377 instanceof Nothing) {
                return g(Prelude.unit);
            };
            if (_377 instanceof Just) {
                return f(_377.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe line 39, column 1 - line 40, column 1: " + [ g.constructor.name, f.constructor.name, _377.constructor.name ]);
        };
    };
};
var maybe = function (b) {
    return function (f) {
        return function (_376) {
            if (_376 instanceof Nothing) {
                return b;
            };
            if (_376 instanceof Just) {
                return f(_376.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe line 26, column 1 - line 27, column 1: " + [ b.constructor.name, f.constructor.name, _376.constructor.name ]);
        };
    };
};
var isNothing = maybe(true)(Prelude["const"](false));
var isJust = maybe(false)(Prelude["const"](true));
var functorMaybe = new Prelude.Functor(function (fn) {
    return function (_378) {
        if (_378 instanceof Just) {
            return new Just(fn(_378.value0));
        };
        return Nothing.value;
    };
});
var invariantMaybe = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorMaybe));
var fromMaybe$prime = function (a) {
    return maybe$prime(a)(Prelude.id(Prelude.categoryFn));
};
var fromMaybe = function (a) {
    return maybe(a)(Prelude.id(Prelude.categoryFn));
};
var extendMaybe = new Control_Extend.Extend(function () {
    return functorMaybe;
}, function (f) {
    return function (_382) {
        if (_382 instanceof Nothing) {
            return Nothing.value;
        };
        return new Just(f(_382));
    };
});
var eqMaybe = function (__dict_Eq_8) {
    return new Prelude.Eq(function (_385) {
        return function (_386) {
            if (_385 instanceof Nothing && _386 instanceof Nothing) {
                return true;
            };
            if (_385 instanceof Just && _386 instanceof Just) {
                return Prelude["=="](__dict_Eq_8)(_385.value0)(_386.value0);
            };
            return false;
        };
    });
};
var ordMaybe = function (__dict_Ord_4) {
    return new Prelude.Ord(function () {
        return eqMaybe(__dict_Ord_4["__superclass_Prelude.Eq_0"]());
    }, function (_387) {
        return function (_388) {
            if (_387 instanceof Just && _388 instanceof Just) {
                return Prelude.compare(__dict_Ord_4)(_387.value0)(_388.value0);
            };
            if (_387 instanceof Nothing && _388 instanceof Nothing) {
                return Prelude.EQ.value;
            };
            if (_387 instanceof Nothing) {
                return Prelude.LT.value;
            };
            if (_388 instanceof Nothing) {
                return Prelude.GT.value;
            };
            throw new Error("Failed pattern match at Data.Maybe line 269, column 1 - line 275, column 1: " + [ _387.constructor.name, _388.constructor.name ]);
        };
    });
};
var boundedMaybe = function (__dict_Bounded_11) {
    return new Prelude.Bounded(Nothing.value, new Just(Prelude.top(__dict_Bounded_11)));
};
var boundedOrdMaybe = function (__dict_BoundedOrd_10) {
    return new Prelude.BoundedOrd(function () {
        return boundedMaybe(__dict_BoundedOrd_10["__superclass_Prelude.Bounded_0"]());
    }, function () {
        return ordMaybe(__dict_BoundedOrd_10["__superclass_Prelude.Ord_1"]());
    });
};
var applyMaybe = new Prelude.Apply(function () {
    return functorMaybe;
}, function (_379) {
    return function (x) {
        if (_379 instanceof Just) {
            return Prelude["<$>"](functorMaybe)(_379.value0)(x);
        };
        if (_379 instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match at Data.Maybe line 121, column 1 - line 145, column 1: " + [ _379.constructor.name, x.constructor.name ]);
    };
});
var bindMaybe = new Prelude.Bind(function () {
    return applyMaybe;
}, function (_381) {
    return function (k) {
        if (_381 instanceof Just) {
            return k(_381.value0);
        };
        if (_381 instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match at Data.Maybe line 180, column 1 - line 199, column 1: " + [ _381.constructor.name, k.constructor.name ]);
    };
});
var booleanAlgebraMaybe = function (__dict_BooleanAlgebra_12) {
    return new Prelude.BooleanAlgebra(function () {
        return boundedMaybe(__dict_BooleanAlgebra_12["__superclass_Prelude.Bounded_0"]());
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.conj(__dict_BooleanAlgebra_12))(x))(y);
        };
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.disj(__dict_BooleanAlgebra_12))(x))(y);
        };
    }, Prelude.map(functorMaybe)(Prelude.not(__dict_BooleanAlgebra_12)));
};
var semiringMaybe = function (__dict_Semiring_1) {
    return new Prelude.Semiring(function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.add(__dict_Semiring_1))(x))(y);
        };
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.mul(__dict_Semiring_1))(x))(y);
        };
    }, new Just(Prelude.one(__dict_Semiring_1)), new Just(Prelude.zero(__dict_Semiring_1)));
};
var moduloSemiringMaybe = function (__dict_ModuloSemiring_7) {
    return new Prelude.ModuloSemiring(function () {
        return semiringMaybe(__dict_ModuloSemiring_7["__superclass_Prelude.Semiring_0"]());
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.div(__dict_ModuloSemiring_7))(x))(y);
        };
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.mod(__dict_ModuloSemiring_7))(x))(y);
        };
    });
};
var ringMaybe = function (__dict_Ring_3) {
    return new Prelude.Ring(function () {
        return semiringMaybe(__dict_Ring_3["__superclass_Prelude.Semiring_0"]());
    }, function (x) {
        return function (y) {
            return Prelude["<*>"](applyMaybe)(Prelude["<$>"](functorMaybe)(Prelude.sub(__dict_Ring_3))(x))(y);
        };
    });
};
var divisionRingMaybe = function (__dict_DivisionRing_9) {
    return new Prelude.DivisionRing(function () {
        return moduloSemiringMaybe(__dict_DivisionRing_9["__superclass_Prelude.ModuloSemiring_1"]());
    }, function () {
        return ringMaybe(__dict_DivisionRing_9["__superclass_Prelude.Ring_0"]());
    });
};
var numMaybe = function (__dict_Num_5) {
    return new Prelude.Num(function () {
        return divisionRingMaybe(__dict_Num_5["__superclass_Prelude.DivisionRing_0"]());
    });
};
var applicativeMaybe = new Prelude.Applicative(function () {
    return applyMaybe;
}, Just.create);
var monadMaybe = new Prelude.Monad(function () {
    return applicativeMaybe;
}, function () {
    return bindMaybe;
});
var altMaybe = new Control_Alt.Alt(function () {
    return functorMaybe;
}, function (_380) {
    return function (r) {
        if (_380 instanceof Nothing) {
            return r;
        };
        return _380;
    };
});
var plusMaybe = new Control_Plus.Plus(function () {
    return altMaybe;
}, Nothing.value);
var alternativeMaybe = new Control_Alternative.Alternative(function () {
    return plusMaybe;
}, function () {
    return applicativeMaybe;
});
var monadPlusMaybe = new Control_MonadPlus.MonadPlus(function () {
    return alternativeMaybe;
}, function () {
    return monadMaybe;
});
module.exports = {
    Nothing: Nothing, 
    Just: Just, 
    isNothing: isNothing, 
    isJust: isJust, 
    "fromMaybe'": fromMaybe$prime, 
    fromMaybe: fromMaybe, 
    "maybe'": maybe$prime, 
    maybe: maybe, 
    functorMaybe: functorMaybe, 
    applyMaybe: applyMaybe, 
    applicativeMaybe: applicativeMaybe, 
    altMaybe: altMaybe, 
    plusMaybe: plusMaybe, 
    alternativeMaybe: alternativeMaybe, 
    bindMaybe: bindMaybe, 
    monadMaybe: monadMaybe, 
    monadPlusMaybe: monadPlusMaybe, 
    extendMaybe: extendMaybe, 
    invariantMaybe: invariantMaybe, 
    semigroupMaybe: semigroupMaybe, 
    monoidMaybe: monoidMaybe, 
    semiringMaybe: semiringMaybe, 
    moduloSemiringMaybe: moduloSemiringMaybe, 
    ringMaybe: ringMaybe, 
    divisionRingMaybe: divisionRingMaybe, 
    numMaybe: numMaybe, 
    eqMaybe: eqMaybe, 
    ordMaybe: ordMaybe, 
    boundedMaybe: boundedMaybe, 
    boundedOrdMaybe: boundedOrdMaybe, 
    booleanAlgebraMaybe: booleanAlgebraMaybe, 
    showMaybe: showMaybe
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Additive/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Monoid = require("Data.Monoid");
var Additive = function (x) {
    return x;
};
var showAdditive = function (__dict_Show_0) {
    return new Prelude.Show(function (_297) {
        return "Additive (" + (Prelude.show(__dict_Show_0)(_297) + ")");
    });
};
var semigroupAdditive = function (__dict_Semiring_1) {
    return new Prelude.Semigroup(function (_298) {
        return function (_299) {
            return Prelude["+"](__dict_Semiring_1)(_298)(_299);
        };
    });
};
var runAdditive = function (_286) {
    return _286;
};
var monoidAdditive = function (__dict_Semiring_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupAdditive(__dict_Semiring_3);
    }, Prelude.zero(__dict_Semiring_3));
};
var invariantAdditive = new Data_Functor_Invariant.Invariant(function (f) {
    return function (_295) {
        return function (_296) {
            return f(_296);
        };
    };
});
var functorAdditive = new Prelude.Functor(function (f) {
    return function (_291) {
        return f(_291);
    };
});
var extendAdditive = new Control_Extend.Extend(function () {
    return functorAdditive;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqAdditive = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_287) {
        return function (_288) {
            return Prelude["=="](__dict_Eq_4)(_287)(_288);
        };
    });
};
var ordAdditive = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqAdditive(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_289) {
        return function (_290) {
            return Prelude.compare(__dict_Ord_2)(_289)(_290);
        };
    });
};
var comonadAdditive = new Control_Comonad.Comonad(function () {
    return extendAdditive;
}, runAdditive);
var applyAdditive = new Prelude.Apply(function () {
    return functorAdditive;
}, function (_292) {
    return function (_293) {
        return _292(_293);
    };
});
var bindAdditive = new Prelude.Bind(function () {
    return applyAdditive;
}, function (_294) {
    return function (f) {
        return f(_294);
    };
});
var applicativeAdditive = new Prelude.Applicative(function () {
    return applyAdditive;
}, Additive);
var monadAdditive = new Prelude.Monad(function () {
    return applicativeAdditive;
}, function () {
    return bindAdditive;
});
module.exports = {
    Additive: Additive, 
    runAdditive: runAdditive, 
    eqAdditive: eqAdditive, 
    ordAdditive: ordAdditive, 
    functorAdditive: functorAdditive, 
    applyAdditive: applyAdditive, 
    applicativeAdditive: applicativeAdditive, 
    bindAdditive: bindAdditive, 
    monadAdditive: monadAdditive, 
    extendAdditive: extendAdditive, 
    comonadAdditive: comonadAdditive, 
    invariantAdditive: invariantAdditive, 
    showAdditive: showAdditive, 
    semigroupAdditive: semigroupAdditive, 
    monoidAdditive: monoidAdditive
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Conj/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Monoid = require("Data.Monoid");
var Conj = function (x) {
    return x;
};
var showConj = function (__dict_Show_0) {
    return new Prelude.Show(function (_309) {
        return "Conj (" + (Prelude.show(__dict_Show_0)(_309) + ")");
    });
};
var semigroupConj = function (__dict_BooleanAlgebra_1) {
    return new Prelude.Semigroup(function (_310) {
        return function (_311) {
            return Prelude.conj(__dict_BooleanAlgebra_1)(_310)(_311);
        };
    });
};
var runConj = function (_300) {
    return _300;
};
var monoidConj = function (__dict_BooleanAlgebra_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupConj(__dict_BooleanAlgebra_3);
    }, Prelude.top(__dict_BooleanAlgebra_3["__superclass_Prelude.Bounded_0"]()));
};
var functorConj = new Prelude.Functor(function (f) {
    return function (_305) {
        return f(_305);
    };
});
var extendConj = new Control_Extend.Extend(function () {
    return functorConj;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqConj = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_301) {
        return function (_302) {
            return Prelude["=="](__dict_Eq_4)(_301)(_302);
        };
    });
};
var ordConj = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqConj(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_303) {
        return function (_304) {
            return Prelude.compare(__dict_Ord_2)(_303)(_304);
        };
    });
};
var comonadConj = new Control_Comonad.Comonad(function () {
    return extendConj;
}, runConj);
var boundedConj = function (__dict_Bounded_5) {
    return new Prelude.Bounded(Prelude.bottom(__dict_Bounded_5), Prelude.top(__dict_Bounded_5));
};
var applyConj = new Prelude.Apply(function () {
    return functorConj;
}, function (_306) {
    return function (_307) {
        return _306(_307);
    };
});
var bindConj = new Prelude.Bind(function () {
    return applyConj;
}, function (_308) {
    return function (f) {
        return f(_308);
    };
});
var applicativeConj = new Prelude.Applicative(function () {
    return applyConj;
}, Conj);
var monadConj = new Prelude.Monad(function () {
    return applicativeConj;
}, function () {
    return bindConj;
});
module.exports = {
    Conj: Conj, 
    runConj: runConj, 
    eqConj: eqConj, 
    ordConj: ordConj, 
    boundedConj: boundedConj, 
    functorConj: functorConj, 
    applyConj: applyConj, 
    applicativeConj: applicativeConj, 
    bindConj: bindConj, 
    monadConj: monadConj, 
    extendConj: extendConj, 
    comonadConj: comonadConj, 
    showConj: showConj, 
    semigroupConj: semigroupConj, 
    monoidConj: monoidConj
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Disj/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Monoid = require("Data.Monoid");
var Disj = function (x) {
    return x;
};
var showDisj = function (__dict_Show_0) {
    return new Prelude.Show(function (_321) {
        return "Disj (" + (Prelude.show(__dict_Show_0)(_321) + ")");
    });
};
var semigroupDisj = function (__dict_BooleanAlgebra_1) {
    return new Prelude.Semigroup(function (_322) {
        return function (_323) {
            return Prelude.disj(__dict_BooleanAlgebra_1)(_322)(_323);
        };
    });
};
var runDisj = function (_312) {
    return _312;
};
var monoidDisj = function (__dict_BooleanAlgebra_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDisj(__dict_BooleanAlgebra_3);
    }, Prelude.bottom(__dict_BooleanAlgebra_3["__superclass_Prelude.Bounded_0"]()));
};
var functorDisj = new Prelude.Functor(function (f) {
    return function (_317) {
        return f(_317);
    };
});
var extendDisj = new Control_Extend.Extend(function () {
    return functorDisj;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqDisj = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_313) {
        return function (_314) {
            return Prelude["=="](__dict_Eq_4)(_313)(_314);
        };
    });
};
var ordDisj = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqDisj(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_315) {
        return function (_316) {
            return Prelude.compare(__dict_Ord_2)(_315)(_316);
        };
    });
};
var comonadDisj = new Control_Comonad.Comonad(function () {
    return extendDisj;
}, runDisj);
var boundedDisj = function (__dict_Bounded_5) {
    return new Prelude.Bounded(Prelude.bottom(__dict_Bounded_5), Prelude.top(__dict_Bounded_5));
};
var applyDisj = new Prelude.Apply(function () {
    return functorDisj;
}, function (_318) {
    return function (_319) {
        return _318(_319);
    };
});
var bindDisj = new Prelude.Bind(function () {
    return applyDisj;
}, function (_320) {
    return function (f) {
        return f(_320);
    };
});
var applicativeDisj = new Prelude.Applicative(function () {
    return applyDisj;
}, Disj);
var monadDisj = new Prelude.Monad(function () {
    return applicativeDisj;
}, function () {
    return bindDisj;
});
module.exports = {
    Disj: Disj, 
    runDisj: runDisj, 
    eqDisj: eqDisj, 
    ordDisj: ordDisj, 
    boundedDisj: boundedDisj, 
    functorDisj: functorDisj, 
    applyDisj: applyDisj, 
    applicativeDisj: applicativeDisj, 
    bindDisj: bindDisj, 
    monadDisj: monadDisj, 
    extendDisj: extendDisj, 
    comonadDisj: comonadDisj, 
    showDisj: showDisj, 
    semigroupDisj: semigroupDisj, 
    monoidDisj: monoidDisj
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Dual/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Monoid = require("Data.Monoid");
var Dual = function (x) {
    return x;
};
var showDual = function (__dict_Show_0) {
    return new Prelude.Show(function (_335) {
        return "Dual (" + (Prelude.show(__dict_Show_0)(_335) + ")");
    });
};
var semigroupDual = function (__dict_Semigroup_1) {
    return new Prelude.Semigroup(function (_336) {
        return function (_337) {
            return Prelude["<>"](__dict_Semigroup_1)(_337)(_336);
        };
    });
};
var runDual = function (_324) {
    return _324;
};
var monoidDual = function (__dict_Monoid_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDual(__dict_Monoid_3["__superclass_Prelude.Semigroup_0"]());
    }, Data_Monoid.mempty(__dict_Monoid_3));
};
var invariantDual = new Data_Functor_Invariant.Invariant(function (f) {
    return function (_333) {
        return function (_334) {
            return f(_334);
        };
    };
});
var functorDual = new Prelude.Functor(function (f) {
    return function (_329) {
        return f(_329);
    };
});
var extendDual = new Control_Extend.Extend(function () {
    return functorDual;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqDual = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_325) {
        return function (_326) {
            return Prelude["=="](__dict_Eq_4)(_325)(_326);
        };
    });
};
var ordDual = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqDual(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_327) {
        return function (_328) {
            return Prelude.compare(__dict_Ord_2)(_327)(_328);
        };
    });
};
var comonadDual = new Control_Comonad.Comonad(function () {
    return extendDual;
}, runDual);
var applyDual = new Prelude.Apply(function () {
    return functorDual;
}, function (_330) {
    return function (_331) {
        return _330(_331);
    };
});
var bindDual = new Prelude.Bind(function () {
    return applyDual;
}, function (_332) {
    return function (f) {
        return f(_332);
    };
});
var applicativeDual = new Prelude.Applicative(function () {
    return applyDual;
}, Dual);
var monadDual = new Prelude.Monad(function () {
    return applicativeDual;
}, function () {
    return bindDual;
});
module.exports = {
    Dual: Dual, 
    runDual: runDual, 
    eqDual: eqDual, 
    ordDual: ordDual, 
    functorDual: functorDual, 
    applyDual: applyDual, 
    applicativeDual: applicativeDual, 
    bindDual: bindDual, 
    monadDual: monadDual, 
    extendDual: extendDual, 
    comonadDual: comonadDual, 
    invariantDual: invariantDual, 
    showDual: showDual, 
    semigroupDual: semigroupDual, 
    monoidDual: monoidDual
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Multiplicative/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Monoid = require("Data.Monoid");
var Multiplicative = function (x) {
    return x;
};
var showMultiplicative = function (__dict_Show_0) {
    return new Prelude.Show(function (_349) {
        return "Multiplicative (" + (Prelude.show(__dict_Show_0)(_349) + ")");
    });
};
var semigroupMultiplicative = function (__dict_Semiring_1) {
    return new Prelude.Semigroup(function (_350) {
        return function (_351) {
            return Prelude["*"](__dict_Semiring_1)(_350)(_351);
        };
    });
};
var runMultiplicative = function (_338) {
    return _338;
};
var monoidMultiplicative = function (__dict_Semiring_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMultiplicative(__dict_Semiring_3);
    }, Prelude.one(__dict_Semiring_3));
};
var invariantMultiplicative = new Data_Functor_Invariant.Invariant(function (f) {
    return function (_347) {
        return function (_348) {
            return f(_348);
        };
    };
});
var functorMultiplicative = new Prelude.Functor(function (f) {
    return function (_343) {
        return f(_343);
    };
});
var extendMultiplicative = new Control_Extend.Extend(function () {
    return functorMultiplicative;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqMultiplicative = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_339) {
        return function (_340) {
            return Prelude["=="](__dict_Eq_4)(_339)(_340);
        };
    });
};
var ordMultiplicative = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqMultiplicative(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_341) {
        return function (_342) {
            return Prelude.compare(__dict_Ord_2)(_341)(_342);
        };
    });
};
var comonadMultiplicative = new Control_Comonad.Comonad(function () {
    return extendMultiplicative;
}, runMultiplicative);
var applyMultiplicative = new Prelude.Apply(function () {
    return functorMultiplicative;
}, function (_344) {
    return function (_345) {
        return _344(_345);
    };
});
var bindMultiplicative = new Prelude.Bind(function () {
    return applyMultiplicative;
}, function (_346) {
    return function (f) {
        return f(_346);
    };
});
var applicativeMultiplicative = new Prelude.Applicative(function () {
    return applyMultiplicative;
}, Multiplicative);
var monadMultiplicative = new Prelude.Monad(function () {
    return applicativeMultiplicative;
}, function () {
    return bindMultiplicative;
});
module.exports = {
    Multiplicative: Multiplicative, 
    runMultiplicative: runMultiplicative, 
    eqMultiplicative: eqMultiplicative, 
    ordMultiplicative: ordMultiplicative, 
    functorMultiplicative: functorMultiplicative, 
    applyMultiplicative: applyMultiplicative, 
    applicativeMultiplicative: applicativeMultiplicative, 
    bindMultiplicative: bindMultiplicative, 
    monadMultiplicative: monadMultiplicative, 
    extendMultiplicative: extendMultiplicative, 
    comonadMultiplicative: comonadMultiplicative, 
    invariantMultiplicative: invariantMultiplicative, 
    showMultiplicative: showMultiplicative, 
    semigroupMultiplicative: semigroupMultiplicative, 
    monoidMultiplicative: monoidMultiplicative
};

},{"Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Monoid = function (__superclass_Prelude$dotSemigroup_0, mempty) {
    this["__superclass_Prelude.Semigroup_0"] = __superclass_Prelude$dotSemigroup_0;
    this.mempty = mempty;
};
var monoidUnit = new Monoid(function () {
    return Prelude.semigroupUnit;
}, Prelude.unit);
var monoidString = new Monoid(function () {
    return Prelude.semigroupString;
}, "");
var monoidArray = new Monoid(function () {
    return Prelude.semigroupArray;
}, [  ]);
var mempty = function (dict) {
    return dict.mempty;
};
var monoidFn = function (__dict_Monoid_0) {
    return new Monoid(function () {
        return Prelude.semigroupFn(__dict_Monoid_0["__superclass_Prelude.Semigroup_0"]());
    }, Prelude["const"](mempty(__dict_Monoid_0)));
};
module.exports = {
    Monoid: Monoid, 
    mempty: mempty, 
    monoidUnit: monoidUnit, 
    monoidFn: monoidFn, 
    monoidString: monoidString, 
    monoidArray: monoidArray
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Nullable/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Nullable

exports["null"] = null;

exports.nullable = function(a, r, f) {
    return a == null ? r : f(a);
};

exports.notNull = function(x) {
    return x;
}; 

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Nullable/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Function = require("Data.Function");
var toNullable = Data_Maybe.maybe($foreign["null"])($foreign.notNull);
var toMaybe = function (n) {
    return $foreign.nullable(n, Data_Maybe.Nothing.value, Data_Maybe.Just.create);
};
var showNullable = function (__dict_Show_0) {
    return new Prelude.Show(function (n) {
        var _1603 = toMaybe(n);
        if (_1603 instanceof Data_Maybe.Nothing) {
            return "null";
        };
        if (_1603 instanceof Data_Maybe.Just) {
            return Prelude.show(__dict_Show_0)(_1603.value0);
        };
        throw new Error("Failed pattern match at Data.Nullable line 37, column 1 - line 42, column 1: " + [ _1603.constructor.name ]);
    });
};
var eqNullable = function (__dict_Eq_2) {
    return new Prelude.Eq(Data_Function.on(Prelude.eq(Data_Maybe.eqMaybe(__dict_Eq_2)))(toMaybe));
};
var ordNullable = function (__dict_Ord_1) {
    return new Prelude.Ord(function () {
        return eqNullable(__dict_Ord_1["__superclass_Prelude.Eq_0"]());
    }, Data_Function.on(Prelude.compare(Data_Maybe.ordMaybe(__dict_Ord_1)))(toMaybe));
};
module.exports = {
    toNullable: toNullable, 
    toMaybe: toMaybe, 
    showNullable: showNullable, 
    eqNullable: eqNullable, 
    ordNullable: ordNullable
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Nullable/foreign.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor.Choice/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_Either = require("Data.Either");
var Data_Profunctor = require("Data.Profunctor");
var Choice = function (__superclass_Data$dotProfunctor$dotProfunctor_0, left, right) {
    this["__superclass_Data.Profunctor.Profunctor_0"] = __superclass_Data$dotProfunctor$dotProfunctor_0;
    this.left = left;
    this.right = right;
};
var right = function (dict) {
    return dict.right;
};
var left = function (dict) {
    return dict.left;
};
var $plus$plus$plus = function (__dict_Category_0) {
    return function (__dict_Choice_1) {
        return function (l) {
            return function (r) {
                return Prelude[">>>"](__dict_Category_0["__superclass_Prelude.Semigroupoid_0"]())(left(__dict_Choice_1)(l))(right(__dict_Choice_1)(r));
            };
        };
    };
};
var $bar$bar$bar = function (__dict_Category_2) {
    return function (__dict_Choice_3) {
        return function (l) {
            return function (r) {
                var join = Data_Profunctor.dimap(__dict_Choice_3["__superclass_Data.Profunctor.Profunctor_0"]())(Data_Either.either(Prelude.id(Prelude.categoryFn))(Prelude.id(Prelude.categoryFn)))(Prelude.id(Prelude.categoryFn))(Prelude.id(__dict_Category_2));
                return Prelude[">>>"](__dict_Category_2["__superclass_Prelude.Semigroupoid_0"]())($plus$plus$plus(__dict_Category_2)(__dict_Choice_3)(l)(r))(join);
            };
        };
    };
};
var choiceFn = new Choice(function () {
    return Data_Profunctor.profunctorFn;
}, function (a2b) {
    return function (_498) {
        if (_498 instanceof Data_Either.Left) {
            return Data_Either.Left.create(a2b(_498.value0));
        };
        if (_498 instanceof Data_Either.Right) {
            return new Data_Either.Right(_498.value0);
        };
        throw new Error("Failed pattern match at Data.Profunctor.Choice line 17, column 1 - line 22, column 1: " + [ a2b.constructor.name, _498.constructor.name ]);
    };
}, Prelude["<$>"](Data_Either.functorEither));
module.exports = {
    Choice: Choice, 
    "|||": $bar$bar$bar, 
    "+++": $plus$plus$plus, 
    right: right, 
    left: left, 
    choiceFn: choiceFn
};

},{"Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Profunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor.Strong/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_Profunctor = require("Data.Profunctor");
var Data_Tuple = require("Data.Tuple");
var Strong = function (__superclass_Data$dotProfunctor$dotProfunctor_0, first, second) {
    this["__superclass_Data.Profunctor.Profunctor_0"] = __superclass_Data$dotProfunctor$dotProfunctor_0;
    this.first = first;
    this.second = second;
};
var strongFn = new Strong(function () {
    return Data_Profunctor.profunctorFn;
}, function (a2b) {
    return function (_72) {
        return new Data_Tuple.Tuple(a2b(_72.value0), _72.value1);
    };
}, Prelude["<$>"](Data_Tuple.functorTuple));
var second = function (dict) {
    return dict.second;
};
var first = function (dict) {
    return dict.first;
};
var $times$times$times = function (__dict_Category_0) {
    return function (__dict_Strong_1) {
        return function (l) {
            return function (r) {
                return Prelude[">>>"](__dict_Category_0["__superclass_Prelude.Semigroupoid_0"]())(first(__dict_Strong_1)(l))(second(__dict_Strong_1)(r));
            };
        };
    };
};
var $amp$amp$amp = function (__dict_Category_2) {
    return function (__dict_Strong_3) {
        return function (l) {
            return function (r) {
                var split = Data_Profunctor.dimap(__dict_Strong_3["__superclass_Data.Profunctor.Profunctor_0"]())(Prelude.id(Prelude.categoryFn))(function (a) {
                    return new Data_Tuple.Tuple(a, a);
                })(Prelude.id(__dict_Category_2));
                return Prelude[">>>"](__dict_Category_2["__superclass_Prelude.Semigroupoid_0"]())(split)($times$times$times(__dict_Category_2)(__dict_Strong_3)(l)(r));
            };
        };
    };
};
module.exports = {
    Strong: Strong, 
    "&&&": $amp$amp$amp, 
    "***": $times$times$times, 
    second: second, 
    first: first, 
    strongFn: strongFn
};

},{"Data.Profunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Profunctor = function (dimap) {
    this.dimap = dimap;
};
var profunctorFn = new Profunctor(function (a2b) {
    return function (c2d) {
        return function (b2c) {
            return Prelude[">>>"](Prelude.semigroupoidFn)(a2b)(Prelude[">>>"](Prelude.semigroupoidFn)(b2c)(c2d));
        };
    };
});
var dimap = function (dict) {
    return dict.dimap;
};
var lmap = function (__dict_Profunctor_0) {
    return function (a2b) {
        return dimap(__dict_Profunctor_0)(a2b)(Prelude.id(Prelude.categoryFn));
    };
};
var rmap = function (__dict_Profunctor_1) {
    return function (b2c) {
        return dimap(__dict_Profunctor_1)(Prelude.id(Prelude.categoryFn))(b2c);
    };
};
var arr = function (__dict_Category_2) {
    return function (__dict_Profunctor_3) {
        return function (f) {
            return rmap(__dict_Profunctor_3)(f)(Prelude.id(__dict_Category_2));
        };
    };
};
module.exports = {
    Profunctor: Profunctor, 
    arr: arr, 
    rmap: rmap, 
    lmap: lmap, 
    dimap: dimap, 
    profunctorFn: profunctorFn
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap.ST/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.StrMap.ST

exports["new"] = function () {
  return {};
};

exports.peek = function (m) {
  return function (k) {
    return function () {
      return m[k];
    };
  };
};

exports.poke = function (m) {
  return function (k) {
    return function (v) {
      return function () {
        m[k] = v;
        return m;
      };
    };
  };
};

exports["delete"] = function (m) {
  return function (k) {
    return function () {
      delete m[k];
      return m;
    };
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap.ST/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");
module.exports = {
    "delete": $foreign["delete"], 
    poke: $foreign.poke, 
    peek: $foreign.peek, 
    "new": $foreign["new"]
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap.ST/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.StrMap

exports._copy = function (m) {
  var r = {};
  for (var k in m) {
    if (m.hasOwnProperty(k)) {
      r[k] = m[k];
    }
  }
  return r;
};

exports._copyEff = function (m) {
  return function () {
    var r = {};
    for (var k in m) {
      if (m.hasOwnProperty(k)) {
        r[k] = m[k];
      }
    }
    return r;
  };
};

exports.empty = {};

exports.runST = function (f) {
  return f;
};

// jshint maxparams: 2
exports._fmapStrMap = function (m0, f) {
  var m = {};
  for (var k in m0) {
    if (m0.hasOwnProperty(k)) {
      m[k] = f(m0[k]);
    }
  }
  return m;
};

// jshint maxparams: 1
exports._foldM = function (bind) {
  return function (f) {
    return function (mz) {
      return function (m) {
        function g (k) {
          return function (z) {
            return f(z)(k)(m[k]);
          };
        }
        for (var k in m) {
          if (m.hasOwnProperty(k)) {
            mz = bind(mz)(g(k));
          }
        }
        return mz;
      };
    };
  };
};

// jshint maxparams: 4
exports._foldSCStrMap = function (m, z, f, fromMaybe) {
  for (var k in m) {
    if (m.hasOwnProperty(k)) {
      var maybeR = f(z)(k)(m[k]);
      var r = fromMaybe(null)(maybeR);
      if (r === null) return z;
      else z = r;
    }
  }
  return z;
};

// jshint maxparams: 1
exports.all = function (f) {
  return function (m) {
    for (var k in m) {
      if (m.hasOwnProperty(k) && !f(k)(m[k])) return false;
    }
    return true;
  };
};

exports.size = function (m) {
  var s = 0;
  for (var k in m) {
    if (m.hasOwnProperty(k)) {
      ++s;
    }
  }
  return s;
};

// jshint maxparams: 4
exports._lookup = function (no, yes, k, m) {
  return k in m ? yes(m[k]) : no;
};

// jshint maxparams: 2
exports._unsafeDeleteStrMap = function (m, k) {
  delete m[k];
  return m;
};

// jshint maxparams: 4
exports._lookupST = function (no, yes, k, m) {
  return function () {
    return k in m ? yes(m[k]) : no;
  };
};

function _collect (f) {
  return function (m) {
    var r = [];
    for (var k in m) {
      if (m.hasOwnProperty(k)) {
        r.push(f(k)(m[k]));
      }
    }
    return r;
  };
}

exports._collect = _collect;

exports.keys = Object.keys || _collect(function (k) {
  return function () { return k; };
});

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var $foreign = require("./foreign");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Prelude = require("Prelude");
var Data_Function = require("Data.Function");
var Data_Monoid = require("Data.Monoid");
var Data_Foldable = require("Data.Foldable");
var Data_Tuple = require("Data.Tuple");
var Data_Traversable = require("Data.Traversable");
var Data_Maybe = require("Data.Maybe");
var Data_StrMap_ST = require("Data.StrMap.ST");
var Data_List = require("Data.List");
var Control_Monad_ST = require("Control.Monad.ST");
var values = Prelude["<<<"](Prelude.semigroupoidFn)(Data_List.toList(Data_Foldable.foldableArray))($foreign._collect(function (_280) {
    return function (v) {
        return v;
    };
}));
var toList = Prelude["<<<"](Prelude.semigroupoidFn)(Data_List.toList(Data_Foldable.foldableArray))($foreign._collect(Data_Tuple.Tuple.create));
var thawST = $foreign._copyEff;
var showStrMap = function (__dict_Show_0) {
    return new Prelude.Show(function (m) {
        return "fromList " + Prelude.show(Data_List.showList(Data_Tuple.showTuple(Prelude.showString)(__dict_Show_0)))(toList(m));
    });
};
var pureST = function (f) {
    return Control_Monad_Eff.runPure($foreign.runST(f));
};
var singleton = function (k) {
    return function (v) {
        return pureST(function __do() {
            var _26 = Data_StrMap_ST["new"]();
            Data_StrMap_ST.poke(_26)(k)(v)();
            return Prelude["return"](Control_Monad_Eff.applicativeEff)(_26)();
        });
    };
};
var mutate = function (f) {
    return function (m) {
        return pureST(function __do() {
            var _25 = thawST(m)();
            f(_25)();
            return Prelude["return"](Control_Monad_Eff.applicativeEff)(_25)();
        });
    };
};
var member = Data_Function.runFn4($foreign._lookup)(false)(Prelude["const"](true));
var lookup = Data_Function.runFn4($foreign._lookup)(Data_Maybe.Nothing.value)(Data_Maybe.Just.create);
var isSubmap = function (__dict_Eq_2) {
    return function (m1) {
        return function (m2) {
            var f = function (k) {
                return function (v) {
                    return $foreign._lookup(false, Prelude["=="](__dict_Eq_2)(v), k, m2);
                };
            };
            return $foreign.all(f)(m1);
        };
    };
};
var isEmpty = $foreign.all(function (_277) {
    return function (_276) {
        return false;
    };
});
var insert = function (k) {
    return function (v) {
        return mutate(function (s) {
            return Data_StrMap_ST.poke(s)(k)(v);
        });
    };
};
var functorStrMap = new Prelude.Functor(function (f) {
    return function (m) {
        return $foreign._fmapStrMap(m, f);
    };
});
var fromListWith = function (f) {
    return function (l) {
        return pureST(function __do() {
            var _28 = Data_StrMap_ST["new"]();
            Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_List.foldableList)(l)(function (_279) {
                return Prelude[">>="](Control_Monad_Eff.bindEff)($foreign._lookupST(_279.value1, f(_279.value1), _279.value0, _28))(Data_StrMap_ST.poke(_28)(_279.value0));
            })();
            return Prelude["return"](Control_Monad_Eff.applicativeEff)(_28)();
        });
    };
};
var fromList = function (l) {
    return pureST(function __do() {
        var _27 = Data_StrMap_ST["new"]();
        Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_List.foldableList)(l)(function (_278) {
            return Data_StrMap_ST.poke(_27)(_278.value0)(_278.value1);
        })();
        return Prelude["return"](Control_Monad_Eff.applicativeEff)(_27)();
    });
};
var freezeST = $foreign._copyEff;
var foldMaybe = function (f) {
    return function (z) {
        return function (m) {
            return $foreign._foldSCStrMap(m, z, f, Data_Maybe.fromMaybe);
        };
    };
};
var foldM = function (__dict_Monad_3) {
    return function (f) {
        return function (z) {
            return $foreign._foldM(Prelude[">>="](__dict_Monad_3["__superclass_Prelude.Bind_1"]()))(f)(Prelude.pure(__dict_Monad_3["__superclass_Prelude.Applicative_0"]())(z));
        };
    };
};
var semigroupStrMap = function (__dict_Semigroup_4) {
    return new Prelude.Semigroup(function (m1) {
        return function (m2) {
            return mutate(function (s1) {
                return foldM(Control_Monad_Eff.monadEff)(function (s2) {
                    return function (k) {
                        return function (v2) {
                            return Data_StrMap_ST.poke(s2)(k)($foreign._lookup(v2, function (v1) {
                                return Prelude["<>"](__dict_Semigroup_4)(v1)(v2);
                            }, k, m2));
                        };
                    };
                })(s1)(m1);
            })(m2);
        };
    });
};
var monoidStrMap = function (__dict_Semigroup_1) {
    return new Data_Monoid.Monoid(function () {
        return semigroupStrMap(__dict_Semigroup_1);
    }, $foreign.empty);
};
var union = function (m) {
    return mutate(function (s) {
        return foldM(Control_Monad_Eff.monadEff)(Data_StrMap_ST.poke)(s)(m);
    });
};
var unions = Data_Foldable.foldl(Data_List.foldableList)(union)($foreign.empty);
var fold = $foreign._foldM(Prelude["#"]);
var foldMap = function (__dict_Monoid_7) {
    return function (f) {
        return fold(function (acc) {
            return function (k) {
                return function (v) {
                    return Prelude["<>"](__dict_Monoid_7["__superclass_Prelude.Semigroup_0"]())(acc)(f(k)(v));
                };
            };
        })(Data_Monoid.mempty(__dict_Monoid_7));
    };
};
var foldableStrMap = new Data_Foldable.Foldable(function (__dict_Monoid_8) {
    return function (f) {
        return foldMap(__dict_Monoid_8)(Prelude["const"](f));
    };
}, function (f) {
    return fold(function (z) {
        return function (_275) {
            return f(z);
        };
    });
}, function (f) {
    return function (z) {
        return function (m) {
            return Data_Foldable.foldr(Data_List.foldableList)(f)(z)(values(m));
        };
    };
});
var traversableStrMap = new Data_Traversable.Traversable(function () {
    return foldableStrMap;
}, function () {
    return functorStrMap;
}, function (__dict_Applicative_6) {
    return Data_Traversable.traverse(traversableStrMap)(__dict_Applicative_6)(Prelude.id(Prelude.categoryFn));
}, function (__dict_Applicative_5) {
    return function (f) {
        return function (ms) {
            return Data_Foldable.foldr(Data_List.foldableList)(function (x) {
                return function (acc) {
                    return Prelude["<*>"](__dict_Applicative_5["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(union)(x))(acc);
                };
            })(Prelude.pure(__dict_Applicative_5)($foreign.empty))(Prelude["<$>"](Data_List.functorList)(Prelude.map((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Tuple.uncurry(singleton)))(Prelude["<$>"](Data_List.functorList)(Data_Traversable.traverse(Data_Tuple.traversableTuple)(__dict_Applicative_5)(f))(toList(ms))));
        };
    };
});
var eqStrMap = function (__dict_Eq_9) {
    return new Prelude.Eq(function (m1) {
        return function (m2) {
            return isSubmap(__dict_Eq_9)(m1)(m2) && isSubmap(__dict_Eq_9)(m2)(m1);
        };
    });
};
var $$delete = function (k) {
    return mutate(function (s) {
        return Data_StrMap_ST["delete"](s)(k);
    });
};
var alter = function (f) {
    return function (k) {
        return function (m) {
            var _534 = f(lookup(k)(m));
            if (_534 instanceof Data_Maybe.Nothing) {
                return $$delete(k)(m);
            };
            if (_534 instanceof Data_Maybe.Just) {
                return insert(k)(_534.value0)(m);
            };
            throw new Error("Failed pattern match at Data.StrMap line 175, column 1 - line 176, column 1: " + [ _534.constructor.name ]);
        };
    };
};
var update = function (f) {
    return function (k) {
        return function (m) {
            return alter(Data_Maybe.maybe(Data_Maybe.Nothing.value)(f))(k)(m);
        };
    };
};
module.exports = {
    freezeST: freezeST, 
    thawST: thawST, 
    foldMaybe: foldMaybe, 
    foldM: foldM, 
    foldMap: foldMap, 
    fold: fold, 
    isSubmap: isSubmap, 
    unions: unions, 
    union: union, 
    values: values, 
    update: update, 
    alter: alter, 
    member: member, 
    "delete": $$delete, 
    fromListWith: fromListWith, 
    fromList: fromList, 
    toList: toList, 
    lookup: lookup, 
    insert: insert, 
    singleton: singleton, 
    isEmpty: isEmpty, 
    functorStrMap: functorStrMap, 
    foldableStrMap: foldableStrMap, 
    traversableStrMap: traversableStrMap, 
    eqStrMap: eqStrMap, 
    showStrMap: showStrMap, 
    semigroupStrMap: semigroupStrMap, 
    monoidStrMap: monoidStrMap, 
    runST: $foreign.runST, 
    all: $foreign.all, 
    keys: $foreign.keys, 
    size: $foreign.size, 
    empty: $foreign.empty
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.List":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.List/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.StrMap.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap.ST/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String.Unsafe/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.String.Unsafe

exports.charCodeAt = function (i) {
  return function (s) {
    if (i >= 0 && i < s.length) return s.charCodeAt(i);
    throw new Error("Data.String.Unsafe.charCodeAt: Invalid index.");
  };
};

exports.charAt = function (i) {
  return function (s) {
    if (i >= 0 && i < s.length) return s.charAt(i);
    throw new Error("Data.String.Unsafe.charAt: Invalid index.");
  };
};

exports.char = function (s) {
  if (s.length === 1) return s.charAt(0);
  throw new Error("Data.String.Unsafe.char: Expected string of length 1.");
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String.Unsafe/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Data_Char = require("Data.Char");
module.exports = {
    charCodeAt: $foreign.charCodeAt, 
    charAt: $foreign.charAt, 
    "char": $foreign["char"]
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String.Unsafe/foreign.js","Data.Char":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Char/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.String

exports._charAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (s) {
        return i >= 0 && i < s.length ? just(s.charAt(i)) : nothing;
      };
    };
  };
};

exports._charCodeAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (s) {
        return i >= 0 && i < s.length ? just(s.charCodeAt(i)) : nothing;
      };
    };
  };
};

exports._toChar = function (just) {
  return function (nothing) {
    return function (s) {
      return s.length === 1 ? just(s) : nothing;
    };
  };
};

exports.fromCharArray = function (a) {
  return a.join("");
};

exports._indexOf = function (just) {
  return function (nothing) {
    return function (x) {
      return function (s) {
        var i = s.indexOf(x);
        return i === -1 ? nothing : just(i);
      };
    };
  };
};

exports["_indexOf'"] = function (just) {
  return function (nothing) {
    return function (x) {
      return function (startAt) {
        return function (s) {
          if (startAt < 0 || startAt > s.length) return nothing;
          var i = s.indexOf(x, startAt);
          return i === -1 ? nothing : just(i);
        };
      };
    };
  };
};

exports._lastIndexOf = function (just) {
  return function (nothing) {
    return function (x) {
      return function (s) {
        var i = s.lastIndexOf(x);
        return i === -1 ? nothing : just(i);
      };
    };
  };
};

exports["_lastIndexOf'"] = function (just) {
  return function (nothing) {
    return function (x) {
      return function (startAt) {
        return function (s) {
          if (startAt < 0 || startAt > s.length) return nothing;
          var i = s.lastIndexOf(x, startAt);
          return i === -1 ? nothing : just(i);
        };
      };
    };
  };
};

exports.length = function (s) {
  return s.length;
};

exports._localeCompare = function (lt) {
  return function (eq) {
    return function (gt) {
      return function (s1) {
        return function (s2) {
          var result = s1.localeCompare(s2);
          return result < 0 ? lt : result > 0 ? gt : eq;
        };
      };
    };
  };
};

exports.replace = function (s1) {
  return function (s2) {
    return function (s3) {
      return s3.replace(s1, s2);
    };
  };
};

exports.take = function (n) {
  return function (s) {
    return s.substr(0, n);
  };
};

exports.drop = function (n) {
  return function (s) {
    return s.substr(n);
  };
};

exports.count = function (p) {
  return function (s) {
    for (var i = 0; i < s.length && p(s.charAt(i)); i++); {}
    return i;
  };
};

exports.split = function (sep) {
  return function (s) {
    return s.split(sep);
  };
};

exports.toCharArray = function (s) {
  return s.split("");
};

exports.toLower = function (s) {
  return s.toLowerCase();
};

exports.toUpper = function (s) {
  return s.toUpperCase();
};

exports.trim = function (s) {
  return s.trim();
};

exports.joinWith = function (s) {
  return function (xs) {
    return xs.join(s);
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Char = require("Data.Char");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var Data_String_Unsafe = require("Data.String.Unsafe");
var uncons = function (_443) {
    if (_443 === "") {
        return Data_Maybe.Nothing.value;
    };
    return new Data_Maybe.Just({
        head: Data_String_Unsafe.charAt(0)(_443), 
        tail: $foreign.drop(1)(_443)
    });
};
var toChar = $foreign._toChar(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var takeWhile = function (p) {
    return function (s) {
        return $foreign.take($foreign.count(p)(s))(s);
    };
};
var $$null = function (s) {
    return $foreign.length(s) === 0;
};
var localeCompare = $foreign._localeCompare(Prelude.LT.value)(Prelude.EQ.value)(Prelude.GT.value);
var lastIndexOf$prime = $foreign["_lastIndexOf'"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var lastIndexOf = $foreign._lastIndexOf(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var stripSuffix = function (suffix) {
    return function (str) {
        var _1606 = lastIndexOf(suffix)(str);
        if (_1606 instanceof Data_Maybe.Just && _1606.value0 === $foreign.length(str) - $foreign.length(suffix)) {
            return Data_Maybe.Just.create($foreign.take(_1606.value0)(str));
        };
        return Data_Maybe.Nothing.value;
    };
};
var indexOf$prime = $foreign["_indexOf'"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var indexOf = $foreign._indexOf(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var stripPrefix = function (prefix) {
    return function (str) {
        var _1608 = indexOf(prefix)(str);
        if (_1608 instanceof Data_Maybe.Just && _1608.value0 === 0) {
            return Data_Maybe.Just.create($foreign.drop($foreign.length(prefix))(str));
        };
        return Data_Maybe.Nothing.value;
    };
};
var fromChar = Data_Char.toString;
var singleton = fromChar;
var dropWhile = function (p) {
    return function (s) {
        return $foreign.drop($foreign.count(p)(s))(s);
    };
};
var contains = function (x) {
    return function (s) {
        return Data_Maybe.isJust(indexOf(x)(s));
    };
};
var charCodeAt = $foreign._charCodeAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var charAt = $foreign._charAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
module.exports = {
    stripSuffix: stripSuffix, 
    stripPrefix: stripPrefix, 
    dropWhile: dropWhile, 
    takeWhile: takeWhile, 
    localeCompare: localeCompare, 
    singleton: singleton, 
    uncons: uncons, 
    "null": $$null, 
    "lastIndexOf'": lastIndexOf$prime, 
    lastIndexOf: lastIndexOf, 
    "indexOf'": indexOf$prime, 
    indexOf: indexOf, 
    contains: contains, 
    toChar: toChar, 
    fromChar: fromChar, 
    charCodeAt: charCodeAt, 
    charAt: charAt, 
    joinWith: $foreign.joinWith, 
    trim: $foreign.trim, 
    toUpper: $foreign.toUpper, 
    toLower: $foreign.toLower, 
    toCharArray: $foreign.toCharArray, 
    split: $foreign.split, 
    drop: $foreign.drop, 
    take: $foreign.take, 
    count: $foreign.count, 
    replace: $foreign.replace, 
    length: $foreign.length, 
    fromCharArray: $foreign.fromCharArray
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/foreign.js","Data.Char":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Char/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.String.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String.Unsafe/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Time/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Seconds = function (x) {
    return x;
};
var SecondOfMinute = function (x) {
    return x;
};
var Minutes = function (x) {
    return x;
};
var MinuteOfHour = function (x) {
    return x;
};
var Milliseconds = function (x) {
    return x;
};
var MillisecondOfSecond = function (x) {
    return x;
};
var Hours = function (x) {
    return x;
};
var HourOfDay = function (x) {
    return x;
};
var TimeValue = function (fromHours, fromMilliseconds, fromMinutes, fromSeconds, toHours, toMilliseconds, toMinutes, toSeconds) {
    this.fromHours = fromHours;
    this.fromMilliseconds = fromMilliseconds;
    this.fromMinutes = fromMinutes;
    this.fromSeconds = fromSeconds;
    this.toHours = toHours;
    this.toMilliseconds = toMilliseconds;
    this.toMinutes = toMinutes;
    this.toSeconds = toSeconds;
};
var toSeconds = function (dict) {
    return dict.toSeconds;
};
var toMinutes = function (dict) {
    return dict.toMinutes;
};
var toMilliseconds = function (dict) {
    return dict.toMilliseconds;
};
var toHours = function (dict) {
    return dict.toHours;
};
var timeValueSeconds = new TimeValue(function (_227) {
    return _227 * 3600.0;
}, function (_229) {
    return _229 / 1000.0;
}, function (_228) {
    return _228 * 60.0;
}, function (n) {
    return n;
}, function (_224) {
    return _224 / 3600.0;
}, function (_226) {
    return _226 * 1000.0;
}, function (_225) {
    return _225 / 60.0;
}, function (n) {
    return n;
});
var timeValueMinutes = new TimeValue(function (_221) {
    return _221 * 60.0;
}, function (_223) {
    return _223 / 60000.0;
}, function (n) {
    return n;
}, function (_222) {
    return _222 / 60.0;
}, function (_218) {
    return _218 / 60.0;
}, function (_220) {
    return _220 * 60000.0;
}, function (n) {
    return n;
}, function (_219) {
    return _219 * 60.0;
});
var timeValueMilliseconds = new TimeValue(function (_233) {
    return _233 * 3600000.0;
}, function (n) {
    return n;
}, function (_234) {
    return _234 * 60000.0;
}, function (_235) {
    return _235 * 1000.0;
}, function (_230) {
    return _230 / 3600000.0;
}, function (n) {
    return n;
}, function (_231) {
    return _231 / 60000.0;
}, function (_232) {
    return _232 / 1000.0;
});
var timeValueHours = new TimeValue(function (n) {
    return n;
}, function (_217) {
    return _217 / 3600000.0;
}, function (_215) {
    return _215 / 60.0;
}, function (_216) {
    return _216 / 3600.0;
}, function (n) {
    return n;
}, function (_214) {
    return _214 * 3600000.0;
}, function (_212) {
    return _212 * 60.0;
}, function (_213) {
    return _213 * 3600.0;
});
var showSeconds = new Prelude.Show(function (_192) {
    return "(Seconds " + (Prelude.show(Prelude.showNumber)(_192) + ")");
});
var showMinutes = new Prelude.Show(function (_173) {
    return "(Minutes " + (Prelude.show(Prelude.showNumber)(_173) + ")");
});
var showMilliseconds = new Prelude.Show(function (_211) {
    return "(Milliseconds " + (Prelude.show(Prelude.showNumber)(_211) + ")");
});
var showHours = new Prelude.Show(function (_154) {
    return "(Hours " + (Prelude.show(Prelude.showNumber)(_154) + ")");
});
var semiringSeconds = new Prelude.Semiring(function (_182) {
    return function (_183) {
        return _182 + _183;
    };
}, function (_184) {
    return function (_185) {
        return _184 * _185;
    };
}, 1.0, 0.0);
var semiringMinutes = new Prelude.Semiring(function (_163) {
    return function (_164) {
        return _163 + _164;
    };
}, function (_165) {
    return function (_166) {
        return _165 * _166;
    };
}, 1.0, 0.0);
var semiringMilliseconds = new Prelude.Semiring(function (_201) {
    return function (_202) {
        return _201 + _202;
    };
}, function (_203) {
    return function (_204) {
        return _203 * _204;
    };
}, 1.0, 0.0);
var semiringHours = new Prelude.Semiring(function (_144) {
    return function (_145) {
        return _144 + _145;
    };
}, function (_146) {
    return function (_147) {
        return _146 * _147;
    };
}, 1.0, 0.0);
var ringSeconds = new Prelude.Ring(function () {
    return semiringSeconds;
}, function (_186) {
    return function (_187) {
        return _186 - _187;
    };
});
var ringMinutes = new Prelude.Ring(function () {
    return semiringMinutes;
}, function (_167) {
    return function (_168) {
        return _167 - _168;
    };
});
var ringMilliseconds = new Prelude.Ring(function () {
    return semiringMilliseconds;
}, function (_205) {
    return function (_206) {
        return _205 - _206;
    };
});
var ringHours = new Prelude.Ring(function () {
    return semiringHours;
}, function (_148) {
    return function (_149) {
        return _148 - _149;
    };
});
var moduloSemiringSeconds = new Prelude.ModuloSemiring(function () {
    return semiringSeconds;
}, function (_188) {
    return function (_189) {
        return _188 / _189;
    };
}, function (_190) {
    return function (_191) {
        return 0.0;
    };
});
var moduloSemiringMinutes = new Prelude.ModuloSemiring(function () {
    return semiringMinutes;
}, function (_169) {
    return function (_170) {
        return _169 / _170;
    };
}, function (_171) {
    return function (_172) {
        return 0.0;
    };
});
var moduloSemiringMilliseconds = new Prelude.ModuloSemiring(function () {
    return semiringMilliseconds;
}, function (_207) {
    return function (_208) {
        return _207 / _208;
    };
}, function (_209) {
    return function (_210) {
        return 0.0;
    };
});
var moduloSemiringHours = new Prelude.ModuloSemiring(function () {
    return semiringHours;
}, function (_150) {
    return function (_151) {
        return _150 / _151;
    };
}, function (_152) {
    return function (_153) {
        return 0.0;
    };
});
var fromSeconds = function (dict) {
    return dict.fromSeconds;
};
var fromMinutes = function (dict) {
    return dict.fromMinutes;
};
var fromMilliseconds = function (dict) {
    return dict.fromMilliseconds;
};
var fromHours = function (dict) {
    return dict.fromHours;
};
var eqSeconds = new Prelude.Eq(function (_178) {
    return function (_179) {
        return _178 === _179;
    };
});
var ordSeconds = new Prelude.Ord(function () {
    return eqSeconds;
}, function (_180) {
    return function (_181) {
        return Prelude.compare(Prelude.ordNumber)(_180)(_181);
    };
});
var eqSecondOfMinute = new Prelude.Eq(function (_174) {
    return function (_175) {
        return _174 === _175;
    };
});
var ordSecondOfMinute = new Prelude.Ord(function () {
    return eqSecondOfMinute;
}, function (_176) {
    return function (_177) {
        return Prelude.compare(Prelude.ordInt)(_176)(_177);
    };
});
var eqMinutes = new Prelude.Eq(function (_159) {
    return function (_160) {
        return _159 === _160;
    };
});
var ordMinutes = new Prelude.Ord(function () {
    return eqMinutes;
}, function (_161) {
    return function (_162) {
        return Prelude.compare(Prelude.ordNumber)(_161)(_162);
    };
});
var eqMinuteOfHour = new Prelude.Eq(function (_155) {
    return function (_156) {
        return _155 === _156;
    };
});
var ordMinuteOfHour = new Prelude.Ord(function () {
    return eqMinuteOfHour;
}, function (_157) {
    return function (_158) {
        return Prelude.compare(Prelude.ordInt)(_157)(_158);
    };
});
var eqMilliseconds = new Prelude.Eq(function (_197) {
    return function (_198) {
        return _197 === _198;
    };
});
var ordMilliseconds = new Prelude.Ord(function () {
    return eqMilliseconds;
}, function (_199) {
    return function (_200) {
        return Prelude.compare(Prelude.ordNumber)(_199)(_200);
    };
});
var eqMillisecondOfSecond = new Prelude.Eq(function (_193) {
    return function (_194) {
        return _193 === _194;
    };
});
var ordMillisecondOfSecond = new Prelude.Ord(function () {
    return eqMillisecondOfSecond;
}, function (_195) {
    return function (_196) {
        return Prelude.compare(Prelude.ordInt)(_195)(_196);
    };
});
var eqHours = new Prelude.Eq(function (_140) {
    return function (_141) {
        return _140 === _141;
    };
});
var ordHours = new Prelude.Ord(function () {
    return eqHours;
}, function (_142) {
    return function (_143) {
        return Prelude.compare(Prelude.ordNumber)(_142)(_143);
    };
});
var eqHourOfDay = new Prelude.Eq(function (_136) {
    return function (_137) {
        return _136 === _137;
    };
});
var ordHourOfDay = new Prelude.Ord(function () {
    return eqHourOfDay;
}, function (_138) {
    return function (_139) {
        return Prelude.compare(Prelude.ordInt)(_138)(_139);
    };
});
var divisionRingSeconds = new Prelude.DivisionRing(function () {
    return moduloSemiringSeconds;
}, function () {
    return ringSeconds;
});
var numSeconds = new Prelude.Num(function () {
    return divisionRingSeconds;
});
var divisionRingMinutes = new Prelude.DivisionRing(function () {
    return moduloSemiringMinutes;
}, function () {
    return ringMinutes;
});
var numMinutes = new Prelude.Num(function () {
    return divisionRingMinutes;
});
var divisionRingMilliseconds = new Prelude.DivisionRing(function () {
    return moduloSemiringMilliseconds;
}, function () {
    return ringMilliseconds;
});
var numMilliseconds = new Prelude.Num(function () {
    return divisionRingMilliseconds;
});
var divisionRingHours = new Prelude.DivisionRing(function () {
    return moduloSemiringHours;
}, function () {
    return ringHours;
});
var numHours = new Prelude.Num(function () {
    return divisionRingHours;
});
module.exports = {
    Milliseconds: Milliseconds, 
    MillisecondOfSecond: MillisecondOfSecond, 
    Seconds: Seconds, 
    SecondOfMinute: SecondOfMinute, 
    Minutes: Minutes, 
    MinuteOfHour: MinuteOfHour, 
    Hours: Hours, 
    HourOfDay: HourOfDay, 
    TimeValue: TimeValue, 
    fromMilliseconds: fromMilliseconds, 
    fromSeconds: fromSeconds, 
    fromMinutes: fromMinutes, 
    fromHours: fromHours, 
    toMilliseconds: toMilliseconds, 
    toSeconds: toSeconds, 
    toMinutes: toMinutes, 
    toHours: toHours, 
    eqHourOfDay: eqHourOfDay, 
    ordHourOfDay: ordHourOfDay, 
    eqHours: eqHours, 
    ordHours: ordHours, 
    semiringHours: semiringHours, 
    ringHours: ringHours, 
    moduloSemiringHours: moduloSemiringHours, 
    divisionRingHours: divisionRingHours, 
    numHours: numHours, 
    showHours: showHours, 
    eqMinuteOfHour: eqMinuteOfHour, 
    ordMinuteOfHour: ordMinuteOfHour, 
    eqMinutes: eqMinutes, 
    ordMinutes: ordMinutes, 
    semiringMinutes: semiringMinutes, 
    ringMinutes: ringMinutes, 
    moduloSemiringMinutes: moduloSemiringMinutes, 
    divisionRingMinutes: divisionRingMinutes, 
    numMinutes: numMinutes, 
    showMinutes: showMinutes, 
    eqSecondOfMinute: eqSecondOfMinute, 
    ordSecondOfMinute: ordSecondOfMinute, 
    eqSeconds: eqSeconds, 
    ordSeconds: ordSeconds, 
    semiringSeconds: semiringSeconds, 
    ringSeconds: ringSeconds, 
    moduloSemiringSeconds: moduloSemiringSeconds, 
    divisionRingSeconds: divisionRingSeconds, 
    numSeconds: numSeconds, 
    showSeconds: showSeconds, 
    eqMillisecondOfSecond: eqMillisecondOfSecond, 
    ordMillisecondOfSecond: ordMillisecondOfSecond, 
    eqMilliseconds: eqMilliseconds, 
    ordMilliseconds: ordMilliseconds, 
    semiringMilliseconds: semiringMilliseconds, 
    ringMilliseconds: ringMilliseconds, 
    moduloSemiringMilliseconds: moduloSemiringMilliseconds, 
    divisionRingMilliseconds: divisionRingMilliseconds, 
    numMilliseconds: numMilliseconds, 
    showMilliseconds: showMilliseconds, 
    timeValueHours: timeValueHours, 
    timeValueMinutes: timeValueMinutes, 
    timeValueSeconds: timeValueSeconds, 
    timeValueMilliseconds: timeValueMilliseconds
};

},{"Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Data.Traversable

// jshint maxparams: 3

exports.traverseArrayImpl = function () {
  function Cont (fn) {
    this.fn = fn;
  }

  var emptyList = {};

  var ConsCell = function (head, tail) {
    this.head = head;
    this.tail = tail;
  };

  function consList (x) {
    return function (xs) {
      return new ConsCell(x, xs);
    };
  }

  function listToArray (list) {
    var arr = [];
    while (list !== emptyList) {
      arr.push(list.head);
      list = list.tail;
    }
    return arr;
  }

  return function (apply) {
    return function (map) {
      return function (pure) {
        return function (f) {
          var buildFrom = function (x, ys) {
            return apply(map(consList)(f(x)))(ys);
          };

          var go = function (acc, currentLen, xs) {
            if (currentLen === 0) {
              return acc;
            } else {
              var last = xs[currentLen - 1];
              return new Cont(function () {
                return go(buildFrom(last, acc), currentLen - 1, xs);
              });
            }
          };

          return function (array) {
            var result = go(pure(emptyList), array.length, array);
            while (result instanceof Cont) {
              result = result.fn();
            }

            return map(listToArray)(result);
          };
        };
      };
    };
  };
}();

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_Foldable = require("Data.Foldable");
var Data_Maybe = require("Data.Maybe");
var Data_Maybe_First = require("Data.Maybe.First");
var Data_Maybe_Last = require("Data.Maybe.Last");
var Data_Monoid_Additive = require("Data.Monoid.Additive");
var Data_Monoid_Dual = require("Data.Monoid.Dual");
var Data_Monoid_Multiplicative = require("Data.Monoid.Multiplicative");
var Data_Monoid_Disj = require("Data.Monoid.Disj");
var Data_Monoid_Conj = require("Data.Monoid.Conj");
var StateL = function (x) {
    return x;
};
var StateR = function (x) {
    return x;
};
var Traversable = function (__superclass_Data$dotFoldable$dotFoldable_1, __superclass_Prelude$dotFunctor_0, sequence, traverse) {
    this["__superclass_Data.Foldable.Foldable_1"] = __superclass_Data$dotFoldable$dotFoldable_1;
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
    this.sequence = sequence;
    this.traverse = traverse;
};
var traverse = function (dict) {
    return dict.traverse;
};
var traversableMultiplicative = new Traversable(function () {
    return Data_Foldable.foldableMultiplicative;
}, function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
}, function (__dict_Applicative_1) {
    return function (_467) {
        return Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Multiplicative.Multiplicative)(_467);
    };
}, function (__dict_Applicative_0) {
    return function (f) {
        return function (_466) {
            return Prelude["<$>"]((__dict_Applicative_0["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Multiplicative.Multiplicative)(f(_466));
        };
    };
});
var traversableMaybe = new Traversable(function () {
    return Data_Foldable.foldableMaybe;
}, function () {
    return Data_Maybe.functorMaybe;
}, function (__dict_Applicative_3) {
    return function (_453) {
        if (_453 instanceof Data_Maybe.Nothing) {
            return Prelude.pure(__dict_Applicative_3)(Data_Maybe.Nothing.value);
        };
        if (_453 instanceof Data_Maybe.Just) {
            return Prelude["<$>"]((__dict_Applicative_3["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe.Just.create)(_453.value0);
        };
        throw new Error("Failed pattern match at Data.Traversable line 59, column 1 - line 65, column 1: " + [ _453.constructor.name ]);
    };
}, function (__dict_Applicative_2) {
    return function (f) {
        return function (_452) {
            if (_452 instanceof Data_Maybe.Nothing) {
                return Prelude.pure(__dict_Applicative_2)(Data_Maybe.Nothing.value);
            };
            if (_452 instanceof Data_Maybe.Just) {
                return Prelude["<$>"]((__dict_Applicative_2["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe.Just.create)(f(_452.value0));
            };
            throw new Error("Failed pattern match at Data.Traversable line 59, column 1 - line 65, column 1: " + [ f.constructor.name, _452.constructor.name ]);
        };
    };
});
var traversableDual = new Traversable(function () {
    return Data_Foldable.foldableDual;
}, function () {
    return Data_Monoid_Dual.functorDual;
}, function (__dict_Applicative_5) {
    return function (_461) {
        return Prelude["<$>"]((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Dual.Dual)(_461);
    };
}, function (__dict_Applicative_4) {
    return function (f) {
        return function (_460) {
            return Prelude["<$>"]((__dict_Applicative_4["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Dual.Dual)(f(_460));
        };
    };
});
var traversableDisj = new Traversable(function () {
    return Data_Foldable.foldableDisj;
}, function () {
    return Data_Monoid_Disj.functorDisj;
}, function (__dict_Applicative_7) {
    return function (_465) {
        return Prelude["<$>"]((__dict_Applicative_7["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Disj.Disj)(_465);
    };
}, function (__dict_Applicative_6) {
    return function (f) {
        return function (_464) {
            return Prelude["<$>"]((__dict_Applicative_6["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Disj.Disj)(f(_464));
        };
    };
});
var traversableConj = new Traversable(function () {
    return Data_Foldable.foldableConj;
}, function () {
    return Data_Monoid_Conj.functorConj;
}, function (__dict_Applicative_9) {
    return function (_463) {
        return Prelude["<$>"]((__dict_Applicative_9["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Conj.Conj)(_463);
    };
}, function (__dict_Applicative_8) {
    return function (f) {
        return function (_462) {
            return Prelude["<$>"]((__dict_Applicative_8["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Conj.Conj)(f(_462));
        };
    };
});
var traversableArray = new Traversable(function () {
    return Data_Foldable.foldableArray;
}, function () {
    return Prelude.functorArray;
}, function (__dict_Applicative_11) {
    return traverse(traversableArray)(__dict_Applicative_11)(Prelude.id(Prelude.categoryFn));
}, function (__dict_Applicative_10) {
    return $foreign.traverseArrayImpl(Prelude.apply(__dict_Applicative_10["__superclass_Prelude.Apply_0"]()))(Prelude.map((__dict_Applicative_10["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]()))(Prelude.pure(__dict_Applicative_10));
});
var traversableAdditive = new Traversable(function () {
    return Data_Foldable.foldableAdditive;
}, function () {
    return Data_Monoid_Additive.functorAdditive;
}, function (__dict_Applicative_13) {
    return function (_459) {
        return Prelude["<$>"]((__dict_Applicative_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Additive.Additive)(_459);
    };
}, function (__dict_Applicative_12) {
    return function (f) {
        return function (_458) {
            return Prelude["<$>"]((__dict_Applicative_12["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Additive.Additive)(f(_458));
        };
    };
});
var stateR = function (_451) {
    return _451;
};
var stateL = function (_450) {
    return _450;
};
var sequence = function (dict) {
    return dict.sequence;
};
var traversableFirst = new Traversable(function () {
    return Data_Foldable.foldableFirst;
}, function () {
    return Data_Maybe_First.functorFirst;
}, function (__dict_Applicative_15) {
    return function (_455) {
        return Prelude["<$>"]((__dict_Applicative_15["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe_First.First)(sequence(traversableMaybe)(__dict_Applicative_15)(_455));
    };
}, function (__dict_Applicative_14) {
    return function (f) {
        return function (_454) {
            return Prelude["<$>"]((__dict_Applicative_14["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe_First.First)(traverse(traversableMaybe)(__dict_Applicative_14)(f)(_454));
        };
    };
});
var traversableLast = new Traversable(function () {
    return Data_Foldable.foldableLast;
}, function () {
    return Data_Maybe_Last.functorLast;
}, function (__dict_Applicative_17) {
    return function (_457) {
        return Prelude["<$>"]((__dict_Applicative_17["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe_Last.Last)(sequence(traversableMaybe)(__dict_Applicative_17)(_457));
    };
}, function (__dict_Applicative_16) {
    return function (f) {
        return function (_456) {
            return Prelude["<$>"]((__dict_Applicative_16["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe_Last.Last)(traverse(traversableMaybe)(__dict_Applicative_16)(f)(_456));
        };
    };
});
var functorStateR = new Prelude.Functor(function (f) {
    return function (k) {
        return function (s) {
            var _1657 = stateR(k)(s);
            return {
                accum: _1657.accum, 
                value: f(_1657.value)
            };
        };
    };
});
var functorStateL = new Prelude.Functor(function (f) {
    return function (k) {
        return function (s) {
            var _1660 = stateL(k)(s);
            return {
                accum: _1660.accum, 
                value: f(_1660.value)
            };
        };
    };
});
var $$for = function (__dict_Applicative_22) {
    return function (__dict_Traversable_23) {
        return function (x) {
            return function (f) {
                return traverse(__dict_Traversable_23)(__dict_Applicative_22)(f)(x);
            };
        };
    };
};
var applyStateR = new Prelude.Apply(function () {
    return functorStateR;
}, function (f) {
    return function (x) {
        return function (s) {
            var _1663 = stateR(x)(s);
            var _1664 = stateR(f)(_1663.accum);
            return {
                accum: _1664.accum, 
                value: _1664.value(_1663.value)
            };
        };
    };
});
var applyStateL = new Prelude.Apply(function () {
    return functorStateL;
}, function (f) {
    return function (x) {
        return function (s) {
            var _1669 = stateL(f)(s);
            var _1670 = stateL(x)(_1669.accum);
            return {
                accum: _1670.accum, 
                value: _1669.value(_1670.value)
            };
        };
    };
});
var applicativeStateR = new Prelude.Applicative(function () {
    return applyStateR;
}, function (a) {
    return function (s) {
        return {
            accum: s, 
            value: a
        };
    };
});
var mapAccumR = function (__dict_Traversable_18) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return stateR(traverse(__dict_Traversable_18)(applicativeStateR)(function (a) {
                    return function (s) {
                        return f(s)(a);
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanr = function (__dict_Traversable_19) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumR(__dict_Traversable_19)(function (b) {
                    return function (a) {
                        var b$prime = f(a)(b);
                        return {
                            accum: b$prime, 
                            value: b$prime
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var applicativeStateL = new Prelude.Applicative(function () {
    return applyStateL;
}, function (a) {
    return function (s) {
        return {
            accum: s, 
            value: a
        };
    };
});
var mapAccumL = function (__dict_Traversable_20) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return stateL(traverse(__dict_Traversable_20)(applicativeStateL)(function (a) {
                    return function (s) {
                        return f(s)(a);
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanl = function (__dict_Traversable_21) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumL(__dict_Traversable_21)(function (b) {
                    return function (a) {
                        var b$prime = f(b)(a);
                        return {
                            accum: b$prime, 
                            value: b$prime
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
module.exports = {
    Traversable: Traversable, 
    mapAccumR: mapAccumR, 
    mapAccumL: mapAccumL, 
    scanr: scanr, 
    scanl: scanl, 
    "for": $$for, 
    sequence: sequence, 
    traverse: traverse, 
    traversableArray: traversableArray, 
    traversableMaybe: traversableMaybe, 
    traversableFirst: traversableFirst, 
    traversableLast: traversableLast, 
    traversableAdditive: traversableAdditive, 
    traversableDual: traversableDual, 
    traversableConj: traversableConj, 
    traversableDisj: traversableDisj, 
    traversableMultiplicative: traversableMultiplicative
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/foreign.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.First":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.First/index.js","Data.Maybe.Last":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Last/index.js","Data.Monoid.Additive":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Additive/index.js","Data.Monoid.Conj":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Conj/index.js","Data.Monoid.Disj":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Disj/index.js","Data.Monoid.Dual":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Dual/index.js","Data.Monoid.Multiplicative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid.Multiplicative/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Control_Biapplicative = require("Control.Biapplicative");
var Control_Biapply = require("Control.Biapply");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Control_Lazy = require("Control.Lazy");
var Data_Bifoldable = require("Data.Bifoldable");
var Data_Bifunctor = require("Data.Bifunctor");
var Data_Bitraversable = require("Data.Bitraversable");
var Data_Foldable = require("Data.Foldable");
var Data_Functor_Invariant = require("Data.Functor.Invariant");
var Data_Maybe = require("Data.Maybe");
var Data_Maybe_First = require("Data.Maybe.First");
var Data_Monoid = require("Data.Monoid");
var Data_Traversable = require("Data.Traversable");
var Tuple = (function () {
    function Tuple(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Tuple.create = function (value0) {
        return function (value1) {
            return new Tuple(value0, value1);
        };
    };
    return Tuple;
})();
var uncurry = function (f) {
    return function (_543) {
        return f(_543.value0)(_543.value1);
    };
};
var swap = function (_544) {
    return new Tuple(_544.value1, _544.value0);
};
var snd = function (_542) {
    return _542.value1;
};
var showTuple = function (__dict_Show_2) {
    return function (__dict_Show_3) {
        return new Prelude.Show(function (_545) {
            return "Tuple (" + (Prelude.show(__dict_Show_2)(_545.value0) + (") (" + (Prelude.show(__dict_Show_3)(_545.value1) + ")")));
        });
    };
};
var semiringTuple = function (__dict_Semiring_4) {
    return function (__dict_Semiring_5) {
        return new Prelude.Semiring(function (_554) {
            return function (_555) {
                return new Tuple(Prelude.add(__dict_Semiring_4)(_554.value0)(_555.value0), Prelude.add(__dict_Semiring_5)(_554.value1)(_555.value1));
            };
        }, function (_556) {
            return function (_557) {
                return new Tuple(Prelude.mul(__dict_Semiring_4)(_556.value0)(_557.value0), Prelude.mul(__dict_Semiring_5)(_556.value1)(_557.value1));
            };
        }, new Tuple(Prelude.one(__dict_Semiring_4), Prelude.one(__dict_Semiring_5)), new Tuple(Prelude.zero(__dict_Semiring_4), Prelude.zero(__dict_Semiring_5)));
    };
};
var semigroupoidTuple = new Prelude.Semigroupoid(function (_550) {
    return function (_551) {
        return new Tuple(_551.value0, _550.value1);
    };
});
var semigroupTuple = function (__dict_Semigroup_6) {
    return function (__dict_Semigroup_7) {
        return new Prelude.Semigroup(function (_552) {
            return function (_553) {
                return new Tuple(Prelude["<>"](__dict_Semigroup_6)(_552.value0)(_553.value0), Prelude["<>"](__dict_Semigroup_7)(_552.value1)(_553.value1));
            };
        });
    };
};
var ringTuple = function (__dict_Ring_8) {
    return function (__dict_Ring_9) {
        return new Prelude.Ring(function () {
            return semiringTuple(__dict_Ring_8["__superclass_Prelude.Semiring_0"]())(__dict_Ring_9["__superclass_Prelude.Semiring_0"]());
        }, function (_562) {
            return function (_563) {
                return new Tuple(Prelude.sub(__dict_Ring_8)(_562.value0)(_563.value0), Prelude.sub(__dict_Ring_9)(_562.value1)(_563.value1));
            };
        });
    };
};
var monoidTuple = function (__dict_Monoid_14) {
    return function (__dict_Monoid_15) {
        return new Data_Monoid.Monoid(function () {
            return semigroupTuple(__dict_Monoid_14["__superclass_Prelude.Semigroup_0"]())(__dict_Monoid_15["__superclass_Prelude.Semigroup_0"]());
        }, new Tuple(Data_Monoid.mempty(__dict_Monoid_14), Data_Monoid.mempty(__dict_Monoid_15)));
    };
};
var moduloSemiringTuple = function (__dict_ModuloSemiring_17) {
    return function (__dict_ModuloSemiring_18) {
        return new Prelude.ModuloSemiring(function () {
            return semiringTuple(__dict_ModuloSemiring_17["__superclass_Prelude.Semiring_0"]())(__dict_ModuloSemiring_18["__superclass_Prelude.Semiring_0"]());
        }, function (_558) {
            return function (_559) {
                return new Tuple(Prelude.div(__dict_ModuloSemiring_17)(_558.value0)(_559.value0), Prelude.div(__dict_ModuloSemiring_18)(_558.value1)(_559.value1));
            };
        }, function (_560) {
            return function (_561) {
                return new Tuple(Prelude.mod(__dict_ModuloSemiring_17)(_560.value0)(_561.value0), Prelude.mod(__dict_ModuloSemiring_18)(_560.value1)(_561.value1));
            };
        });
    };
};
var lookup = function (__dict_Foldable_19) {
    return function (__dict_Eq_20) {
        return function (a) {
            return function (f) {
                return Data_Maybe_First.runFirst(Data_Foldable.foldMap(__dict_Foldable_19)(Data_Maybe_First.monoidFirst)(function (_540) {
                    var _1977 = Prelude["=="](__dict_Eq_20)(a)(_540.value0);
                    if (_1977) {
                        return new Data_Maybe.Just(_540.value1);
                    };
                    if (!_1977) {
                        return Data_Maybe.Nothing.value;
                    };
                    throw new Error("Failed pattern match at Data.Tuple line 173, column 1 - line 174, column 1: " + [ _1977.constructor.name ]);
                })(f));
            };
        };
    };
};
var functorTuple = new Prelude.Functor(function (f) {
    return function (_569) {
        return new Tuple(_569.value0, f(_569.value1));
    };
});
var invariantTuple = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorTuple));
var fst = function (_541) {
    return _541.value0;
};
var lazyTuple = function (__dict_Lazy_21) {
    return function (__dict_Lazy_22) {
        return new Control_Lazy.Lazy(function (f) {
            return new Tuple(Control_Lazy.defer(__dict_Lazy_21)(function (_538) {
                return fst(f(Prelude.unit));
            }), Control_Lazy.defer(__dict_Lazy_22)(function (_539) {
                return snd(f(Prelude.unit));
            }));
        });
    };
};
var foldableTuple = new Data_Foldable.Foldable(function (__dict_Monoid_23) {
    return function (f) {
        return function (_579) {
            return f(_579.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (_578) {
            return f(z)(_578.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (_577) {
            return f(_577.value1)(z);
        };
    };
});
var traversableTuple = new Data_Traversable.Traversable(function () {
    return foldableTuple;
}, function () {
    return functorTuple;
}, function (__dict_Applicative_1) {
    return function (_584) {
        return Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Tuple.create(_584.value0))(_584.value1);
    };
}, function (__dict_Applicative_0) {
    return function (f) {
        return function (_583) {
            return Prelude["<$>"]((__dict_Applicative_0["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Tuple.create(_583.value0))(f(_583.value1));
        };
    };
});
var extendTuple = new Control_Extend.Extend(function () {
    return functorTuple;
}, function (f) {
    return function (_576) {
        return new Tuple(_576.value0, f(_576));
    };
});
var eqTuple = function (__dict_Eq_24) {
    return function (__dict_Eq_25) {
        return new Prelude.Eq(function (_546) {
            return function (_547) {
                return Prelude["=="](__dict_Eq_24)(_546.value0)(_547.value0) && Prelude["=="](__dict_Eq_25)(_546.value1)(_547.value1);
            };
        });
    };
};
var ordTuple = function (__dict_Ord_10) {
    return function (__dict_Ord_11) {
        return new Prelude.Ord(function () {
            return eqTuple(__dict_Ord_10["__superclass_Prelude.Eq_0"]())(__dict_Ord_11["__superclass_Prelude.Eq_0"]());
        }, function (_548) {
            return function (_549) {
                var _2022 = Prelude.compare(__dict_Ord_10)(_548.value0)(_549.value0);
                if (_2022 instanceof Prelude.EQ) {
                    return Prelude.compare(__dict_Ord_11)(_548.value1)(_549.value1);
                };
                return _2022;
            };
        });
    };
};
var divisionRingTuple = function (__dict_DivisionRing_26) {
    return function (__dict_DivisionRing_27) {
        return new Prelude.DivisionRing(function () {
            return moduloSemiringTuple(__dict_DivisionRing_26["__superclass_Prelude.ModuloSemiring_1"]())(__dict_DivisionRing_27["__superclass_Prelude.ModuloSemiring_1"]());
        }, function () {
            return ringTuple(__dict_DivisionRing_26["__superclass_Prelude.Ring_0"]())(__dict_DivisionRing_27["__superclass_Prelude.Ring_0"]());
        });
    };
};
var numTuple = function (__dict_Num_12) {
    return function (__dict_Num_13) {
        return new Prelude.Num(function () {
            return divisionRingTuple(__dict_Num_12["__superclass_Prelude.DivisionRing_0"]())(__dict_Num_13["__superclass_Prelude.DivisionRing_0"]());
        });
    };
};
var curry = function (f) {
    return function (a) {
        return function (b) {
            return f(new Tuple(a, b));
        };
    };
};
var comonadTuple = new Control_Comonad.Comonad(function () {
    return extendTuple;
}, snd);
var boundedTuple = function (__dict_Bounded_28) {
    return function (__dict_Bounded_29) {
        return new Prelude.Bounded(new Tuple(Prelude.bottom(__dict_Bounded_28), Prelude.bottom(__dict_Bounded_29)), new Tuple(Prelude.top(__dict_Bounded_28), Prelude.top(__dict_Bounded_29)));
    };
};
var boundedOrdTuple = function (__dict_BoundedOrd_30) {
    return function (__dict_BoundedOrd_31) {
        return new Prelude.BoundedOrd(function () {
            return boundedTuple(__dict_BoundedOrd_30["__superclass_Prelude.Bounded_0"]())(__dict_BoundedOrd_31["__superclass_Prelude.Bounded_0"]());
        }, function () {
            return ordTuple(__dict_BoundedOrd_30["__superclass_Prelude.Ord_1"]())(__dict_BoundedOrd_31["__superclass_Prelude.Ord_1"]());
        });
    };
};
var booleanAlgebraTuple = function (__dict_BooleanAlgebra_32) {
    return function (__dict_BooleanAlgebra_33) {
        return new Prelude.BooleanAlgebra(function () {
            return boundedTuple(__dict_BooleanAlgebra_32["__superclass_Prelude.Bounded_0"]())(__dict_BooleanAlgebra_33["__superclass_Prelude.Bounded_0"]());
        }, function (_564) {
            return function (_565) {
                return new Tuple(Prelude.conj(__dict_BooleanAlgebra_32)(_564.value0)(_565.value0), Prelude.conj(__dict_BooleanAlgebra_33)(_564.value1)(_565.value1));
            };
        }, function (_566) {
            return function (_567) {
                return new Tuple(Prelude.disj(__dict_BooleanAlgebra_32)(_566.value0)(_567.value0), Prelude.disj(__dict_BooleanAlgebra_33)(_566.value1)(_567.value1));
            };
        }, function (_568) {
            return new Tuple(Prelude.not(__dict_BooleanAlgebra_32)(_568.value0), Prelude.not(__dict_BooleanAlgebra_33)(_568.value1));
        });
    };
};
var bifunctorTuple = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
        return function (_570) {
            return new Tuple(f(_570.value0), g(_570.value1));
        };
    };
});
var bifoldableTuple = new Data_Bifoldable.Bifoldable(function (__dict_Monoid_37) {
    return function (f) {
        return function (g) {
            return function (_580) {
                return Prelude["<>"](__dict_Monoid_37["__superclass_Prelude.Semigroup_0"]())(f(_580.value0))(g(_580.value1));
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (_582) {
                return g(f(z)(_582.value0))(_582.value1);
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (_581) {
                return f(_581.value0)(g(_581.value1)(z));
            };
        };
    };
});
var bitraversableTuple = new Data_Bitraversable.Bitraversable(function () {
    return bifoldableTuple;
}, function () {
    return bifunctorTuple;
}, function (__dict_Applicative_35) {
    return function (_586) {
        return Prelude["<*>"](__dict_Applicative_35["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_35["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Tuple.create)(_586.value0))(_586.value1);
    };
}, function (__dict_Applicative_34) {
    return function (f) {
        return function (g) {
            return function (_585) {
                return Prelude["<*>"](__dict_Applicative_34["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_34["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Tuple.create)(f(_585.value0)))(g(_585.value1));
            };
        };
    };
});
var biapplyTuple = new Control_Biapply.Biapply(function () {
    return bifunctorTuple;
}, function (_573) {
    return function (_574) {
        return new Tuple(_573.value0(_574.value0), _573.value1(_574.value1));
    };
});
var biapplicativeTuple = new Control_Biapplicative.Biapplicative(function () {
    return biapplyTuple;
}, Tuple.create);
var applyTuple = function (__dict_Semigroup_38) {
    return new Prelude.Apply(function () {
        return functorTuple;
    }, function (_571) {
        return function (_572) {
            return new Tuple(Prelude["<>"](__dict_Semigroup_38)(_571.value0)(_572.value0), _571.value1(_572.value1));
        };
    });
};
var bindTuple = function (__dict_Semigroup_36) {
    return new Prelude.Bind(function () {
        return applyTuple(__dict_Semigroup_36);
    }, function (_575) {
        return function (f) {
            var _2086 = f(_575.value1);
            return new Tuple(Prelude["<>"](__dict_Semigroup_36)(_575.value0)(_2086.value0), _2086.value1);
        };
    });
};
var applicativeTuple = function (__dict_Monoid_39) {
    return new Prelude.Applicative(function () {
        return applyTuple(__dict_Monoid_39["__superclass_Prelude.Semigroup_0"]());
    }, Tuple.create(Data_Monoid.mempty(__dict_Monoid_39)));
};
var monadTuple = function (__dict_Monoid_16) {
    return new Prelude.Monad(function () {
        return applicativeTuple(__dict_Monoid_16);
    }, function () {
        return bindTuple(__dict_Monoid_16["__superclass_Prelude.Semigroup_0"]());
    });
};
module.exports = {
    Tuple: Tuple, 
    lookup: lookup, 
    swap: swap, 
    uncurry: uncurry, 
    curry: curry, 
    snd: snd, 
    fst: fst, 
    showTuple: showTuple, 
    eqTuple: eqTuple, 
    ordTuple: ordTuple, 
    boundedTuple: boundedTuple, 
    boundedOrdTuple: boundedOrdTuple, 
    semigroupoidTuple: semigroupoidTuple, 
    semigroupTuple: semigroupTuple, 
    monoidTuple: monoidTuple, 
    semiringTuple: semiringTuple, 
    moduloSemiringTuple: moduloSemiringTuple, 
    ringTuple: ringTuple, 
    divisionRingTuple: divisionRingTuple, 
    numTuple: numTuple, 
    booleanAlgebraTuple: booleanAlgebraTuple, 
    functorTuple: functorTuple, 
    invariantTuple: invariantTuple, 
    bifunctorTuple: bifunctorTuple, 
    applyTuple: applyTuple, 
    biapplyTuple: biapplyTuple, 
    applicativeTuple: applicativeTuple, 
    biapplicativeTuple: biapplicativeTuple, 
    bindTuple: bindTuple, 
    monadTuple: monadTuple, 
    extendTuple: extendTuple, 
    comonadTuple: comonadTuple, 
    lazyTuple: lazyTuple, 
    foldableTuple: foldableTuple, 
    bifoldableTuple: bifoldableTuple, 
    traversableTuple: traversableTuple, 
    bitraversableTuple: bitraversableTuple
};

},{"Control.Biapplicative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Biapplicative/index.js","Control.Biapply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Biapply/index.js","Control.Comonad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Comonad/index.js","Control.Extend":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Extend/index.js","Control.Lazy":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Lazy/index.js","Data.Bifoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifoldable/index.js","Data.Bifunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bifunctor/index.js","Data.Bitraversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Bitraversable/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Functor.Invariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Invariant/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.First":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.First/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Unfoldable/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_Array_ST = require("Data.Array.ST");
var Prelude = require("Prelude");
var Control_Monad_ST = require("Control.Monad.ST");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Unfoldable = function (unfoldr) {
    this.unfoldr = unfoldr;
};
var unfoldr = function (dict) {
    return dict.unfoldr;
};
var unfoldableArray = new Unfoldable(function (f) {
    return function (b) {
        return Control_Monad_Eff.runPure(Data_Array_ST.runSTArray(function __do() {
            var _18 = Data_Array_ST.emptySTArray();
            var _17 = Control_Monad_ST.newSTRef(b)();
            (function () {
                while (!(function __do() {
                    var _16 = Control_Monad_ST.readSTRef(_17)();
                    return (function () {
                        var _512 = f(_16);
                        if (_512 instanceof Data_Maybe.Nothing) {
                            return Prelude["return"](Control_Monad_Eff.applicativeEff)(true);
                        };
                        if (_512 instanceof Data_Maybe.Just) {
                            return function __do() {
                                Data_Array_ST.pushSTArray(_18)(_512.value0.value0)();
                                Control_Monad_ST.writeSTRef(_17)(_512.value0.value1)();
                                return Prelude["return"](Control_Monad_Eff.applicativeEff)(false)();
                            };
                        };
                        throw new Error("Failed pattern match at Data.Unfoldable line 28, column 1 - line 40, column 16: " + [ _512.constructor.name ]);
                    })()();
                })()) {

                };
                return {};
            })();
            return Prelude["return"](Control_Monad_Eff.applicativeEff)(_18)();
        }));
    };
});
module.exports = {
    Unfoldable: Unfoldable, 
    unfoldr: unfoldr, 
    unfoldableArray: unfoldableArray
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","Data.Array.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.ST/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Void/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_Functor_Contravariant = require("Data.Functor.Contravariant");
var Void = function (x) {
    return x;
};
var showVoid = new Prelude.Show(function (_44) {
    return "Void";
});
var eqVoid = new Prelude.Eq(function (_42) {
    return function (_43) {
        return true;
    };
});
var absurd = function (a) {
    var spin = function (__copy__45) {
        var _45 = __copy__45;
        tco: while (true) {
            var __tco__45 = _45;
            _45 = __tco__45;
            continue tco;
        };
    };
    return spin(a);
};
var coerce = function (__dict_Contravariant_0) {
    return function (__dict_Functor_1) {
        return function (a) {
            return Prelude["<$>"](__dict_Functor_1)(absurd)(Data_Functor_Contravariant[">$<"](__dict_Contravariant_0)(absurd)(a));
        };
    };
};
module.exports = {
    Void: Void, 
    absurd: absurd, 
    coerce: coerce, 
    eqVoid: eqVoid, 
    showVoid: showVoid
};

},{"Data.Functor.Contravariant":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Functor.Contravariant/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Global/foreign.js":[function(require,module,exports){
/* globals exports */
"use strict";

// module Global

exports.nan = NaN;

exports.isNaN = isNaN;

exports.infinity = Infinity;

exports.isFinite = isFinite;

exports.readInt = function (radix) {
  return function (n) {
    return parseInt(n, radix);
  };
};

exports.readFloat = parseFloat;

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Global/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
module.exports = {
    readFloat: $foreign.readFloat, 
    readInt: $foreign.readInt, 
    isFinite: $foreign.isFinite, 
    infinity: $foreign.infinity, 
    isNaN: $foreign.isNaN, 
    nan: $foreign.nan
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Global/foreign.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Component/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Halogen_Signal = require("Halogen.Signal");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_Int = require("Data.Int");
var Data_Maybe = require("Data.Maybe");
var Data_Either = require("Data.Either");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Halogen_HTML = require("Halogen.HTML");
var hoistComponent = function (f) {
    return function (sf) {
        return Prelude["<$>"](Halogen_Signal.functorSF1)(Prelude["<$>"](Halogen_HTML.functorHTML)(f))(sf);
    };
};
var combine = function (__dict_Functor_0) {
    return function (f) {
        var f1 = function (n1) {
            return function (n2) {
                return f(Prelude["<$>"](Halogen_HTML.functorHTML)(Prelude["<$>"](__dict_Functor_0)(Data_Either.Left.create))(n1))(Prelude["<$>"](Halogen_HTML.functorHTML)(Prelude["<$>"](__dict_Functor_0)(Data_Either.Right.create))(n2));
            };
        };
        return Halogen_Signal.mergeWith(f1);
    };
};
module.exports = {
    hoistComponent: hoistComponent, 
    combine: combine
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Int":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Halogen.HTML":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML/index.js","Halogen.Signal":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Signal/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Attributes/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Unsafe_Coerce = require("Unsafe.Coerce");
var Prelude = require("Prelude");
var Data_Exists = require("Data.Exists");
var Data_String = require("Data.String");
var DOM = require("DOM");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Data_Either = require("Data.Either");
var Data_Foreign = require("Data.Foreign");
var Data_Monoid = require("Data.Monoid");
var Data_Traversable = require("Data.Traversable");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");
var Halogen_Internal_VirtualDOM = require("Halogen.Internal.VirtualDOM");
var Halogen_HTML_Events_Types = require("Halogen.HTML.Events.Types");
var Halogen_HTML_Events_Handler = require("Halogen.HTML.Events.Handler");
var EventName = function (x) {
    return x;
};
var HandlerF = (function () {
    function HandlerF(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    HandlerF.create = function (value0) {
        return function (value1) {
            return new HandlerF(value0, value1);
        };
    };
    return HandlerF;
})();
var ClassName = function (x) {
    return x;
};
var AttributeName = function (x) {
    return x;
};
var AttrF = (function () {
    function AttrF(value0, value1, value2) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
    };
    AttrF.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return new AttrF(value0, value1, value2);
            };
        };
    };
    return AttrF;
})();
var Attr = (function () {
    function Attr(value0) {
        this.value0 = value0;
    };
    Attr.create = function (value0) {
        return new Attr(value0);
    };
    return Attr;
})();
var Handler = (function () {
    function Handler(value0) {
        this.value0 = value0;
    };
    Handler.create = function (value0) {
        return new Handler(value0);
    };
    return Handler;
})();
var Initializer = (function () {
    function Initializer(value0) {
        this.value0 = value0;
    };
    Initializer.create = function (value0) {
        return new Initializer(value0);
    };
    return Initializer;
})();
var Finalizer = (function () {
    function Finalizer(value0) {
        this.value0 = value0;
    };
    Finalizer.create = function (value0) {
        return new Finalizer(value0);
    };
    return Finalizer;
})();
var IsAttribute = function (toAttrString) {
    this.toAttrString = toAttrString;
};
var toAttrString = function (dict) {
    return dict.toAttrString;
};
var stringIsAttribute = new IsAttribute(function (_349) {
    return function (s) {
        return s;
    };
});
var runExistsR = Unsafe_Coerce.unsafeCoerce;
var runEventName = function (_347) {
    return _347;
};
var runClassName = function (_345) {
    return _345;
};
var runAttributeName = function (_346) {
    return _346;
};
var numberIsAttribute = new IsAttribute(function (_350) {
    return function (n) {
        return Prelude.show(Prelude.showNumber)(n);
    };
});
var mkExistsR = Unsafe_Coerce.unsafeCoerce;
var initializer = Initializer.create;
var handler = function (name_1) {
    return function (k) {
        return new Handler(mkExistsR(new HandlerF(name_1, k)));
    };
};
var finalizer = Finalizer.create;
var eventName = EventName;
var className = ClassName;
var booleanIsAttribute = new IsAttribute(function (name_1) {
    return function (_351) {
        if (_351) {
            return runAttributeName(name_1);
        };
        if (!_351) {
            return "";
        };
        throw new Error("Failed pattern match at Halogen.HTML.Attributes line 187, column 1 - line 195, column 1: " + [ name_1.constructor.name, _351.constructor.name ]);
    };
});
var attributeName = AttributeName;
var attr = function (__dict_IsAttribute_0) {
    return function (name_1) {
        return function (v) {
            return new Attr(Data_Exists.mkExists(new AttrF(toAttrString(__dict_IsAttribute_0), name_1, v)));
        };
    };
};
var charset = attr(stringIsAttribute)(attributeName("charset"));
var checked = attr(booleanIsAttribute)(attributeName("checked"));
var class_ = Prelude["<<<"](Prelude.semigroupoidFn)(attr(stringIsAttribute)(attributeName("className")))(runClassName);
var classes = function (ss) {
    return attr(stringIsAttribute)(attributeName("className"))(Data_String.joinWith(" ")(Prelude.map(Prelude.functorArray)(runClassName)(ss)));
};
var colSpan = Prelude["<<<"](Prelude.semigroupoidFn)(attr(stringIsAttribute)(attributeName("colSpan")))(Prelude.show(Prelude.showNumber));
var content = attr(stringIsAttribute)(attributeName("content"));
var disabled = attr(booleanIsAttribute)(attributeName("disabled"));
var enabled = Prelude["<<<"](Prelude.semigroupoidFn)(disabled)(Prelude.not(Prelude.booleanAlgebraBoolean));
var $$for = attr(stringIsAttribute)(attributeName("htmlFor"));
var height = Prelude["<<<"](Prelude.semigroupoidFn)(attr(stringIsAttribute)(attributeName("height")))(Prelude.show(Prelude.showNumber));
var href = attr(stringIsAttribute)(attributeName("href"));
var httpEquiv = attr(stringIsAttribute)(attributeName("http-equiv"));
var id_ = attr(stringIsAttribute)(attributeName("id"));
var key = attr(stringIsAttribute)(attributeName("key"));
var name = attr(stringIsAttribute)(attributeName("name"));
var functorAttr = new Prelude.Functor(function (f) {
    return function (_348) {
        if (_348 instanceof Attr) {
            return new Attr(_348.value0);
        };
        if (_348 instanceof Handler) {
            return runExistsR(function (_344) {
                return new Handler(mkExistsR(new HandlerF(_344.value0, function (e_1) {
                    return Prelude["<$>"](Halogen_HTML_Events_Handler.functorEventHandler)(f)(_344.value1(e_1));
                })));
            })(_348.value0);
        };
        if (_348 instanceof Initializer) {
            return new Initializer(f(_348.value0));
        };
        if (_348 instanceof Finalizer) {
            return new Finalizer(f(_348.value0));
        };
        throw new Error("Failed pattern match at Halogen.HTML.Attributes line 115, column 1 - line 122, column 1: " + [ f.constructor.name, _348.constructor.name ]);
    };
});
var placeholder = attr(stringIsAttribute)(attributeName("placeholder"));
var readonly = attr(booleanIsAttribute)(attributeName("readonly"));
var rel = attr(stringIsAttribute)(attributeName("rel"));
var required = attr(booleanIsAttribute)(attributeName("required"));
var rowSpan = Prelude["<<<"](Prelude.semigroupoidFn)(attr(stringIsAttribute)(attributeName("rowSpan")))(Prelude.show(Prelude.showNumber));
var selected = attr(booleanIsAttribute)(attributeName("selected"));
var spellcheck = attr(booleanIsAttribute)(attributeName("spellcheck"));
var src = attr(stringIsAttribute)(attributeName("src"));
var target = attr(stringIsAttribute)(attributeName("target"));
var title = attr(stringIsAttribute)(attributeName("title"));
var type_ = attr(stringIsAttribute)(attributeName("type"));
var value = attr(stringIsAttribute)(attributeName("value"));
var width = Prelude["<<<"](Prelude.semigroupoidFn)(attr(stringIsAttribute)(attributeName("width")))(Prelude.show(Prelude.showNumber));
var alt = attr(stringIsAttribute)(attributeName("alt"));
module.exports = {
    Attr: Attr, 
    Handler: Handler, 
    Initializer: Initializer, 
    Finalizer: Finalizer, 
    HandlerF: HandlerF, 
    AttrF: AttrF, 
    IsAttribute: IsAttribute, 
    placeholder: placeholder, 
    selected: selected, 
    checked: checked, 
    enabled: enabled, 
    spellcheck: spellcheck, 
    readonly: readonly, 
    required: required, 
    disabled: disabled, 
    width: width, 
    value: value, 
    type_: type_, 
    title: title, 
    target: target, 
    src: src, 
    rel: rel, 
    name: name, 
    id_: id_, 
    httpEquiv: httpEquiv, 
    href: href, 
    height: height, 
    "for": $$for, 
    content: content, 
    rowSpan: rowSpan, 
    colSpan: colSpan, 
    classes: classes, 
    class_: class_, 
    charset: charset, 
    alt: alt, 
    key: key, 
    finalizer: finalizer, 
    initializer: initializer, 
    handler: handler, 
    attr: attr, 
    runExistsR: runExistsR, 
    mkExistsR: mkExistsR, 
    toAttrString: toAttrString, 
    runEventName: runEventName, 
    eventName: eventName, 
    runAttributeName: runAttributeName, 
    attributeName: attributeName, 
    runClassName: runClassName, 
    className: className, 
    functorAttr: functorAttr, 
    stringIsAttribute: stringIsAttribute, 
    numberIsAttribute: numberIsAttribute, 
    booleanIsAttribute: booleanIsAttribute
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Exists":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Exists/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.String":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Halogen.HTML.Events.Handler":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/index.js","Halogen.HTML.Events.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Types/index.js","Halogen.Internal.VirtualDOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js","Unsafe.Coerce":"/home/greg/haskell/snooker-statistics/frontend-new/output/Unsafe.Coerce/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Forms/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Data_Foreign_Class = require("Data.Foreign.Class");
var Prelude = require("Prelude");
var Control_Plus = require("Control.Plus");
var Halogen_HTML_Attributes = require("Halogen.HTML.Attributes");
var Data_Foreign = require("Data.Foreign");
var DOM = require("DOM");
var Data_Maybe = require("Data.Maybe");
var Data_Either = require("Data.Either");
var Data_Traversable = require("Data.Traversable");
var Control_Alternative = require("Control.Alternative");
var Halogen_HTML_Events_Handler = require("Halogen.HTML.Events.Handler");
var Data_Foreign_Index = require("Data.Foreign.Index");
var addForeignPropHandler = function (__dict_Alternative_0) {
    return function (__dict_IsForeign_1) {
        return function (key) {
            return function (prop) {
                return function (f) {
                    var handler = function (e) {
                        var _531 = Data_Foreign_Class.readProp(__dict_IsForeign_1)(Data_Foreign_Index.indexString)(prop)(e);
                        if (_531 instanceof Data_Either.Left) {
                            return Prelude.pure(Halogen_HTML_Events_Handler.applicativeEventHandler)(Control_Plus.empty(__dict_Alternative_0["__superclass_Control.Plus.Plus_1"]()));
                        };
                        if (_531 instanceof Data_Either.Right) {
                            return f(_531.value0);
                        };
                        throw new Error("Failed pattern match at Halogen.HTML.Events.Forms line 31, column 3 - line 32, column 3: " + [ _531.constructor.name ]);
                    };
                    return Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName(key))(function (e) {
                        return handler(Data_Foreign.toForeign(e.target));
                    });
                };
            };
        };
    };
};
var onChecked = function (__dict_Alternative_2) {
    return addForeignPropHandler(__dict_Alternative_2)(Data_Foreign_Class.booleanIsForeign)("change")("checked");
};
var onInput = function (__dict_Alternative_3) {
    return addForeignPropHandler(__dict_Alternative_3)(Data_Foreign_Class.stringIsForeign)("input")("value");
};
var onValueChanged = function (__dict_Alternative_4) {
    return function (__dict_IsForeign_5) {
        return addForeignPropHandler(__dict_Alternative_4)(__dict_IsForeign_5)("change")("value");
    };
};
module.exports = {
    onInput: onInput, 
    onChecked: onChecked, 
    onValueChanged: onValueChanged
};

},{"Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Foreign.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Class/index.js","Data.Foreign.Index":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Index/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Halogen.HTML.Attributes":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Attributes/index.js","Halogen.HTML.Events.Handler":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Halogen.HTML.Events.Handler

exports.preventDefaultImpl = function (e) {
  return function () {
    e.preventDefault();
  };
};

exports.stopPropagationImpl = function (e) {
  return function () {
    e.stopPropagation();
  };
};

exports.stopImmediatePropagationImpl = function (e) {
  return function () {
    e.stopImmediatePropagation();
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var $foreign = require("./foreign");
var Control_Monad_Writer_Class = require("Control.Monad.Writer.Class");
var Prelude = require("Prelude");
var Control_Monad_Writer = require("Control.Monad.Writer");
var Control_Apply = require("Control.Apply");
var Data_Foldable = require("Data.Foldable");
var DOM = require("DOM");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Data_Array = require("Data.Array");
var Control_Plus = require("Control.Plus");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Halogen_HTML_Events_Types = require("Halogen.HTML.Events.Types");
var Data_Monoid = require("Data.Monoid");
var Data_Identity = require("Data.Identity");
var PreventDefault = (function () {
    function PreventDefault() {

    };
    PreventDefault.value = new PreventDefault();
    return PreventDefault;
})();
var StopPropagation = (function () {
    function StopPropagation() {

    };
    StopPropagation.value = new StopPropagation();
    return StopPropagation;
})();
var StopImmediatePropagation = (function () {
    function StopImmediatePropagation() {

    };
    StopImmediatePropagation.value = new StopImmediatePropagation();
    return StopImmediatePropagation;
})();
var EventHandler = function (x) {
    return x;
};
var unEventHandler = function (_337) {
    return _337;
};
var stopPropagation = Control_Monad_Writer_Class.tell(Data_Monoid.monoidArray)(Control_Monad_Writer_Trans.monadWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(Control_Monad_Writer_Class.monadWriterWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))([ StopPropagation.value ]);
var stopImmediatePropagation = Control_Monad_Writer_Class.tell(Data_Monoid.monoidArray)(Control_Monad_Writer_Trans.monadWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(Control_Monad_Writer_Class.monadWriterWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))([ StopImmediatePropagation.value ]);
var runEventHandler = function (e) {
    return function (_338) {
        var applyUpdate = function (_343) {
            if (_343 instanceof PreventDefault) {
                return $foreign.preventDefaultImpl(e);
            };
            if (_343 instanceof StopPropagation) {
                return $foreign.stopPropagationImpl(e);
            };
            if (_343 instanceof StopImmediatePropagation) {
                return $foreign.stopImmediatePropagationImpl(e);
            };
            throw new Error("Failed pattern match at Halogen.HTML.Events.Handler line 94, column 3 - line 95, column 3: " + [ _343.constructor.name ]);
        };
        var _529 = Control_Monad_Writer.runWriter(_338);
        return Control_Apply["*>"](Control_Monad_Eff.applyEff)(Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_Foldable.foldableArray)(_529.value1)(applyUpdate))(Prelude["return"](Control_Monad_Eff.applicativeEff)(_529.value0));
    };
};
var preventDefault = Control_Monad_Writer_Class.tell(Data_Monoid.monoidArray)(Control_Monad_Writer_Trans.monadWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(Control_Monad_Writer_Class.monadWriterWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))([ PreventDefault.value ]);
var functorEventHandler = new Prelude.Functor(function (f) {
    return function (_339) {
        return Prelude["<$>"](Control_Monad_Writer_Trans.functorWriterT(Data_Identity.functorIdentity))(f)(_339);
    };
});
var applyEventHandler = new Prelude.Apply(function () {
    return functorEventHandler;
}, function (_340) {
    return function (_341) {
        return Prelude["<*>"](Control_Monad_Writer_Trans.applyWriterT(Data_Monoid.monoidArray)(Data_Identity.applyIdentity))(_340)(_341);
    };
});
var bindEventHandler = new Prelude.Bind(function () {
    return applyEventHandler;
}, function (_342) {
    return function (f) {
        return Prelude[">>="](Control_Monad_Writer_Trans.bindWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(_342)(Prelude["<<<"](Prelude.semigroupoidFn)(unEventHandler)(f));
    };
});
var applicativeEventHandler = new Prelude.Applicative(function () {
    return applyEventHandler;
}, Prelude["<<<"](Prelude.semigroupoidFn)(EventHandler)(Prelude.pure(Control_Monad_Writer_Trans.applicativeWriterT(Data_Monoid.monoidArray)(Data_Identity.applicativeIdentity))));
var monadEventHandler = new Prelude.Monad(function () {
    return applicativeEventHandler;
}, function () {
    return bindEventHandler;
});
module.exports = {
    runEventHandler: runEventHandler, 
    stopImmediatePropagation: stopImmediatePropagation, 
    stopPropagation: stopPropagation, 
    preventDefault: preventDefault, 
    functorEventHandler: functorEventHandler, 
    applyEventHandler: applyEventHandler, 
    applicativeEventHandler: applicativeEventHandler, 
    bindEventHandler: bindEventHandler, 
    monadEventHandler: monadEventHandler
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/foreign.js","Control.Apply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Apply/index.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Writer":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer/index.js","Control.Monad.Writer.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Class/index.js","Control.Monad.Writer.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Writer.Trans/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.Array":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Identity":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Identity/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Halogen.HTML.Events.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Types/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Monad/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Control_Monad_Aff = require("Control.Monad.Aff");
var Control_Monad_List_Trans = require("Control.Monad.List.Trans");
var Prelude = require("Prelude");
var Control_Apply = require("Control.Apply");
var Control_Monad_Aff_Class = require("Control.Monad.Aff.Class");
var Data_Monoid = require("Data.Monoid");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Data_Tuple = require("Data.Tuple");
var Data_Maybe = require("Data.Maybe");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_Eff_Exception = require("Control.Monad.Eff.Exception");
var Event = function (x) {
    return x;
};
var unEvent = function (_457) {
    return _457;
};
var semigroupEvent = new Prelude.Semigroup(function (_460) {
    return function (_461) {
        return Prelude["<>"](Control_Monad_List_Trans.semigroupListT(Control_Monad_Aff.applicativeAff))(_460)(_461);
    };
});
var runEvent = function (f) {
    return function (s) {
        var handler = function (_459) {
            if (_459 instanceof Data_Maybe.Nothing) {
                return Prelude["return"](Control_Monad_Eff.applicativeEff)(Prelude.unit);
            };
            if (_459 instanceof Data_Maybe.Just) {
                return Control_Apply["*>"](Control_Monad_Eff.applyEff)(s(_459.value0.value0))(go(_459.value0.value1));
            };
            throw new Error("Failed pattern match at Halogen.HTML.Events.Monad line 48, column 1 - line 49, column 1: " + [ _459.constructor.name ]);
        };
        var go = function (l) {
            return Control_Monad_Aff.runAff(f)(handler)(Control_Monad_Aff.later(Control_Monad_List_Trans.uncons(Control_Monad_Aff.monadAff)(l)));
        };
        return Prelude["<<<"](Prelude.semigroupoidFn)(go)(unEvent);
    };
};
var monoidEvent = new Data_Monoid.Monoid(function () {
    return semigroupEvent;
}, Data_Monoid.mempty(Control_Monad_List_Trans.monoidListT(Control_Monad_Aff.applicativeAff)));
var monadAffEvent = new Control_Monad_Aff_Class.MonadAff(Prelude["<<<"](Prelude.semigroupoidFn)(Event)(Control_Monad_Trans.lift(Control_Monad_List_Trans.monadTransListT)(Control_Monad_Aff.monadAff)));
var functorEvent = new Prelude.Functor(function (f) {
    return function (_462) {
        return Prelude["<$>"](Control_Monad_List_Trans.functorListT(Control_Monad_Aff.functorAff))(f)(_462);
    };
});
var async = Control_Monad_Aff_Class.liftAff(monadAffEvent);
var $$yield = Prelude["<<<"](Prelude.semigroupoidFn)(async)(Prelude.pure(Control_Monad_Aff.applicativeAff));
var applyEvent = new Prelude.Apply(function () {
    return functorEvent;
}, function (_463) {
    return function (_464) {
        return Prelude["<*>"](Control_Monad_List_Trans.applyListT(Control_Monad_Aff.monadAff))(_463)(_464);
    };
});
var bindEvent = new Prelude.Bind(function () {
    return applyEvent;
}, function (_465) {
    return function (f) {
        return Prelude[">>="](Control_Monad_List_Trans.bindListT(Control_Monad_Aff.monadAff))(_465)(Prelude[">>>"](Prelude.semigroupoidFn)(f)(unEvent));
    };
});
var applicativeEvent = new Prelude.Applicative(function () {
    return applyEvent;
}, Prelude["<<<"](Prelude.semigroupoidFn)(Event)(Prelude.pure(Control_Monad_List_Trans.applicativeListT(Control_Monad_Aff.monadAff))));
var monadEvent = new Prelude.Monad(function () {
    return applicativeEvent;
}, function () {
    return bindEvent;
});
var monadEffEvent = new Control_Monad_Eff_Class.MonadEff(function () {
    return monadEvent;
}, Prelude["<<<"](Prelude.semigroupoidFn)(Event)(Prelude["<<<"](Prelude.semigroupoidFn)(Control_Monad_Trans.lift(Control_Monad_List_Trans.monadTransListT)(Control_Monad_Aff.monadAff))(Control_Monad_Eff_Class.liftEff(Control_Monad_Aff.monadEffAff))));
var andThen = function (_458) {
    return function (f) {
        var go = function (l_1) {
            return Control_Monad_List_Trans.wrapEffect(Control_Monad_Aff.functorAff)(Prelude.bind(Control_Monad_Aff.bindAff)(Control_Monad_List_Trans.uncons(Control_Monad_Aff.monadAff)(l_1))(function (_32) {
                return Prelude["return"](Control_Monad_Aff.applicativeAff)((function () {
                    if (_32 instanceof Data_Maybe.Nothing) {
                        return Control_Monad_List_Trans.nil(Control_Monad_Aff.applicativeAff);
                    };
                    if (_32 instanceof Data_Maybe.Just) {
                        return Prelude["<>"](Control_Monad_List_Trans.semigroupListT(Control_Monad_Aff.applicativeAff))(Control_Monad_List_Trans.singleton(Control_Monad_Aff.applicativeAff)(_32.value0.value0))(Prelude["<>"](Control_Monad_List_Trans.semigroupListT(Control_Monad_Aff.applicativeAff))(unEvent(f(_32.value0.value0)))(go(_32.value0.value1)));
                    };
                    throw new Error("Failed pattern match at Halogen.HTML.Events.Monad line 69, column 1 - line 70, column 1: " + [ _32.constructor.name ]);
                })());
            }));
        };
        return go(_458);
    };
};
var altEvent = new Control_Alt.Alt(function () {
    return functorEvent;
}, function (_466) {
    return function (_467) {
        return Control_Alt["<|>"](Control_Monad_List_Trans.altListT(Control_Monad_Aff.applicativeAff))(_466)(_467);
    };
});
var plusEvent = new Control_Plus.Plus(function () {
    return altEvent;
}, Control_Plus.empty(Control_Monad_List_Trans.plusListT(Control_Monad_Aff.monadAff)));
var alternativeEvent = new Control_Alternative.Alternative(function () {
    return plusEvent;
}, function () {
    return applicativeEvent;
});
var monadPlusEvent = new Control_MonadPlus.MonadPlus(function () {
    return alternativeEvent;
}, function () {
    return monadEvent;
});
module.exports = {
    Event: Event, 
    andThen: andThen, 
    async: async, 
    "yield": $$yield, 
    runEvent: runEvent, 
    unEvent: unEvent, 
    semigroupEvent: semigroupEvent, 
    monoidEvent: monoidEvent, 
    functorEvent: functorEvent, 
    applyEvent: applyEvent, 
    applicativeEvent: applicativeEvent, 
    bindEvent: bindEvent, 
    monadEvent: monadEvent, 
    monadEffEvent: monadEffEvent, 
    monadAffEvent: monadAffEvent, 
    altEvent: altEvent, 
    plusEvent: plusEvent, 
    alternativeEvent: alternativeEvent, 
    monadPlusEvent: monadPlusEvent
};

},{"Control.Alt":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alt/index.js","Control.Alternative":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Alternative/index.js","Control.Apply":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Apply/index.js","Control.Monad.Aff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff/index.js","Control.Monad.Aff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Aff.Class/index.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Eff.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Class/index.js","Control.Monad.Eff.Exception":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Exception/index.js","Control.Monad.List.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.List.Trans/index.js","Control.Monad.Trans":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Trans/index.js","Control.MonadPlus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.MonadPlus/index.js","Control.Plus":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Plus/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Types/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var Prelude = require("Prelude");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
module.exports = {};

},{"Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Halogen_HTML_Attributes = require("Halogen.HTML.Attributes");
var Data_Maybe = require("Data.Maybe");
var Halogen_HTML_Events_Handler = require("Halogen.HTML.Events.Handler");
var Halogen_HTML_Events_Types = require("Halogen.HTML.Events.Types");
var onUnload = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("unload"));
var onSubmit = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("submit"));
var onSelect = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("select"));
var onSearch = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("search"));
var onScroll = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("scroll"));
var onResize = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("resize"));
var onReset = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("reset"));
var onPageShow = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("pageshow"));
var onPageHide = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("pagehide"));
var onMouseUp = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mouseup"));
var onMouseOver = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mouseover"));
var onMouseOut = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mouseout"));
var onMouseMove = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mousemove"));
var onMouseLeave = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mouseleave"));
var onMouseEnter = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mouseenter"));
var onMouseDown = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("mousedown"));
var onLoad = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("load"));
var onKeyUp = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("keyup"));
var onKeyPress = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("keypress"));
var onKeyDown = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("keydown"));
var onInvalid = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("invalid"));
var onHashChange = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("hashchange"));
var onFocusOut = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("focusout"));
var onFocusIn = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("focusin"));
var onFocus = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("focus"));
var onError = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("error"));
var onDoubleClick = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("dblclick"));
var onContextMenu = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("contextmenu"));
var onClick = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("click"));
var onChange = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("change"));
var onBlur = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("blur"));
var onBeforeUnload = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("beforeunload"));
var onAbort = Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName("abort"));
var input_ = function (__dict_Applicative_0) {
    return function (x) {
        return function (_354) {
            return Prelude.pure(Halogen_HTML_Events_Handler.applicativeEventHandler)(Prelude.pure(__dict_Applicative_0)(x));
        };
    };
};
var input = function (__dict_Applicative_1) {
    return function (f) {
        return function (e) {
            return Prelude.pure(Halogen_HTML_Events_Handler.applicativeEventHandler)(Prelude.pure(__dict_Applicative_1)(f(e)));
        };
    };
};
module.exports = {
    onFocusOut: onFocusOut, 
    onFocusIn: onFocusIn, 
    onFocus: onFocus, 
    onBlur: onBlur, 
    onKeyUp: onKeyUp, 
    onKeyPress: onKeyPress, 
    onKeyDown: onKeyDown, 
    onMouseUp: onMouseUp, 
    onMouseOut: onMouseOut, 
    onMouseOver: onMouseOver, 
    onMouseMove: onMouseMove, 
    onMouseLeave: onMouseLeave, 
    onMouseEnter: onMouseEnter, 
    onMouseDown: onMouseDown, 
    onDoubleClick: onDoubleClick, 
    onContextMenu: onContextMenu, 
    onClick: onClick, 
    onSubmit: onSubmit, 
    onSelect: onSelect, 
    onSearch: onSearch, 
    onReset: onReset, 
    onInvalid: onInvalid, 
    onChange: onChange, 
    onUnload: onUnload, 
    onScroll: onScroll, 
    onResize: onResize, 
    onPageHide: onPageHide, 
    onPageShow: onPageShow, 
    onLoad: onLoad, 
    onHashChange: onHashChange, 
    onError: onError, 
    onBeforeUnload: onBeforeUnload, 
    onAbort: onAbort, 
    input_: input_, 
    input: input
};

},{"Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Halogen.HTML.Attributes":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Attributes/index.js","Halogen.HTML.Events.Handler":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/index.js","Halogen.HTML.Events.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Types/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Renderer.VirtualDOM/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Data_Exists = require("Data.Exists");
var Data_Function = require("Data.Function");
var Halogen_Internal_VirtualDOM = require("Halogen.Internal.VirtualDOM");
var Halogen_HTML_Attributes = require("Halogen.HTML.Attributes");
var Prelude = require("Prelude");
var Control_Monad_Eff_Unsafe = require("Control.Monad.Eff.Unsafe");
var Halogen_HTML_Events_Handler = require("Halogen.HTML.Events.Handler");
var Halogen_HTML = require("Halogen.HTML");
var Data_Foldable = require("Data.Foldable");
var Data_Monoid = require("Data.Monoid");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Halogen_HTML_Events_Types = require("Halogen.HTML.Events.Types");
var renderAttr = function (dr) {
    return function (_360) {
        if (_360 instanceof Halogen_HTML_Attributes.Attr) {
            return Data_Exists.runExists(function (_358) {
                return Halogen_Internal_VirtualDOM.prop(Halogen_HTML_Attributes.runAttributeName(_358.value1), _358.value2);
            })(_360.value0);
        };
        if (_360 instanceof Halogen_HTML_Attributes.Handler) {
            return Halogen_HTML_Attributes.runExistsR(function (_359) {
                return Halogen_Internal_VirtualDOM.handlerProp(Halogen_HTML_Attributes.runEventName(_359.value0), function (ev) {
                    return function __do() {
                        var _29 = Control_Monad_Eff_Unsafe.unsafeInterleaveEff(Halogen_HTML_Events_Handler.runEventHandler(ev)(_359.value1(ev)))();
                        return dr(_29)();
                    };
                });
            })(_360.value0);
        };
        if (_360 instanceof Halogen_HTML_Attributes.Initializer) {
            return Halogen_Internal_VirtualDOM.initProp(dr(_360.value0));
        };
        if (_360 instanceof Halogen_HTML_Attributes.Finalizer) {
            return Halogen_Internal_VirtualDOM.finalizerProp(dr(_360.value0));
        };
        throw new Error("Failed pattern match at Halogen.HTML.Renderer.VirtualDOM line 22, column 1 - line 23, column 1: " + [ dr.constructor.name, _360.constructor.name ]);
    };
};
var renderHTML = function (f) {
    var go = function (_361) {
        if (_361 instanceof Halogen_HTML.Text) {
            return Halogen_Internal_VirtualDOM.vtext(_361.value0);
        };
        if (_361 instanceof Halogen_HTML.Element) {
            return Halogen_Internal_VirtualDOM.vnode(Halogen_HTML.runTagName(_361.value0))(Data_Foldable.foldMap(Data_Foldable.foldableArray)(Halogen_Internal_VirtualDOM.monoidProps)(renderAttr(f))(_361.value1))(Prelude.map(Prelude.functorArray)(go)(_361.value2));
        };
        throw new Error("Failed pattern match at Halogen.HTML.Renderer.VirtualDOM line 34, column 1 - line 35, column 1: " + [ _361.constructor.name ]);
    };
    return go;
};
module.exports = {
    renderHTML: renderHTML
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Eff.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/index.js","Data.Exists":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Exists/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Halogen.HTML":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML/index.js","Halogen.HTML.Attributes":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Attributes/index.js","Halogen.HTML.Events.Handler":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Handler/index.js","Halogen.HTML.Events.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Types/index.js","Halogen.Internal.VirtualDOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Prelude = require("Prelude");
var Data_Monoid = require("Data.Monoid");
var Data_Void = require("Data.Void");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Data_Foreign = require("Data.Foreign");
var Data_Function = require("Data.Function");
var Data_StrMap = require("Data.StrMap");
var Data_String = require("Data.String");
var Data_Foldable = require("Data.Foldable");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_Eff_Unsafe = require("Control.Monad.Eff.Unsafe");
var Control_Monad_ST = require("Control.Monad.ST");
var Halogen_Internal_VirtualDOM = require("Halogen.Internal.VirtualDOM");
var Halogen_HTML_Attributes = require("Halogen.HTML.Attributes");
var TagName = function (x) {
    return x;
};
var Text = (function () {
    function Text(value0) {
        this.value0 = value0;
    };
    Text.create = function (value0) {
        return new Text(value0);
    };
    return Text;
})();
var Element = (function () {
    function Element(value0, value1, value2) {
        this.value0 = value0;
        this.value1 = value1;
        this.value2 = value2;
    };
    Element.create = function (value0) {
        return function (value1) {
            return function (value2) {
                return new Element(value0, value1, value2);
            };
        };
    };
    return Element;
})();
var text = Text.create;
var tagName = TagName;
var element = Element.create;
var em = element(tagName("em"));
var em_ = em(Data_Monoid.mempty(Data_Monoid.monoidArray));
var embed = function (xs) {
    return element(tagName("embed"))(xs);
};
var embed_ = embed(Data_Monoid.mempty(Data_Monoid.monoidArray));
var fieldset = function (xs) {
    return element(tagName("fieldset"))(xs);
};
var fieldset_ = fieldset(Data_Monoid.mempty(Data_Monoid.monoidArray));
var figcaption = function (xs) {
    return element(tagName("figcaption"))(xs);
};
var figcaption_ = figcaption(Data_Monoid.mempty(Data_Monoid.monoidArray));
var figure = function (xs) {
    return element(tagName("figure"))(xs);
};
var figure_ = figure(Data_Monoid.mempty(Data_Monoid.monoidArray));
var font = function (xs) {
    return element(tagName("font"))(xs);
};
var font_ = font(Data_Monoid.mempty(Data_Monoid.monoidArray));
var footer = function (xs) {
    return element(tagName("footer"))(xs);
};
var footer_ = footer(Data_Monoid.mempty(Data_Monoid.monoidArray));
var form = function (xs) {
    return element(tagName("form"))(xs);
};
var form_ = form(Data_Monoid.mempty(Data_Monoid.monoidArray));
var frame = function (xs) {
    return element(tagName("frame"))(xs);
};
var frame_ = frame(Data_Monoid.mempty(Data_Monoid.monoidArray));
var frameset = function (xs) {
    return element(tagName("frameset"))(xs);
};
var frameset_ = frameset(Data_Monoid.mempty(Data_Monoid.monoidArray));
var h1 = function (xs) {
    return element(tagName("h1"))(xs);
};
var h1_ = h1(Data_Monoid.mempty(Data_Monoid.monoidArray));
var h2 = function (xs) {
    return element(tagName("h2"))(xs);
};
var h2_ = h2(Data_Monoid.mempty(Data_Monoid.monoidArray));
var h3 = function (xs) {
    return element(tagName("h3"))(xs);
};
var h3_ = h3(Data_Monoid.mempty(Data_Monoid.monoidArray));
var h4 = function (xs) {
    return element(tagName("h4"))(xs);
};
var h4_ = h4(Data_Monoid.mempty(Data_Monoid.monoidArray));
var h5 = function (xs) {
    return element(tagName("h5"))(xs);
};
var h5_ = h5(Data_Monoid.mempty(Data_Monoid.monoidArray));
var h6 = function (xs) {
    return element(tagName("h6"))(xs);
};
var h6_ = h6(Data_Monoid.mempty(Data_Monoid.monoidArray));
var head = function (xs) {
    return element(tagName("head"))(xs);
};
var head_ = head(Data_Monoid.mempty(Data_Monoid.monoidArray));
var header = function (xs) {
    return element(tagName("header"))(xs);
};
var header_ = header(Data_Monoid.mempty(Data_Monoid.monoidArray));
var hr = function (xs) {
    return element(tagName("hr"))(xs);
};
var hr_ = hr(Data_Monoid.mempty(Data_Monoid.monoidArray));
var html = function (xs) {
    return element(tagName("html"))(xs);
};
var html_ = html(Data_Monoid.mempty(Data_Monoid.monoidArray));
var i = function (xs) {
    return element(tagName("i"))(xs);
};
var i_ = i(Data_Monoid.mempty(Data_Monoid.monoidArray));
var iframe = function (xs) {
    return element(tagName("iframe"))(xs);
};
var iframe_ = iframe(Data_Monoid.mempty(Data_Monoid.monoidArray));
var img = function (xs) {
    return element(tagName("img"))(xs);
};
var img_ = img(Data_Monoid.mempty(Data_Monoid.monoidArray));
var input = function (xs) {
    return element(tagName("input"))(xs);
};
var input_ = input(Data_Monoid.mempty(Data_Monoid.monoidArray));
var ins = function (xs) {
    return element(tagName("ins"))(xs);
};
var ins_ = ins(Data_Monoid.mempty(Data_Monoid.monoidArray));
var kbd = function (xs) {
    return element(tagName("kbd"))(xs);
};
var kbd_ = kbd(Data_Monoid.mempty(Data_Monoid.monoidArray));
var keygen = function (xs) {
    return element(tagName("keygen"))(xs);
};
var keygen_ = keygen(Data_Monoid.mempty(Data_Monoid.monoidArray));
var label = function (xs) {
    return element(tagName("label"))(xs);
};
var label_ = label(Data_Monoid.mempty(Data_Monoid.monoidArray));
var legend = function (xs) {
    return element(tagName("legend"))(xs);
};
var legend_ = legend(Data_Monoid.mempty(Data_Monoid.monoidArray));
var li = function (xs) {
    return element(tagName("li"))(xs);
};
var li_ = li(Data_Monoid.mempty(Data_Monoid.monoidArray));
var link = function (xs) {
    return element(tagName("link"))(xs);
};
var link_ = link(Data_Monoid.mempty(Data_Monoid.monoidArray));
var main = function (xs) {
    return element(tagName("main"))(xs);
};
var main_ = main(Data_Monoid.mempty(Data_Monoid.monoidArray));
var map = function (xs) {
    return element(tagName("map"))(xs);
};
var map_ = map(Data_Monoid.mempty(Data_Monoid.monoidArray));
var mark = function (xs) {
    return element(tagName("mark"))(xs);
};
var mark_ = mark(Data_Monoid.mempty(Data_Monoid.monoidArray));
var menu = function (xs) {
    return element(tagName("menu"))(xs);
};
var menu_ = menu(Data_Monoid.mempty(Data_Monoid.monoidArray));
var menuitem = function (xs) {
    return element(tagName("menuitem"))(xs);
};
var menuitem_ = menuitem(Data_Monoid.mempty(Data_Monoid.monoidArray));
var meta = function (xs) {
    return element(tagName("meta"))(xs);
};
var meta_ = meta(Data_Monoid.mempty(Data_Monoid.monoidArray));
var meter = function (xs) {
    return element(tagName("meter"))(xs);
};
var meter_ = meter(Data_Monoid.mempty(Data_Monoid.monoidArray));
var nav = function (xs) {
    return element(tagName("nav"))(xs);
};
var nav_ = nav(Data_Monoid.mempty(Data_Monoid.monoidArray));
var noframes = function (xs) {
    return element(tagName("noframes"))(xs);
};
var noframes_ = noframes(Data_Monoid.mempty(Data_Monoid.monoidArray));
var noscript = function (xs) {
    return element(tagName("noscript"))(xs);
};
var noscript_ = noscript(Data_Monoid.mempty(Data_Monoid.monoidArray));
var object = function (xs) {
    return element(tagName("object"))(xs);
};
var object_ = object(Data_Monoid.mempty(Data_Monoid.monoidArray));
var ol = function (xs) {
    return element(tagName("ol"))(xs);
};
var ol_ = ol(Data_Monoid.mempty(Data_Monoid.monoidArray));
var optgroup = function (xs) {
    return element(tagName("optgroup"))(xs);
};
var optgroup_ = optgroup(Data_Monoid.mempty(Data_Monoid.monoidArray));
var option = function (xs) {
    return element(tagName("option"))(xs);
};
var option_ = option(Data_Monoid.mempty(Data_Monoid.monoidArray));
var output = function (xs) {
    return element(tagName("output"))(xs);
};
var output_ = output(Data_Monoid.mempty(Data_Monoid.monoidArray));
var p = function (xs) {
    return element(tagName("p"))(xs);
};
var p_ = p(Data_Monoid.mempty(Data_Monoid.monoidArray));
var param = function (xs) {
    return element(tagName("param"))(xs);
};
var param_ = param(Data_Monoid.mempty(Data_Monoid.monoidArray));
var pre = function (xs) {
    return element(tagName("pre"))(xs);
};
var pre_ = pre(Data_Monoid.mempty(Data_Monoid.monoidArray));
var progress = function (xs) {
    return element(tagName("progress"))(xs);
};
var progress_ = progress(Data_Monoid.mempty(Data_Monoid.monoidArray));
var q = function (xs) {
    return element(tagName("q"))(xs);
};
var q_ = q(Data_Monoid.mempty(Data_Monoid.monoidArray));
var rp = function (xs) {
    return element(tagName("rp"))(xs);
};
var rp_ = rp(Data_Monoid.mempty(Data_Monoid.monoidArray));
var rt = function (xs) {
    return element(tagName("rt"))(xs);
};
var rt_ = rt(Data_Monoid.mempty(Data_Monoid.monoidArray));
var ruby = function (xs) {
    return element(tagName("ruby"))(xs);
};
var ruby_ = ruby(Data_Monoid.mempty(Data_Monoid.monoidArray));
var s = function (xs) {
    return element(tagName("s"))(xs);
};
var functorHTML = new Prelude.Functor(function (f) {
    var go = function (_353) {
        if (_353 instanceof Text) {
            return new Text(_353.value0);
        };
        if (_353 instanceof Element) {
            return new Element(_353.value0, Prelude["<$>"](Prelude.functorArray)(Prelude["<$>"](Halogen_HTML_Attributes.functorAttr)(f))(_353.value1), Prelude["<$>"](Prelude.functorArray)(go)(_353.value2));
        };
        throw new Error("Failed pattern match at Halogen.HTML line 175, column 1 - line 181, column 1: " + [ _353.constructor.name ]);
    };
    return go;
});
var runTagName = function (_352) {
    return _352;
};
var s_ = s(Data_Monoid.mempty(Data_Monoid.monoidArray));
var samp = function (xs) {
    return element(tagName("samp"))(xs);
};
var samp_ = samp(Data_Monoid.mempty(Data_Monoid.monoidArray));
var script = function (xs) {
    return element(tagName("script"))(xs);
};
var script_ = script(Data_Monoid.mempty(Data_Monoid.monoidArray));
var section = function (xs) {
    return element(tagName("section"))(xs);
};
var section_ = section(Data_Monoid.mempty(Data_Monoid.monoidArray));
var select = function (xs) {
    return element(tagName("select"))(xs);
};
var select_ = select(Data_Monoid.mempty(Data_Monoid.monoidArray));
var small = function (xs) {
    return element(tagName("small"))(xs);
};
var small_ = small(Data_Monoid.mempty(Data_Monoid.monoidArray));
var source = function (xs) {
    return element(tagName("source"))(xs);
};
var source_ = source(Data_Monoid.mempty(Data_Monoid.monoidArray));
var span = function (xs) {
    return element(tagName("span"))(xs);
};
var span_ = span(Data_Monoid.mempty(Data_Monoid.monoidArray));
var strike = function (xs) {
    return element(tagName("strike"))(xs);
};
var strike_ = strike(Data_Monoid.mempty(Data_Monoid.monoidArray));
var strong = function (xs) {
    return element(tagName("strong"))(xs);
};
var strong_ = strong(Data_Monoid.mempty(Data_Monoid.monoidArray));
var style = function (xs) {
    return element(tagName("style"))(xs);
};
var style_ = style(Data_Monoid.mempty(Data_Monoid.monoidArray));
var sub = function (xs) {
    return element(tagName("sub"))(xs);
};
var sub_ = sub(Data_Monoid.mempty(Data_Monoid.monoidArray));
var summary = function (xs) {
    return element(tagName("summary"))(xs);
};
var summary_ = summary(Data_Monoid.mempty(Data_Monoid.monoidArray));
var sup = function (xs) {
    return element(tagName("sup"))(xs);
};
var sup_ = sup(Data_Monoid.mempty(Data_Monoid.monoidArray));
var table = function (xs) {
    return element(tagName("table"))(xs);
};
var table_ = table(Data_Monoid.mempty(Data_Monoid.monoidArray));
var tbody = function (xs) {
    return element(tagName("tbody"))(xs);
};
var tbody_ = tbody(Data_Monoid.mempty(Data_Monoid.monoidArray));
var td = function (xs) {
    return element(tagName("td"))(xs);
};
var td_ = td(Data_Monoid.mempty(Data_Monoid.monoidArray));
var textarea = function (xs) {
    return element(tagName("textarea"))(xs);
};
var textarea_ = textarea(Data_Monoid.mempty(Data_Monoid.monoidArray));
var tfoot = function (xs) {
    return element(tagName("tfoot"))(xs);
};
var tfoot_ = tfoot(Data_Monoid.mempty(Data_Monoid.monoidArray));
var th = function (xs) {
    return element(tagName("th"))(xs);
};
var th_ = th(Data_Monoid.mempty(Data_Monoid.monoidArray));
var thead = function (xs) {
    return element(tagName("thead"))(xs);
};
var thead_ = thead(Data_Monoid.mempty(Data_Monoid.monoidArray));
var time = function (xs) {
    return element(tagName("time"))(xs);
};
var time_ = time(Data_Monoid.mempty(Data_Monoid.monoidArray));
var title = function (xs) {
    return element(tagName("title"))(xs);
};
var title_ = title(Data_Monoid.mempty(Data_Monoid.monoidArray));
var tr = function (xs) {
    return element(tagName("tr"))(xs);
};
var tr_ = tr(Data_Monoid.mempty(Data_Monoid.monoidArray));
var track = function (xs) {
    return element(tagName("track"))(xs);
};
var track_ = track(Data_Monoid.mempty(Data_Monoid.monoidArray));
var tt = function (xs) {
    return element(tagName("tt"))(xs);
};
var tt_ = tt(Data_Monoid.mempty(Data_Monoid.monoidArray));
var u = function (xs) {
    return element(tagName("u"))(xs);
};
var u_ = u(Data_Monoid.mempty(Data_Monoid.monoidArray));
var ul = function (xs) {
    return element(tagName("ul"))(xs);
};
var ul_ = ul(Data_Monoid.mempty(Data_Monoid.monoidArray));
var $$var = function (xs) {
    return element(tagName("var"))(xs);
};
var var_ = $$var(Data_Monoid.mempty(Data_Monoid.monoidArray));
var video = function (xs) {
    return element(tagName("video"))(xs);
};
var video_ = video(Data_Monoid.mempty(Data_Monoid.monoidArray));
var wbr = function (xs) {
    return element(tagName("wbr"))(xs);
};
var wbr_ = wbr(Data_Monoid.mempty(Data_Monoid.monoidArray));
var dt = function (xs) {
    return element(tagName("dt"))(xs);
};
var dt_ = dt(Data_Monoid.mempty(Data_Monoid.monoidArray));
var dl = function (xs) {
    return element(tagName("dl"))(xs);
};
var dl_ = dl(Data_Monoid.mempty(Data_Monoid.monoidArray));
var div = function (xs) {
    return element(tagName("div"))(xs);
};
var div_ = div(Data_Monoid.mempty(Data_Monoid.monoidArray));
var dir = function (xs) {
    return element(tagName("dir"))(xs);
};
var dir_ = dir(Data_Monoid.mempty(Data_Monoid.monoidArray));
var dialog = function (xs) {
    return element(tagName("dialog"))(xs);
};
var dialog_ = dialog(Data_Monoid.mempty(Data_Monoid.monoidArray));
var dfn = function (xs) {
    return element(tagName("dfn"))(xs);
};
var dfn_ = dfn(Data_Monoid.mempty(Data_Monoid.monoidArray));
var details = function (xs) {
    return element(tagName("details"))(xs);
};
var details_ = details(Data_Monoid.mempty(Data_Monoid.monoidArray));
var del = function (xs) {
    return element(tagName("del"))(xs);
};
var del_ = del(Data_Monoid.mempty(Data_Monoid.monoidArray));
var dd = function (xs) {
    return element(tagName("dd"))(xs);
};
var dd_ = dd(Data_Monoid.mempty(Data_Monoid.monoidArray));
var datalist = function (xs) {
    return element(tagName("datalist"))(xs);
};
var datalist_ = datalist(Data_Monoid.mempty(Data_Monoid.monoidArray));
var colgroup = function (xs) {
    return element(tagName("colgroup"))(xs);
};
var colgroup_ = colgroup(Data_Monoid.mempty(Data_Monoid.monoidArray));
var col = function (xs) {
    return element(tagName("col"))(xs);
};
var col_ = col(Data_Monoid.mempty(Data_Monoid.monoidArray));
var code = function (xs) {
    return element(tagName("code"))(xs);
};
var code_ = code(Data_Monoid.mempty(Data_Monoid.monoidArray));
var cite = function (xs) {
    return element(tagName("cite"))(xs);
};
var cite_ = cite(Data_Monoid.mempty(Data_Monoid.monoidArray));
var center = function (xs) {
    return element(tagName("center"))(xs);
};
var center_ = center(Data_Monoid.mempty(Data_Monoid.monoidArray));
var caption = function (xs) {
    return element(tagName("caption"))(xs);
};
var caption_ = caption(Data_Monoid.mempty(Data_Monoid.monoidArray));
var canvas = function (xs) {
    return element(tagName("canvas"))(xs);
};
var canvas_ = canvas(Data_Monoid.mempty(Data_Monoid.monoidArray));
var button = function (xs) {
    return element(tagName("button"))(xs);
};
var button_ = button(Data_Monoid.mempty(Data_Monoid.monoidArray));
var br = function (xs) {
    return element(tagName("br"))(xs);
};
var br_ = br(Data_Monoid.mempty(Data_Monoid.monoidArray));
var body = function (xs) {
    return element(tagName("body"))(xs);
};
var body_ = body(Data_Monoid.mempty(Data_Monoid.monoidArray));
var blockquote = function (xs) {
    return element(tagName("blockquote"))(xs);
};
var blockquote_ = blockquote(Data_Monoid.mempty(Data_Monoid.monoidArray));
var big = function (xs) {
    return element(tagName("big"))(xs);
};
var big_ = big(Data_Monoid.mempty(Data_Monoid.monoidArray));
var bdo = function (xs) {
    return element(tagName("bdo"))(xs);
};
var bdo_ = bdo(Data_Monoid.mempty(Data_Monoid.monoidArray));
var bdi = function (xs) {
    return element(tagName("bdi"))(xs);
};
var bdi_ = bdi(Data_Monoid.mempty(Data_Monoid.monoidArray));
var basefont = function (xs) {
    return element(tagName("basefont"))(xs);
};
var basefont_ = basefont(Data_Monoid.mempty(Data_Monoid.monoidArray));
var base = function (xs) {
    return element(tagName("base"))(xs);
};
var base_ = base(Data_Monoid.mempty(Data_Monoid.monoidArray));
var b = function (xs) {
    return element(tagName("b"))(xs);
};
var b_ = b(Data_Monoid.mempty(Data_Monoid.monoidArray));
var audio = function (xs) {
    return element(tagName("audio"))(xs);
};
var audio_ = audio(Data_Monoid.mempty(Data_Monoid.monoidArray));
var aside = function (xs) {
    return element(tagName("aside"))(xs);
};
var aside_ = aside(Data_Monoid.mempty(Data_Monoid.monoidArray));
var article = function (xs) {
    return element(tagName("article"))(xs);
};
var article_ = article(Data_Monoid.mempty(Data_Monoid.monoidArray));
var area = function (xs) {
    return element(tagName("area"))(xs);
};
var area_ = area(Data_Monoid.mempty(Data_Monoid.monoidArray));
var applet = function (xs) {
    return element(tagName("applet"))(xs);
};
var applet_ = applet(Data_Monoid.mempty(Data_Monoid.monoidArray));
var address = function (xs) {
    return element(tagName("address"))(xs);
};
var address_ = address(Data_Monoid.mempty(Data_Monoid.monoidArray));
var acronym = function (xs) {
    return element(tagName("acronym"))(xs);
};
var acronym_ = acronym(Data_Monoid.mempty(Data_Monoid.monoidArray));
var abbr = function (xs) {
    return element(tagName("abbr"))(xs);
};
var abbr_ = abbr(Data_Monoid.mempty(Data_Monoid.monoidArray));
var a = function (xs) {
    return element(tagName("a"))(xs);
};
var a_ = a(Data_Monoid.mempty(Data_Monoid.monoidArray));
module.exports = {
    Text: Text, 
    Element: Element, 
    wbr_: wbr_, 
    wbr: wbr, 
    video_: video_, 
    video: video, 
    var_: var_, 
    "var": $$var, 
    ul_: ul_, 
    ul: ul, 
    u_: u_, 
    u: u, 
    tt_: tt_, 
    tt: tt, 
    track_: track_, 
    track: track, 
    tr_: tr_, 
    tr: tr, 
    title_: title_, 
    title: title, 
    time_: time_, 
    time: time, 
    thead_: thead_, 
    thead: thead, 
    th_: th_, 
    th: th, 
    tfoot_: tfoot_, 
    tfoot: tfoot, 
    textarea_: textarea_, 
    textarea: textarea, 
    td_: td_, 
    td: td, 
    tbody_: tbody_, 
    tbody: tbody, 
    table_: table_, 
    table: table, 
    sup_: sup_, 
    sup: sup, 
    summary_: summary_, 
    summary: summary, 
    sub_: sub_, 
    sub: sub, 
    style_: style_, 
    style: style, 
    strong_: strong_, 
    strong: strong, 
    strike_: strike_, 
    strike: strike, 
    span_: span_, 
    span: span, 
    source_: source_, 
    source: source, 
    small_: small_, 
    small: small, 
    select_: select_, 
    select: select, 
    section_: section_, 
    section: section, 
    script_: script_, 
    script: script, 
    samp_: samp_, 
    samp: samp, 
    s_: s_, 
    s: s, 
    ruby_: ruby_, 
    ruby: ruby, 
    rt_: rt_, 
    rt: rt, 
    rp_: rp_, 
    rp: rp, 
    q_: q_, 
    q: q, 
    progress_: progress_, 
    progress: progress, 
    pre_: pre_, 
    pre: pre, 
    param_: param_, 
    param: param, 
    p_: p_, 
    p: p, 
    output_: output_, 
    output: output, 
    option_: option_, 
    option: option, 
    optgroup_: optgroup_, 
    optgroup: optgroup, 
    ol_: ol_, 
    ol: ol, 
    object_: object_, 
    object: object, 
    noscript_: noscript_, 
    noscript: noscript, 
    noframes_: noframes_, 
    noframes: noframes, 
    nav_: nav_, 
    nav: nav, 
    meter_: meter_, 
    meter: meter, 
    meta_: meta_, 
    meta: meta, 
    menuitem_: menuitem_, 
    menuitem: menuitem, 
    menu_: menu_, 
    menu: menu, 
    mark_: mark_, 
    mark: mark, 
    map_: map_, 
    map: map, 
    main_: main_, 
    main: main, 
    link_: link_, 
    link: link, 
    li_: li_, 
    li: li, 
    legend_: legend_, 
    legend: legend, 
    label_: label_, 
    label: label, 
    keygen_: keygen_, 
    keygen: keygen, 
    kbd_: kbd_, 
    kbd: kbd, 
    ins_: ins_, 
    ins: ins, 
    input_: input_, 
    input: input, 
    img_: img_, 
    img: img, 
    iframe_: iframe_, 
    iframe: iframe, 
    i_: i_, 
    i: i, 
    html_: html_, 
    html: html, 
    hr_: hr_, 
    hr: hr, 
    header_: header_, 
    header: header, 
    head_: head_, 
    head: head, 
    h6_: h6_, 
    h6: h6, 
    h5_: h5_, 
    h5: h5, 
    h4_: h4_, 
    h4: h4, 
    h3_: h3_, 
    h3: h3, 
    h2_: h2_, 
    h2: h2, 
    h1_: h1_, 
    h1: h1, 
    frameset_: frameset_, 
    frameset: frameset, 
    frame_: frame_, 
    frame: frame, 
    form_: form_, 
    form: form, 
    footer_: footer_, 
    footer: footer, 
    font_: font_, 
    font: font, 
    figure_: figure_, 
    figure: figure, 
    figcaption_: figcaption_, 
    figcaption: figcaption, 
    fieldset_: fieldset_, 
    fieldset: fieldset, 
    embed_: embed_, 
    embed: embed, 
    em_: em_, 
    em: em, 
    dt_: dt_, 
    dt: dt, 
    dl_: dl_, 
    dl: dl, 
    div_: div_, 
    div: div, 
    dir_: dir_, 
    dir: dir, 
    dialog_: dialog_, 
    dialog: dialog, 
    dfn_: dfn_, 
    dfn: dfn, 
    details_: details_, 
    details: details, 
    del_: del_, 
    del: del, 
    dd_: dd_, 
    dd: dd, 
    datalist_: datalist_, 
    datalist: datalist, 
    colgroup_: colgroup_, 
    colgroup: colgroup, 
    col_: col_, 
    col: col, 
    code_: code_, 
    code: code, 
    cite_: cite_, 
    cite: cite, 
    center_: center_, 
    center: center, 
    caption_: caption_, 
    caption: caption, 
    canvas_: canvas_, 
    canvas: canvas, 
    button_: button_, 
    button: button, 
    br_: br_, 
    br: br, 
    body_: body_, 
    body: body, 
    blockquote_: blockquote_, 
    blockquote: blockquote, 
    big_: big_, 
    big: big, 
    bdo_: bdo_, 
    bdo: bdo, 
    bdi_: bdi_, 
    bdi: bdi, 
    basefont_: basefont_, 
    basefont: basefont, 
    base_: base_, 
    base: base, 
    b_: b_, 
    b: b, 
    audio_: audio_, 
    audio: audio, 
    aside_: aside_, 
    aside: aside, 
    article_: article_, 
    article: article, 
    area_: area_, 
    area: area, 
    applet_: applet_, 
    applet: applet, 
    address_: address_, 
    address: address, 
    acronym_: acronym_, 
    acronym: acronym, 
    abbr_: abbr_, 
    abbr: abbr, 
    a_: a_, 
    a: a, 
    runTagName: runTagName, 
    tagName: tagName, 
    element: element, 
    text: text, 
    functorHTML: functorHTML
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Eff.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Unsafe/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.StrMap":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.StrMap/index.js","Data.String":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.String/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Data.Void":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Void/index.js","Halogen.HTML.Attributes":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Attributes/index.js","Halogen.Internal.VirtualDOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/foreign.js":[function(require,module,exports){
/* global exports, require */
"use strict";

// module Halogen.Internal.VirtualDOM

exports.emptyProps = {};

// jshint maxparams: 2
exports.prop = function (key, value) {
  var props = {};
  props[key] = value;
  return props;
};

// jshint maxparams: 2
exports.handlerProp = function (key, f) {
  var props = {};
  var Hook = function () {};
  Hook.prototype.callback = function (e) {
    f(e)();
  };
  Hook.prototype.hook = function (node) {
    node.addEventListener(key, this.callback);
  };
  Hook.prototype.unhook = function (node) {
    node.removeEventListener(key, this.callback);
  };
  props["halogen-hook-" + key] = new Hook(f);
  return props;
};

// jshint maxparams: 1
exports.initProp = function (f) {
  var props = {};
  var Hook = function () {};
  // jshint maxparams: 3
  Hook.prototype.hook = function (node, prop, prev) {
    if (typeof prev === "undefined") f();
  };
  props["halogen-init"] = new Hook(f);
  return props;
};

exports.finalizerProp = function (f) {
  var props = {};
  var Hook = function () {};
  Hook.prototype.hook = function () { };
  Hook.prototype.unhook = function () {
    f();
  };
  props["halogen-finalizer"] = new Hook(f);
  return props;
};

// jshint maxparams: 2
exports.concatProps = function (p1, p2) {
  var props = {};
  var key;
  for (key in p1) {
    if (p1.hasOwnProperty(key)) props[key] = p1[key];
  }
  for (key in p2) {
    if (p2.hasOwnProperty(key)) props[key] = p2[key];
  }
  return props;
};

exports.createElement = function () {
  var vcreateElement = require("virtual-dom/create-element");
  return function (vtree) {
    return vcreateElement(vtree);
  };
}();

exports.diff = function () {
  var vdiff = require("virtual-dom/diff");
  return function (vtree1) {
    return function (vtree2) {
      return vdiff(vtree1, vtree2);
    };
  };
}();

exports.patch = function () {
  var vpatch = require("virtual-dom/patch");
  return function (p) {
    return function (node) {
      return function () {
        return vpatch(node, p);
      };
    };
  };
}();

exports.vtext = function () {
  var VText = require("virtual-dom/vnode/vtext");
  return function (s) {
    return new VText(s);
  };
}();

exports.vnode = function () {
  var VirtualNode = require("virtual-dom/vnode/vnode");
  var SoftSetHook = require("virtual-dom/virtual-hyperscript/hooks/soft-set-hook");
  return function (name) {
    return function (attr) {
      return function (children) {
        var props = {
          attributes: {}
        };
        for (var key in attr) {
          if (key.indexOf("data-") === 0 || key === "readonly") {
            props.attributes[key] = attr[key];
          } else {
            props[key] = attr[key];
          }
        }
        if (name === "input" && props.value !== undefined) {
          props.value = new SoftSetHook(props.value);
        }
        return new VirtualNode(name, props, children, attr.key);
      };
    };
  };
}();

},{"virtual-dom/create-element":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/create-element.js","virtual-dom/diff":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/diff.js","virtual-dom/patch":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/patch.js","virtual-dom/virtual-hyperscript/hooks/soft-set-hook":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/virtual-hyperscript/hooks/soft-set-hook.js","virtual-dom/vnode/vnode":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vnode.js","virtual-dom/vnode/vtext":"/home/greg/haskell/snooker-statistics/frontend-new/node_modules/virtual-dom/vnode/vtext.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var $foreign = require("./foreign");
var Data_Function = require("Data.Function");
var Prelude = require("Prelude");
var DOM = require("DOM");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_Int = require("Data.Int");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");
var Data_Nullable = require("Data.Nullable");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");
var semigroupProps = new Prelude.Semigroup(Data_Function.runFn2($foreign.concatProps));
var monoidProps = new Data_Monoid.Monoid(function () {
    return semigroupProps;
}, $foreign.emptyProps);
module.exports = {
    semigroupProps: semigroupProps, 
    monoidProps: monoidProps, 
    vnode: $foreign.vnode, 
    vtext: $foreign.vtext, 
    patch: $foreign.patch, 
    diff: $foreign.diff, 
    createElement: $foreign.createElement, 
    finalizerProp: $foreign.finalizerProp, 
    initProp: $foreign.initProp, 
    handlerProp: $foreign.handlerProp, 
    prop: $foreign.prop, 
    emptyProps: $foreign.emptyProps
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/foreign.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.ST":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.ST/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Int":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Monoid":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Monoid/index.js","Data.Nullable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Nullable/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Signal/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Data_Tuple = require("Data.Tuple");
var Prelude = require("Prelude");
var Data_Profunctor = require("Data.Profunctor");
var Data_Profunctor_Strong = require("Data.Profunctor.Strong");
var Data_Profunctor_Choice = require("Data.Profunctor.Choice");
var Data_Either = require("Data.Either");
var SF = function (x) {
    return x;
};
var SF1 = function (x) {
    return x;
};
var tail = function (_104) {
    return _104.next;
};
var stateful$prime = function (s) {
    return function (step) {
        var go = function (s_1) {
            return function (i) {
                var _509 = step(s_1)(i);
                return {
                    result: _509.value0, 
                    next: go(_509.value1)
                };
            };
        };
        return go(s);
    };
};
var startingAt = function (s) {
    return function (o) {
        return {
            result: o, 
            next: s
        };
    };
};
var stateful = function (s) {
    return function (step) {
        return startingAt(stateful$prime(s)(function (s_1) {
            return function (i) {
                var s$prime = step(s_1)(i);
                return new Data_Tuple.Tuple(s$prime, s$prime);
            };
        }))(s);
    };
};
var runSF1 = function (_102) {
    return _102;
};
var runSF = function (_101) {
    return _101;
};
var profunctorSF1 = new Data_Profunctor.Profunctor(function (f) {
    return function (g) {
        return function (_110) {
            return {
                result: g(_110.result), 
                next: Data_Profunctor.dimap(profunctorSF)(f)(g)(_110.next)
            };
        };
    };
});
var profunctorSF = new Data_Profunctor.Profunctor(function (f) {
    return function (g) {
        return function (_109) {
            return function (i) {
                return Data_Profunctor.dimap(profunctorSF1)(f)(g)(_109(f(i)));
            };
        };
    };
});
var strongSF = new Data_Profunctor_Strong.Strong(function () {
    return profunctorSF;
}, function (s) {
    return function (_99) {
        var _521 = runSF(s)(_99.value0);
        return {
            result: new Data_Tuple.Tuple(_521.result, _99.value1), 
            next: Data_Profunctor_Strong.first(strongSF)(_521.next)
        };
    };
}, function (s) {
    return function (_100) {
        var _525 = runSF(s)(_100.value1);
        return {
            result: new Data_Tuple.Tuple(_100.value0, _525.result), 
            next: Data_Profunctor_Strong.second(strongSF)(_525.next)
        };
    };
});
var loop = function (s) {
    return function (signal) {
        return function (i) {
            var _528 = runSF(signal)(new Data_Tuple.Tuple(s, i));
            return {
                result: Data_Tuple.snd(_528.result), 
                next: loop(Data_Tuple.fst(_528.result))(_528.next)
            };
        };
    };
};
var input = function (i) {
    return {
        result: i, 
        next: input
    };
};
var head = function (_103) {
    return _103.result;
};
var mergeWith$prime = function (f) {
    return function (g) {
        var o = function (s1) {
            return function (s2) {
                return {
                    result: g(head(s1))(head(s2)), 
                    next: function (i) {
                        var _530 = f(i);
                        if (_530 instanceof Data_Either.Left) {
                            return o(runSF(tail(s1))(_530.value0))(s2);
                        };
                        if (_530 instanceof Data_Either.Right) {
                            return o(s1)(runSF(tail(s2))(_530.value0));
                        };
                        throw new Error("Failed pattern match at Halogen.Signal line 94, column 1 - line 95, column 1: " + [ _530.constructor.name ]);
                    }
                };
            };
        };
        return o;
    };
};
var mergeWith = mergeWith$prime(Prelude.id(Prelude.categoryFn));
var semigroupoidSF1 = new Prelude.Semigroupoid(function (f) {
    return function (g) {
        return {
            result: head(f), 
            next: Prelude["<<<"](semigroupoidSF)(tail(f))(tail(g))
        };
    };
});
var semigroupoidSF = new Prelude.Semigroupoid(function (f) {
    return function (g) {
        return function (i) {
            var s1 = runSF(g)(i);
            var s2 = runSF(f)(head(s1));
            return Prelude["<<<"](semigroupoidSF1)(s2)(s1);
        };
    };
});
var functorSF1 = new Prelude.Functor(function (f) {
    return function (_106) {
        return {
            result: f(_106.result), 
            next: Prelude["<$>"](functorSF)(f)(_106.next)
        };
    };
});
var functorSF = new Prelude.Functor(function (f) {
    return function (_105) {
        return function (i) {
            return Prelude["<$>"](functorSF1)(f)(_105(i));
        };
    };
});
var differencesWith = function (f) {
    return function (initial) {
        return stateful$prime(initial)(function (last) {
            return function (next) {
                var d = f(last)(next);
                return new Data_Tuple.Tuple(d, next);
            };
        });
    };
};
var choiceSF = new Data_Profunctor_Choice.Choice(function () {
    return profunctorSF;
}, function (s) {
    return function (e) {
        if (e instanceof Data_Either.Left) {
            var _538 = runSF(s)(e.value0);
            return {
                result: new Data_Either.Left(_538.result), 
                next: Data_Profunctor_Choice.left(choiceSF)(_538.next)
            };
        };
        if (e instanceof Data_Either.Right) {
            return {
                result: new Data_Either.Right(e.value0), 
                next: Data_Profunctor_Choice.left(choiceSF)(s)
            };
        };
        throw new Error("Failed pattern match: " + [ e.constructor.name ]);
    };
}, function (s) {
    return function (e) {
        if (e instanceof Data_Either.Left) {
            return {
                result: new Data_Either.Left(e.value0), 
                next: Data_Profunctor_Choice.right(choiceSF)(s)
            };
        };
        if (e instanceof Data_Either.Right) {
            var _543 = runSF(s)(e.value0);
            return {
                result: new Data_Either.Right(_543.result), 
                next: Data_Profunctor_Choice.right(choiceSF)(_543.next)
            };
        };
        throw new Error("Failed pattern match: " + [ e.constructor.name ]);
    };
});
var categorySF = new Prelude.Category(function () {
    return semigroupoidSF;
}, input);
var applySF1 = new Prelude.Apply(function () {
    return functorSF1;
}, function (_107) {
    return function (_108) {
        return {
            result: _107.result(_108.result), 
            next: Prelude["<*>"](applySF)(_107.next)(_108.next)
        };
    };
});
var applySF = new Prelude.Apply(function () {
    return functorSF;
}, function (f) {
    return function (x) {
        return function (i) {
            return Prelude["<*>"](applySF1)(runSF(f)(i))(runSF(x)(i));
        };
    };
});
var applicativeSF1 = new Prelude.Applicative(function () {
    return applySF1;
}, function (a) {
    return {
        result: a, 
        next: Prelude.pure(applicativeSF)(a)
    };
});
var applicativeSF = new Prelude.Applicative(function () {
    return applySF;
}, function (a) {
    return function (_98) {
        return Prelude.pure(applicativeSF1)(a);
    };
});
module.exports = {
    "mergeWith'": mergeWith$prime, 
    mergeWith: mergeWith, 
    tail: tail, 
    head: head, 
    startingAt: startingAt, 
    loop: loop, 
    differencesWith: differencesWith, 
    "stateful'": stateful$prime, 
    stateful: stateful, 
    input: input, 
    runSF1: runSF1, 
    runSF: runSF, 
    functorSF: functorSF, 
    functorSF1: functorSF1, 
    applySF: applySF, 
    applySF1: applySF1, 
    applicativeSF: applicativeSF, 
    applicativeSF1: applicativeSF1, 
    profunctorSF: profunctorSF, 
    profunctorSF1: profunctorSF1, 
    strongSF: strongSF, 
    choiceSF: choiceSF, 
    semigroupoidSF: semigroupoidSF, 
    semigroupoidSF1: semigroupoidSF1, 
    categorySF: categorySF
};

},{"Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Profunctor":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor/index.js","Data.Profunctor.Choice":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor.Choice/index.js","Data.Profunctor.Strong":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor.Strong/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var Halogen_Signal = require("Halogen.Signal");
var Halogen_Internal_VirtualDOM = require("Halogen.Internal.VirtualDOM");
var Prelude = require("Prelude");
var Halogen_HTML_Events_Monad = require("Halogen.HTML.Events.Monad");
var Control_Monad_Eff_Console = require("Control.Monad.Eff.Console");
var Control_Monad_Eff_Exception = require("Control.Monad.Eff.Exception");
var Halogen_HTML_Renderer_VirtualDOM = require("Halogen.HTML.Renderer.VirtualDOM");
var Data_Profunctor_Strong = require("Data.Profunctor.Strong");
var Data_DOM_Simple_Window = require("Data.DOM.Simple.Window");
var Control_Monad_Eff_Ref = require("Control.Monad.Eff.Ref");
var DOM = require("DOM");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Data_Either = require("Data.Either");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Halogen_HTML = require("Halogen.HTML");
var Halogen_Component = require("Halogen.Component");
var mainLoop = function (buildProcess) {
    var go = function (ref) {
        var driver = function (req) {
            return Prelude["void"](Control_Monad_Eff.functorEff)(Data_DOM_Simple_Window.setTimeout(Data_DOM_Simple_Window.htmlWindow)(Data_DOM_Simple_Window.globalWindow)(0.0)(function __do() {
                var _35 = Control_Monad_Eff_Ref.readRef(ref)();
                return (function () {
                    if (_35 instanceof Data_Maybe.Just) {
                        var work = Halogen_Signal.runSF(_35.value0.process)(new Data_Tuple.Tuple(req, _35.value0.node));
                        return function __do() {
                            var _34 = Halogen_Signal.head(work)();
                            return Control_Monad_Eff_Ref.writeRef(ref)(new Data_Maybe.Just({
                                process: Halogen_Signal.tail(work), 
                                node: _34
                            }))();
                        };
                    };
                    if (_35 instanceof Data_Maybe.Nothing) {
                        return Control_Monad_Eff_Console.log("Error: An attempt to re-render was made during the initial render.");
                    };
                    throw new Error("Failed pattern match at Halogen line 151, column 5 - line 152, column 5: " + [ _35.constructor.name ]);
                })()();
            }));
        };
        return function __do() {
            var _36 = buildProcess(driver)();
            Control_Monad_Eff_Ref.writeRef(ref)(new Data_Maybe.Just({
                process: _36.value1, 
                node: _36.value0
            }))();
            return Prelude["return"](Control_Monad_Eff.applicativeEff)(new Data_Tuple.Tuple(_36.value0, driver))();
        };
    };
    return function __do() {
        var _37 = Control_Monad_Eff_Ref.newRef(Data_Maybe.Nothing.value)();
        return go(_37)();
    };
};
var changes = Halogen_Signal.differencesWith(Halogen_Internal_VirtualDOM.diff);
var componentProcess = function (sf) {
    return function (postRender) {
        return function (driver) {
            var logger = function (e) {
                return Control_Monad_Eff_Console.log("Uncaught error in asynchronous code: " + Control_Monad_Eff_Exception.message(e));
            };
            var requestHandler = function (aff) {
                return Halogen_HTML_Events_Monad.runEvent(logger)(driver)(aff);
            };
            var applyPatch = function (_471) {
                return function __do() {
                    var _33 = Halogen_Internal_VirtualDOM.patch(_471.value0.value0)(_471.value1)();
                    postRender(_471.value0.value1)(_33)(driver)();
                    return Prelude["return"](Control_Monad_Eff.applicativeEff)(_33)();
                };
            };
            var render = Halogen_HTML_Renderer_VirtualDOM.renderHTML(requestHandler);
            var vtrees = Prelude["<$>"](Halogen_Signal.functorSF1)(render)(sf);
            var node = Halogen_Internal_VirtualDOM.createElement(Halogen_Signal.head(vtrees));
            var diffs = Prelude[">>>"](Halogen_Signal.semigroupoidSF)(Halogen_Signal.tail(vtrees))(changes(Halogen_Signal.head(vtrees)));
            var process = Data_Profunctor_Strong["***"](Halogen_Signal.categorySF)(Halogen_Signal.strongSF)(Data_Profunctor_Strong["&&&"](Halogen_Signal.categorySF)(Halogen_Signal.strongSF)(diffs)(Halogen_Signal.input))(Halogen_Signal.input);
            return new Data_Tuple.Tuple(node, Prelude["<$>"](Halogen_Signal.functorSF)(applyPatch)(process));
        };
    };
};
var runUIWith = function (sf) {
    return function (postRender) {
        return mainLoop(Prelude["<<<"](Prelude.semigroupoidFn)(Prelude.pure(Control_Monad_Eff.applicativeEff))(componentProcess(sf)(postRender)));
    };
};
var runUI = function (sf) {
    return runUIWith(sf)(function (_470) {
        return function (_469) {
            return function (_468) {
                return Prelude["return"](Control_Monad_Eff.applicativeEff)(Prelude.unit);
            };
        };
    });
};
module.exports = {
    mainLoop: mainLoop, 
    componentProcess: componentProcess, 
    runUIWith: runUIWith, 
    runUI: runUI, 
    changes: changes
};

},{"Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","Control.Monad.Eff.Console":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Console/index.js","Control.Monad.Eff.Exception":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Exception/index.js","Control.Monad.Eff.Ref":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff.Ref/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.DOM.Simple.Window":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Window/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Profunctor.Strong":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor.Strong/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Halogen.Component":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Component/index.js","Halogen.HTML":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML/index.js","Halogen.HTML.Events.Monad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Monad/index.js","Halogen.HTML.Renderer.VirtualDOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Renderer.VirtualDOM/index.js","Halogen.Internal.VirtualDOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Internal.VirtualDOM/index.js","Halogen.Signal":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Signal/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Main/foreign.js":[function(require,module,exports){
"use strict";

// module Main

exports.statistics = statistics;
exports.matchesOfPlayer = matchesOfPlayer;
exports.playerName = playerName;

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Main/index.js":[function(require,module,exports){
// Generated by psc version 0.7.2.0
"use strict";
var $foreign = require("./foreign");
var Prelude = require("Prelude");
var Data_DOM_Simple_Window = require("Data.DOM.Simple.Window");
var Data_DOM_Simple_Element = require("Data.DOM.Simple.Element");
var Data_Foldable = require("Data.Foldable");
var Data_Map = require("Data.Map");
var Data_Array_Unsafe = require("Data.Array.Unsafe");
var Data_List = require("Data.List");
var Halogen_HTML_Attributes = require("Halogen.HTML.Attributes");
var Halogen_HTML = require("Halogen.HTML");
var Halogen_HTML_Events_Forms = require("Halogen.HTML.Events.Forms");
var Halogen_HTML_Events = require("Halogen.HTML.Events");
var Data_Array = require("Data.Array");
var Data_Int = require("Data.Int");
var Data_Date_UTC = require("Data.Date.UTC");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var Halogen_Signal = require("Halogen.Signal");
var Data_Tuple = require("Data.Tuple");
var Data_Profunctor_Strong = require("Data.Profunctor.Strong");
var Data_Date = require("Data.Date");
var Halogen = require("Halogen");
var Data_Void = require("Data.Void");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Function = require("Data.Function");
var Control_Bind = require("Control.Bind");
var Control_Monad_Eff = require("Control.Monad.Eff");
var DOM = require("DOM");
var Data_Time = require("Data.Time");
var Data_Traversable = require("Data.Traversable");
var Data_DOM_Simple_Document = require("Data.DOM.Simple.Document");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Halogen_Component = require("Halogen.Component");
var Data_Unfoldable = require("Data.Unfoldable");
var Data_Foreign_Class = require("Data.Foreign.Class");
var Halogen_HTML_Events_Monad = require("Halogen.HTML.Events.Monad");
var MyDate = (function () {
    function MyDate(value0) {
        this.value0 = value0;
    };
    MyDate.create = function (value0) {
        return new MyDate(value0);
    };
    return MyDate;
})();
var Select = (function () {
    function Select(value0) {
        this.value0 = value0;
    };
    Select.create = function (value0) {
        return new Select(value0);
    };
    return Select;
})();
var State = (function () {
    function State(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    State.create = function (value0) {
        return function (value1) {
            return new State(value0, value1);
        };
    };
    return State;
})();
var toDate = function (m) {
    return Data_Maybe_Unsafe.fromJust(Data_Date.fromString(m.date));
};
var stats = Data_Foldable.foldl(Data_Foldable.foldableArray)(function (m) {
    return function (pbs) {
        return Data_Map.insert(Prelude.ordString)(pbs.label)(pbs)(m);
    };
})(Data_Map.empty)($foreign.statistics);
var showDayOfMonth = new Prelude.Show(function (_14) {
    return Prelude.show(Prelude.showInt)(_14);
});
var padded = function (n) {
    if (n < 10.0) {
        return "0" + Prelude.show(Prelude.showNumber)(n);
    };
    return Prelude.show(Prelude.showNumber)(n);
};
var eqMyDate = new Prelude.Eq(function (_12) {
    return function (_13) {
        return Prelude["=="](Data_Date.eqYear)(_12.value0.ye)(_13.value0.ye) && (Prelude["=="](Data_Date.eqMonth)(_12.value0.mo)(_13.value0.mo) && Prelude["=="](Data_Date.eqDayOfMonth)(_12.value0.da)(_13.value0.da));
    };
});
var dayToMatches = function (matches) {
    var toDateAbout = function (m) {
        var d = toDate(m);
        return new MyDate({
            ye: Data_Date_UTC.year(d), 
            mo: Data_Date_UTC.month(d), 
            da: Data_Date_UTC.dayOfMonth(d)
        });
    };
    return Prelude["<$>"](Prelude.functorArray)(Prelude["<<<"](Prelude.semigroupoidFn)(Data_Profunctor_Strong.first(Data_Profunctor_Strong.strongFn)(Data_Array_Unsafe.head))(Data_Array.unzip))(Data_Array.groupBy(Data_Function.on(Prelude["=="](eqMyDate))(Data_Tuple.fst))(Prelude["<$>"](Prelude.functorArray)(function (m) {
        return new Data_Tuple.Tuple(toDateAbout(m), m);
    })(matches)));
};
var ui = function (__dict_Applicative_0) {
    return function (__dict_Alternative_1) {
        var update = function (_6) {
            return function (_7) {
                return new State(Data_Maybe_Unsafe.fromJust(Data_Map.lookup(Prelude.ordString)(_7.value0)(stats)), _7.value0);
            };
        };
        var showTime = function (m) {
            var pad2 = function (_10) {
                return Prelude["<<<"](Prelude.semigroupoidFn)(padded)(Data_Int.toNumber)(_10);
            };
            var pad1 = function (_11) {
                return Prelude["<<<"](Prelude.semigroupoidFn)(padded)(Data_Int.toNumber)(_11);
            };
            var d = toDate(m);
            return pad1(Data_Date_UTC.hourOfDay(d)) + (":" + pad2(Data_Date_UTC.minuteOfHour(d)));
        };
        var renderBreak = function (b) {
            return Halogen_HTML.tr_([ Halogen_HTML.td_([ Halogen_HTML.text(b.minimum) ]), Halogen_HTML.td_([ Halogen_HTML.text(b.percent) ]), Halogen_HTML.td_([ Halogen_HTML.text(b.absolute) ]), Halogen_HTML.td_([ Halogen_HTML.text(b.wPercentage) ]) ]);
        };
        var niceDate = function (d) {
            var shY = function (_9) {
                return Prelude["<<<"](Prelude.semigroupoidFn)(padded)(Data_Int.toNumber)(_9);
            };
            var shD = function (_8) {
                return Prelude["<<<"](Prelude.semigroupoidFn)(padded)(Data_Int.toNumber)(_8);
            };
            return shD(d.da) + (". " + (Prelude.show(Data_Date.showMonth)(d.mo) + (" " + shY(d.ye))));
        };
        var markupPlayer = function (player) {
            return function (winner) {
                var _30 = Prelude["=="](Prelude.eqString)(player)(winner);
                if (_30) {
                    return Halogen_HTML.b_([ Halogen_HTML.text(player) ]);
                };
                if (!_30) {
                    return Halogen_HTML.text(player);
                };
                throw new Error("Failed pattern match at Main line 93, column 1 - line 94, column 1: " + [ _30.constructor.name ]);
            };
        };
        var firstState = Data_Array_Unsafe.head(Data_List.fromList(Data_Unfoldable.unfoldableArray)(Data_Map.toList(stats)));
        var class$prime = function (clazz) {
            return Halogen_HTML_Attributes.class_(Halogen_HTML_Attributes.className(clazz));
        };
        var renderMatch = function (m) {
            return Halogen_HTML.tr_([ Halogen_HTML.td([ class$prime("matchDate") ])([ Halogen_HTML.text(showTime(m)) ]), Halogen_HTML.td([ class$prime("player1") ])([ markupPlayer(m.player1)(m.winner) ]), Halogen_HTML.td([ class$prime("player1") ])([ Halogen_HTML.text(m.ranking1) ]), Halogen_HTML.td([ class$prime("player1") ])([ Halogen_HTML.text(m.maxBreak1) ]), Halogen_HTML.td([ class$prime("player2") ])([ markupPlayer(m.player2)(m.winner) ]), Halogen_HTML.td([ class$prime("player2") ])([ Halogen_HTML.text(m.ranking2) ]), Halogen_HTML.td([ class$prime("player2") ])([ Halogen_HTML.text(m.maxBreak2) ]) ]);
        };
        var renderMatches = function (matches) {
            return Prelude.flip(Prelude["<$>"](Prelude.functorArray))(dayToMatches(matches))(function (_4) {
                return Halogen_HTML.div([ class$prime("matchesOfDay") ])([ Halogen_HTML.div_([ Halogen_HTML.h3_([ Halogen_HTML.text(niceDate(_4.value0.value0)) ]) ]), Halogen_HTML.table([ class$prime("matchesTable") ])([ Halogen_HTML.tbody_(Prelude["<$>"](Prelude.functorArray)(renderMatch)(_4.value1)) ]) ]);
            });
        };
        var stat = function (key) {
            return function (value) {
                return Halogen_HTML.div([ class$prime("stat") ])([ Halogen_HTML.span([ class$prime("left") ])([ Halogen_HTML.text(key) ]), Halogen_HTML.span([ class$prime("right") ])([ Halogen_HTML.text(value) ]) ]);
            };
        };
        var render = function (_5) {
            return Halogen_HTML.div_([ Halogen_HTML.div([ class$prime("playerInfo") ])([ Halogen_HTML.select([ Halogen_HTML_Events_Forms.onValueChanged(__dict_Alternative_1)(Data_Foreign_Class.stringIsForeign)(Halogen_HTML_Events.input(__dict_Applicative_0)(Select.create)) ])(Prelude.flip(Prelude["<$>"](Prelude.functorArray))(Data_List.fromList(Data_Unfoldable.unfoldableArray)(Data_Map.toList(stats)))(function (_3) {
                return Halogen_HTML.option([ Halogen_HTML_Attributes.name(_3.value0) ])([ Halogen_HTML.text(_3.value0) ]);
            })), stat("Matches: ")(Prelude.show(Prelude.showInt)(_5.value0.matches)), stat("Win %: ")(_5.value0.winPercentage), stat("Average Duration: ")(_5.value0.avgDuration), stat("Max Break:")(_5.value0.maxBreak), stat("Average Max:")(_5.value0.avgMax), stat("Ranking")(_5.value0.ranking), stat("Ranking difference")(_5.value0.rankDiff) ]), Halogen_HTML.table([ class$prime("breaksTable") ])([ Halogen_HTML.thead_([ Halogen_HTML.tr_([ Halogen_HTML.th_([ Halogen_HTML.text("Break >=") ]), Halogen_HTML.th_([ Halogen_HTML.text("Prozent") ]), Halogen_HTML.th_([ Halogen_HTML.text("Absolut") ]), Halogen_HTML.th_([ Halogen_HTML.text("Win %") ]) ]) ]), Halogen_HTML.tbody_(Prelude["<$>"](Prelude.functorArray)(renderBreak)(_5.value0.breakStats)) ]), Halogen_HTML.div([ class$prime("rankingBox") ])([ Halogen_HTML.img([ Halogen_HTML_Attributes.src(_5.value1 + ("-" + ($foreign.playerName + ".png"))) ])([  ]) ]), Halogen_HTML.div([ class$prime("matchesBox") ])([ Halogen_HTML.table([ class$prime("matchesTable") ])([ Halogen_HTML.tbody_(renderMatches(Data_Array.take(_5.value0.matches)($foreign.matchesOfPlayer))) ]) ]) ]);
        };
        return Prelude["<$>"](Halogen_Signal.functorSF1)(render)(Halogen_Signal.stateful(new State(Data_Tuple.snd(firstState), Data_Tuple.fst(firstState)))(update));
    };
};
var appendToWrapper = function (e) {
    return function __do() {
        var _1 = Data_DOM_Simple_Window.document(Data_DOM_Simple_Window.htmlWindow)(Data_DOM_Simple_Window.globalWindow)();
        var _0 = Data_DOM_Simple_Element.querySelector(Data_DOM_Simple_Document.htmlDocumentElement)("#wrapper")(_1)();
        if (_0 instanceof Data_Maybe.Just) {
            return Data_DOM_Simple_Element.appendChild(Data_DOM_Simple_Element.htmlElement)(_0.value0)(e)();
        };
        throw new Error("Failed pattern match at Main line 42, column 1 - line 43, column 1: " + [ _0.constructor.name ]);
    };
};
var main = function __do() {
    var _2 = Halogen.runUI(ui(Halogen_HTML_Events_Monad.applicativeEvent)(Halogen_HTML_Events_Monad.alternativeEvent))();
    return appendToWrapper(_2.value0)();
};
module.exports = {
    MyDate: MyDate, 
    Select: Select, 
    State: State, 
    main: main, 
    toDate: toDate, 
    dayToMatches: dayToMatches, 
    padded: padded, 
    ui: ui, 
    stats: stats, 
    appendToWrapper: appendToWrapper, 
    eqMyDate: eqMyDate, 
    showDayOfMonth: showDayOfMonth, 
    playerName: $foreign.playerName, 
    matchesOfPlayer: $foreign.matchesOfPlayer, 
    statistics: $foreign.statistics
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Main/foreign.js","Control.Bind":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Bind/index.js","Control.Monad.Eff":"/home/greg/haskell/snooker-statistics/frontend-new/output/Control.Monad.Eff/index.js","DOM":"/home/greg/haskell/snooker-statistics/frontend-new/output/DOM/index.js","Data.Array":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array/index.js","Data.Array.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Array.Unsafe/index.js","Data.DOM.Simple.Document":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Document/index.js","Data.DOM.Simple.Element":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Element/index.js","Data.DOM.Simple.Types":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Types/index.js","Data.DOM.Simple.Window":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.DOM.Simple.Window/index.js","Data.Date":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date/index.js","Data.Date.UTC":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Date.UTC/index.js","Data.Either":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Either/index.js","Data.Foldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foldable/index.js","Data.Foreign.Class":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Foreign.Class/index.js","Data.Function":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Function/index.js","Data.Int":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Int/index.js","Data.List":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.List/index.js","Data.Map":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Map/index.js","Data.Maybe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe/index.js","Data.Maybe.Unsafe":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Maybe.Unsafe/index.js","Data.Profunctor.Strong":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Profunctor.Strong/index.js","Data.Time":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Time/index.js","Data.Traversable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Traversable/index.js","Data.Tuple":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Tuple/index.js","Data.Unfoldable":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Unfoldable/index.js","Data.Void":"/home/greg/haskell/snooker-statistics/frontend-new/output/Data.Void/index.js","Halogen":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen/index.js","Halogen.Component":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Component/index.js","Halogen.HTML":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML/index.js","Halogen.HTML.Attributes":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Attributes/index.js","Halogen.HTML.Events":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events/index.js","Halogen.HTML.Events.Forms":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Forms/index.js","Halogen.HTML.Events.Monad":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.HTML.Events.Monad/index.js","Halogen.Signal":"/home/greg/haskell/snooker-statistics/frontend-new/output/Halogen.Signal/index.js","Prelude":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Math/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Math

exports.abs = Math.abs;

exports.acos = Math.acos;

exports.asin = Math.asin;

exports.atan = Math.atan;

exports.atan2 = function (y) {
  return function (x) {
    return Math.atan2(y, x);
  };
};

exports.ceil = Math.ceil;

exports.cos = Math.cos;

exports.exp = Math.exp;

exports.floor = Math.floor;

exports.log = Math.log;

exports.max = function (n1) {
  return function (n2) {
    return Math.max(n1, n2);
  };
};

exports.min = function (n1) {
  return function (n2) {
    return Math.min(n1, n2);
  };
};

exports.pow = function (n) {
  return function (p) {
    return Math.pow(n, p);
  };
};

exports["%"] = function(n) {
  return function(m) {
    return n % m;
  };
};

exports.round = Math.round;

exports.sin = Math.sin;

exports.sqrt = Math.sqrt;

exports.tan = Math.tan;

exports.e = Math.E;

exports.ln2 = Math.LN2;

exports.ln10 = Math.LN10;

exports.log2e = Math.LOG2E;

exports.log10e = Math.LOG10E;

exports.pi = Math.PI;

exports.sqrt1_2 = Math.SQRT1_2;

exports.sqrt2 = Math.SQRT2;

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Math/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
module.exports = {
    sqrt2: $foreign.sqrt2, 
    sqrt1_2: $foreign.sqrt1_2, 
    pi: $foreign.pi, 
    log10e: $foreign.log10e, 
    log2e: $foreign.log2e, 
    ln10: $foreign.ln10, 
    ln2: $foreign.ln2, 
    e: $foreign.e, 
    "%": $foreign["%"], 
    tan: $foreign.tan, 
    sqrt: $foreign.sqrt, 
    sin: $foreign.sin, 
    round: $foreign.round, 
    pow: $foreign.pow, 
    min: $foreign.min, 
    max: $foreign.max, 
    log: $foreign.log, 
    floor: $foreign.floor, 
    exp: $foreign.exp, 
    cos: $foreign.cos, 
    ceil: $foreign.ceil, 
    atan2: $foreign.atan2, 
    atan: $foreign.atan, 
    asin: $foreign.asin, 
    acos: $foreign.acos, 
    abs: $foreign.abs
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Math/foreign.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/foreign.js":[function(require,module,exports){
/* global exports */
"use strict";

// module Prelude

//- Functor --------------------------------------------------------------------

exports.arrayMap = function (f) {
  return function (arr) {
    var l = arr.length;
    var result = new Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(arr[i]);
    }
    return result;
  };
};

//- Bind -----------------------------------------------------------------------

exports.arrayBind = function (arr) {
  return function (f) {
    var result = [];
    for (var i = 0, l = arr.length; i < l; i++) {
      Array.prototype.push.apply(result, f(arr[i]));
    }
    return result;
  };
};

//- Monoid ---------------------------------------------------------------------

exports.concatString = function (s1) {
  return function (s2) {
    return s1 + s2;
  };
};

exports.concatArray = function (xs) {
  return function (ys) {
    return xs.concat(ys);
  };
};

//- Semiring -------------------------------------------------------------------

exports.intAdd = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x + y | 0;
  };
};

exports.intMul = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x * y | 0;
  };
};

exports.numAdd = function (n1) {
  return function (n2) {
    return n1 + n2;
  };
};

exports.numMul = function (n1) {
  return function (n2) {
    return n1 * n2;
  };
};

//- ModuloSemiring -------------------------------------------------------------

exports.intDiv = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x / y | 0;
  };
};

exports.intMod = function (x) {
  return function (y) {
    return x % y;
  };
};

exports.numDiv = function (n1) {
  return function (n2) {
    return n1 / n2;
  };
};

//- Ring -----------------------------------------------------------------------

exports.intSub = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x - y | 0;
  };
};

exports.numSub = function (n1) {
  return function (n2) {
    return n1 - n2;
  };
};

//- Eq -------------------------------------------------------------------------

exports.refEq = function (r1) {
  return function (r2) {
    return r1 === r2;
  };
};

exports.refIneq = function (r1) {
  return function (r2) {
    return r1 !== r2;
  };
};

exports.eqArrayImpl = function (f) {
  return function (xs) {
    return function (ys) {
      if (xs.length !== ys.length) return false;
      for (var i = 0; i < xs.length; i++) {
        if (!f(xs[i])(ys[i])) return false;
      }
      return true;
    };
  };
};

exports.ordArrayImpl = function (f) {
  return function (xs) {
    return function (ys) {
      var i = 0;
      var xlen = xs.length;
      var ylen = ys.length;
      while (i < xlen && i < ylen) {
        var x = xs[i];
        var y = ys[i];
        var o = f(x)(y);
        if (o !== 0) {
          return o;
        }
        i++;
      }
      if (xlen === ylen) {
        return 0;
      } else if (xlen > ylen) {
        return -1;
      } else {
        return 1;
      }
    };
  };
};

//- Ord ------------------------------------------------------------------------

exports.unsafeCompareImpl = function (lt) {
  return function (eq) {
    return function (gt) {
      return function (x) {
        return function (y) {
          return x < y ? lt : x > y ? gt : eq;
        };
      };
    };
  };
};

//- Bounded --------------------------------------------------------------------

exports.topChar = String.fromCharCode(65535);
exports.bottomChar = String.fromCharCode(0);

//- BooleanAlgebra -------------------------------------------------------------

exports.boolOr = function (b1) {
  return function (b2) {
    return b1 || b2;
  };
};

exports.boolAnd = function (b1) {
  return function (b2) {
    return b1 && b2;
  };
};

exports.boolNot = function (b) {
  return !b;
};

//- Show -----------------------------------------------------------------------

exports.showIntImpl = function (n) {
  return n.toString();
};

exports.showNumberImpl = function (n) {
  /* jshint bitwise: false */
  return n === (n | 0) ? n + ".0" : n.toString();
};

exports.showCharImpl = function (c) {
  return c === "'" ? "'\\''" : "'" + c + "'";
};

exports.showStringImpl = function (s) {
  return JSON.stringify(s);
};

exports.showArrayImpl = function (f) {
  return function (xs) {
    var ss = [];
    for (var i = 0, l = xs.length; i < l; i++) {
      ss[i] = f(xs[i]);
    }
    return "[" + ss.join(",") + "]";
  };
};

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
var Unit = function (x) {
    return x;
};
var LT = (function () {
    function LT() {

    };
    LT.value = new LT();
    return LT;
})();
var GT = (function () {
    function GT() {

    };
    GT.value = new GT();
    return GT;
})();
var EQ = (function () {
    function EQ() {

    };
    EQ.value = new EQ();
    return EQ;
})();
var Semigroupoid = function (compose) {
    this.compose = compose;
};
var Category = function (__superclass_Prelude$dotSemigroupoid_0, id) {
    this["__superclass_Prelude.Semigroupoid_0"] = __superclass_Prelude$dotSemigroupoid_0;
    this.id = id;
};
var Functor = function (map) {
    this.map = map;
};
var Apply = function (__superclass_Prelude$dotFunctor_0, apply) {
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
    this.apply = apply;
};
var Applicative = function (__superclass_Prelude$dotApply_0, pure) {
    this["__superclass_Prelude.Apply_0"] = __superclass_Prelude$dotApply_0;
    this.pure = pure;
};
var Bind = function (__superclass_Prelude$dotApply_0, bind) {
    this["__superclass_Prelude.Apply_0"] = __superclass_Prelude$dotApply_0;
    this.bind = bind;
};
var Monad = function (__superclass_Prelude$dotApplicative_0, __superclass_Prelude$dotBind_1) {
    this["__superclass_Prelude.Applicative_0"] = __superclass_Prelude$dotApplicative_0;
    this["__superclass_Prelude.Bind_1"] = __superclass_Prelude$dotBind_1;
};
var Semigroup = function (append) {
    this.append = append;
};
var Semiring = function (add, mul, one, zero) {
    this.add = add;
    this.mul = mul;
    this.one = one;
    this.zero = zero;
};
var Ring = function (__superclass_Prelude$dotSemiring_0, sub) {
    this["__superclass_Prelude.Semiring_0"] = __superclass_Prelude$dotSemiring_0;
    this.sub = sub;
};
var ModuloSemiring = function (__superclass_Prelude$dotSemiring_0, div, mod) {
    this["__superclass_Prelude.Semiring_0"] = __superclass_Prelude$dotSemiring_0;
    this.div = div;
    this.mod = mod;
};
var DivisionRing = function (__superclass_Prelude$dotModuloSemiring_1, __superclass_Prelude$dotRing_0) {
    this["__superclass_Prelude.ModuloSemiring_1"] = __superclass_Prelude$dotModuloSemiring_1;
    this["__superclass_Prelude.Ring_0"] = __superclass_Prelude$dotRing_0;
};
var Num = function (__superclass_Prelude$dotDivisionRing_0) {
    this["__superclass_Prelude.DivisionRing_0"] = __superclass_Prelude$dotDivisionRing_0;
};
var Eq = function (eq) {
    this.eq = eq;
};
var Ord = function (__superclass_Prelude$dotEq_0, compare) {
    this["__superclass_Prelude.Eq_0"] = __superclass_Prelude$dotEq_0;
    this.compare = compare;
};
var Bounded = function (bottom, top) {
    this.bottom = bottom;
    this.top = top;
};
var BoundedOrd = function (__superclass_Prelude$dotBounded_0, __superclass_Prelude$dotOrd_1) {
    this["__superclass_Prelude.Bounded_0"] = __superclass_Prelude$dotBounded_0;
    this["__superclass_Prelude.Ord_1"] = __superclass_Prelude$dotOrd_1;
};
var BooleanAlgebra = function (__superclass_Prelude$dotBounded_0, conj, disj, not) {
    this["__superclass_Prelude.Bounded_0"] = __superclass_Prelude$dotBounded_0;
    this.conj = conj;
    this.disj = disj;
    this.not = not;
};
var Show = function (show) {
    this.show = show;
};
var $dollar = function (f) {
    return function (x) {
        return f(x);
    };
};
var $hash = function (x) {
    return function (f) {
        return f(x);
    };
};
var zero = function (dict) {
    return dict.zero;
};
var unsafeCompare = $foreign.unsafeCompareImpl(LT.value)(EQ.value)(GT.value);
var unit = {};
var top = function (dict) {
    return dict.top;
};
var sub = function (dict) {
    return dict.sub;
};
var $minus = function (__dict_Ring_0) {
    return sub(__dict_Ring_0);
};
var showUnit = new Show(function (_134) {
    return "unit";
});
var showString = new Show($foreign.showStringImpl);
var showOrdering = new Show(function (_135) {
    if (_135 instanceof LT) {
        return "LT";
    };
    if (_135 instanceof GT) {
        return "GT";
    };
    if (_135 instanceof EQ) {
        return "EQ";
    };
    throw new Error("Failed pattern match at Prelude line 860, column 1 - line 865, column 1: " + [ _135.constructor.name ]);
});
var showNumber = new Show($foreign.showNumberImpl);
var showInt = new Show($foreign.showIntImpl);
var showChar = new Show($foreign.showCharImpl);
var showBoolean = new Show(function (_133) {
    if (_133) {
        return "true";
    };
    if (!_133) {
        return "false";
    };
    throw new Error("Failed pattern match at Prelude line 838, column 1 - line 842, column 1: " + [ _133.constructor.name ]);
});
var show = function (dict) {
    return dict.show;
};
var showArray = function (__dict_Show_1) {
    return new Show($foreign.showArrayImpl(show(__dict_Show_1)));
};
var semiringUnit = new Semiring(function (_106) {
    return function (_107) {
        return unit;
    };
}, function (_108) {
    return function (_109) {
        return unit;
    };
}, unit, unit);
var semiringNumber = new Semiring($foreign.numAdd, $foreign.numMul, 1.0, 0.0);
var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);
var semigroupoidFn = new Semigroupoid(function (f) {
    return function (g) {
        return function (x) {
            return f(g(x));
        };
    };
});
var semigroupUnit = new Semigroup(function (_103) {
    return function (_104) {
        return unit;
    };
});
var semigroupString = new Semigroup($foreign.concatString);
var semigroupOrdering = new Semigroup(function (_105) {
    return function (y) {
        if (_105 instanceof LT) {
            return LT.value;
        };
        if (_105 instanceof GT) {
            return GT.value;
        };
        if (_105 instanceof EQ) {
            return y;
        };
        throw new Error("Failed pattern match at Prelude line 413, column 1 - line 418, column 1: " + [ _105.constructor.name, y.constructor.name ]);
    };
});
var semigroupArray = new Semigroup($foreign.concatArray);
var ringUnit = new Ring(function () {
    return semiringUnit;
}, function (_110) {
    return function (_111) {
        return unit;
    };
});
var ringNumber = new Ring(function () {
    return semiringNumber;
}, $foreign.numSub);
var ringInt = new Ring(function () {
    return semiringInt;
}, $foreign.intSub);
var pure = function (dict) {
    return dict.pure;
};
var $$return = function (__dict_Applicative_2) {
    return pure(__dict_Applicative_2);
};
var otherwise = true;
var one = function (dict) {
    return dict.one;
};
var not = function (dict) {
    return dict.not;
};
var negate = function (__dict_Ring_3) {
    return function (a) {
        return $minus(__dict_Ring_3)(zero(__dict_Ring_3["__superclass_Prelude.Semiring_0"]()))(a);
    };
};
var mul = function (dict) {
    return dict.mul;
};
var $times = function (__dict_Semiring_4) {
    return mul(__dict_Semiring_4);
};
var moduloSemiringUnit = new ModuloSemiring(function () {
    return semiringUnit;
}, function (_114) {
    return function (_115) {
        return unit;
    };
}, function (_116) {
    return function (_117) {
        return unit;
    };
});
var moduloSemiringNumber = new ModuloSemiring(function () {
    return semiringNumber;
}, $foreign.numDiv, function (_112) {
    return function (_113) {
        return 0.0;
    };
});
var moduloSemiringInt = new ModuloSemiring(function () {
    return semiringInt;
}, $foreign.intDiv, $foreign.intMod);
var mod = function (dict) {
    return dict.mod;
};
var map = function (dict) {
    return dict.map;
};
var $less$dollar$greater = function (__dict_Functor_5) {
    return map(__dict_Functor_5);
};
var $less$hash$greater = function (__dict_Functor_6) {
    return function (fa) {
        return function (f) {
            return $less$dollar$greater(__dict_Functor_6)(f)(fa);
        };
    };
};
var id = function (dict) {
    return dict.id;
};
var functorArray = new Functor($foreign.arrayMap);
var flip = function (f) {
    return function (b) {
        return function (a) {
            return f(a)(b);
        };
    };
};
var eqUnit = new Eq(function (_118) {
    return function (_119) {
        return true;
    };
});
var ordUnit = new Ord(function () {
    return eqUnit;
}, function (_122) {
    return function (_123) {
        return EQ.value;
    };
});
var eqString = new Eq($foreign.refEq);
var ordString = new Ord(function () {
    return eqString;
}, unsafeCompare);
var eqOrdering = new Eq(function (_120) {
    return function (_121) {
        if (_120 instanceof LT && _121 instanceof LT) {
            return true;
        };
        if (_120 instanceof GT && _121 instanceof GT) {
            return true;
        };
        if (_120 instanceof EQ && _121 instanceof EQ) {
            return true;
        };
        return false;
    };
});
var ordOrdering = new Ord(function () {
    return eqOrdering;
}, function (_124) {
    return function (_125) {
        if (_124 instanceof LT && _125 instanceof LT) {
            return EQ.value;
        };
        if (_124 instanceof EQ && _125 instanceof EQ) {
            return EQ.value;
        };
        if (_124 instanceof GT && _125 instanceof GT) {
            return EQ.value;
        };
        if (_124 instanceof LT) {
            return LT.value;
        };
        if (_124 instanceof EQ && _125 instanceof LT) {
            return GT.value;
        };
        if (_124 instanceof EQ && _125 instanceof GT) {
            return LT.value;
        };
        if (_124 instanceof GT) {
            return GT.value;
        };
        throw new Error("Failed pattern match at Prelude line 668, column 1 - line 677, column 1: " + [ _124.constructor.name, _125.constructor.name ]);
    };
});
var eqNumber = new Eq($foreign.refEq);
var ordNumber = new Ord(function () {
    return eqNumber;
}, unsafeCompare);
var eqInt = new Eq($foreign.refEq);
var ordInt = new Ord(function () {
    return eqInt;
}, unsafeCompare);
var eqChar = new Eq($foreign.refEq);
var ordChar = new Ord(function () {
    return eqChar;
}, unsafeCompare);
var eqBoolean = new Eq($foreign.refEq);
var ordBoolean = new Ord(function () {
    return eqBoolean;
}, unsafeCompare);
var eq = function (dict) {
    return dict.eq;
};
var $eq$eq = function (__dict_Eq_7) {
    return eq(__dict_Eq_7);
};
var eqArray = function (__dict_Eq_8) {
    return new Eq($foreign.eqArrayImpl($eq$eq(__dict_Eq_8)));
};
var divisionRingUnit = new DivisionRing(function () {
    return moduloSemiringUnit;
}, function () {
    return ringUnit;
});
var numUnit = new Num(function () {
    return divisionRingUnit;
});
var divisionRingNumber = new DivisionRing(function () {
    return moduloSemiringNumber;
}, function () {
    return ringNumber;
});
var numNumber = new Num(function () {
    return divisionRingNumber;
});
var div = function (dict) {
    return dict.div;
};
var $div = function (__dict_ModuloSemiring_10) {
    return div(__dict_ModuloSemiring_10);
};
var disj = function (dict) {
    return dict.disj;
};
var $bar$bar = function (__dict_BooleanAlgebra_11) {
    return disj(__dict_BooleanAlgebra_11);
};
var $$const = function (a) {
    return function (_101) {
        return a;
    };
};
var $$void = function (__dict_Functor_12) {
    return function (fa) {
        return $less$dollar$greater(__dict_Functor_12)($$const(unit))(fa);
    };
};
var conj = function (dict) {
    return dict.conj;
};
var $amp$amp = function (__dict_BooleanAlgebra_13) {
    return conj(__dict_BooleanAlgebra_13);
};
var compose = function (dict) {
    return dict.compose;
};
var functorFn = new Functor(compose(semigroupoidFn));
var $less$less$less = function (__dict_Semigroupoid_14) {
    return compose(__dict_Semigroupoid_14);
};
var $greater$greater$greater = function (__dict_Semigroupoid_15) {
    return flip(compose(__dict_Semigroupoid_15));
};
var compare = function (dict) {
    return dict.compare;
};
var ordArray = function (__dict_Ord_16) {
    return new Ord(function () {
        return eqArray(__dict_Ord_16["__superclass_Prelude.Eq_0"]());
    }, function (xs) {
        return function (ys) {
            return $dollar(compare(ordInt)(0))($foreign.ordArrayImpl(function (x) {
                return function (y) {
                    var _1123 = compare(__dict_Ord_16)(x)(y);
                    if (_1123 instanceof EQ) {
                        return 0;
                    };
                    if (_1123 instanceof LT) {
                        return 1;
                    };
                    if (_1123 instanceof GT) {
                        return negate(ringInt)(1);
                    };
                    throw new Error("Failed pattern match at Prelude line 660, column 1 - line 666, column 1: " + [ _1123.constructor.name ]);
                };
            })(xs)(ys));
        };
    });
};
var $less = function (__dict_Ord_17) {
    return function (a1) {
        return function (a2) {
            var _1124 = compare(__dict_Ord_17)(a1)(a2);
            if (_1124 instanceof LT) {
                return true;
            };
            return false;
        };
    };
};
var $less$eq = function (__dict_Ord_18) {
    return function (a1) {
        return function (a2) {
            var _1125 = compare(__dict_Ord_18)(a1)(a2);
            if (_1125 instanceof GT) {
                return false;
            };
            return true;
        };
    };
};
var $greater = function (__dict_Ord_19) {
    return function (a1) {
        return function (a2) {
            var _1126 = compare(__dict_Ord_19)(a1)(a2);
            if (_1126 instanceof GT) {
                return true;
            };
            return false;
        };
    };
};
var $greater$eq = function (__dict_Ord_20) {
    return function (a1) {
        return function (a2) {
            var _1127 = compare(__dict_Ord_20)(a1)(a2);
            if (_1127 instanceof LT) {
                return false;
            };
            return true;
        };
    };
};
var categoryFn = new Category(function () {
    return semigroupoidFn;
}, function (x) {
    return x;
});
var boundedUnit = new Bounded(unit, unit);
var boundedOrdering = new Bounded(LT.value, GT.value);
var boundedOrdUnit = new BoundedOrd(function () {
    return boundedUnit;
}, function () {
    return ordUnit;
});
var boundedOrdOrdering = new BoundedOrd(function () {
    return boundedOrdering;
}, function () {
    return ordOrdering;
});
var boundedInt = new Bounded(negate(ringInt)(2147483648), 2147483647);
var boundedOrdInt = new BoundedOrd(function () {
    return boundedInt;
}, function () {
    return ordInt;
});
var boundedChar = new Bounded($foreign.bottomChar, $foreign.topChar);
var boundedOrdChar = new BoundedOrd(function () {
    return boundedChar;
}, function () {
    return ordChar;
});
var boundedBoolean = new Bounded(false, true);
var boundedOrdBoolean = new BoundedOrd(function () {
    return boundedBoolean;
}, function () {
    return ordBoolean;
});
var bottom = function (dict) {
    return dict.bottom;
};
var boundedFn = function (__dict_Bounded_21) {
    return new Bounded(function (_127) {
        return bottom(__dict_Bounded_21);
    }, function (_126) {
        return top(__dict_Bounded_21);
    });
};
var booleanAlgebraUnit = new BooleanAlgebra(function () {
    return boundedUnit;
}, function (_128) {
    return function (_129) {
        return unit;
    };
}, function (_130) {
    return function (_131) {
        return unit;
    };
}, function (_132) {
    return unit;
});
var booleanAlgebraFn = function (__dict_BooleanAlgebra_22) {
    return new BooleanAlgebra(function () {
        return boundedFn(__dict_BooleanAlgebra_22["__superclass_Prelude.Bounded_0"]());
    }, function (fx) {
        return function (fy) {
            return function (a) {
                return conj(__dict_BooleanAlgebra_22)(fx(a))(fy(a));
            };
        };
    }, function (fx) {
        return function (fy) {
            return function (a) {
                return disj(__dict_BooleanAlgebra_22)(fx(a))(fy(a));
            };
        };
    }, function (fx) {
        return function (a) {
            return not(__dict_BooleanAlgebra_22)(fx(a));
        };
    });
};
var booleanAlgebraBoolean = new BooleanAlgebra(function () {
    return boundedBoolean;
}, $foreign.boolAnd, $foreign.boolOr, $foreign.boolNot);
var $div$eq = function (__dict_Eq_9) {
    return function (x) {
        return function (y) {
            return not(booleanAlgebraBoolean)($eq$eq(__dict_Eq_9)(x)(y));
        };
    };
};
var bind = function (dict) {
    return dict.bind;
};
var liftM1 = function (__dict_Monad_23) {
    return function (f) {
        return function (a) {
            return bind(__dict_Monad_23["__superclass_Prelude.Bind_1"]())(a)(function (_20) {
                return $$return(__dict_Monad_23["__superclass_Prelude.Applicative_0"]())(f(_20));
            });
        };
    };
};
var $greater$greater$eq = function (__dict_Bind_24) {
    return bind(__dict_Bind_24);
};
var asTypeOf = function (x) {
    return function (_102) {
        return x;
    };
};
var applyFn = new Apply(function () {
    return functorFn;
}, function (f) {
    return function (g) {
        return function (x) {
            return f(x)(g(x));
        };
    };
});
var bindFn = new Bind(function () {
    return applyFn;
}, function (m) {
    return function (f) {
        return function (x) {
            return f(m(x))(x);
        };
    };
});
var apply = function (dict) {
    return dict.apply;
};
var $less$times$greater = function (__dict_Apply_25) {
    return apply(__dict_Apply_25);
};
var liftA1 = function (__dict_Applicative_26) {
    return function (f) {
        return function (a) {
            return $less$times$greater(__dict_Applicative_26["__superclass_Prelude.Apply_0"]())(pure(__dict_Applicative_26)(f))(a);
        };
    };
};
var applicativeFn = new Applicative(function () {
    return applyFn;
}, $$const);
var monadFn = new Monad(function () {
    return applicativeFn;
}, function () {
    return bindFn;
});
var append = function (dict) {
    return dict.append;
};
var $plus$plus = function (__dict_Semigroup_27) {
    return append(__dict_Semigroup_27);
};
var $less$greater = function (__dict_Semigroup_28) {
    return append(__dict_Semigroup_28);
};
var semigroupFn = function (__dict_Semigroup_29) {
    return new Semigroup(function (f) {
        return function (g) {
            return function (x) {
                return $less$greater(__dict_Semigroup_29)(f(x))(g(x));
            };
        };
    });
};
var ap = function (__dict_Monad_30) {
    return function (f) {
        return function (a) {
            return bind(__dict_Monad_30["__superclass_Prelude.Bind_1"]())(f)(function (_22) {
                return bind(__dict_Monad_30["__superclass_Prelude.Bind_1"]())(a)(function (_21) {
                    return $$return(__dict_Monad_30["__superclass_Prelude.Applicative_0"]())(_22(_21));
                });
            });
        };
    };
};
var monadArray = new Monad(function () {
    return applicativeArray;
}, function () {
    return bindArray;
});
var bindArray = new Bind(function () {
    return applyArray;
}, $foreign.arrayBind);
var applyArray = new Apply(function () {
    return functorArray;
}, ap(monadArray));
var applicativeArray = new Applicative(function () {
    return applyArray;
}, function (x) {
    return [ x ];
});
var add = function (dict) {
    return dict.add;
};
var $plus = function (__dict_Semiring_31) {
    return add(__dict_Semiring_31);
};
module.exports = {
    LT: LT, 
    GT: GT, 
    EQ: EQ, 
    Show: Show, 
    BooleanAlgebra: BooleanAlgebra, 
    BoundedOrd: BoundedOrd, 
    Bounded: Bounded, 
    Ord: Ord, 
    Eq: Eq, 
    DivisionRing: DivisionRing, 
    Num: Num, 
    Ring: Ring, 
    ModuloSemiring: ModuloSemiring, 
    Semiring: Semiring, 
    Semigroup: Semigroup, 
    Monad: Monad, 
    Bind: Bind, 
    Applicative: Applicative, 
    Apply: Apply, 
    Functor: Functor, 
    Category: Category, 
    Semigroupoid: Semigroupoid, 
    show: show, 
    "||": $bar$bar, 
    "&&": $amp$amp, 
    not: not, 
    disj: disj, 
    conj: conj, 
    bottom: bottom, 
    top: top, 
    unsafeCompare: unsafeCompare, 
    ">=": $greater$eq, 
    "<=": $less$eq, 
    ">": $greater, 
    "<": $less, 
    compare: compare, 
    "/=": $div$eq, 
    "==": $eq$eq, 
    eq: eq, 
    "-": $minus, 
    negate: negate, 
    sub: sub, 
    "/": $div, 
    mod: mod, 
    div: div, 
    "*": $times, 
    "+": $plus, 
    one: one, 
    mul: mul, 
    zero: zero, 
    add: add, 
    "++": $plus$plus, 
    "<>": $less$greater, 
    append: append, 
    ap: ap, 
    liftM1: liftM1, 
    "return": $$return, 
    ">>=": $greater$greater$eq, 
    bind: bind, 
    liftA1: liftA1, 
    pure: pure, 
    "<*>": $less$times$greater, 
    apply: apply, 
    "void": $$void, 
    "<#>": $less$hash$greater, 
    "<$>": $less$dollar$greater, 
    map: map, 
    id: id, 
    ">>>": $greater$greater$greater, 
    "<<<": $less$less$less, 
    compose: compose, 
    otherwise: otherwise, 
    asTypeOf: asTypeOf, 
    "const": $$const, 
    flip: flip, 
    "#": $hash, 
    "$": $dollar, 
    unit: unit, 
    semigroupoidFn: semigroupoidFn, 
    categoryFn: categoryFn, 
    functorFn: functorFn, 
    functorArray: functorArray, 
    applyFn: applyFn, 
    applyArray: applyArray, 
    applicativeFn: applicativeFn, 
    applicativeArray: applicativeArray, 
    bindFn: bindFn, 
    bindArray: bindArray, 
    monadFn: monadFn, 
    monadArray: monadArray, 
    semigroupString: semigroupString, 
    semigroupUnit: semigroupUnit, 
    semigroupFn: semigroupFn, 
    semigroupOrdering: semigroupOrdering, 
    semigroupArray: semigroupArray, 
    semiringInt: semiringInt, 
    semiringNumber: semiringNumber, 
    semiringUnit: semiringUnit, 
    ringInt: ringInt, 
    ringNumber: ringNumber, 
    ringUnit: ringUnit, 
    moduloSemiringInt: moduloSemiringInt, 
    moduloSemiringNumber: moduloSemiringNumber, 
    moduloSemiringUnit: moduloSemiringUnit, 
    divisionRingNumber: divisionRingNumber, 
    divisionRingUnit: divisionRingUnit, 
    numNumber: numNumber, 
    numUnit: numUnit, 
    eqBoolean: eqBoolean, 
    eqInt: eqInt, 
    eqNumber: eqNumber, 
    eqChar: eqChar, 
    eqString: eqString, 
    eqUnit: eqUnit, 
    eqArray: eqArray, 
    eqOrdering: eqOrdering, 
    ordBoolean: ordBoolean, 
    ordInt: ordInt, 
    ordNumber: ordNumber, 
    ordString: ordString, 
    ordChar: ordChar, 
    ordUnit: ordUnit, 
    ordArray: ordArray, 
    ordOrdering: ordOrdering, 
    boundedBoolean: boundedBoolean, 
    boundedUnit: boundedUnit, 
    boundedOrdering: boundedOrdering, 
    boundedInt: boundedInt, 
    boundedChar: boundedChar, 
    boundedFn: boundedFn, 
    boundedOrdBoolean: boundedOrdBoolean, 
    boundedOrdUnit: boundedOrdUnit, 
    boundedOrdOrdering: boundedOrdOrdering, 
    boundedOrdInt: boundedOrdInt, 
    boundedOrdChar: boundedOrdChar, 
    booleanAlgebraBoolean: booleanAlgebraBoolean, 
    booleanAlgebraUnit: booleanAlgebraUnit, 
    booleanAlgebraFn: booleanAlgebraFn, 
    showBoolean: showBoolean, 
    showInt: showInt, 
    showNumber: showNumber, 
    showChar: showChar, 
    showString: showString, 
    showUnit: showUnit, 
    showArray: showArray, 
    showOrdering: showOrdering
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Prelude/foreign.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Unsafe.Coerce/foreign.js":[function(require,module,exports){
"use strict";

// module Unsafe.Coerce

exports.unsafeCoerce = function(x) { return x; }

},{}],"/home/greg/haskell/snooker-statistics/frontend-new/output/Unsafe.Coerce/index.js":[function(require,module,exports){
// Generated by psc version 0.7.4.1
"use strict";
var $foreign = require("./foreign");
module.exports = {
    unsafeCoerce: $foreign.unsafeCoerce
};

},{"./foreign":"/home/greg/haskell/snooker-statistics/frontend-new/output/Unsafe.Coerce/foreign.js"}],"/home/greg/haskell/snooker-statistics/frontend-new/output/browserify.js":[function(require,module,exports){
require('Main').main();

},{"Main":"/home/greg/haskell/snooker-statistics/frontend-new/output/Main/index.js"}],"/usr/local/lib/node_modules/pulp/node_modules/browserify/node_modules/browser-resolve/empty.js":[function(require,module,exports){

},{}]},{},["/home/greg/haskell/snooker-statistics/frontend-new/output/browserify.js"]);
