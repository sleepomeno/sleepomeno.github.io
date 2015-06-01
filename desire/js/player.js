(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":8}],2:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":25}],3:[function(require,module,exports){
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
},{"min-document":129}],4:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],5:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],6:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":11}],7:[function(require,module,exports){
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

},{"../vnode/is-vhook.js":16,"is-object":4}],8:[function(require,module,exports){
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

},{"../vnode/handle-thunk.js":14,"../vnode/is-vnode.js":17,"../vnode/is-vtext.js":18,"../vnode/is-widget.js":19,"./apply-properties":7,"global/document":3}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"../vnode/is-widget.js":19,"../vnode/vpatch.js":22,"./apply-properties":7,"./create-element":8,"./update-widget":12}],11:[function(require,module,exports){
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

},{"./dom-index":9,"./patch-op":10,"global/document":3,"x-is-array":5}],12:[function(require,module,exports){
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

},{"../vnode/is-widget.js":19}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./is-thunk":15,"./is-vnode":17,"./is-vtext":18,"./is-widget":19}],15:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],16:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],17:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":20}],18:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":20}],19:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],20:[function(require,module,exports){
module.exports = "2"

},{}],21:[function(require,module,exports){
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

},{"./is-thunk":15,"./is-vhook":16,"./is-vnode":17,"./is-widget":19,"./version":20}],22:[function(require,module,exports){
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

},{"./version":20}],23:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":20}],24:[function(require,module,exports){
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

},{"../vnode/is-vhook":16,"is-object":4}],25:[function(require,module,exports){
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

},{"../vnode/handle-thunk":14,"../vnode/is-thunk":15,"../vnode/is-vnode":17,"../vnode/is-vtext":18,"../vnode/is-widget":19,"../vnode/vpatch":22,"./diff-props":24,"x-is-array":5}],26:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Alt` type class.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | The `Alt` type class identifies an associative operation on a type
 *  | constructor.  It is similar to `Semigroup`, except that it applies to
 *  | types of kind `* -> *`, like `Array` or `List`, rather than concrete types
 *  | `String` or `Number`.
 *  |
 *  | `Alt` instances are required to satisfy the following laws:
 *  |
 *  | - Associativity: `(x <|> y) <|> z == x <|> (y <|> z)`
 *  | - Distributivity: `f <$> (x <|> y) == (f <$> x) <|> (f <$> y)`
 *  |
 *  | For example, the `Array` (`[]`) type is an instance of `Alt`, where
 *  | `(<|>)` is defined to be concatenation.
 */
var Alt = function ($less$bar$greater, __superclass_Prelude$dotFunctor_0) {
    this["<|>"] = $less$bar$greater;
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
};

/**
 *  | The `Alt` type class identifies an associative operation on a type
 *  | constructor.  It is similar to `Semigroup`, except that it applies to
 *  | types of kind `* -> *`, like `Array` or `List`, rather than concrete types
 *  | `String` or `Number`.
 *  |
 *  | `Alt` instances are required to satisfy the following laws:
 *  |
 *  | - Associativity: `(x <|> y) <|> z == x <|> (y <|> z)`
 *  | - Distributivity: `f <$> (x <|> y) == (f <$> x) <|> (f <$> y)`
 *  |
 *  | For example, the `Array` (`[]`) type is an instance of `Alt`, where
 *  | `(<|>)` is defined to be concatenation.
 */
var $less$bar$greater = function (dict) {
    return dict["<|>"];
};
module.exports = {
    Alt: Alt, 
    "<|>": $less$bar$greater
};

},{"Prelude":127}],27:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Alternative` type class and associated
 *  | helper functions.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Lazy = require("Control.Lazy");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");

/**
 *  | The `Alternative` type class has no members of its own; it just specifies
 *  | that the type constructor has both `Applicative` and `Plus` instances.
 *  |
 *  | Types which have `Alternative` instances should also satisfy the following
 *  | laws:
 *  |
 *  | - Distributivity: `(f <|> g) <*> x == (f <*> x) <|> (g <*> x)`
 *  | - Annihilation: `empty <*> f = empty`
 */
var Alternative = function (__superclass_Control$dotPlus$dotPlus_1, __superclass_Prelude$dotApplicative_0) {
    this["__superclass_Control.Plus.Plus_1"] = __superclass_Control$dotPlus$dotPlus_1;
    this["__superclass_Prelude.Applicative_0"] = __superclass_Prelude$dotApplicative_0;
};
var some = function (__dict_Alternative_0) {
    return function (__dict_Lazy1_1) {
        return function (v) {
            return Prelude["<*>"]((__dict_Alternative_0["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())(Prelude["<$>"](((__dict_Alternative_0["__superclass_Control.Plus.Plus_1"]())["__superclass_Control.Alt.Alt_0"]())["__superclass_Prelude.Functor_0"]())(Prelude[":"])(v))(Control_Lazy.defer1(__dict_Lazy1_1)(function (_133) {
                return many(__dict_Alternative_0)(__dict_Lazy1_1)(v);
            }));
        };
    };
};
var many = function (__dict_Alternative_2) {
    return function (__dict_Lazy1_3) {
        return function (v) {
            return Control_Alt["<|>"]((__dict_Alternative_2["__superclass_Control.Plus.Plus_1"]())["__superclass_Control.Alt.Alt_0"]())(some(__dict_Alternative_2)(__dict_Lazy1_3)(v))(Prelude.pure(__dict_Alternative_2["__superclass_Prelude.Applicative_0"]())([  ]));
        };
    };
};
module.exports = {
    Alternative: Alternative, 
    many: many, 
    some: some
};

},{"Control.Alt":26,"Control.Lazy":32,"Control.Plus":57,"Prelude":127}],28:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines helper functions for working with `Apply` instances.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | Combine two effectful actions, keeping only the result of the first.
 */
var $less$times = function (__dict_Apply_0) {
    return function (a) {
        return function (b) {
            return Prelude["<*>"](__dict_Apply_0)(Prelude["<$>"](__dict_Apply_0["__superclass_Prelude.Functor_0"]())(Prelude["const"])(a))(b);
        };
    };
};

/**
 *  | Combine two effectful actions, keeping only the result of the second.
 */
var $times$greater = function (__dict_Apply_1) {
    return function (a) {
        return function (b) {
            return Prelude["<*>"](__dict_Apply_1)(Prelude["<$>"](__dict_Apply_1["__superclass_Prelude.Functor_0"]())(Prelude["const"](Prelude.id(Prelude.categoryArr)))(a))(b);
        };
    };
};

/**
 *  | Lift a function of five arguments to a function which accepts and returns
 *  | values wrapped with the type constructor `f`.
 */
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

/**
 *  | Lift a function of four arguments to a function which accepts and returns
 *  | values wrapped with the type constructor `f`.
 */
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

/**
 *  | Lift a function of three arguments to a function which accepts and returns
 *  | values wrapped with the type constructor `f`.
 */
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

/**
 *  | Lift a function of two arguments to a function which accepts and returns
 *  | values wrapped with the type constructor `f`.
 */
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

},{"Prelude":127}],29:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines helper functions for working with `Bind` instances.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | Forwards Kleisli composition.
 *  |
 *  | For example:
 *  | 
 *  | ```purescript
 *  | import Data.Array (head, tail)
 *  | 
 *  | third = tail >=> tail >=> head
 *  | ```
 */
var $greater$eq$greater = function (__dict_Bind_0) {
    return function (f) {
        return function (g) {
            return function (a) {
                return Prelude[">>="](__dict_Bind_0)(f(a))(g);
            };
        };
    };
};

/**
 *  | A version of `(>>=)` with its arguments flipped.
 */
var $eq$less$less = function (__dict_Bind_1) {
    return function (f) {
        return function (m) {
            return Prelude[">>="](__dict_Bind_1)(m)(f);
        };
    };
};

/**
 *  | Backwards Kleisli composition.
 */
var $less$eq$less = function (__dict_Bind_2) {
    return function (f) {
        return function (g) {
            return function (a) {
                return $eq$less$less(__dict_Bind_2)(f)(g(a));
            };
        };
    };
};

/**
 *  | Collapse two applications of a monadic type constructor into one.
 */
var join = function (__dict_Bind_3) {
    return function (m) {
        return Prelude[">>="](__dict_Bind_3)(m)(Prelude.id(Prelude.categoryArr));
    };
};

/**
 *  | Execute a monadic action if a condition holds. 
 *  | 
 *  | For example:
 *  |
 *  | ```purescript
 *  | main = ifM ((< 0.5) <$> random)
 *  |          (trace "Heads")
 *  |          (trace "Tails")
 *  | ```
 */
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
                    throw new Error("Failed pattern match");
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

},{"Prelude":127}],30:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Comonad` type class.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Extend = require("Control.Extend");

/**
 *  | `Comonad` extends the `Extend` class with the `extract` function
 *  | which extracts a value, discarding the comonadic context.
 *  |
 *  | `Comonad` is the dual of `Monad`, and `extract` is the dual of 
 *  | `pure` or `return`.
 *  | 
 *  | Laws:
 *  |
 *  | - Left Identity: `extract <<= xs = xs`
 *  | - Right Identity: `extract (f <<= xs) = f xs`
 */
var Comonad = function (__superclass_Control$dotExtend$dotExtend_0, extract) {
    this["__superclass_Control.Extend.Extend_0"] = __superclass_Control$dotExtend$dotExtend_0;
    this.extract = extract;
};

/**
 *  | `Comonad` extends the `Extend` class with the `extract` function
 *  | which extracts a value, discarding the comonadic context.
 *  |
 *  | `Comonad` is the dual of `Monad`, and `extract` is the dual of 
 *  | `pure` or `return`.
 *  | 
 *  | Laws:
 *  |
 *  | - Left Identity: `extract <<= xs = xs`
 *  | - Right Identity: `extract (f <<= xs) = f xs`
 */
var extract = function (dict) {
    return dict.extract;
};
module.exports = {
    Comonad: Comonad, 
    extract: extract
};

},{"Control.Extend":31,"Prelude":127}],31:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Extend` type class and associated helper functions.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | The `Extend` class defines the extension operator `(<<=)`
 *  | which extends a local context-dependent computation to
 *  | a global computation.
 *  |
 *  | `Extend` is the dual of `Bind`, and `(<<=)` is the dual of 
 *  | `(>>=)`.
 *  |
 *  | Laws:
 *  |
 *  | - Associativity: `extend f <<< extend g = extend (f <<< extend g)`
 */
var Extend = function ($less$less$eq, __superclass_Prelude$dotFunctor_0) {
    this["<<="] = $less$less$eq;
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
};

/**
 *  | The `Extend` class defines the extension operator `(<<=)`
 *  | which extends a local context-dependent computation to
 *  | a global computation.
 *  |
 *  | `Extend` is the dual of `Bind`, and `(<<=)` is the dual of 
 *  | `(>>=)`.
 *  |
 *  | Laws:
 *  |
 *  | - Associativity: `extend f <<< extend g = extend (f <<< extend g)`
 */
var $less$less$eq = function (dict) {
    return dict["<<="];
};

/**
 *  | Backwards co-Kleisli composition.
 */
var $eq$less$eq = function (__dict_Extend_0) {
    return function (f) {
        return function (g) {
            return function (w) {
                return f($less$less$eq(__dict_Extend_0)(g)(w));
            };
        };
    };
};

/**
 *  | Forwards co-Kleisli composition.
 */
var $eq$greater$eq = function (__dict_Extend_1) {
    return function (f) {
        return function (g) {
            return function (w) {
                return g($less$less$eq(__dict_Extend_1)(f)(w));
            };
        };
    };
};

/**
 *  | A version of `(<<=)` with its arguments flipped.
 */
var $eq$greater$greater = function (__dict_Extend_2) {
    return function (w) {
        return function (f) {
            return $less$less$eq(__dict_Extend_2)(f)(w);
        };
    };
};
var extendArr = function (__dict_Semigroup_3) {
    return new Extend(function (f) {
        return function (g) {
            return function (w) {
                return f(function (w$prime) {
                    return g(Prelude["<>"](__dict_Semigroup_3)(w)(w$prime));
                });
            };
        };
    }, function () {
        return Prelude.functorArr;
    });
};

/**
 *  | An alias for `(<<=)`.
 */
var extend = function (__dict_Extend_4) {
    return $less$less$eq(__dict_Extend_4);
};

/**
 *  | Duplicate a comonadic context.
 *  |
 *  | `duplicate` is dual to `Control.Bind.join`.
 */
var duplicate = function (__dict_Extend_5) {
    return function (w) {
        return $less$less$eq(__dict_Extend_5)(Prelude.id(Prelude.categoryArr))(w);
    };
};
module.exports = {
    Extend: Extend, 
    duplicate: duplicate, 
    extend: extend, 
    "=<=": $eq$less$eq, 
    "=>=": $eq$greater$eq, 
    "=>>": $eq$greater$greater, 
    "<<=": $less$less$eq, 
    extendArr: extendArr
};

},{"Prelude":127}],32:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Lazy` type class and associated
 *  | helper functions.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | The `Lazy` class represents types which allow evaluation of values
 *  | to be _deferred_.
 *  |
 *  | Usually, this means that a type contains a function arrow which can
 *  | be used to delay evaluation.
 */
var Lazy = function (defer) {
    this.defer = defer;
};

/**
 *  | A version of `Lazy` for type constructors of one type argument.
 */
var Lazy1 = function (defer1) {
    this.defer1 = defer1;
};

/**
 *  | A version of `Lazy` for type constructors of two type arguments.
 */
var Lazy2 = function (defer2) {
    this.defer2 = defer2;
};

/**
 *  | A version of `Lazy` for type constructors of two type arguments.
 */
var defer2 = function (dict) {
    return dict.defer2;
};

/**
 *  | A version of `fix` for type constructors of two type arguments.
 */
var fix2 = function (__dict_Lazy2_0) {
    return function (f) {
        return defer2(__dict_Lazy2_0)(function (_126) {
            return f(fix2(__dict_Lazy2_0)(f));
        });
    };
};

/**
 *  | A version of `Lazy` for type constructors of one type argument.
 */
var defer1 = function (dict) {
    return dict.defer1;
};

/**
 *  | A version of `fix` for type constructors of one type argument.
 */
var fix1 = function (__dict_Lazy1_1) {
    return function (f) {
        return defer1(__dict_Lazy1_1)(function (_125) {
            return f(fix1(__dict_Lazy1_1)(f));
        });
    };
};

/**
 *  | The `Lazy` class represents types which allow evaluation of values
 *  | to be _deferred_.
 *  |
 *  | Usually, this means that a type contains a function arrow which can
 *  | be used to delay evaluation.
 */
var defer = function (dict) {
    return dict.defer;
};

/**
 *  | `fix` defines a value as the fixed point of a function.
 *  |
 *  | The `Lazy` instance allows us to generate the result lazily.
 */
var fix = function (__dict_Lazy_2) {
    return function (f) {
        return defer(__dict_Lazy_2)(function (_124) {
            return f(fix(__dict_Lazy_2)(f));
        });
    };
};
module.exports = {
    Lazy2: Lazy2, 
    Lazy1: Lazy1, 
    Lazy: Lazy, 
    fix2: fix2, 
    fix1: fix1, 
    fix: fix, 
    defer2: defer2, 
    defer1: defer1, 
    defer: defer
};

},{"Prelude":127}],33:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Aff = require("Control.Monad.Aff");
var MonadAff = function (liftAff) {
    this.liftAff = liftAff;
};
var monadAffAff = new MonadAff(Prelude.id(Prelude.categoryArr));
var liftAff = function (dict) {
    return dict.liftAff;
};
module.exports = {
    MonadAff: MonadAff, 
    liftAff: liftAff, 
    monadAffAff: monadAffAff
};

},{"Control.Monad.Aff":34,"Prelude":127}],34:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Data_Function = require("Data.Function");
var Prelude = require("Prelude");
var Data_Monoid = require("Data.Monoid");
var Data_Either = require("Data.Either");
var Control_Monad_Error_Class = require("Control.Monad.Error.Class");
var Control_Monad_Eff_Exception = require("Control.Monad.Eff.Exception");
var Control_Apply = require("Control.Apply");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_Eff_Unsafe = require("Control.Monad.Eff.Unsafe");
var Control_Monad_Eff_Class = require("Control.Monad.Eff.Class");

    function _cancelWith(nonCanceler, aff, canceler1) {
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
  ;

    function _setTimeout(nonCanceler, millis, aff) {
      return function(success, error) {
        var canceler;

        var timeout = setTimeout(function() {
          canceler = aff(success, error);
        }, millis);

        return function(e) {
          return function(s, f) {
            if (canceler !== undefined) {
              return canceler(e)(s, f);
            } else {
              clearTimeout(timeout);

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
  ;

    function _unsafeInterleaveAff(aff) {
      return aff;
    }
  ;

    function _forkAff(nonCanceler, aff) {
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
  ;

    function _makeAff(cb) {
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
    ;

    function _pure(canceler, v) {
      return function(success, error) {
        try {
          success(v);
        } catch (e) {
          error(e);
        }

        return canceler;
      }
    };

    function _throwError(canceler, e) {
      return function(success, error) {
        error(e);

        return canceler;
      };
    };

    function _fmap(f, aff) {
      return function(success, error) {
        return aff(function(v) {
          try {
            success(f(v));
          } catch (e) {
            error(e);
          }
        }, error);
      };
    };

    function _bind(alwaysCanceler, aff, f) {
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
    };

    function _attempt(Left, Right, aff) {
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
    };

    function _runAff(errorT, successT, aff) {
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
    };

    function _liftEff(canceler, e) {
      return function(success, error) {
        try {
          success(e());
        } catch (e) {
          error(e);
        }

        return canceler;
      };
    };

/**
 *  | A canceler is asynchronous function that can be used to attempt the 
 *  | cancelation of a computation. Returns a boolean flag indicating whether
 *  | or not the cancellation was successful.
 */
var Canceler = function (x) {
    return x;
};

/**
 *  | Runs the asynchronous computation. You must supply an error callback and a
 *  | success callback.
 */
var runAff = function (ex) {
    return function (f) {
        return function (aff) {
            return _runAff(ex, f, aff);
        };
    };
};

/**
 *  | Creates an asynchronous effect from a function that accepts error and
 *  | success callbacks, and returns a canceler for the computation. This
 *  | function can be used for asynchronous computations that can be canceled.
 */
var makeAff$prime = function (h) {
    return _makeAff(h);
};

/**
 *  | Converts the asynchronous computation into a synchronous one. All values
 *  | and errors are ignored.
 */
var launchAff = runAff(Prelude["const"](Prelude.pure(Control_Monad_Eff.applicativeEff)(Prelude.unit)))(Prelude["const"](Prelude.pure(Control_Monad_Eff.applicativeEff)(Prelude.unit)));
var functorAff = new Prelude.Functor(function (f) {
    return function (fa) {
        return _fmap(f, fa);
    };
});

/**
 *  | Unwraps the canceler function from the newtype that wraps it.
 */
var cancel = function (_319) {
    return _319;
};

/**
 *  | Promotes any error to the value level of the asynchronous monad.
 */
var attempt = function (aff) {
    return _attempt(Data_Either.Left.create, Data_Either.Right.create, aff);
};

/**
 *  | Ignores any errors.
 */
var apathize = function (a) {
    return Prelude["<$>"](functorAff)(Prelude["const"](Prelude.unit))(attempt(a));
};
var applyAff = new Prelude.Apply(function (ff) {
    return function (fa) {
        return _bind(alwaysCanceler, ff, function (f) {
            return Prelude["<$>"](functorAff)(f)(fa);
        });
    };
}, function () {
    return functorAff;
});
var applicativeAff = new Prelude.Applicative(function () {
    return applyAff;
}, function (v) {
    return _pure(nonCanceler, v);
});
var nonCanceler = Prelude["const"](Prelude.pure(applicativeAff)(false));
var alwaysCanceler = Prelude["const"](Prelude.pure(applicativeAff)(true));

/**
 *  | This function allows you to attach a custom canceler to an asynchronous
 *  | computation. If the computation is canceled, then the custom canceler 
 *  | will be run along side the computation's own canceler.
 */
var cancelWith = function (aff) {
    return function (c) {
        return _cancelWith(nonCanceler, aff, c);
    };
};

/**
 *  | Forks the specified asynchronous computation so subsequent monadic binds
 *  | will not block on the result of the computation.
 */
var forkAff = function (aff) {
    return _forkAff(nonCanceler, aff);
};

/**
 *  | Runs the asynchronous computation later (off the current execution context).
 */
var later$prime = function (n) {
    return function (aff) {
        return _setTimeout(nonCanceler, n, aff);
    };
};

/**
 *  | Runs the asynchronous computation off the current execution context.
 */
var later = later$prime(0);

/**
 *  | Lifts a synchronous computation and makes explicit any failure from exceptions.
 */
var liftEff$prime = function (eff) {
    return attempt(_unsafeInterleaveAff(_liftEff(nonCanceler, eff)));
};

/**
 *  | Creates an asynchronous effect from a function that accepts error and
 *  | success callbacks. This function can be used for asynchronous computations
 *  | that cannot be canceled.
 */
var makeAff = function (h) {
    return makeAff$prime(function (e) {
        return function (a) {
            return Prelude["<$>"](Control_Monad_Eff.functorEff)(Prelude["const"](nonCanceler))(h(e)(a));
        };
    });
};
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
var semigroupCanceler = new Prelude.Semigroup(function (_320) {
    return function (_321) {
        return function (e) {
            return Prelude["<*>"](applyAff)(Prelude["<$>"](functorAff)(Prelude["||"](Prelude.boolLikeBoolean))(_320(e)))(_321(e));
        };
    };
});
var monoidCanceler = new Data_Monoid.Monoid(function () {
    return semigroupCanceler;
}, Prelude["const"](Prelude.pure(applicativeAff)(true)));
var bindAff = new Prelude.Bind(function (fa) {
    return function (f) {
        return _bind(alwaysCanceler, fa, f);
    };
}, function () {
    return applyAff;
});
var monadAff = new Prelude.Monad(function () {
    return applicativeAff;
}, function () {
    return bindAff;
});
var monadEffAff = new Control_Monad_Eff_Class.MonadEff(function () {
    return monadAff;
}, function (eff) {
    return _liftEff(nonCanceler, eff);
});

/**
 *  | Allows users to catch and throw errors on the error channel of the
 *  | asynchronous computation. See documentation in `purescript-transformers`.
 */
var monadErrorAff = new Control_Monad_Error_Class.MonadError(function (aff) {
    return function (ex) {
        return Prelude[">>="](bindAff)(attempt(aff))(Data_Either.either(ex)(Prelude.pure(applicativeAff)));
    };
}, function (e) {
    return _throwError(nonCanceler, e);
});
var altAff = new Control_Alt.Alt(function (a1) {
    return function (a2) {
        return Prelude[">>="](bindAff)(attempt(a1))(Data_Either.either(Prelude["const"](a2))(Prelude.pure(applicativeAff)));
    };
}, function () {
    return functorAff;
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
    semigroupCanceler: semigroupCanceler, 
    monoidCanceler: monoidCanceler
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Apply":28,"Control.Monad.Eff":39,"Control.Monad.Eff.Class":35,"Control.Monad.Eff.Exception":36,"Control.Monad.Eff.Unsafe":38,"Control.Monad.Error.Class":40,"Control.MonadPlus":56,"Control.Plus":57,"Data.Either":73,"Data.Function":83,"Data.Monoid":97,"Prelude":127}],35:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Data_Monoid = require("Data.Monoid");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_RWS_Trans = require("Control.Monad.RWS.Trans");

/**
 *  | The `MonadEff` class captures those monads which support native effects.
 *  |
 *  | Instances are provided for `Eff` itself, and the standard monad transformers.
 *  |
 *  | `liftEff` can be used in any appropriate monad transformer stack to lift an action
 *  | of type `Eff eff a` into the monad.
 *  |
 *  | Note that `MonadEff` is parameterized by the row of effects, so type inference can be
 *  | tricky. It is generally recommended to either work with a polymorphic row of effects,
 *  | or a concrete, closed row of effects such as `(trace :: Trace)`.
 */
var MonadEff = function (__superclass_Prelude$dotMonad_0, liftEff) {
    this["__superclass_Prelude.Monad_0"] = __superclass_Prelude$dotMonad_0;
    this.liftEff = liftEff;
};
var monadEffEff = new MonadEff(function () {
    return Control_Monad_Eff.monadEff;
}, Prelude.id(Prelude.categoryArr));

/**
 *  | The `MonadEff` class captures those monads which support native effects.
 *  |
 *  | Instances are provided for `Eff` itself, and the standard monad transformers.
 *  |
 *  | `liftEff` can be used in any appropriate monad transformer stack to lift an action
 *  | of type `Eff eff a` into the monad.
 *  |
 *  | Note that `MonadEff` is parameterized by the row of effects, so type inference can be
 *  | tricky. It is generally recommended to either work with a polymorphic row of effects,
 *  | or a concrete, closed row of effects such as `(trace :: Trace)`.
 */
var liftEff = function (dict) {
    return dict.liftEff;
};
var monadEffError = function (__dict_Monad_0) {
    return function (__dict_MonadEff_1) {
        return new MonadEff(function () {
            return Control_Monad_Error_Trans.monadErrorT(__dict_Monad_0);
        }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_Error_Trans.monadTransErrorT)(__dict_Monad_0))(liftEff(__dict_MonadEff_1)));
    };
};
var monadEffMaybe = function (__dict_Monad_2) {
    return function (__dict_MonadEff_3) {
        return new MonadEff(function () {
            return Control_Monad_Maybe_Trans.monadMaybeT(__dict_Monad_2);
        }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_Maybe_Trans.monadTransMaybeT)(__dict_Monad_2))(liftEff(__dict_MonadEff_3)));
    };
};
var monadEffRWS = function (__dict_Monad_4) {
    return function (__dict_Monoid_5) {
        return function (__dict_MonadEff_6) {
            return new MonadEff(function () {
                return Control_Monad_RWS_Trans.monadRWST(__dict_Monad_4)(__dict_Monoid_5);
            }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_RWS_Trans.monadTransRWST(__dict_Monoid_5))(__dict_Monad_4))(liftEff(__dict_MonadEff_6)));
        };
    };
};
var monadEffReader = function (__dict_Monad_7) {
    return function (__dict_MonadEff_8) {
        return new MonadEff(function () {
            return Control_Monad_Reader_Trans.monadReaderT(__dict_Monad_7);
        }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_Reader_Trans.monadTransReaderT)(__dict_Monad_7))(liftEff(__dict_MonadEff_8)));
    };
};
var monadEffState = function (__dict_Monad_9) {
    return function (__dict_MonadEff_10) {
        return new MonadEff(function () {
            return Control_Monad_State_Trans.monadStateT(__dict_Monad_9);
        }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_State_Trans.monadTransStateT)(__dict_Monad_9))(liftEff(__dict_MonadEff_10)));
    };
};
var monadEffWriter = function (__dict_Monad_11) {
    return function (__dict_Monoid_12) {
        return function (__dict_MonadEff_13) {
            return new MonadEff(function () {
                return Control_Monad_Writer_Trans.monadWriterT(__dict_Monoid_12)(__dict_Monad_11);
            }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_Writer_Trans.monadTransWriterT(__dict_Monoid_12))(__dict_Monad_11))(liftEff(__dict_MonadEff_13)));
        };
    };
};
module.exports = {
    MonadEff: MonadEff, 
    liftEff: liftEff, 
    monadEffEff: monadEffEff, 
    monadEffMaybe: monadEffMaybe, 
    monadEffError: monadEffError, 
    monadEffState: monadEffState, 
    monadEffWriter: monadEffWriter, 
    monadEffReader: monadEffReader, 
    monadEffRWS: monadEffRWS
};

},{"Control.Monad.Eff":39,"Control.Monad.Error.Trans":41,"Control.Monad.Maybe.Trans":45,"Control.Monad.RWS.Trans":46,"Control.Monad.Reader.Trans":48,"Control.Monad.State.Trans":50,"Control.Monad.Trans":51,"Control.Monad.Writer.Trans":53,"Data.Monoid":97,"Prelude":127}],36:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines an effect, actions and handlers for working
 *  | with Javascript exceptions.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");

  function showErrorImpl(err) {
    return err.stack || err.toString();
  }
  ;

  function error(msg) {
    return new Error(msg);
  }
  ;

  function message(e) {
    return e.message;
  }
  ;

  function throwException(e) {
    return function() {
      throw e;
    };
  }
  ;

  function catchException(c) {
    return function(t) {
      return function() {
        try {
          return t();
        } catch(e) {
          if (e instanceof Error || Object.prototype.toString.call(e) === '[object Error]') {
            return c(e)();
          } else {
            return c(new Error(e.toString()))();
          }
        }
      };
    };
  }
  ;
var showError = new Prelude.Show(showErrorImpl);
module.exports = {
    catchException: catchException, 
    throwException: throwException, 
    message: message, 
    error: error, 
    showError: showError
};

},{"Control.Monad.Eff":39,"Prelude":127}],37:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines an effect and actions for working with
 *  | global mutable variables.
 *  |
 *  | _Note_: The `Control.Monad.ST` provides a _safe_ alternative
 *  | to global mutable variables when mutation is restricted to a
 *  | local scope.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");

  function newRef(val) {
    return function () {
      return { value: val };
    };
  }
;

  function readRef(ref) {
    return function() {
      return ref.value;
    };
  }
;

  function modifyRef$prime(ref) {
    return function(f) {
      return function() {
        var t = f(ref.value);
        ref.value = t.newState;
        return t.retVal;
      };
    };
  }
;

  function writeRef(ref) {
    return function(val) {
      return function() {
        ref.value = val;
        return {};
      };
    };
  }
;

/**
 *  | Update the value of a mutable reference by applying a function
 *  | to the current value.
 */
var modifyRef = function (ref) {
    return function (f) {
        return modifyRef$prime(ref)(function (s) {
            return {
                newState: f(s), 
                retVal: Prelude.unit
            };
        });
    };
};
module.exports = {
    writeRef: writeRef, 
    modifyRef: modifyRef, 
    "modifyRef'": modifyRef$prime, 
    readRef: readRef, 
    newRef: newRef
};

},{"Control.Monad.Eff":39,"Prelude":127}],38:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");

    function unsafeInterleaveEff(f) {
      return f;
    }
    ;
module.exports = {
    unsafeInterleaveEff: unsafeInterleaveEff
};

},{"Control.Monad.Eff":39,"Prelude":127}],39:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");

    function returnE(a) {
      return function() {
        return a;
      };
    }
    ;

    function bindE(a) {
      return function(f) {
        return function() {
          return f(a())();
        };
      };
    }
    ;

    function runPure(f) {
      return f();
    }
    ;

    function untilE(f) {
      return function() {
        while (!f());
        return {};
      };
    }
    ;

    function whileE(f) {
      return function(a) {
        return function() {
          while (f()) {
            a();
          }
          return {};
        };
      };
    }
    ;

    function forE(lo) {
      return function(hi) {
        return function(f) {
          return function() {
            for (var i = lo; i < hi; i++) {
              f(i)();
            }
          };
        };
      };
    }
    ;

    function foreachE(as) {
      return function(f) {
        return function() {
          for (var i = 0; i < as.length; i++) {
            f(as[i])();
          }
        };
      };
    }
    ;
var monadEff = new Prelude.Monad(function () {
    return applicativeEff;
}, function () {
    return bindEff;
});
var bindEff = new Prelude.Bind(bindE, function () {
    return applyEff;
});
var applyEff = new Prelude.Apply(Prelude.ap(monadEff), function () {
    return functorEff;
});
var applicativeEff = new Prelude.Applicative(function () {
    return applyEff;
}, returnE);
var functorEff = new Prelude.Functor(Prelude.liftA1(applicativeEff));
module.exports = {
    foreachE: foreachE, 
    forE: forE, 
    whileE: whileE, 
    untilE: untilE, 
    runPure: runPure, 
    functorEff: functorEff, 
    applyEff: applyEff, 
    applicativeEff: applicativeEff, 
    bindEff: bindEff, 
    monadEff: monadEff
};

},{"Prelude":127}],40:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `MonadError` type class and its instances.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_Except_Trans = require("Control.Monad.Except.Trans");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Control_Monad_Error = require("Control.Monad.Error");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");

/**
 *  | The `MonadError` type class represents those monads which support errors via
 *  | `throwError` and `catchError`.
 *  |
 *  | - `throwError e` throws the error `e`
 *  | - `catchError x f` calls the error handler `f` if an error is thrown during the
 *  |   evaluation of `x`.
 *  |
 *  | An implementation is provided for `ErrorT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - Left zero: `throwError e >>= f = throwError e`
 *  | - Catch: `catchError (throwError e) f = f e`
 *  | - Pure: `catchError (pure a) f = pure a`
 *  | 
 */
var MonadError = function (catchError, throwError) {
    this.catchError = catchError;
    this.throwError = throwError;
};

/**
 *  | The `MonadError` type class represents those monads which support errors via
 *  | `throwError` and `catchError`.
 *  |
 *  | - `throwError e` throws the error `e`
 *  | - `catchError x f` calls the error handler `f` if an error is thrown during the
 *  |   evaluation of `x`.
 *  |
 *  | An implementation is provided for `ErrorT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - Left zero: `throwError e >>= f = throwError e`
 *  | - Catch: `catchError (throwError e) f = f e`
 *  | - Pure: `catchError (pure a) f = pure a`
 *  | 
 */
var throwError = function (dict) {
    return dict.throwError;
};
var monadErrorMaybe = new MonadError(function (_318) {
    return function (f) {
        if (_318 instanceof Data_Maybe.Nothing) {
            return f(Prelude.unit);
        };
        if (_318 instanceof Data_Maybe.Just) {
            return new Data_Maybe.Just(_318.value0);
        };
        throw new Error("Failed pattern match");
    };
}, Prelude["const"](Data_Maybe.Nothing.value));
var monadErrorExceptT = function (__dict_Monad_0) {
    return new MonadError(Control_Monad_Except_Trans.catchE(__dict_Monad_0), Control_Monad_Except_Trans.throwE(__dict_Monad_0["__superclass_Prelude.Applicative_0"]()));
};
var monadErrorErrorT = function (__dict_Monad_1) {
    return new MonadError(function (m) {
        return function (h) {
            return Control_Monad_Error_Trans.ErrorT(Prelude[">>="](__dict_Monad_1["__superclass_Prelude.Bind_1"]())(Control_Monad_Error_Trans.runErrorT(m))(function (_35) {
                if (_35 instanceof Data_Either.Left) {
                    return Control_Monad_Error_Trans.runErrorT(h(_35.value0));
                };
                if (_35 instanceof Data_Either.Right) {
                    return Prelude["return"](__dict_Monad_1)(new Data_Either.Right(_35.value0));
                };
                throw new Error("Failed pattern match");
            }));
        };
    }, function (e) {
        return Control_Monad_Error_Trans.ErrorT(Prelude["return"](__dict_Monad_1)(new Data_Either.Left(e)));
    });
};
var monadErrorEither = new MonadError(function (_317) {
    return function (h) {
        if (_317 instanceof Data_Either.Left) {
            return h(_317.value0);
        };
        if (_317 instanceof Data_Either.Right) {
            return new Data_Either.Right(_317.value0);
        };
        throw new Error("Failed pattern match");
    };
}, Data_Either.Left.create);

/**
 *  | The `MonadError` type class represents those monads which support errors via
 *  | `throwError` and `catchError`.
 *  |
 *  | - `throwError e` throws the error `e`
 *  | - `catchError x f` calls the error handler `f` if an error is thrown during the
 *  |   evaluation of `x`.
 *  |
 *  | An implementation is provided for `ErrorT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - Left zero: `throwError e >>= f = throwError e`
 *  | - Catch: `catchError (throwError e) f = f e`
 *  | - Pure: `catchError (pure a) f = pure a`
 *  | 
 */
var catchError = function (dict) {
    return dict.catchError;
};

/**
 *  | This function allows you to provide a predicate for selecting the
 *  | exceptions that you're interested in, and handle only those exceptons.
 *  | If the inner computation throws an exception, and the predicate returns
 *  | Nothing, then the whole computation will still fail with that exception.
 */
var catchJust = function (__dict_MonadError_2) {
    return function (p) {
        return function (act) {
            return function (handler) {
                var handle = function (e) {
                    var _1462 = p(e);
                    if (_1462 instanceof Data_Maybe.Nothing) {
                        return throwError(__dict_MonadError_2)(e);
                    };
                    if (_1462 instanceof Data_Maybe.Just) {
                        return handler(_1462.value0);
                    };
                    throw new Error("Failed pattern match");
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

},{"Control.Monad.Error":42,"Control.Monad.Error.Trans":41,"Control.Monad.Except.Trans":43,"Control.Monad.Maybe.Trans":45,"Control.Monad.Reader.Trans":48,"Control.Monad.State.Trans":50,"Control.Monad.Trans":51,"Control.Monad.Writer.Trans":53,"Data.Either":73,"Data.Maybe":90,"Data.Monoid":97,"Prelude":127}],41:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the error monad transformer, `ErrorT`.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Apply = require("Control.Apply");
var Control_Monad_Error = require("Control.Monad.Error");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Plus = require("Control.Plus");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Data_Either = require("Data.Either");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");

/**
 *  | The error monad transformer
 *  |
 *  | This monad transformer extends the base monad with the ability to throw and handle 
 *  | errors.
 *  |
 *  | The `MonadError` type class describes the operations supported by this monad.
 */
var ErrorT = function (x) {
    return x;
};

/**
 *  | Run a computation in the `ErrorT` monad.
 */
var runErrorT = function (_299) {
    return _299;
};
var monadTransErrorT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_2) {
    return function (m) {
        return ErrorT(Prelude[">>="](__dict_Monad_2["__superclass_Prelude.Bind_1"]())(m)(function (_21) {
            return Prelude["return"](__dict_Monad_2)(new Data_Either.Right(_21));
        }));
    };
});

/**
 *  | Change the error and result types in an `ErrorT` monad action.
 */
var mapErrorT = function (f) {
    return function (m) {
        return ErrorT(f(runErrorT(m)));
    };
};
var liftPassError = function (__dict_Monad_6) {
    return function (pass) {
        return mapErrorT(function (m) {
            return pass(Prelude[">>="](__dict_Monad_6["__superclass_Prelude.Bind_1"]())(m)(function (_23) {
                return Prelude["return"](__dict_Monad_6)((function () {
                    if (_23 instanceof Data_Either.Left) {
                        return new Data_Tuple.Tuple(new Data_Either.Left(_23.value0), Prelude.id(Prelude.categoryArr));
                    };
                    if (_23 instanceof Data_Either.Right) {
                        return new Data_Tuple.Tuple(new Data_Either.Right(_23.value0.value0), _23.value0.value1);
                    };
                    throw new Error("Failed pattern match");
                })());
            }));
        });
    };
};
var liftListenError = function (__dict_Monad_7) {
    return function (listen) {
        return mapErrorT(function (m) {
            return Prelude[">>="](__dict_Monad_7["__superclass_Prelude.Bind_1"]())(listen(m))(function (_22) {
                return Prelude["return"](__dict_Monad_7)(Prelude["<$>"](Data_Either.functorEither)(function (r) {
                    return new Data_Tuple.Tuple(r, _22.value1);
                })(_22.value0));
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
var functorErrorT = function (__dict_Functor_8) {
    return new Prelude.Functor(function (f) {
        return Prelude["<<<"](Prelude.semigroupoidArr)(ErrorT)(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude["<$>"](__dict_Functor_8)(Prelude["<$>"](Data_Either.functorEither)(f)))(runErrorT));
    });
};
var applyErrorT = function (__dict_Apply_10) {
    return new Prelude.Apply(function (_300) {
        return function (_301) {
            return ErrorT(Prelude["<*>"](__dict_Apply_10)(Prelude["<$>"](__dict_Apply_10["__superclass_Prelude.Functor_0"]())(Control_Apply.lift2(Data_Either.applyEither)(Prelude["$"]))(_300))(_301));
        };
    }, function () {
        return functorErrorT(__dict_Apply_10["__superclass_Prelude.Functor_0"]());
    });
};
var bindErrorT = function (__dict_Monad_9) {
    return new Prelude.Bind(function (m) {
        return function (f) {
            return ErrorT(Prelude[">>="](__dict_Monad_9["__superclass_Prelude.Bind_1"]())(runErrorT(m))(function (_20) {
                if (_20 instanceof Data_Either.Left) {
                    return Prelude["return"](__dict_Monad_9)(new Data_Either.Left(_20.value0));
                };
                if (_20 instanceof Data_Either.Right) {
                    return runErrorT(f(_20.value0));
                };
                throw new Error("Failed pattern match");
            }));
        };
    }, function () {
        return applyErrorT((__dict_Monad_9["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]());
    });
};
var applicativeErrorT = function (__dict_Applicative_11) {
    return new Prelude.Applicative(function () {
        return applyErrorT(__dict_Applicative_11["__superclass_Prelude.Apply_0"]());
    }, function (a) {
        return ErrorT(Prelude.pure(__dict_Applicative_11)(new Data_Either.Right(a)));
    });
};
var monadErrorT = function (__dict_Monad_5) {
    return new Prelude.Monad(function () {
        return applicativeErrorT(__dict_Monad_5["__superclass_Prelude.Applicative_0"]());
    }, function () {
        return bindErrorT(__dict_Monad_5);
    });
};
var altErrorT = function (__dict_Monad_14) {
    return new Control_Alt.Alt(function (x) {
        return function (y) {
            return ErrorT(Prelude[">>="](__dict_Monad_14["__superclass_Prelude.Bind_1"]())(runErrorT(x))(function (e) {
                if (e instanceof Data_Either.Left) {
                    return runErrorT(y);
                };
                return Prelude["return"](__dict_Monad_14)(e);
            }));
        };
    }, function () {
        return functorErrorT(((__dict_Monad_14["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    });
};
var plusErrorT = function (__dict_Monad_0) {
    return function (__dict_Error_1) {
        return new Control_Plus.Plus(function () {
            return altErrorT(__dict_Monad_0);
        }, Prelude["return"](__dict_Monad_0)(Data_Either.Left.create(Control_Monad_Error.strMsg(__dict_Error_1)("No alternative"))));
    };
};
var alternativeErrorT = function (__dict_Monad_12) {
    return function (__dict_Error_13) {
        return new Control_Alternative.Alternative(function () {
            return plusErrorT(__dict_Monad_12)(__dict_Error_13);
        }, function () {
            return applicativeErrorT(__dict_Monad_12["__superclass_Prelude.Applicative_0"]());
        });
    };
};
var monadPlusErrorT = function (__dict_Monad_3) {
    return function (__dict_Error_4) {
        return new Control_MonadPlus.MonadPlus(function () {
            return alternativeErrorT(__dict_Monad_3)(__dict_Error_4);
        }, function () {
            return monadErrorT(__dict_Monad_3);
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
    monadPlusErrorT: monadPlusErrorT, 
    monadTransErrorT: monadTransErrorT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Apply":28,"Control.Monad.Error":42,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Data.Either":73,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],42:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Error` type class, which is used with the error monad
 *  | transformer, `ErrorT`.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | The `Error` type class represents _error_ types, which can be 
 *  | constructed from error message strings.
 */
var $$Error = function (noMsg, strMsg) {
    this.noMsg = noMsg;
    this.strMsg = strMsg;
};

/**
 *  | The `Error` type class represents _error_ types, which can be 
 *  | constructed from error message strings.
 */
var strMsg = function (dict) {
    return dict.strMsg;
};

/**
 *  | The `Error` type class represents _error_ types, which can be 
 *  | constructed from error message strings.
 */
var noMsg = function (dict) {
    return dict.noMsg;
};
var errorString = new $$Error("", Prelude.id(Prelude.categoryArr));
module.exports = {
    "Error": $$Error, 
    strMsg: strMsg, 
    noMsg: noMsg, 
    errorString: errorString
};

},{"Prelude":127}],43:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Either = require("Data.Either");
var Data_Monoid = require("Data.Monoid");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");

/**
 *  | A monad transformer which adds exceptions to other monads, in the same way
 *  | as `Except`. As before, `e` is the type of exceptions, and `a` is the type
 *  | of successful results. The new type parameter `m` is the inner monad that
 *  | computations run in.
 */
var ExceptT = function (x) {
    return x;
};

/**
 *  | Throw an exception in an `ExceptT` computation.
 */
var throwE = function (__dict_Applicative_0) {
    return Prelude["<<<"](Prelude.semigroupoidArr)(ExceptT)(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude.pure(__dict_Applicative_0))(Data_Either.Left.create));
};

/**
 *  | The inverse of `ExceptT`. Run a computation in the `ExceptT` monad.
 */
var runExceptT = function (_173) {
    return _173;
};

/**
 *  | Transform any exceptions thrown by an `ExceptT` computation using the given function.
 */
var withExceptT = function (__dict_Functor_1) {
    return function (f) {
        var mapLeft = function (f_1) {
            return function (_174) {
                if (_174 instanceof Data_Either.Right) {
                    return new Data_Either.Right(_174.value0);
                };
                if (_174 instanceof Data_Either.Left) {
                    return new Data_Either.Left(f_1(_174.value0));
                };
                throw new Error("Failed pattern match");
            };
        };
        return Prelude["<<<"](Prelude.semigroupoidArr)(ExceptT)(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude["<$>"](__dict_Functor_1)(mapLeft(f)))(runExceptT));
    };
};

/**
 *  | Transform the unwrapped computation using the given function.
 */
var mapExceptT = function (f) {
    return function (m) {
        return f(runExceptT(m));
    };
};
var functorExceptT = function (__dict_Functor_7) {
    return new Prelude.Functor(function (f) {
        return mapExceptT(Prelude["<$>"](__dict_Functor_7)(Prelude["<$>"](Data_Either.functorEither)(f)));
    });
};

/**
 *  | Catch an exception in an `ExceptT` computation.
 */
var catchE = function (__dict_Monad_8) {
    return function (m) {
        return function (handler) {
            return Prelude[">>="](__dict_Monad_8["__superclass_Prelude.Bind_1"]())(runExceptT(m))(Data_Either.either(Prelude["<<<"](Prelude.semigroupoidArr)(runExceptT)(handler))(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude.pure(__dict_Monad_8["__superclass_Prelude.Applicative_0"]()))(Data_Either.Right.create)));
        };
    };
};
var applyExceptT = function (__dict_Apply_10) {
    return new Prelude.Apply(function (_175) {
        return function (_176) {
            var f$prime = Prelude["<$>"](__dict_Apply_10["__superclass_Prelude.Functor_0"]())(Prelude["<*>"](Data_Either.applyEither))(_175);
            var x$prime = Prelude["<*>"](__dict_Apply_10)(f$prime)(_176);
            return x$prime;
        };
    }, function () {
        return functorExceptT(__dict_Apply_10["__superclass_Prelude.Functor_0"]());
    });
};
var bindExceptT = function (__dict_Monad_9) {
    return new Prelude.Bind(function (m) {
        return function (k) {
            return Prelude[">>="](__dict_Monad_9["__superclass_Prelude.Bind_1"]())(runExceptT(m))(Data_Either.either(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude["return"](__dict_Monad_9))(Data_Either.Left.create))(Prelude["<<<"](Prelude.semigroupoidArr)(runExceptT)(k)));
        };
    }, function () {
        return applyExceptT((__dict_Monad_9["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]());
    });
};
var applicativeExceptT = function (__dict_Applicative_11) {
    return new Prelude.Applicative(function () {
        return applyExceptT(__dict_Applicative_11["__superclass_Prelude.Apply_0"]());
    }, Prelude["<<<"](Prelude.semigroupoidArr)(ExceptT)(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude.pure(__dict_Applicative_11))(Data_Either.Right.create)));
};
var monadExceptT = function (__dict_Monad_6) {
    return new Prelude.Monad(function () {
        return applicativeExceptT(__dict_Monad_6["__superclass_Prelude.Applicative_0"]());
    }, function () {
        return bindExceptT(__dict_Monad_6);
    });
};
var altExceptT = function (__dict_Semigroup_14) {
    return function (__dict_Monad_15) {
        return new Control_Alt.Alt(function (m) {
            return function (n) {
                return ExceptT(Prelude[">>="](__dict_Monad_15["__superclass_Prelude.Bind_1"]())(runExceptT(m))(function (_19) {
                    if (_19 instanceof Data_Either.Right) {
                        return Prelude.pure(__dict_Monad_15["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_19.value0));
                    };
                    if (_19 instanceof Data_Either.Left) {
                        return Prelude[">>="](__dict_Monad_15["__superclass_Prelude.Bind_1"]())(runExceptT(n))(function (_18) {
                            if (_18 instanceof Data_Either.Right) {
                                return Prelude.pure(__dict_Monad_15["__superclass_Prelude.Applicative_0"]())(new Data_Either.Right(_18.value0));
                            };
                            if (_18 instanceof Data_Either.Left) {
                                return Prelude.pure(__dict_Monad_15["__superclass_Prelude.Applicative_0"]())(new Data_Either.Left(Prelude["<>"](__dict_Semigroup_14)(_19.value0)(_18.value0)));
                            };
                            throw new Error("Failed pattern match");
                        });
                    };
                    throw new Error("Failed pattern match");
                }));
            };
        }, function () {
            return functorExceptT(((__dict_Monad_15["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
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
var alternativeExceptT = function (__dict_Monoid_12) {
    return function (__dict_Monad_13) {
        return new Control_Alternative.Alternative(function () {
            return plusExceptT(__dict_Monoid_12)(__dict_Monad_13);
        }, function () {
            return applicativeExceptT(__dict_Monad_13["__superclass_Prelude.Applicative_0"]());
        });
    };
};
var monadPlusExceptT = function (__dict_Monoid_4) {
    return function (__dict_Monad_5) {
        return new Control_MonadPlus.MonadPlus(function () {
            return alternativeExceptT(__dict_Monoid_4)(__dict_Monad_5);
        }, function () {
            return monadExceptT(__dict_Monad_5);
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
    altExceptT: altExceptT, 
    plusExceptT: plusExceptT, 
    alternativeExceptT: alternativeExceptT, 
    monadPlusExceptT: monadPlusExceptT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.MonadPlus":56,"Control.Plus":57,"Data.Either":73,"Data.Monoid":97,"Prelude":127}],44:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Lazy = require("Data.Lazy");
var Data_Array = require("Data.Array");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");
var Data_Monoid = require("Data.Monoid");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Data_Unfoldable = require("Data.Unfoldable");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Monad = require("Control.Monad");
var Control_Monad_Trans = require("Control.Monad.Trans");
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
var ZipListT = function (x) {
    return x;
};
var zipList = ZipListT;
var wrapLazy = function (__dict_Monad_0) {
    return function (v) {
        return ListT.create(Prelude.pure(__dict_Monad_0["__superclass_Prelude.Applicative_0"]())(new Skip(v)));
    };
};
var wrapEffect = function (__dict_Monad_1) {
    return function (v) {
        return ListT.create(Prelude["<$>"](((__dict_Monad_1["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude["<<<"](Prelude.semigroupoidArr)(Skip.create)(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Lazy.defer)(Prelude["const"])))(v));
    };
};
var unfold = function (__dict_Monad_2) {
    return function (f) {
        return function (z) {
            var g = function (_660) {
                if (_660 instanceof Data_Maybe.Just) {
                    return new Yield(_660.value0.value1, Data_Lazy.defer(function (_654) {
                        return unfold(__dict_Monad_2)(f)(_660.value0.value0);
                    }));
                };
                if (_660 instanceof Data_Maybe.Nothing) {
                    return Done.value;
                };
                throw new Error("Failed pattern match");
            };
            return ListT.create(Prelude["<$>"](((__dict_Monad_2["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g)(f(z)));
        };
    };
};
var runListT = function (_657) {
    return _657.value0;
};
var scanl = function (__dict_Monad_4) {
    return function (f) {
        return function (b) {
            return function (l) {
                var g = function (_670) {
                    var h = function (_671) {
                        if (_671 instanceof Yield) {
                            var b$prime = f(_670.value0)(_671.value0);
                            return Data_Maybe.Just.create(new Data_Tuple.Tuple(new Data_Tuple.Tuple(b$prime, Data_Lazy.force(_671.value1)), b$prime));
                        };
                        if (_671 instanceof Skip) {
                            return Data_Maybe.Just.create(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_670.value0, Data_Lazy.force(_671.value0)), _670.value0));
                        };
                        if (_671 instanceof Done) {
                            return Data_Maybe.Nothing.value;
                        };
                        throw new Error("Failed pattern match");
                    };
                    return Prelude["<$>"](((__dict_Monad_4["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(h)(runListT(_670.value1));
                };
                return unfold(__dict_Monad_4)(g)(new Data_Tuple.Tuple(b, l));
            };
        };
    };
};
var stepMap = function (__dict_Functor_5) {
    return function (f) {
        return function (l) {
            return ListT.create(Prelude["<$>"](__dict_Functor_5)(f)(runListT(l)));
        };
    };
};
var takeWhile = function (__dict_Applicative_6) {
    return function (f) {
        
        /**
         *  FIXME: type inferencer bug with if/then/else
         */
        var g = function (_662) {
            if (_662 instanceof Yield) {
                var ifThenElse = function (p) {
                    return function (a_1) {
                        return function (b) {
                            if (p) {
                                return a_1;
                            };
                            if (!p) {
                                return b;
                            };
                            throw new Error("Failed pattern match");
                        };
                    };
                };
                return ifThenElse(f(_662.value0))(new Yield(_662.value0, Prelude["<$>"](Data_Lazy.functorLazy)(takeWhile(__dict_Applicative_6)(f))(_662.value1)))(Done.value);
            };
            if (_662 instanceof Skip) {
                return Skip.create(Prelude["<$>"](Data_Lazy.functorLazy)(takeWhile(__dict_Applicative_6)(f))(_662.value0));
            };
            if (_662 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match");
        };
        return stepMap((__dict_Applicative_6["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g);
    };
};
var uncons = function (__dict_Monad_7) {
    return function (l) {
        var g = function (_667) {
            if (_667 instanceof Yield) {
                return Prelude.pure(__dict_Monad_7["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Just.create(new Data_Tuple.Tuple(_667.value0, Data_Lazy.force(_667.value1))));
            };
            if (_667 instanceof Skip) {
                return uncons(__dict_Monad_7)(Data_Lazy.force(_667.value0));
            };
            if (_667 instanceof Done) {
                return Prelude.pure(__dict_Monad_7["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Nothing.value);
            };
            throw new Error("Failed pattern match");
        };
        return Prelude[">>="](__dict_Monad_7["__superclass_Prelude.Bind_1"]())(runListT(l))(g);
    };
};
var tail = function (__dict_Monad_8) {
    return function (l) {
        return Prelude["<$>"](((__dict_Monad_8["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.snd))(uncons(__dict_Monad_8)(l));
    };
};
var prepend$prime = function (__dict_Applicative_9) {
    return function (h) {
        return function (t) {
            return ListT.create(Prelude.pure(__dict_Applicative_9)(new Yield(h, t)));
        };
    };
};
var prepend = function (__dict_Applicative_10) {
    return function (h) {
        return function (t) {
            return prepend$prime(__dict_Applicative_10)(h)(Data_Lazy.defer(Prelude["const"](t)));
        };
    };
};
var nil = function (__dict_Applicative_12) {
    return ListT.create(Prelude.pure(__dict_Applicative_12)(Done.value));
};
var singleton = function (__dict_Applicative_14) {
    return function (a) {
        return prepend(__dict_Applicative_14)(a)(nil(__dict_Applicative_14));
    };
};
var take = function (__dict_Applicative_15) {
    return function (n) {
        return function (fa) {
            if (n === 0) {
                return nil(__dict_Applicative_15);
            };
            var f = function (_661) {
                if (_661 instanceof Yield) {
                    var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(take(__dict_Applicative_15)(n - 1))(_661.value1);
                    return new Yield(_661.value0, s$prime);
                };
                if (_661 instanceof Skip) {
                    var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(take(__dict_Applicative_15)(n))(_661.value0);
                    return new Skip(s$prime);
                };
                if (_661 instanceof Done) {
                    return Done.value;
                };
                throw new Error("Failed pattern match");
            };
            return stepMap((__dict_Applicative_15["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(fa);
        };
    };
};
var zipWith$prime = function (__dict_Monad_16) {
    return function (f) {
        var loop = function (fa) {
            return function (fb) {
                var g = function (_672) {
                    return function (_673) {
                        if (_673 instanceof Data_Maybe.Nothing) {
                            return Prelude.pure(__dict_Monad_16["__superclass_Prelude.Applicative_0"]())(nil(__dict_Monad_16["__superclass_Prelude.Applicative_0"]()));
                        };
                        if (_672 instanceof Data_Maybe.Nothing) {
                            return Prelude.pure(__dict_Monad_16["__superclass_Prelude.Applicative_0"]())(nil(__dict_Monad_16["__superclass_Prelude.Applicative_0"]()));
                        };
                        if (_672 instanceof Data_Maybe.Just && _673 instanceof Data_Maybe.Just) {
                            return Prelude["<$>"](((__dict_Monad_16["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude.flip(prepend$prime(__dict_Monad_16["__superclass_Prelude.Applicative_0"]()))(Data_Lazy.defer(function (_655) {
                                return zipWith$prime(__dict_Monad_16)(f)(_672.value0.value1)(_673.value0.value1);
                            })))(f(_672.value0.value0)(_673.value0.value0));
                        };
                        throw new Error("Failed pattern match");
                    };
                };
                return wrapEffect(__dict_Monad_16)(Prelude[">>="](__dict_Monad_16["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_16)(fa))(function (_60) {
                    return Prelude[">>="](__dict_Monad_16["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_16)(fb))(function (_59) {
                        return g(_60)(_59);
                    });
                }));
            };
        };
        return loop;
    };
};
var zipWith = function (__dict_Monad_17) {
    return function (f) {
        var g = function (a) {
            return function (b) {
                return Prelude.pure(__dict_Monad_17["__superclass_Prelude.Applicative_0"]())(f(a)(b));
            };
        };
        return zipWith$prime(__dict_Monad_17)(g);
    };
};
var mapMaybe = function (__dict_Functor_22) {
    return function (f) {
        var g = function (_666) {
            if (_666 instanceof Yield) {
                return Data_Maybe.fromMaybe(Skip.create)(Prelude["<$>"](Data_Maybe.functorMaybe)(Yield.create)(f(_666.value0)))(Prelude["<$>"](Data_Lazy.functorLazy)(mapMaybe(__dict_Functor_22)(f))(_666.value1));
            };
            if (_666 instanceof Skip) {
                return Skip.create(Prelude["<$>"](Data_Lazy.functorLazy)(mapMaybe(__dict_Functor_22)(f))(_666.value0));
            };
            if (_666 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match");
        };
        return stepMap(__dict_Functor_22)(g);
    };
};
var iterate = function (__dict_Monad_23) {
    return function (f) {
        return function (a) {
            var g = function (a_1) {
                return Prelude.pure(__dict_Monad_23["__superclass_Prelude.Applicative_0"]())(new Data_Maybe.Just(new Data_Tuple.Tuple(f(a_1), a_1)));
            };
            return unfold(__dict_Monad_23)(g)(a);
        };
    };
};
var repeat = function (__dict_Monad_24) {
    return iterate(__dict_Monad_24)(Prelude.id(Prelude.categoryArr));
};
var head = function (__dict_Monad_25) {
    return function (l) {
        return Prelude["<$>"](((__dict_Monad_25["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.fst))(uncons(__dict_Monad_25)(l));
    };
};
var functorListT = function (__dict_Functor_27) {
    return new Prelude.Functor(function (f) {
        var g = function (_676) {
            if (_676 instanceof Yield) {
                return new Yield(f(_676.value0), Prelude["<$>"](Data_Lazy.functorLazy)(Prelude["<$>"](functorListT(__dict_Functor_27))(f))(_676.value1));
            };
            if (_676 instanceof Skip) {
                return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(Prelude["<$>"](functorListT(__dict_Functor_27))(f))(_676.value0));
            };
            if (_676 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match");
        };
        return stepMap(__dict_Functor_27)(g);
    });
};
var functorZipListT = function (__dict_Functor_26) {
    return new Prelude.Functor(function (f) {
        return function (_677) {
            return ZipListT(Prelude["<$>"](functorListT(__dict_Functor_26))(f)(_677));
        };
    });
};
var fromEffect = function (__dict_Applicative_28) {
    return function (fa) {
        return ListT.create(Prelude["<$>"]((__dict_Applicative_28["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude.flip(Yield.create)(Data_Lazy.defer(function (_653) {
            return nil(__dict_Applicative_28);
        })))(fa));
    };
};
var monadTransListT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_29) {
    return fromEffect(__dict_Monad_29["__superclass_Prelude.Applicative_0"]());
});
var fromArray = function (__dict_Monad_30) {
    return function (xs) {
        var f = function (n) {
            return Prelude.pure(__dict_Monad_30["__superclass_Prelude.Applicative_0"]())(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.Tuple.create(n + 1))(Data_Array["!!"](xs)(n)));
        };
        return unfold(__dict_Monad_30)(f)(0);
    };
};
var foldl$prime = function (__dict_Monad_31) {
    return function (f) {
        var loop = function (b) {
            return function (l) {
                var g = function (_668) {
                    if (_668 instanceof Data_Maybe.Nothing) {
                        return Prelude.pure(__dict_Monad_31["__superclass_Prelude.Applicative_0"]())(b);
                    };
                    if (_668 instanceof Data_Maybe.Just) {
                        return Prelude[">>="](__dict_Monad_31["__superclass_Prelude.Bind_1"]())(f(b)(_668.value0.value0))(Prelude.flip(loop)(_668.value0.value1));
                    };
                    throw new Error("Failed pattern match");
                };
                return Prelude[">>="](__dict_Monad_31["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_31)(l))(g);
            };
        };
        return loop;
    };
};
var foldl = function (__dict_Monad_32) {
    return function (f) {
        var loop = function (b) {
            return function (l) {
                var g = function (_669) {
                    if (_669 instanceof Data_Maybe.Nothing) {
                        return Prelude.pure(__dict_Monad_32["__superclass_Prelude.Applicative_0"]())(b);
                    };
                    if (_669 instanceof Data_Maybe.Just) {
                        return loop(f(b)(_669.value0.value0))(_669.value0.value1);
                    };
                    throw new Error("Failed pattern match");
                };
                return Prelude[">>="](__dict_Monad_32["__superclass_Prelude.Bind_1"]())(uncons(__dict_Monad_32)(l))(g);
            };
        };
        return loop;
    };
};
var toArray = function (__dict_Monad_33) {
    return Prelude["<<<"](Prelude.semigroupoidArr)(Prelude["<$>"](((__dict_Monad_33["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Array.reverse))(foldl(__dict_Monad_33)(Prelude.flip(Prelude[":"]))([  ]));
};
var filter = function (__dict_Functor_34) {
    return function (f) {
        var g = function (_665) {
            if (_665 instanceof Yield) {
                var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(filter(__dict_Functor_34)(f))(_665.value1);
                var _3042 = f(_665.value0);
                if (_3042) {
                    return new Yield(_665.value0, s$prime);
                };
                if (!_3042) {
                    return new Skip(s$prime);
                };
                throw new Error("Failed pattern match");
            };
            if (_665 instanceof Skip) {
                var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(filter(__dict_Functor_34)(f))(_665.value0);
                return new Skip(s$prime);
            };
            if (_665 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match");
        };
        return stepMap(__dict_Functor_34)(g);
    };
};
var dropWhile = function (__dict_Applicative_35) {
    return function (f) {
        var g = function (_664) {
            if (_664 instanceof Yield) {
                var _3047 = f(_664.value0);
                if (_3047) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(dropWhile(__dict_Applicative_35)(f))(_664.value1));
                };
                if (!_3047) {
                    return new Yield(_664.value0, _664.value1);
                };
                throw new Error("Failed pattern match");
            };
            if (_664 instanceof Skip) {
                return Skip.create(Prelude["<$>"](Data_Lazy.functorLazy)(dropWhile(__dict_Applicative_35)(f))(_664.value0));
            };
            if (_664 instanceof Done) {
                return Done.value;
            };
            throw new Error("Failed pattern match");
        };
        return stepMap((__dict_Applicative_35["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g);
    };
};
var drop = function (__dict_Applicative_36) {
    return function (n) {
        return function (fa) {
            if (n === 0) {
                return fa;
            };
            var f = function (_663) {
                if (_663 instanceof Yield) {
                    var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(drop(__dict_Applicative_36)(n - 1))(_663.value1);
                    return new Skip(s$prime);
                };
                if (_663 instanceof Skip) {
                    var s$prime = Prelude["<$>"](Data_Lazy.functorLazy)(drop(__dict_Applicative_36)(n))(_663.value0);
                    return new Skip(s$prime);
                };
                if (_663 instanceof Done) {
                    return Done.value;
                };
                throw new Error("Failed pattern match");
            };
            return stepMap((__dict_Applicative_36["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(fa);
        };
    };
};
var cons$prime = function (__dict_Applicative_37) {
    return function (lh) {
        return function (t) {
            var f = function (_658) {
                return new Yield(Data_Lazy.force(lh), t);
            };
            return ListT.create(Prelude["<$>"]((__dict_Applicative_37["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(Prelude.pure(__dict_Applicative_37)(Prelude.unit)));
        };
    };
};
var unfoldableListT = function (__dict_Monad_38) {
    return new Data_Unfoldable.Unfoldable(function (f) {
        return function (b) {
            var go = function (_678) {
                if (_678 instanceof Data_Maybe.Nothing) {
                    return nil(__dict_Monad_38["__superclass_Prelude.Applicative_0"]());
                };
                if (_678 instanceof Data_Maybe.Just) {
                    return cons$prime(__dict_Monad_38["__superclass_Prelude.Applicative_0"]())(Prelude.pure(Data_Lazy.applicativeLazy)(_678.value0.value0))(Data_Lazy.defer(function (_656) {
                        return go(f(_678.value0.value1));
                    }));
                };
                throw new Error("Failed pattern match");
            };
            return go(f(b));
        };
    });
};
var semigroupListT = function (__dict_Applicative_40) {
    return new Prelude.Semigroup(concat(__dict_Applicative_40));
};
var concat = function (__dict_Applicative_39) {
    return function (x) {
        return function (y) {
            var f = function (_659) {
                if (_659 instanceof Yield) {
                    return new Yield(_659.value0, Prelude["<$>"](Data_Lazy.functorLazy)(Prelude.flip(Prelude["<>"](semigroupListT(__dict_Applicative_39)))(y))(_659.value1));
                };
                if (_659 instanceof Skip) {
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(Prelude.flip(Prelude["<>"](semigroupListT(__dict_Applicative_39)))(y))(_659.value0));
                };
                if (_659 instanceof Done) {
                    return new Skip(Data_Lazy.defer(Prelude["const"](y)));
                };
                throw new Error("Failed pattern match");
            };
            return stepMap((__dict_Applicative_39["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(f)(x);
        };
    };
};
var monoidListT = function (__dict_Applicative_19) {
    return new Data_Monoid.Monoid(function () {
        return semigroupListT(__dict_Applicative_19);
    }, nil(__dict_Applicative_19));
};
var semigroupZipListT = function (__dict_Applicative_3) {
    return new Prelude.Semigroup(function (_674) {
        return function (_675) {
            return ZipListT(Prelude["<>"](semigroupListT(__dict_Applicative_3))(_674)(_675));
        };
    });
};
var monoidZipListT = function (__dict_Applicative_18) {
    return new Data_Monoid.Monoid(function () {
        return semigroupZipListT(__dict_Applicative_18);
    }, Data_Monoid.mempty(monoidListT(__dict_Applicative_18)));
};
var catMaybes = function (__dict_Functor_41) {
    return mapMaybe(__dict_Functor_41)(Prelude.id(Prelude.categoryArr));
};
var applyZipListT = function (__dict_Monad_43) {
    return new Prelude.Apply(function (_679) {
        return function (_680) {
            var g = function (f) {
                return function (x) {
                    return f(x);
                };
            };
            return ZipListT(zipWith(__dict_Monad_43)(g)(_679)(_680));
        };
    }, function () {
        return functorZipListT(((__dict_Monad_43["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    });
};
var monadListT = function (__dict_Monad_21) {
    return new Prelude.Monad(function () {
        return applicativeListT(__dict_Monad_21);
    }, function () {
        return bindListT(__dict_Monad_21);
    });
};
var bindListT = function (__dict_Monad_42) {
    return new Prelude.Bind(function (fa) {
        return function (f) {
            var g = function (_681) {
                if (_681 instanceof Yield) {
                    var h = function (s_1) {
                        return concat(__dict_Monad_42["__superclass_Prelude.Applicative_0"]())(f(_681.value0))(Prelude[">>="](bindListT(__dict_Monad_42))(s_1)(f));
                    };
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(h)(_681.value1));
                };
                if (_681 instanceof Skip) {
                    var h = function (s_2) {
                        return Prelude[">>="](bindListT(__dict_Monad_42))(s_2)(f);
                    };
                    return new Skip(Prelude["<$>"](Data_Lazy.functorLazy)(h)(_681.value0));
                };
                if (_681 instanceof Done) {
                    return Done.value;
                };
                throw new Error("Failed pattern match");
            };
            return stepMap(((__dict_Monad_42["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(g)(fa);
        };
    }, function () {
        return applyListT(__dict_Monad_42);
    });
};
var applyListT = function (__dict_Monad_44) {
    return new Prelude.Apply(function (f) {
        return function (x) {
            return Prelude[">>="](bindListT(__dict_Monad_44))(f)(function (_62) {
                return Prelude[">>="](bindListT(__dict_Monad_44))(x)(function (_61) {
                    return Prelude["return"](monadListT(__dict_Monad_44))(_62(_61));
                });
            });
        };
    }, function () {
        return functorListT(((__dict_Monad_44["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    });
};
var applicativeListT = function (__dict_Monad_46) {
    return new Prelude.Applicative(function () {
        return applyListT(__dict_Monad_46);
    }, singleton(__dict_Monad_46["__superclass_Prelude.Applicative_0"]()));
};
var applicativeZipListT = function (__dict_Monad_45) {
    return new Prelude.Applicative(function () {
        return applyZipListT(__dict_Monad_45);
    }, Prelude["<<<"](Prelude.semigroupoidArr)(ZipListT)(Prelude.pure(applicativeListT(__dict_Monad_45))));
};
var altListT = function (__dict_Applicative_50) {
    return new Control_Alt.Alt(concat(__dict_Applicative_50), function () {
        return functorListT((__dict_Applicative_50["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    });
};
var altZipListT = function (__dict_Applicative_49) {
    return new Control_Alt.Alt(function (_682) {
        return function (_683) {
            return ZipListT(Control_Alt["<|>"](altListT(__dict_Applicative_49))(_682)(_683));
        };
    }, function () {
        return functorZipListT((__dict_Applicative_49["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    });
};
var plusListT = function (__dict_Monad_13) {
    return new Control_Plus.Plus(function () {
        return altListT(__dict_Monad_13["__superclass_Prelude.Applicative_0"]());
    }, nil(__dict_Monad_13["__superclass_Prelude.Applicative_0"]()));
};
var alternativeListT = function (__dict_Monad_48) {
    return new Control_Alternative.Alternative(function () {
        return plusListT(__dict_Monad_48);
    }, function () {
        return applicativeListT(__dict_Monad_48);
    });
};
var monadPlusListT = function (__dict_Monad_20) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeListT(__dict_Monad_20);
    }, function () {
        return monadListT(__dict_Monad_20);
    });
};
var plusZipListT = function (__dict_Monad_11) {
    return new Control_Plus.Plus(function () {
        return altZipListT(__dict_Monad_11["__superclass_Prelude.Applicative_0"]());
    }, Control_Plus.empty(plusListT(__dict_Monad_11)));
};
var alternativeZipListT = function (__dict_Monad_47) {
    return new Control_Alternative.Alternative(function () {
        return plusZipListT(__dict_Monad_47);
    }, function () {
        return applicativeZipListT(__dict_Monad_47);
    });
};
module.exports = {
    zipList: zipList, 
    "zipWith'": zipWith$prime, 
    zipWith: zipWith, 
    wrapLazy: wrapLazy, 
    wrapEffect: wrapEffect, 
    unfold: unfold, 
    uncons: uncons, 
    toArray: toArray, 
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
    fromArray: fromArray, 
    "foldl'": foldl$prime, 
    foldl: foldl, 
    filter: filter, 
    dropWhile: dropWhile, 
    drop: drop, 
    "cons'": cons$prime, 
    catMaybes: catMaybes, 
    semigroupListT: semigroupListT, 
    semigroupZipListT: semigroupZipListT, 
    monoidListT: monoidListT, 
    monoidZipListT: monoidZipListT, 
    functorListT: functorListT, 
    functorZipListT: functorZipListT, 
    unfoldableListT: unfoldableListT, 
    applyListT: applyListT, 
    applyZipListT: applyZipListT, 
    applicativeListT: applicativeListT, 
    applicativeZipListT: applicativeZipListT, 
    bindListT: bindListT, 
    monadListT: monadListT, 
    monadTransListT: monadTransListT, 
    altListT: altListT, 
    altZipListT: altZipListT, 
    plusListT: plusListT, 
    plusZipListT: plusZipListT, 
    alternativeListT: alternativeListT, 
    alternativeZipListT: alternativeZipListT, 
    monadPlusListT: monadPlusListT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Monad":55,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Data.Array":61,"Data.Lazy":87,"Data.Maybe":90,"Data.Monoid":97,"Data.Tuple":108,"Data.Unfoldable":109,"Prelude":127}],45:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `MaybeT` monad transformer.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_Monad = require("Control.Monad");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");

/**
 *  | The `MaybeT` monad transformer.
 *  |
 *  | This monad transformer extends the base monad, supporting failure and alternation via
 *  | the `MonadPlus` type class.
 */
var MaybeT = function (x) {
    return x;
};

/**
 *  | Run a computation in the `MaybeT` monad.
 */
var runMaybeT = function (_302) {
    return _302;
};
var monadTransMaybeT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_1) {
    return Prelude["<<<"](Prelude.semigroupoidArr)(MaybeT)(Prelude.liftM1(__dict_Monad_1)(Data_Maybe.Just.create));
});

/**
 *  | Change the result type of a `MaybeT` monad action.
 */
var mapMaybeT = function (f) {
    return Prelude["<<<"](Prelude.semigroupoidArr)(MaybeT)(Prelude["<<<"](Prelude.semigroupoidArr)(f)(runMaybeT));
};
var liftPassMaybe = function (__dict_Monad_4) {
    return function (pass) {
        return mapMaybeT(function (m) {
            return pass(Prelude[">>="](__dict_Monad_4["__superclass_Prelude.Bind_1"]())(m)(function (_27) {
                return Prelude["return"](__dict_Monad_4)((function () {
                    if (_27 instanceof Data_Maybe.Nothing) {
                        return new Data_Tuple.Tuple(Data_Maybe.Nothing.value, Prelude.id(Prelude.categoryArr));
                    };
                    if (_27 instanceof Data_Maybe.Just) {
                        return new Data_Tuple.Tuple(new Data_Maybe.Just(_27.value0.value0), _27.value0.value1);
                    };
                    throw new Error("Failed pattern match");
                })());
            }));
        });
    };
};
var liftListenMaybe = function (__dict_Monad_5) {
    return function (listen) {
        return mapMaybeT(function (m) {
            return Prelude[">>="](__dict_Monad_5["__superclass_Prelude.Bind_1"]())(listen(m))(function (_26) {
                return Prelude["return"](__dict_Monad_5)(Prelude["<$>"](Data_Maybe.functorMaybe)(function (r) {
                    return new Data_Tuple.Tuple(r, _26.value1);
                })(_26.value0));
            });
        });
    };
};
var liftCatchMaybe = function ($$catch) {
    return function (m) {
        return function (h) {
            return MaybeT($$catch(runMaybeT(m))(Prelude["<<<"](Prelude.semigroupoidArr)(runMaybeT)(h)));
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
var monadMaybeT = function (__dict_Monad_3) {
    return new Prelude.Monad(function () {
        return applicativeMaybeT(__dict_Monad_3);
    }, function () {
        return bindMaybeT(__dict_Monad_3);
    });
};
var functorMaybeT = function (__dict_Monad_6) {
    return new Prelude.Functor(Prelude.liftA1(applicativeMaybeT(__dict_Monad_6)));
};
var bindMaybeT = function (__dict_Monad_7) {
    return new Prelude.Bind(function (x) {
        return function (f) {
            return MaybeT(Prelude[">>="](__dict_Monad_7["__superclass_Prelude.Bind_1"]())(runMaybeT(x))(function (_24) {
                if (_24 instanceof Data_Maybe.Nothing) {
                    return Prelude["return"](__dict_Monad_7)(Data_Maybe.Nothing.value);
                };
                if (_24 instanceof Data_Maybe.Just) {
                    return runMaybeT(f(_24.value0));
                };
                throw new Error("Failed pattern match");
            }));
        };
    }, function () {
        return applyMaybeT(__dict_Monad_7);
    });
};
var applyMaybeT = function (__dict_Monad_8) {
    return new Prelude.Apply(Prelude.ap(monadMaybeT(__dict_Monad_8)), function () {
        return functorMaybeT(__dict_Monad_8);
    });
};
var applicativeMaybeT = function (__dict_Monad_9) {
    return new Prelude.Applicative(function () {
        return applyMaybeT(__dict_Monad_9);
    }, Prelude["<<<"](Prelude.semigroupoidArr)(MaybeT)(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude.pure(__dict_Monad_9["__superclass_Prelude.Applicative_0"]()))(Data_Maybe.Just.create)));
};
var altMaybeT = function (__dict_Monad_11) {
    return new Control_Alt.Alt(function (m1) {
        return function (m2) {
            return Prelude[">>="](__dict_Monad_11["__superclass_Prelude.Bind_1"]())(runMaybeT(m1))(function (_25) {
                if (_25 instanceof Data_Maybe.Nothing) {
                    return runMaybeT(m2);
                };
                return Prelude["return"](__dict_Monad_11)(_25);
            });
        };
    }, function () {
        return functorMaybeT(__dict_Monad_11);
    });
};
var plusMaybeT = function (__dict_Monad_0) {
    return new Control_Plus.Plus(function () {
        return altMaybeT(__dict_Monad_0);
    }, Prelude.pure(__dict_Monad_0["__superclass_Prelude.Applicative_0"]())(Data_Maybe.Nothing.value));
};
var alternativeMaybeT = function (__dict_Monad_10) {
    return new Control_Alternative.Alternative(function () {
        return plusMaybeT(__dict_Monad_10);
    }, function () {
        return applicativeMaybeT(__dict_Monad_10);
    });
};
var monadPlusMaybeT = function (__dict_Monad_2) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeMaybeT(__dict_Monad_2);
    }, function () {
        return monadMaybeT(__dict_Monad_2);
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
    monadPlusMaybeT: monadPlusMaybeT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Monad":55,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Data.Either":73,"Data.Maybe":90,"Data.Tuple":108,"Prelude":127}],46:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the reader-writer-state monad transformer, `RWST`.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Tuple = require("Data.Tuple");
var Data_Monoid = require("Data.Monoid");
var Control_Monad_Trans = require("Control.Monad.Trans");

/**
 *  | The reader-writer-state monad transformer, which combines the operations
 *  | of `ReaderT`, `WriterT` and `StateT` into a single monad transformer.
 */
var RWST = function (x) {
    return x;
};

/**
 *  | Run a computation in the `RWST` monad.
 */
var runRWST = function (_308) {
    return _308;
};

/**
 *  | Change the context type in a `RWST` monad action.
 */
var withRWST = function (f) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Data_Tuple.uncurry(runRWST(m))(f(r)(s));
            };
        };
    };
};
var mkSee = function (__dict_Monoid_2) {
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
var monadTransRWST = function (__dict_Monoid_3) {
    return new Control_Monad_Trans.MonadTrans(function (__dict_Monad_4) {
        return function (m) {
            return function (_307) {
                return function (s) {
                    return Prelude[">>="](__dict_Monad_4["__superclass_Prelude.Bind_1"]())(m)(function (a) {
                        return Prelude["return"](__dict_Monad_4)(mkSee(__dict_Monoid_3)(s)(a)(Data_Monoid.mempty(__dict_Monoid_3)));
                    });
                };
            };
        };
    });
};

/**
 *  | Change the result and accumulator types in a `RWST` monad action.
 */
var mapRWST = function (f) {
    return function (m) {
        return function (r) {
            return function (s) {
                return f(runRWST(m)(r)(s));
            };
        };
    };
};
var functorRWST = function (__dict_Functor_5) {
    return new Prelude.Functor(function (f) {
        return function (m) {
            return function (r) {
                return function (s) {
                    return Prelude["<$>"](__dict_Functor_5)(function (see) {
                        var _1398 = {};
                        for (var _1399 in see) {
                            if (see.hasOwnProperty(_1399)) {
                                _1398[_1399] = see[_1399];
                            };
                        };
                        _1398.result = f(see.result);
                        return _1398;
                    })(runRWST(m)(r)(s));
                };
            };
        };
    });
};

/**
 *  | Run a computation in the `RWST` monad, discarding the result.
 */
var execRWST = function (__dict_Monad_6) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_6["__superclass_Prelude.Bind_1"]())(runRWST(m)(r)(s))(function (see) {
                    return Prelude["return"](__dict_Monad_6)(new Data_Tuple.Tuple(see.state, see.log));
                });
            };
        };
    };
};

/**
 *  | Run a computation in the `RWST` monad, discarding the final state.
 */
var evalRWST = function (__dict_Monad_7) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_7["__superclass_Prelude.Bind_1"]())(runRWST(m)(r)(s))(function (see) {
                    return Prelude["return"](__dict_Monad_7)(new Data_Tuple.Tuple(see.result, see.log));
                });
            };
        };
    };
};
var applyRWST = function (__dict_Bind_10) {
    return function (__dict_Monoid_11) {
        return new Prelude.Apply(function (f) {
            return function (m) {
                return function (r) {
                    return function (s) {
                        return Prelude[">>="](__dict_Bind_10)(runRWST(f)(r)(s))(function (_304) {
                            return Prelude["<#>"]((__dict_Bind_10["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(runRWST(m)(r)(_304.state))(function (_303) {
                                return mkSee(__dict_Monoid_11)(_303.state)(_304.result(_303.result))(Prelude["++"](__dict_Monoid_11["__superclass_Prelude.Semigroup_0"]())(_304.log)(_303.log));
                            });
                        });
                    };
                };
            };
        }, function () {
            return functorRWST((__dict_Bind_10["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
        });
    };
};
var bindRWST = function (__dict_Bind_8) {
    return function (__dict_Monoid_9) {
        return new Prelude.Bind(function (m) {
            return function (f) {
                return function (r) {
                    return function (s) {
                        return Prelude[">>="](__dict_Bind_8)(runRWST(m)(r)(s))(function (_305) {
                            return Prelude["<#>"]((__dict_Bind_8["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(runRWST(f(_305.result))(r)(_305.state))(function (see$prime) {
                                var _1409 = {};
                                for (var _1410 in see$prime) {
                                    if (see$prime.hasOwnProperty(_1410)) {
                                        _1409[_1410] = see$prime[_1410];
                                    };
                                };
                                _1409.log = Prelude["++"](__dict_Monoid_9["__superclass_Prelude.Semigroup_0"]())(_305.log)(see$prime.log);
                                return _1409;
                            });
                        });
                    };
                };
            };
        }, function () {
            return applyRWST(__dict_Bind_8)(__dict_Monoid_9);
        });
    };
};
var applicativeRWST = function (__dict_Monad_12) {
    return function (__dict_Monoid_13) {
        return new Prelude.Applicative(function () {
            return applyRWST(__dict_Monad_12["__superclass_Prelude.Bind_1"]())(__dict_Monoid_13);
        }, function (a) {
            return function (_306) {
                return function (s) {
                    return Prelude.pure(__dict_Monad_12["__superclass_Prelude.Applicative_0"]())(mkSee(__dict_Monoid_13)(s)(a)(Data_Monoid.mempty(__dict_Monoid_13)));
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
    monadTransRWST: monadTransRWST
};

},{"Control.Monad.Trans":51,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],47:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `RWS` monad.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Identity = require("Data.Identity");
var Control_Monad_RWS_Trans = require("Control.Monad.RWS.Trans");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");

/**
 *  | Write to the accumulator in a `RWS` action
 */
var writer = function (__dict_Applicative_0) {
    return function (_584) {
        return function (_578) {
            return function (s) {
                return Prelude.pure(__dict_Applicative_0)({
                    state: s, 
                    result: _584.value0, 
                    log: _584.value1
                });
            };
        };
    };
};

/**
 *  | Change the type of the context in a `RWS` action
 */
var withRWS = Control_Monad_RWS_Trans.withRWST;

/**
 *  | Append a value to the accumulator in a `RWS` action
 */
var tell = function (__dict_Applicative_1) {
    return function (w) {
        return writer(__dict_Applicative_1)(new Data_Tuple.Tuple(Prelude.unit, w));
    };
};

/**
 *  | Get or modify the state in a `RWS` action
 */
var state = function (__dict_Applicative_2) {
    return function (__dict_Monoid_3) {
        return function (f) {
            return function (_582) {
                return function (s) {
                    var _2205 = f(s);
                    return Prelude.pure(__dict_Applicative_2)(Control_Monad_RWS_Trans.mkSee(__dict_Monoid_3)(_2205.value1)(_2205.value0)(Data_Monoid.mempty(__dict_Monoid_3)));
                };
            };
        };
    };
};

/**
 *  | Create an action in the `RWS` monad from a function which uses the 
 *  | global context and state explicitly.
 */
var rws = function (f) {
    return function (r) {
        return function (s) {
            return Prelude["return"](Data_Identity.monadIdentity)(f(r)(s));
        };
    };
};

/**
 *  | Run a computation in the `RWS` monad.
 */
var runRWS = function (m) {
    return function (r) {
        return function (s) {
            return Data_Identity.runIdentity(Control_Monad_RWS_Trans.runRWST(m)(r)(s));
        };
    };
};

/**
 *  | Read a value which depends on the context in a `RWS` action.
 */
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

/**
 *  | Set the state in a `RWS` action
 */
var put = function (__dict_Applicative_6) {
    return function (__dict_Monoid_7) {
        return function (s) {
            return state(__dict_Applicative_6)(__dict_Monoid_7)(function (_583) {
                return new Data_Tuple.Tuple(Prelude.unit, s);
            });
        };
    };
};

/**
 *  | Execute a `RWS` action and modify the accumulator
 */
var pass = function (__dict_Monad_8) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_8["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (_580) {
                    return Prelude.pure(__dict_Monad_8["__superclass_Prelude.Applicative_0"]())({
                        state: _580.state, 
                        result: _580.result.value0, 
                        log: _580.result.value1(_580.log)
                    });
                });
            };
        };
    };
};

/**
 *  | Modify the state in a `RWS` action
 */
var modify = function (__dict_Applicative_9) {
    return function (__dict_Monoid_10) {
        return function (f) {
            return state(__dict_Applicative_9)(__dict_Monoid_10)(function (s) {
                return new Data_Tuple.Tuple(Prelude.unit, f(s));
            });
        };
    };
};

/**
 *  | Change the types of the result and accumulator in a `RWS` action
 */
var mapRWS = function (f) {
    return Control_Monad_RWS_Trans.mapRWST(Prelude[">>>"](Prelude.semigroupoidArr)(Data_Identity.runIdentity)(Prelude[">>>"](Prelude.semigroupoidArr)(f)(Data_Identity.Identity)));
};

/**
 *  | Locally change the context of a `RWS` action.
 */
var local = function (f) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Control_Monad_RWS_Trans.runRWST(m)(f(r))(s);
            };
        };
    };
};

/**
 *  | Execute a `RWS` action, and return a value which depends on the accumulator along with the return value
 */
var listens = function (__dict_Monad_11) {
    return function (f) {
        return function (m) {
            return function (r) {
                return function (s) {
                    return Prelude[">>="](__dict_Monad_11["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (_581) {
                        return Prelude.pure(__dict_Monad_11["__superclass_Prelude.Applicative_0"]())({
                            state: _581.state, 
                            result: new Data_Tuple.Tuple(_581.result, f(_581.log)), 
                            log: _581.log
                        });
                    });
                };
            };
        };
    };
};

/**
 *  | Execute a `RWS` action, and return the changes to the accumulator along with the return value
 */
var listen = function (__dict_Monad_12) {
    return function (m) {
        return function (r) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_12["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (_579) {
                    return Prelude.pure(__dict_Monad_12["__superclass_Prelude.Applicative_0"]())({
                        state: _579.state, 
                        result: new Data_Tuple.Tuple(_579.result, _579.log), 
                        log: _579.log
                    });
                });
            };
        };
    };
};

/**
 *  | Get a value which depends on the state in a `RWS` action
 */
var gets = function (__dict_Applicative_13) {
    return function (__dict_Monoid_14) {
        return function (f) {
            return state(__dict_Applicative_13)(__dict_Monoid_14)(function (s) {
                return new Data_Tuple.Tuple(f(s), s);
            });
        };
    };
};

/**
 *  | Get the state in a `RWS` action
 */
var get = function (__dict_Applicative_15) {
    return function (__dict_Monoid_16) {
        return state(__dict_Applicative_15)(__dict_Monoid_16)(function (s) {
            return new Data_Tuple.Tuple(s, s);
        });
    };
};

/**
 *  | Run a computation in the `RWS` monad, discarding the result
 */
var execRWS = function (m) {
    return function (r) {
        return function (s) {
            return Data_Identity.runIdentity(Control_Monad_RWS_Trans.execRWST(Data_Identity.monadIdentity)(m)(r)(s));
        };
    };
};

/**
 *  | Run a computation in the `RWS` monad, discarding the final state
 */
var evalRWS = function (m) {
    return function (r) {
        return function (s) {
            return Data_Identity.runIdentity(Control_Monad_RWS_Trans.evalRWST(Data_Identity.monadIdentity)(m)(r)(s));
        };
    };
};

/**
 *  | Modify the accumulator in a `RWS` action
 */
var censor = function (__dict_Monad_17) {
    return function (f) {
        return function (m) {
            return function (r) {
                return function (s) {
                    return Prelude[">>="](__dict_Monad_17["__superclass_Prelude.Bind_1"]())(Control_Monad_RWS_Trans.runRWST(m)(r)(s))(function (see) {
                        return Prelude.pure(__dict_Monad_17["__superclass_Prelude.Applicative_0"]())((function () {
                            var _2223 = {};
                            for (var _2224 in see) {
                                if (see.hasOwnProperty(_2224)) {
                                    _2223[_2224] = see[_2224];
                                };
                            };
                            _2223.log = f(see.log);
                            return _2223;
                        })());
                    });
                };
            };
        };
    };
};

/**
 *  | Get the context of a `RWS` action
 */
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

},{"Control.Monad.RWS.Trans":46,"Data.Identity":85,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],48:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the reader monad transformer, `ReaderT`.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");

/**
 *  | The reader monad transformer.
 *  | 
 *  | This monad transformer extends the base monad transformer with a _global context_ of
 *  | type `r`.
 *  |
 *  | The `MonadReader` type class describes the operations supported by this monad.
 */
var ReaderT = function (x) {
    return x;
};

/**
 *  | Run a computation in the `ReaderT` monad.
 */
var runReaderT = function (_135) {
    return _135;
};

/**
 *  | Change the type of the context in a `ReaderT` monad action.
 */
var withReaderT = function (f) {
    return function (m) {
        return ReaderT(Prelude["<<<"](Prelude.semigroupoidArr)(runReaderT(m))(f));
    };
};

/**
 *  | Change the type of the result in a `ReaderT` monad action.
 */
var mapReaderT = function (f) {
    return function (m) {
        return ReaderT(Prelude["<<<"](Prelude.semigroupoidArr)(f)(runReaderT(m)));
    };
};
var liftReaderT = function (m) {
    return Prelude["const"](m);
};
var monadTransReaderT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_2) {
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
var functorReaderT = function (__dict_Functor_4) {
    return new Prelude.Functor(function (f) {
        return mapReaderT(Prelude["<$>"](__dict_Functor_4)(f));
    });
};
var applyReaderT = function (__dict_Applicative_6) {
    return new Prelude.Apply(function (f) {
        return function (v) {
            return function (r) {
                return Prelude["<*>"](__dict_Applicative_6["__superclass_Prelude.Apply_0"]())(runReaderT(f)(r))(runReaderT(v)(r));
            };
        };
    }, function () {
        return functorReaderT((__dict_Applicative_6["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]());
    });
};
var bindReaderT = function (__dict_Monad_5) {
    return new Prelude.Bind(function (m) {
        return function (k) {
            return function (r) {
                return Prelude[">>="](__dict_Monad_5["__superclass_Prelude.Bind_1"]())(runReaderT(m)(r))(function (_14) {
                    return runReaderT(k(_14))(r);
                });
            };
        };
    }, function () {
        return applyReaderT(__dict_Monad_5["__superclass_Prelude.Applicative_0"]());
    });
};
var applicativeReaderT = function (__dict_Applicative_7) {
    return new Prelude.Applicative(function () {
        return applyReaderT(__dict_Applicative_7);
    }, Prelude["<<<"](Prelude.semigroupoidArr)(liftReaderT)(Prelude.pure(__dict_Applicative_7)));
};
var monadReaderT = function (__dict_Monad_0) {
    return new Prelude.Monad(function () {
        return applicativeReaderT(__dict_Monad_0["__superclass_Prelude.Applicative_0"]());
    }, function () {
        return bindReaderT(__dict_Monad_0);
    });
};
var altReaderT = function (__dict_Alt_9) {
    return new Control_Alt.Alt(function (m) {
        return function (n) {
            return function (r) {
                return Control_Alt["<|>"](__dict_Alt_9)(runReaderT(m)(r))(runReaderT(n)(r));
            };
        };
    }, function () {
        return functorReaderT(__dict_Alt_9["__superclass_Prelude.Functor_0"]());
    });
};
var plusReaderT = function (__dict_Plus_3) {
    return new Control_Plus.Plus(function () {
        return altReaderT(__dict_Plus_3["__superclass_Control.Alt.Alt_0"]());
    }, liftReaderT(Control_Plus.empty(__dict_Plus_3)));
};
var alternativeReaderT = function (__dict_Alternative_8) {
    return new Control_Alternative.Alternative(function () {
        return plusReaderT(__dict_Alternative_8["__superclass_Control.Plus.Plus_1"]());
    }, function () {
        return applicativeReaderT(__dict_Alternative_8["__superclass_Prelude.Applicative_0"]());
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
    monadTransReaderT: monadTransReaderT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Prelude":127}],49:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Control_Monad_Eff = require("Control.Monad.Eff");
var Prelude = require("Prelude");

    function newSTRef(val) {
      return function() {
        return { value: val };
      };
    }
    ;

    function readSTRef(ref) {
      return function() {
        return ref.value;
      };
    }
    ;

    function modifySTRef(ref) {
      return function(f) {
        return function() {
          return ref.value = f(ref.value);
        };
      };
    }
    ;

    function writeSTRef(ref) {
      return function(a) {
        return function() {
          return ref.value = a;
        };
      };
    }
    ;

    function runST(f) {
      return f;
    }
    ;

/**
 *  | A convenience function which combines `runST` with `runPure`, which can be used when the only required effect is `ST`.
 *  |
 *  | Note: since this function has a rank-2 type, it may cause problems to apply this function using the `$` operator. The recommended approach
 *  | is to use parentheses instead.
 */
var pureST = function (st) {
    return Control_Monad_Eff.runPure(runST(st));
};
module.exports = {
    pureST: pureST, 
    runST: runST, 
    writeSTRef: writeSTRef, 
    modifySTRef: modifySTRef, 
    readSTRef: readSTRef, 
    newSTRef: newSTRef
};

},{"Control.Monad.Eff":39,"Prelude":127}],50:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the state monad transformer, `StateT`.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Tuple = require("Data.Tuple");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Lazy = require("Control.Lazy");

/**
 *  | The state monad transformer.
 *  |
 *  | This monad transformer extends the base monad with the operations `get` 
 *  | and `put` which can be used to model a single piece of mutable state.
 *  |
 *  | The `MonadState` type class describes the operations supported by this monad.
 */
var StateT = function (x) {
    return x;
};

/**
 *  | Run a computation in the `StateT` monad.
 */
var runStateT = function (_311) {
    return _311;
};

/**
 *  | Modify the final state in a `StateT` monad action.
 */
var withStateT = function (f) {
    return function (s) {
        return StateT(Prelude["<<<"](Prelude.semigroupoidArr)(runStateT(s))(f));
    };
};
var monadTransStateT = new Control_Monad_Trans.MonadTrans(function (__dict_Monad_2) {
    return function (m) {
        return function (s) {
            return Prelude[">>="](__dict_Monad_2["__superclass_Prelude.Bind_1"]())(m)(function (_29) {
                return Prelude["return"](__dict_Monad_2)(new Data_Tuple.Tuple(_29, s));
            });
        };
    };
});

/**
 *  | Change the result type in a `StateT` monad action.
 */
var mapStateT = function (f) {
    return function (m) {
        return StateT(Prelude["<<<"](Prelude.semigroupoidArr)(f)(runStateT(m)));
    };
};
var liftPassState = function (__dict_Monad_5) {
    return function (pass) {
        return function (m) {
            return StateT(function (s) {
                return pass(Prelude[">>="](__dict_Monad_5["__superclass_Prelude.Bind_1"]())(runStateT(m)(s))(function (_31) {
                    return Prelude["return"](__dict_Monad_5)(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_31.value0.value0, _31.value1), _31.value0.value1));
                }));
            });
        };
    };
};
var liftListenState = function (__dict_Monad_6) {
    return function (listen) {
        return function (m) {
            return StateT(function (s) {
                return Prelude[">>="](__dict_Monad_6["__superclass_Prelude.Bind_1"]())(listen(runStateT(m)(s)))(function (_30) {
                    return Prelude["return"](__dict_Monad_6)(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_30.value0.value0, _30.value1), _30.value0.value1));
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
                    return StateT(function (_310) {
                        return c(new Data_Tuple.Tuple(a, s));
                    });
                }))(s);
            });
        });
    };
};
var lazy1StateT = new Control_Lazy.Lazy1(function (f) {
    return StateT(function (s) {
        return runStateT(f(Prelude.unit))(s);
    });
});

/**
 *  | Run a computation in the `StateT` monad discarding the result.
 */
var execStateT = function (__dict_Apply_8) {
    return function (m) {
        return function (s) {
            return Prelude["<$>"](__dict_Apply_8["__superclass_Prelude.Functor_0"]())(Data_Tuple.snd)(runStateT(m)(s));
        };
    };
};

/**
 *  | Run a computation in the `StateT` monad, discarding the final state.
 */
var evalStateT = function (__dict_Apply_9) {
    return function (m) {
        return function (s) {
            return Prelude["<$>"](__dict_Apply_9["__superclass_Prelude.Functor_0"]())(Data_Tuple.fst)(runStateT(m)(s));
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
var functorStateT = function (__dict_Monad_7) {
    return new Prelude.Functor(Prelude.liftM1(monadStateT(__dict_Monad_7)));
};
var bindStateT = function (__dict_Monad_10) {
    return new Prelude.Bind(function (_312) {
        return function (f) {
            return function (s) {
                return Prelude[">>="](__dict_Monad_10["__superclass_Prelude.Bind_1"]())(_312(s))(function (_28) {
                    return runStateT(f(_28.value0))(_28.value1);
                });
            };
        };
    }, function () {
        return applyStateT(__dict_Monad_10);
    });
};
var applyStateT = function (__dict_Monad_11) {
    return new Prelude.Apply(Prelude.ap(monadStateT(__dict_Monad_11)), function () {
        return functorStateT(__dict_Monad_11);
    });
};
var applicativeStateT = function (__dict_Monad_12) {
    return new Prelude.Applicative(function () {
        return applyStateT(__dict_Monad_12);
    }, function (a) {
        return StateT(function (s) {
            return Prelude["return"](__dict_Monad_12)(new Data_Tuple.Tuple(a, s));
        });
    });
};
var altStateT = function (__dict_Monad_15) {
    return function (__dict_Alt_16) {
        return new Control_Alt.Alt(function (x) {
            return function (y) {
                return StateT(function (s) {
                    return Control_Alt["<|>"](__dict_Alt_16)(runStateT(x)(s))(runStateT(y)(s));
                });
            };
        }, function () {
            return functorStateT(__dict_Monad_15);
        });
    };
};
var plusStateT = function (__dict_Monad_0) {
    return function (__dict_Plus_1) {
        return new Control_Plus.Plus(function () {
            return altStateT(__dict_Monad_0)(__dict_Plus_1["__superclass_Control.Alt.Alt_0"]());
        }, StateT(function (_309) {
            return Control_Plus.empty(__dict_Plus_1);
        }));
    };
};
var alternativeStateT = function (__dict_Monad_13) {
    return function (__dict_Alternative_14) {
        return new Control_Alternative.Alternative(function () {
            return plusStateT(__dict_Monad_13)(__dict_Alternative_14["__superclass_Control.Plus.Plus_1"]());
        }, function () {
            return applicativeStateT(__dict_Monad_13);
        });
    };
};
var monadPlusStateT = function (__dict_MonadPlus_4) {
    return new Control_MonadPlus.MonadPlus(function () {
        return alternativeStateT(__dict_MonadPlus_4["__superclass_Prelude.Monad_0"]())(__dict_MonadPlus_4["__superclass_Control.Alternative.Alternative_1"]());
    }, function () {
        return monadStateT(__dict_MonadPlus_4["__superclass_Prelude.Monad_0"]());
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
    monadPlusStateT: monadPlusStateT, 
    monadTransStateT: monadTransStateT, 
    lazy1StateT: lazy1StateT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Lazy":32,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Data.Tuple":108,"Prelude":127}],51:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `MonadTrans` type class of _monad transformers_.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | The `MonadTrans` type class represents _monad transformers_.
 *  |
 *  | A monad transformer is a type constructor of kind `(* -> *) -> * -> *`, which
 *  | takes a `Monad` as its first argument, and returns another `Monad`.
 *  |
 *  | This allows us to add additional effects to an existing monad. By iterating this
 *  | process, we create monad transformer _stacks_, which contain all of the effects
 *  | required for a particular computation.
 *  | 
 *  | The laws state that `lift` is a `Monad` morphism.
 *  |
 *  | Laws:
 *  |
 *  | - `lift (pure a) = pure a`
 *  | - `lift (do { x <- m ; y }) = do { x <- lift m ; lift y }`
 */
var MonadTrans = function (lift) {
    this.lift = lift;
};

/**
 *  | The `MonadTrans` type class represents _monad transformers_.
 *  |
 *  | A monad transformer is a type constructor of kind `(* -> *) -> * -> *`, which
 *  | takes a `Monad` as its first argument, and returns another `Monad`.
 *  |
 *  | This allows us to add additional effects to an existing monad. By iterating this
 *  | process, we create monad transformer _stacks_, which contain all of the effects
 *  | required for a particular computation.
 *  | 
 *  | The laws state that `lift` is a `Monad` morphism.
 *  |
 *  | Laws:
 *  |
 *  | - `lift (pure a) = pure a`
 *  | - `lift (do { x <- m ; y }) = do { x <- lift m ; lift y }`
 */
var lift = function (dict) {
    return dict.lift;
};
module.exports = {
    MonadTrans: MonadTrans, 
    lift: lift
};

},{"Prelude":127}],52:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `MonadWriter` type class and its instances.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_Monad_Error_Trans = require("Control.Monad.Error.Trans");
var Control_Monad_Maybe_Trans = require("Control.Monad.Maybe.Trans");
var Control_Monad_State_Trans = require("Control.Monad.State.Trans");
var Control_Monad_Reader_Trans = require("Control.Monad.Reader.Trans");
var Control_Monad_RWS = require("Control.Monad.RWS");
var Control_Monad_Error = require("Control.Monad.Error");
var Control_Monad_RWS_Trans = require("Control.Monad.RWS.Trans");
var Data_Monoid = require("Data.Monoid");
var Data_Tuple = require("Data.Tuple");

/**
 *  | The `MonadWriter w` type class represents those monads which support a monoidal accumulator
 *  | of type `w`.
 *  |
 *  | - `writer` appends a value to the accumulator.
 *  | - `listen` modifies the result to include the changes to the accumulator.
 *  | - `pass` applies the returned function to the accumulator.
 *  |
 *  | An implementation is provided for `WriterT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - `writer a mempty = pure a`
 *  | - `do { tell x ; tell y } = tell (x <> y)`
 *  | - `listen (pure a) = pure (Tuple a mempty)`
 *  | - `listen (writer a x) = tell x $> Tuple a x`
 *  |
 */
var MonadWriter = function (listen, pass, writer) {
    this.listen = listen;
    this.pass = pass;
    this.writer = writer;
};

/**
 *  | The `MonadWriter w` type class represents those monads which support a monoidal accumulator
 *  | of type `w`.
 *  |
 *  | - `writer` appends a value to the accumulator.
 *  | - `listen` modifies the result to include the changes to the accumulator.
 *  | - `pass` applies the returned function to the accumulator.
 *  |
 *  | An implementation is provided for `WriterT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - `writer a mempty = pure a`
 *  | - `do { tell x ; tell y } = tell (x <> y)`
 *  | - `listen (pure a) = pure (Tuple a mempty)`
 *  | - `listen (writer a x) = tell x $> Tuple a x`
 *  |
 */
var writer = function (dict) {
    return dict.writer;
};

/**
 *  | Append a value to the accumulator.
 */
var tell = function (__dict_Monoid_0) {
    return function (__dict_Monad_1) {
        return function (__dict_MonadWriter_2) {
            return function (w) {
                return writer(__dict_MonadWriter_2)(new Data_Tuple.Tuple(Prelude.unit, w));
            };
        };
    };
};

/**
 *  | The `MonadWriter w` type class represents those monads which support a monoidal accumulator
 *  | of type `w`.
 *  |
 *  | - `writer` appends a value to the accumulator.
 *  | - `listen` modifies the result to include the changes to the accumulator.
 *  | - `pass` applies the returned function to the accumulator.
 *  |
 *  | An implementation is provided for `WriterT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - `writer a mempty = pure a`
 *  | - `do { tell x ; tell y } = tell (x <> y)`
 *  | - `listen (pure a) = pure (Tuple a mempty)`
 *  | - `listen (writer a x) = tell x $> Tuple a x`
 *  |
 */
var pass = function (dict) {
    return dict.pass;
};
var monadWriterWriterT = function (__dict_Monoid_3) {
    return function (__dict_Monad_4) {
        return new MonadWriter(function (m) {
            return Control_Monad_Writer_Trans.WriterT(Prelude[">>="](__dict_Monad_4["__superclass_Prelude.Bind_1"]())(Control_Monad_Writer_Trans.runWriterT(m))(function (_50) {
                return Prelude["return"](__dict_Monad_4)(new Data_Tuple.Tuple(new Data_Tuple.Tuple(_50.value0, _50.value1), _50.value1));
            }));
        }, function (m) {
            return Control_Monad_Writer_Trans.WriterT(Prelude[">>="](__dict_Monad_4["__superclass_Prelude.Bind_1"]())(Control_Monad_Writer_Trans.runWriterT(m))(function (_51) {
                return Prelude["return"](__dict_Monad_4)(new Data_Tuple.Tuple(_51.value0.value0, _51.value0.value1(_51.value1)));
            }));
        }, Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Writer_Trans.WriterT)(Prelude["return"](__dict_Monad_4)));
    };
};
var monadWriterRWST = function (__dict_Monad_5) {
    return function (__dict_Monoid_6) {
        return new MonadWriter(Control_Monad_RWS.listen(__dict_Monad_5), Control_Monad_RWS.pass(__dict_Monad_5), Control_Monad_RWS.writer(__dict_Monad_5["__superclass_Prelude.Applicative_0"]()));
    };
};

/**
 *  | The `MonadWriter w` type class represents those monads which support a monoidal accumulator
 *  | of type `w`.
 *  |
 *  | - `writer` appends a value to the accumulator.
 *  | - `listen` modifies the result to include the changes to the accumulator.
 *  | - `pass` applies the returned function to the accumulator.
 *  |
 *  | An implementation is provided for `WriterT`, and for other monad transformers
 *  | defined in this library.
 *  |
 *  | Laws:
 *  |
 *  | - `writer a mempty = pure a`
 *  | - `do { tell x ; tell y } = tell (x <> y)`
 *  | - `listen (pure a) = pure (Tuple a mempty)`
 *  | - `listen (writer a x) = tell x $> Tuple a x`
 *  |
 */
var listen = function (dict) {
    return dict.listen;
};

/**
 *  | Read a value which depends on the modifications made to the accumulator during an action.
 */
var listens = function (__dict_Monoid_7) {
    return function (__dict_Monad_8) {
        return function (__dict_MonadWriter_9) {
            return function (f) {
                return function (m) {
                    return Prelude[">>="](__dict_Monad_8["__superclass_Prelude.Bind_1"]())(listen(__dict_MonadWriter_9)(m))(function (_48) {
                        return Prelude["return"](__dict_Monad_8)(new Data_Tuple.Tuple(_48.value0, f(_48.value1)));
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

/**
 *  | Modify the final accumulator value by applying a function.
 */
var censor = function (__dict_Monoid_18) {
    return function (__dict_Monad_19) {
        return function (__dict_MonadWriter_20) {
            return function (f) {
                return function (m) {
                    return pass(__dict_MonadWriter_20)(Prelude[">>="](__dict_Monad_19["__superclass_Prelude.Bind_1"]())(m)(function (_49) {
                        return Prelude["return"](__dict_Monad_19)(new Data_Tuple.Tuple(_49, f));
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

},{"Control.Monad.Error":42,"Control.Monad.Error.Trans":41,"Control.Monad.Maybe.Trans":45,"Control.Monad.RWS":47,"Control.Monad.RWS.Trans":46,"Control.Monad.Reader.Trans":48,"Control.Monad.State.Trans":50,"Control.Monad.Trans":51,"Control.Monad.Writer.Trans":53,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],53:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the writer monad transformer, `WriterT`.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Tuple = require("Data.Tuple");
var Data_Monoid = require("Data.Monoid");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_Monad_Trans = require("Control.Monad.Trans");
var Control_MonadPlus = require("Control.MonadPlus");

/**
 *  | The writer monad transformer.
 *  |
 *  | This monad transformer extends the base monad with a monoidal accumulator of
 *  | type `w`.
 *  |
 *  | The `MonadWriter` type class describes the operations supported by this monad.
 */
var WriterT = function (x) {
    return x;
};

/**
 *  | Run a computation in the `WriterT` monad.
 */
var runWriterT = function (_314) {
    return _314;
};
var monadTransWriterT = function (__dict_Monoid_4) {
    return new Control_Monad_Trans.MonadTrans(function (__dict_Monad_5) {
        return function (m) {
            return WriterT(Prelude[">>="](__dict_Monad_5["__superclass_Prelude.Bind_1"]())(m)(function (_34) {
                return Prelude["return"](__dict_Monad_5)(new Data_Tuple.Tuple(_34, Data_Monoid.mempty(__dict_Monoid_4)));
            }));
        };
    });
};

/**
 *  | Change the accumulator and base monad types in a `WriterT` monad action.
 */
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
var liftCallCCWriter = function (__dict_Monoid_8) {
    return function (callCC) {
        return function (f) {
            return WriterT(callCC(function (c) {
                return runWriterT(f(function (a) {
                    return WriterT(c(new Data_Tuple.Tuple(a, Data_Monoid.mempty(__dict_Monoid_8))));
                }));
            }));
        };
    };
};
var functorWriterT = function (__dict_Functor_9) {
    return new Prelude.Functor(function (f) {
        return mapWriterT(Prelude["<$>"](__dict_Functor_9)(function (_313) {
            return new Data_Tuple.Tuple(f(_313.value0), _313.value1);
        }));
    });
};

/**
 *  | Run a computation in the `WriterT` monad, discarding the result.
 */
var execWriterT = function (__dict_Apply_10) {
    return function (m) {
        return Prelude["<$>"](__dict_Apply_10["__superclass_Prelude.Functor_0"]())(Data_Tuple.snd)(runWriterT(m));
    };
};
var applyWriterT = function (__dict_Monoid_13) {
    return function (__dict_Apply_14) {
        return new Prelude.Apply(function (f) {
            return function (v) {
                return WriterT((function () {
                    var k = function (_315) {
                        return function (_316) {
                            return new Data_Tuple.Tuple(_315.value0(_316.value0), Prelude["<>"](__dict_Monoid_13["__superclass_Prelude.Semigroup_0"]())(_315.value1)(_316.value1));
                        };
                    };
                    return Prelude["<*>"](__dict_Apply_14)(Prelude["<$>"](__dict_Apply_14["__superclass_Prelude.Functor_0"]())(k)(runWriterT(f)))(runWriterT(v));
                })());
            };
        }, function () {
            return functorWriterT(__dict_Apply_14["__superclass_Prelude.Functor_0"]());
        });
    };
};
var bindWriterT = function (__dict_Monoid_11) {
    return function (__dict_Monad_12) {
        return new Prelude.Bind(function (m) {
            return function (k) {
                return WriterT(Prelude[">>="](__dict_Monad_12["__superclass_Prelude.Bind_1"]())(runWriterT(m))(function (_33) {
                    return Prelude[">>="](__dict_Monad_12["__superclass_Prelude.Bind_1"]())(runWriterT(k(_33.value0)))(function (_32) {
                        return Prelude["return"](__dict_Monad_12)(new Data_Tuple.Tuple(_32.value0, Prelude["<>"](__dict_Monoid_11["__superclass_Prelude.Semigroup_0"]())(_33.value1)(_32.value1)));
                    });
                }));
            };
        }, function () {
            return applyWriterT(__dict_Monoid_11)((__dict_Monad_12["__superclass_Prelude.Applicative_0"]())["__superclass_Prelude.Apply_0"]());
        });
    };
};
var applicativeWriterT = function (__dict_Monoid_15) {
    return function (__dict_Applicative_16) {
        return new Prelude.Applicative(function () {
            return applyWriterT(__dict_Monoid_15)(__dict_Applicative_16["__superclass_Prelude.Apply_0"]());
        }, function (a) {
            return WriterT(Prelude.pure(__dict_Applicative_16)(new Data_Tuple.Tuple(a, Data_Monoid.mempty(__dict_Monoid_15))));
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
var altWriterT = function (__dict_Monoid_19) {
    return function (__dict_Alt_20) {
        return new Control_Alt.Alt(function (m) {
            return function (n) {
                return WriterT(Control_Alt["<|>"](__dict_Alt_20)(runWriterT(m))(runWriterT(n)));
            };
        }, function () {
            return functorWriterT(__dict_Alt_20["__superclass_Prelude.Functor_0"]());
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
var alternativeWriterT = function (__dict_Monoid_17) {
    return function (__dict_Alternative_18) {
        return new Control_Alternative.Alternative(function () {
            return plusWriterT(__dict_Monoid_17)(__dict_Alternative_18["__superclass_Control.Plus.Plus_1"]());
        }, function () {
            return applicativeWriterT(__dict_Monoid_17)(__dict_Alternative_18["__superclass_Prelude.Applicative_0"]());
        });
    };
};
var monadPlusWriterT = function (__dict_Monoid_6) {
    return function (__dict_MonadPlus_7) {
        return new Control_MonadPlus.MonadPlus(function () {
            return alternativeWriterT(__dict_Monoid_6)(__dict_MonadPlus_7["__superclass_Control.Alternative.Alternative_1"]());
        }, function () {
            return monadWriterT(__dict_Monoid_6)(__dict_MonadPlus_7["__superclass_Prelude.Monad_0"]());
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
    monadPlusWriterT: monadPlusWriterT, 
    monadTransWriterT: monadTransWriterT
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],54:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Writer` monad.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Identity = require("Data.Identity");
var Control_Monad_Writer_Trans = require("Control.Monad.Writer.Trans");
var Data_Tuple = require("Data.Tuple");
var Data_Monoid = require("Data.Monoid");

/**
 *  | Run a computation in the `Writer` monad
 */
var runWriter = Prelude["<<<"](Prelude.semigroupoidArr)(Data_Identity.runIdentity)(Control_Monad_Writer_Trans.runWriterT);

/**
 *  | Change the result and accumulator types in a `Writer` monad action
 */
var mapWriter = function (f) {
    return Control_Monad_Writer_Trans.mapWriterT(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Identity.Identity)(Prelude["<<<"](Prelude.semigroupoidArr)(f)(Data_Identity.runIdentity)));
};

/**
 *  | Run a computation in the `Writer` monad, discarding the result
 */
var execWriter = function (m) {
    return Data_Tuple.snd(runWriter(m));
};
module.exports = {
    mapWriter: mapWriter, 
    execWriter: execWriter, 
    runWriter: runWriter
};

},{"Control.Monad.Writer.Trans":53,"Data.Identity":85,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],55:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines helper functions for working with `Monad` instances.
 */
"use strict";
var Prelude = require("Prelude");

/**
 *  | Perform a monadic action when a condition is true.
 */
var when = function (__dict_Monad_0) {
    return function (_121) {
        return function (m) {
            if (_121) {
                return m;
            };
            if (!_121) {
                return Prelude["return"](__dict_Monad_0)(Prelude.unit);
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Perform a monadic action unless a condition is true.
 */
var unless = function (__dict_Monad_1) {
    return function (_122) {
        return function (m) {
            if (!_122) {
                return m;
            };
            if (_122) {
                return Prelude["return"](__dict_Monad_1)(Prelude.unit);
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Perform a monadic action `n` times collecting all of the results.
 */
var replicateM = function (__dict_Monad_2) {
    return function (n) {
        return function (m) {
            if (n === 0) {
                return Prelude["return"](__dict_Monad_2)([  ]);
            };
            return Prelude[">>="](__dict_Monad_2["__superclass_Prelude.Bind_1"]())(m)(function (_11) {
                return Prelude[">>="](__dict_Monad_2["__superclass_Prelude.Bind_1"]())(replicateM(__dict_Monad_2)(n - 1)(m))(function (_10) {
                    return Prelude["return"](__dict_Monad_2)(Prelude[":"](_11)(_10));
                });
            });
        };
    };
};

/**
 *  | Perform a fold using a monadic step function.
 */
var foldM = function (__dict_Monad_3) {
    return function (f) {
        return function (a) {
            return function (_120) {
                if (_120.length === 0) {
                    return Prelude["return"](__dict_Monad_3)(a);
                };
                if (_120.length >= 1) {
                    var _938 = _120.slice(1);
                    return Prelude[">>="](__dict_Monad_3["__superclass_Prelude.Bind_1"]())(f(a)(_120[0]))(function (a$prime) {
                        return foldM(__dict_Monad_3)(f)(a$prime)(_938);
                    });
                };
                throw new Error("Failed pattern match");
            };
        };
    };
};

/**
 *  | Filter where the predicate returns a monadic `Boolean`.
 *  |
 *  | For example: 
 *  |
 *  | ```purescript
 *  | powerSet :: forall a. [a] -> [[a]]
 *  | powerSet = filterM (const [true, false])
 *  | ```
 */
var filterM = function (__dict_Monad_4) {
    return function (p) {
        return function (_123) {
            if (_123.length === 0) {
                return Prelude["return"](__dict_Monad_4)([  ]);
            };
            if (_123.length >= 1) {
                var _945 = _123.slice(1);
                return Prelude[">>="](__dict_Monad_4["__superclass_Prelude.Bind_1"]())(p(_123[0]))(function (_13) {
                    return Prelude[">>="](__dict_Monad_4["__superclass_Prelude.Bind_1"]())(filterM(__dict_Monad_4)(p)(_945))(function (_12) {
                        return Prelude["return"](__dict_Monad_4)((function () {
                            if (_13) {
                                return Prelude[":"](_123[0])(_12);
                            };
                            if (!_13) {
                                return _12;
                            };
                            throw new Error("Failed pattern match");
                        })());
                    });
                });
            };
            throw new Error("Failed pattern match");
        };
    };
};
module.exports = {
    filterM: filterM, 
    unless: unless, 
    when: when, 
    foldM: foldM, 
    replicateM: replicateM
};

},{"Prelude":127}],56:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `MonadPlus` type class.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");

/**
 *  | The `MonadPlus` type class has no members of its own; it just specifies
 *  | that the type has both `Monad` and `Alternative` instances.
 *  |
 *  | Types which have `MonadPlus` instances should also satisfy the following
 *  | laws:
 *  |
 *  | - Distributivity: `(x <|> y) >>= f == (x >>= f) <|> (y >>= f)`
 *  | - Annihilation: `empty >>= f = empty`
 */
var MonadPlus = function (__superclass_Control$dotAlternative$dotAlternative_1, __superclass_Prelude$dotMonad_0) {
    this["__superclass_Control.Alternative.Alternative_1"] = __superclass_Control$dotAlternative$dotAlternative_1;
    this["__superclass_Prelude.Monad_0"] = __superclass_Prelude$dotMonad_0;
};

/**
 *  | Fail using `Plus` if a condition does not hold, or
 *  | succeed using `Monad` if it does.
 *  |
 *  | For example:
 *  |
 *  | ```purescript
 *  | import Data.Array
 *  | 
 *  | factors :: Number -> [Number]
 *  | factors n = do
 *  |   a <- 1 .. n
 *  |   b <- 1 .. a
 *  |   guard $ a * b == n
 *  |   return a
 *  | ```
 */
var guard = function (__dict_MonadPlus_0) {
    return function (_134) {
        if (_134) {
            return Prelude["return"](__dict_MonadPlus_0["__superclass_Prelude.Monad_0"]())(Prelude.unit);
        };
        if (!_134) {
            return Control_Plus.empty((__dict_MonadPlus_0["__superclass_Control.Alternative.Alternative_1"]())["__superclass_Control.Plus.Plus_1"]());
        };
        throw new Error("Failed pattern match");
    };
};
module.exports = {
    MonadPlus: MonadPlus, 
    guard: guard
};

},{"Control.Alternative":27,"Control.Plus":57,"Prelude":127}],57:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Plus` type class.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");

/**
 *  | The `Plus` type class extends the `Alt` type class with a value that
 *  | should be the left and right identity for `(<|>)`.
 *  |
 *  | It is similar to `Monoid`, except that it applies to types of
 *  | kind `* -> *`, like `Array` or `List`, rather than concrete types like
 *  | `String` or `Number`.
 *  |
 *  | `Plus` instances should satisfy the following laws:
 *  |
 *  | - Left identity: `empty <|> x == x`
 *  | - Right identity: `x <|> empty == x`
 *  | - Annihilation: `f <$> empty == empty`
 */
var Plus = function (__superclass_Control$dotAlt$dotAlt_0, empty) {
    this["__superclass_Control.Alt.Alt_0"] = __superclass_Control$dotAlt$dotAlt_0;
    this.empty = empty;
};

/**
 *  | The `Plus` type class extends the `Alt` type class with a value that
 *  | should be the left and right identity for `(<|>)`.
 *  |
 *  | It is similar to `Monoid`, except that it applies to types of
 *  | kind `* -> *`, like `Array` or `List`, rather than concrete types like
 *  | `String` or `Number`.
 *  |
 *  | `Plus` instances should satisfy the following laws:
 *  |
 *  | - Left identity: `empty <|> x == x`
 *  | - Right identity: `x <|> empty == x`
 *  | - Annihilation: `f <$> empty == empty`
 */
var empty = function (dict) {
    return dict.empty;
};
module.exports = {
    Plus: Plus, 
    empty: empty
};

},{"Control.Alt":26,"Prelude":127}],58:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
module.exports = {};

},{"Prelude":127}],59:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Helper functions for working with mutable arrays using the `ST` effect.
 *  |
 *  | This module can be used when performance is important and mutation is a local effect.
 */
"use strict";
var Data_Function = require("Data.Function");
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");

  function runSTArray(f) {
    return f;
  };

  function emptySTArray() {
    return [];
  };

  function peekSTArrayImpl(just, nothing, arr, i) {
    return function() {
      var index = i >>> 0;
      return index < arr.length? just(arr[index]) : nothing;
    };
  };

  function pokeSTArrayImpl(arr, i, a) {
    return function() {
      var index = i >>> 0;
      var ret = index < arr.length;
      if (ret)
        arr[index] = a;
      return ret;
    };
  };

  function pushAllSTArrayImpl(arr, as) {
    return function(){
      return arr.push.apply(arr, as);
    };
  };

  function spliceSTArrayImpl(arr, index, howMany, bs) {
    return function(){
      return arr.splice.apply(arr, [index, howMany].concat(bs));
    };
  };

  function copyImpl(arr) {
    return function(){
      return arr.slice();
    };
  };

  function toAssocArray(arr) {
    return function(){
      var n = arr.length;
      var as = new Array(n);
      for (var i = 0; i < n; i++)
        as[i] = {value: arr[i], index: i};
      return as;
    };
  };

/**
 *  | Create a mutable copy of an immutable array.
 */
var thaw = copyImpl;

/**
 *  | Remove and/or insert elements from/into a mutable array at the specified index.
 */
var spliceSTArray = Data_Function.runFn4(spliceSTArrayImpl);

/**
 *  | Append the values in an immutable array to the end of a mutable array.
 */
var pushAllSTArray = Data_Function.runFn2(pushAllSTArrayImpl);

/**
 *  | Append an element to the end of a mutable array.
 */
var pushSTArray = function (arr) {
    return function (a) {
        return pushAllSTArray(arr)([ a ]);
    };
};

/**
 *  | Change the value at the specified index in a mutable array.
 */
var pokeSTArray = Data_Function.runFn3(pokeSTArrayImpl);

/**
 *  | Read the value at the specified index in a mutable array.
 */
var peekSTArray = Data_Function.runFn4(peekSTArrayImpl)(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);

/**
 *  | Create an immutable copy of a mutable array.
 */
var freeze = copyImpl;
module.exports = {
    toAssocArray: toAssocArray, 
    thaw: thaw, 
    freeze: freeze, 
    spliceSTArray: spliceSTArray, 
    pushAllSTArray: pushAllSTArray, 
    pushSTArray: pushSTArray, 
    pokeSTArray: pokeSTArray, 
    peekSTArray: peekSTArray, 
    emptySTArray: emptySTArray, 
    runSTArray: runSTArray
};

},{"Control.Monad.Eff":39,"Control.Monad.ST":49,"Data.Function":83,"Data.Maybe":90,"Prelude":127}],60:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Unsafe helper functions for working with immutable arrays.
 *  |
 *  | _Note_: these functions should be used with care, and may result in unspecified
 *  | behavior, including runtime exceptions.
 */
"use strict";
var Prelude_Unsafe = require("Prelude.Unsafe");
var Prelude = require("Prelude");
var Data_Array = require("Data.Array");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");

/**
 *  | Get all but the first element of a non-empty array.
 *  |
 *  | Running time: `O(n)`, where `n` is the length of the array.
 */
var tail = function (_172) {
    if (_172.length >= 1) {
        var _1133 = _172.slice(1);
        return _1133;
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Get the last element of a non-empty array.
 *  |
 *  | Running time: `O(1)`.
 */
var last = function (xs) {
    return xs[Data_Array.length(xs) - 1];
};

/**
 *  | Get all but the last element of a non-empty array.
 *  |
 *  | Running time: `O(n)`, where `n` is the length of the array.
 */
var init = Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe_Unsafe.fromJust)(Data_Array.init);

/**
 *  | Get the first element of a non-empty array.
 *  |
 *  | Running time: `O(1)`.
 */
var head = function (xs) {
    return xs[0];
};
module.exports = {
    init: init, 
    last: last, 
    tail: tail, 
    head: head
};

},{"Data.Array":61,"Data.Maybe.Unsafe":89,"Prelude":127,"Prelude.Unsafe":126}],61:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Helper functions for working with immutable Javascript arrays.
 *  |
 *  | _Note_: Depending on your use-case, you may prefer to use `Data.List` or
 *  | `Data.Sequence` instead, which might give better performance for certain
 *  | use cases. This module is useful when integrating with JavaScript libraries
 *  | which use arrays, but immutable arrays are not a practical data structure
 *  | for many use cases due to their poor asymptotics.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Control_Alt = require("Control.Alt");
var Control_Plus = require("Control.Plus");
var Control_Alternative = require("Control.Alternative");
var Control_MonadPlus = require("Control.MonadPlus");
var Prelude_Unsafe = require("Prelude.Unsafe");
function snoc(l) {  return function (e) {    var l1 = l.slice();    l1.push(e);     return l1;  };};
function length (xs) {  return xs.length;};
function findIndex (f) {  return function (arr) {    for (var i = 0, l = arr.length; i < l; i++) {      if (f(arr[i])) {        return i;      }    }    return -1;  };};
function findLastIndex (f) {  return function (arr) {    for (var i = arr.length - 1; i >= 0; i--) {      if (f(arr[i])) {        return i;      }    }    return -1;  };};
function append (l1) {  return function (l2) {    return l1.concat(l2);  };};
function concat (xss) {  var result = [];  for (var i = 0, l = xss.length; i < l; i++) {    result.push.apply(result, xss[i]);  }  return result;};
function reverse (l) {  return l.slice().reverse();};
function drop (n) {  return function (l) {    return l.slice(n);  };};
function slice (s) {  return function (e) {    return function (l) {      return l.slice(s, e);    };  };};
function insertAt (index) {  return function (a) {    return function (l) {      var l1 = l.slice();      l1.splice(index, 0, a);      return l1;    };   };};
function deleteAt (index) {  return function (n) {    return function (l) {      var l1 = l.slice();      l1.splice(index, n);      return l1;    };   };};
function updateAt (index) {  return function (a) {    return function (l) {      var i = ~~index;      if (i < 0 || i >= l.length) return l;      var l1 = l.slice();      l1[i] = a;      return l1;    };   };};
function concatMap (f) {  return function (arr) {    var result = [];    for (var i = 0, l = arr.length; i < l; i++) {      Array.prototype.push.apply(result, f(arr[i]));    }    return result;  };};
function map (f) {  return function (arr) {    var l = arr.length;    var result = new Array(l);    for (var i = 0; i < l; i++) {      result[i] = f(arr[i]);    }    return result;  };};
function filter (f) {  return function (arr) {    var n = 0;    var result = [];    for (var i = 0, l = arr.length; i < l; i++) {      if (f(arr[i])) {        result[n++] = arr[i];      }    }    return result;  };};
function range (start) {  return function (end) {    var i = ~~start, e = ~~end;    var step = i > e ? -1 : 1;    var result = [i], n = 1;    while (i !== e) {      i += step;      result[n++] = i;    }    return result;  };};
function zipWith (f) {  return function (xs) {    return function (ys) {      var l = xs.length < ys.length ? xs.length : ys.length;      var result = new Array(l);      for (var i = 0; i < l; i++) {        result[i] = f(xs[i])(ys[i]);      }      return result;    };  };};
function sortJS (f) {  return function (l) {    return l.slice().sort(function (x, y) {      return f(x)(y);    });  };};

function replicate(nn) {
  return function(v) {
    var n = nn > 0? nn : 0;
    var r = new Array(n);
    for (var i = 0; i < n; i++)
      r[i] = v;
    return r;
   };
}
;

/**
 *  | An infix synonym for `range`.
 */
var $dot$dot = range;

/**
 *  | This operator provides a safe way to read a value at a particular index from an array.
 *  |
 *  | This function returns `Nothing` if the index is out-of-bounds.
 *  |
 *  | `Data.Array.Unsafe` provides the `unsafeIndex` function, which is an unsafe version of
 *  | this function without bounds checking.
 */
var $bang$bang = function (xs) {
    return function (n) {
        var isInt = function (n_1) {
            return n_1 !== ~~n_1;
        };
        var _1036 = n < 0 || (n >= length(xs) || isInt(n));
        if (_1036) {
            return Data_Maybe.Nothing.value;
        };
        if (!_1036) {
            return new Data_Maybe.Just(xs[n]);
        };
        throw new Error("Failed pattern match");
    };
};

/**
 *  | Keep only a number of elements from the start of an array, creating a new array.
 */
var take = function (n) {
    return slice(0)(n);
};

/**
 *  | Get all but the first element of an array, creating a new array, or `Nothing` if the array is empty
 *  |
 *  | Running time: `O(n)` where `n` is the length of the array
 */
var tail = function (_157) {
    if (_157.length >= 1) {
        var _1039 = _157.slice(1);
        return new Data_Maybe.Just(_1039);
    };
    return Data_Maybe.Nothing.value;
};

/**
 *  | Split an array into two parts:
 *  |
 *  | 1. the longest initial subarray for which all element satisfy the specified predicate
 *  | 2. the remaining elements
 *  |
 *  | For example,
 *  |
 *  | ```purescript
 *  | span (\n -> n % 2 == 1) [1,3,2,4,5] == { init: [1,3], rest: [2,4,5] }
 *  | ```
 */
var span = (function () {
    var go = function (__copy_acc) {
        return function (__copy_p) {
            return function (__copy_xs) {
                var acc = __copy_acc;
                var p = __copy_p;
                var xs = __copy_xs;
                tco: while (true) {
                    if (xs.length >= 1) {
                        var _1044 = xs.slice(1);
                        if (p(xs[0])) {
                            var __tco_acc = Prelude[":"](xs[0])(acc);
                            var __tco_p = p;
                            acc = __tco_acc;
                            p = __tco_p;
                            xs = _1044;
                            continue tco;
                        };
                    };
                    return {
                        init: reverse(acc), 
                        rest: xs
                    };
                };
            };
        };
    };
    return go([  ]);
})();

/**
 *  | Calculate the longest initial subarray for which all element satisfy the specified predicate,
 *  | creating a new array.
 */
var takeWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).init;
    };
};

/**
 *  | Sort the elements of an array in increasing order, where elements are compared using
 *  | the specified partial ordering, creating a new array.
 */
var sortBy = function (comp) {
    return function (xs) {
        var comp$prime = function (x) {
            return function (y) {
                var _1045 = comp(x)(y);
                if (_1045 instanceof Prelude.GT) {
                    return 1;
                };
                if (_1045 instanceof Prelude.EQ) {
                    return 0;
                };
                if (_1045 instanceof Prelude.LT) {
                    return -1;
                };
                throw new Error("Failed pattern match");
            };
        };
        return sortJS(comp$prime)(xs);
    };
};

/**
 *  | Sort the elements of an array in increasing order, creating a new array.
 */
var sort = function (__dict_Ord_0) {
    return function (xs) {
        return sortBy(Prelude.compare(__dict_Ord_0))(xs);
    };
};

/**
 *  | Create an array of one element
 */
var singleton = function (a) {
    return [ a ];
};
var semigroupArray = new Prelude.Semigroup(append);

/**
 *  | Test whether an array is empty.
 */
var $$null = function (_158) {
    if (_158.length === 0) {
        return true;
    };
    return false;
};

/**
 *  | Remove the duplicates from an array, where element equality is determined by the
 *  | specified equivalence relation, creating a new array.
 */
var nubBy = function ($eq$eq) {
    return function (_159) {
        if (_159.length === 0) {
            return [  ];
        };
        if (_159.length >= 1) {
            var _1050 = _159.slice(1);
            return Prelude[":"](_159[0])(nubBy($eq$eq)(filter(function (y) {
                return !$eq$eq(_159[0])(y);
            })(_1050)));
        };
        throw new Error("Failed pattern match");
    };
};

/**
 *  | Remove the duplicates from an array, creating a new array.
 */
var nub = function (__dict_Eq_1) {
    return nubBy(Prelude["=="](__dict_Eq_1));
};

/**
 *  | Apply a function to the element at the specified index, creating a new array.
 */
var modifyAt = function (i) {
    return function (f) {
        return function (xs) {
            var _1051 = $bang$bang(xs)(i);
            if (_1051 instanceof Data_Maybe.Just) {
                return updateAt(i)(f(_1051.value0))(xs);
            };
            if (_1051 instanceof Data_Maybe.Nothing) {
                return xs;
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Apply a function to each element in an array, keeping only the results which
 *  | contain a value, creating a new array.
 */
var mapMaybe = function (f) {
    return concatMap(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.maybe([  ])(singleton))(f));
};

/**
 *  | Get the last element in an array, or `Nothing` if the array is empty
 *  |
 *  | Running time: `O(1)`.
 */
var last = function (xs) {
    return $bang$bang(xs)(length(xs) - 1);
};

/**
 *  | Calculate the intersection of two arrays, using the specified equivalence relation
 *  | to compare elements, creating a new array.
 */
var intersectBy = function (eq) {
    return function (xs) {
        return function (ys) {
            if (xs.length === 0) {
                return [  ];
            };
            if (ys.length === 0) {
                return [  ];
            };
            var el = function (x) {
                return findIndex(eq(x))(ys) >= 0;
            };
            return filter(el)(xs);
        };
    };
};

/**
 *  | Calculate the intersection of two arrays, creating a new array.
 */
var intersect = function (__dict_Eq_2) {
    return intersectBy(Prelude["=="](__dict_Eq_2));
};

/**
 *  | Get all but the last element of an array, creating a new array, or `Nothing` if the array is empty.
 *  |
 *  | Running time: `O(n)` where `n` is the length of the array
 */
var init = function (xs) {
    if (xs.length === 0) {
        return Data_Maybe.Nothing.value;
    };
    return new Data_Maybe.Just(slice(0)(length(xs) - 1)(xs));
};

/**
 *  | Get the first element in an array, or `Nothing` if the array is empty
 *  |
 *  | Running time: `O(1)`.
 */
var head = function (xs) {
    return $bang$bang(xs)(0);
};

/**
 *  | Group equal, consecutive elements of an array into arrays, using the specified
 *  | equivalence relation to detemine equality.
 */
var groupBy = (function () {
    var go = function (__copy_acc) {
        return function (__copy_op) {
            return function (__copy__161) {
                var acc = __copy_acc;
                var op = __copy_op;
                var _161 = __copy__161;
                tco: while (true) {
                    if (_161.length === 0) {
                        return reverse(acc);
                    };
                    if (_161.length >= 1) {
                        var _1061 = _161.slice(1);
                        var sp = span(op(_161[0]))(_1061);
                        var __tco_acc = Prelude[":"](Prelude[":"](_161[0])(sp.init))(acc);
                        var __tco_op = op;
                        acc = __tco_acc;
                        op = __tco_op;
                        _161 = sp.rest;
                        continue tco;
                    };
                    throw new Error("Failed pattern match");
                };
            };
        };
    };
    return go([  ]);
})();

/**
 *  | Group equal, consecutive elements of an array into arrays.
 *  |
 *  | For example,
 *  |
 *  | ```purescript
 *  | group [1,1,2,2,1] == [[1,1],[2,2],[1]]
 *  | ```
 */
var group = function (__dict_Eq_3) {
    return function (xs) {
        return groupBy(Prelude["=="](__dict_Eq_3))(xs);
    };
};

/**
 *  | Sort and group the elements of an array into arrays.
 *  |
 *  | For example,
 *  |
 *  | ```purescript
 *  | group [1,1,2,2,1] == [[1,1,1],[2,2]]
 *  | ```
 */
var group$prime = function (__dict_Ord_4) {
    return Prelude["<<<"](Prelude.semigroupoidArr)(group(__dict_Ord_4["__superclass_Prelude.Eq_0"]()))(sort(__dict_Ord_4));
};
var functorArray = new Prelude.Functor(map);

/**
 *  | Find the index of the last element equal to the specified element,
 *  | or `-1` if no such element exists
 */
var elemLastIndex = function (__dict_Eq_5) {
    return function (x) {
        return findLastIndex(Prelude["=="](__dict_Eq_5)(x));
    };
};

/**
 *  | Find the index of the first element equal to the specified element,
 *  | or `-1` if no such element exists
 */
var elemIndex = function (__dict_Eq_6) {
    return function (x) {
        return findIndex(Prelude["=="](__dict_Eq_6)(x));
    };
};

/**
 *  | Remove the longest initial subarray for which all element satisfy the specified predicate,
 *  | creating a new array.
 */
var dropWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).rest;
    };
};

/**
 *  | Delete the first element of an array which matches the specified value, under the
 *  | equivalence relation provided in the first argument, creating a new array.
 */
var deleteBy = function (eq) {
    return function (x) {
        return function (ys) {
            if (ys.length === 0) {
                return [  ];
            };
            var _1065 = findIndex(eq(x))(ys);
            if (_1065 < 0) {
                return ys;
            };
            return deleteAt(_1065)(1)(ys);
        };
    };
};

/**
 *  | Delete the first element of an array which is equal to the specified value,
 *  | creating a new array.
 */
var $$delete = function (__dict_Eq_7) {
    return deleteBy(Prelude["=="](__dict_Eq_7));
};

/**
 *  | Delete the first occurrence of each element in the second array from the first array,
 *  | creating a new array.
 */
var $bslash$bslash = function (__dict_Eq_8) {
    return function (xs) {
        return function (ys) {
            var go = function (__copy_xs_1) {
                return function (__copy__160) {
                    var xs_1 = __copy_xs_1;
                    var _160 = __copy__160;
                    tco: while (true) {
                        if (_160.length === 0) {
                            return xs_1;
                        };
                        if (xs_1.length === 0) {
                            return [  ];
                        };
                        if (_160.length >= 1) {
                            var _1069 = _160.slice(1);
                            var __tco_xs_1 = $$delete(__dict_Eq_8)(_160[0])(xs_1);
                            xs_1 = __tco_xs_1;
                            _160 = _1069;
                            continue tco;
                        };
                        throw new Error("Failed pattern match");
                    };
                };
            };
            return go(xs)(ys);
        };
    };
};

/**
 *  | Filter an array of optional values, keeping only the elements which contain
 *  | a value, creating a new array.
 */
var catMaybes = concatMap(Data_Maybe.maybe([  ])(singleton));
var monadArray = new Prelude.Monad(function () {
    return applicativeArray;
}, function () {
    return bindArray;
});
var bindArray = new Prelude.Bind(Prelude.flip(concatMap), function () {
    return applyArray;
});
var applyArray = new Prelude.Apply(Prelude.ap(monadArray), function () {
    return functorArray;
});
var applicativeArray = new Prelude.Applicative(function () {
    return applyArray;
}, singleton);
var altArray = new Control_Alt.Alt(append, function () {
    return functorArray;
});
var plusArray = new Control_Plus.Plus(function () {
    return altArray;
}, [  ]);
var alternativeArray = new Control_Alternative.Alternative(function () {
    return plusArray;
}, function () {
    return applicativeArray;
});
var monadPlusArray = new Control_MonadPlus.MonadPlus(function () {
    return alternativeArray;
}, function () {
    return monadArray;
});
module.exports = {
    replicate: replicate, 
    takeWhile: takeWhile, 
    dropWhile: dropWhile, 
    span: span, 
    groupBy: groupBy, 
    "group'": group$prime, 
    group: group, 
    sortBy: sortBy, 
    sort: sort, 
    nubBy: nubBy, 
    nub: nub, 
    zipWith: zipWith, 
    range: range, 
    filter: filter, 
    concatMap: concatMap, 
    intersect: intersect, 
    intersectBy: intersectBy, 
    "\\\\": $bslash$bslash, 
    "delete": $$delete, 
    deleteBy: deleteBy, 
    modifyAt: modifyAt, 
    updateAt: updateAt, 
    deleteAt: deleteAt, 
    insertAt: insertAt, 
    take: take, 
    drop: drop, 
    reverse: reverse, 
    concat: concat, 
    append: append, 
    elemLastIndex: elemLastIndex, 
    elemIndex: elemIndex, 
    findLastIndex: findLastIndex, 
    findIndex: findIndex, 
    length: length, 
    catMaybes: catMaybes, 
    mapMaybe: mapMaybe, 
    map: map, 
    "null": $$null, 
    init: init, 
    tail: tail, 
    last: last, 
    head: head, 
    singleton: singleton, 
    snoc: snoc, 
    "..": $dot$dot, 
    "!!": $bang$bang, 
    functorArray: functorArray, 
    applyArray: applyArray, 
    applicativeArray: applicativeArray, 
    bindArray: bindArray, 
    monadArray: monadArray, 
    semigroupArray: semigroupArray, 
    altArray: altArray, 
    plusArray: plusArray, 
    alternativeArray: alternativeArray, 
    monadPlusArray: monadPlusArray
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.MonadPlus":56,"Control.Plus":57,"Data.Maybe":90,"Prelude":127,"Prelude.Unsafe":126}],62:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | A type and functions for single characters.
 */
"use strict";
var Prelude = require("Prelude");

    function toCharCode(c) {
      return c.charCodeAt(0);
    }
    ;

    function fromCharCode(c) {
      return String.fromCharCode(c);
    }
    ;

/**
 * | A unicode character.
 */
var Char = function (x) {
    return x;
};

/**
 *  | Characters can be rendered as a string with `show`.
 */
var showChar = new Prelude.Show(function (_117) {
    return "Char " + Prelude.show(Prelude.showString)(_117);
});

/**
 *  | Characters can be compared for equality with `==` and `/=`.
 */
var eqChar = new Prelude.Eq(function (a) {
    return function (b) {
        return !Prelude["=="](eqChar)(a)(b);
    };
}, function (_113) {
    return function (_114) {
        return _113 === _114;
    };
});

/**
 *  | Characters can be compared with `compare`, `>`, `>=`, `<` and `<=`.
 */
var ordChar = new Prelude.Ord(function () {
    return eqChar;
}, function (_115) {
    return function (_116) {
        return Prelude.compare(Prelude.ordString)(_115)(_116);
    };
});

/**
 *  | Returns the string of length `1` containing only the given character.
 */
var charString = function (_112) {
    return _112;
};
module.exports = {
    toCharCode: toCharCode, 
    fromCharCode: fromCharCode, 
    charString: charString, 
    eqChar: eqChar, 
    ordChar: ordChar, 
    showChar: showChar
};

},{"Prelude":127}],63:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_DOM_Simple_Unsafe_Element = require("Data.DOM.Simple.Unsafe.Element");
var Data_DOM_Simple_Unsafe_Utils = require("Data.DOM.Simple.Unsafe.Utils");
var Data_DOM_Simple_Unsafe_Document = require("Data.DOM.Simple.Unsafe.Document");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_DOM_Simple_Element = require("Data.DOM.Simple.Element");
var Document = function (body, setBody, setTitle, title) {
    this.body = body;
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
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeGetElementById(id)(el))(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude["return"](Control_Monad_Eff.monadEff))(Data_DOM_Simple_Unsafe_Utils.ensure));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByClassName, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByName, Data_DOM_Simple_Unsafe_Element.unsafeGetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeHasAttribute, Data_DOM_Simple_Unsafe_Element.unsafeInnerHTML, function (sel) {
    return function (el) {
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeQuerySelector(sel)(el))(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude["return"](Control_Monad_Eff.monadEff))(Data_DOM_Simple_Unsafe_Utils.ensure));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeQuerySelectorAll, Data_DOM_Simple_Unsafe_Element.unsafeRemoveAttribute, Data_DOM_Simple_Unsafe_Element.unsafeSetAttribute, Data_DOM_Simple_Unsafe_Element.unsafeSetInnerHTML, Data_DOM_Simple_Unsafe_Element.unsafeSetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeSetTextContent, Data_DOM_Simple_Unsafe_Element.unsafeSetValue, Data_DOM_Simple_Unsafe_Element.unsafeTextContent, Data_DOM_Simple_Unsafe_Element.unsafeValue);
var htmlDocument = new Document(Data_DOM_Simple_Unsafe_Document.unsafeBody, Data_DOM_Simple_Unsafe_Document.unsafeSetBody, Data_DOM_Simple_Unsafe_Document.unsafeSetTitle, Data_DOM_Simple_Unsafe_Document.unsafeTitle);
var body = function (dict) {
    return dict.body;
};
module.exports = {
    Document: Document, 
    setBody: setBody, 
    body: body, 
    setTitle: setTitle, 
    title: title, 
    htmlDocumentElement: htmlDocumentElement, 
    htmlDocument: htmlDocument, 
    showHtmlDocument: showHtmlDocument
};

},{"Control.Monad.Eff":39,"DOM":58,"Data.DOM.Simple.Element":64,"Data.DOM.Simple.Types":65,"Data.DOM.Simple.Unsafe.Document":66,"Data.DOM.Simple.Unsafe.Element":67,"Data.DOM.Simple.Unsafe.Utils":68,"Prelude":127}],64:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
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
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeGetElementById(id)(el))(Prelude[">>>"](Prelude.semigroupoidArr)(Data_DOM_Simple_Unsafe_Utils.ensure)(Prelude["return"](Control_Monad_Eff.monadEff)));
    };
}, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByClassName, Data_DOM_Simple_Unsafe_Element.unsafeGetElementsByName, Data_DOM_Simple_Unsafe_Element.unsafeGetStyleAttr, Data_DOM_Simple_Unsafe_Element.unsafeHasAttribute, Data_DOM_Simple_Unsafe_Element.unsafeInnerHTML, function (sel) {
    return function (el) {
        return Prelude[">>="](Control_Monad_Eff.bindEff)(Data_DOM_Simple_Unsafe_Element.unsafeQuerySelector(sel)(el))(Prelude[">>>"](Prelude.semigroupoidArr)(Data_DOM_Simple_Unsafe_Utils.ensure)(Prelude["return"](Control_Monad_Eff.monadEff)));
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

},{"Control.Monad.Eff":39,"DOM":58,"Data.Array":61,"Data.DOM.Simple.Types":65,"Data.DOM.Simple.Unsafe.Element":67,"Data.DOM.Simple.Unsafe.Utils":68,"Data.Foldable":76,"Data.Maybe":90,"Data.Tuple":108,"Prelude":127}],65:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
module.exports = {};

},{"Control.Monad.Eff":39,"Prelude":127}],66:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");

  function unsafeTitle(src) {
    return function () {
      return src.title;
    };
  };

  function unsafeSetTitle(value) {
    return function (src) {
      return function () {
        src.title = value;
      };
    };
  };

  function unsafeBody(src) {
    return function () {
      return src.body;
    };
  };

  function unsafeSetBody(value) {
    return function (src) {
      return function () {
        src.body = value;
      };
    };
  };
module.exports = {
    unsafeSetBody: unsafeSetBody, 
    unsafeBody: unsafeBody, 
    unsafeSetTitle: unsafeSetTitle, 
    unsafeTitle: unsafeTitle
};

},{"Control.Monad.Eff":39,"DOM":58,"Data.DOM.Simple.Types":65,"Prelude":127}],67:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");

  function unsafeGetElementById(targ_id) {
    return function (src) {
      return function () {
        return src.getElementById(targ_id);
      };
    };
  };

  function unsafeGetElementsByClassName(targ_id) {
    return function (src) {
      return function () {
        return src.getElementsByClassName(targ_id);
      };
    };
  };

  function unsafeGetElementsByName(targ_id) {
    return function (src) {
      return function () {
        return src.getElementsByName(targ_id);
      };
    };
  };

  function unsafeQuerySelector(selector) {
    return function (src) {
      return function () {
        return src.querySelector(selector);
      };
    };
  };

  function unsafeQuerySelectorAll(selector) {
    return function (src) {
      return function () {
        return src.querySelectorAll(selector);
      };
    };
  };

  function unsafeGetAttribute(name) {
    return function (src) {
      return function () {
        return src.getAttribute(name);
      };
    };
  };

  function unsafeSetAttribute(name) {
    return function (value) {
      return function (src) {
        return function () {
          src.setAttribute(name, value);
          return {};
        };
      };
    };
  };

  function unsafeHasAttribute(name) {
    return function (src) {
      return function () {
        return src.hasAttribute(name);
      };
    };
  };

  function unsafeRemoveAttribute(name) {
    return function (src) {
      return function () {
        src.removeAttribute(name);
        return {};
      };
    };
  };

  function unsafeGetStyleAttr(name) {
    return function (src) {
      return function () {
        return src.style[name];
      };
    };
  };

  function unsafeSetStyleAttr(name) {
    return function (value) {
      return function (src) {
        return function () {
          src.style[name] = value;
          return {};
        };
      };
    };
  };

  function unsafeChildren(src) {
    return function () {
      return src.children;
    };
  };

  function unsafeAppendChild(src) {
    return function (child) {
      return function () {
        return src.appendChild(child);
      };
    };
  };

  function unsafeInnerHTML(src) {
    return function () {
      return src.innerHTML;
    };
  };

  function unsafeSetInnerHTML(value) {
    return function (src) {
      return function () {
        src.innerHTML = value;
        return {};
      };
    };
  };

  function unsafeTextContent(src) {
    return function () {
      return src.textContent;
    };
  };

  function unsafeSetTextContent(value) {
    return function (src) {
      return function () {
        src.textContent = value;
        return {};
      };
    };
  };

  function unsafeValue(src) {
    return function () {
      return src.value;
    };
  };

  function unsafeSetValue(value) {
    return function (src) {
      return function () {
        src.value = value;
        return {};
      };
    };
  };

  function unsafeContentWindow(obj) {
    return function () {
      return obj.contentWindow;
    };
  };

  function unsafeClassAdd(value) {
    return function (src) {
      return function () {
        src.classList.add(value);
        return {};
      };
    };
  };

  function unsafeClassRemove(value) {
    return function (src) {
      return function () {
        src.classList.remove(value);
        return {};
      };
    };
  };

  function unsafeClassToggle(value) {
    return function (src) {
      return function () {
        src.classList.toggle(value);
        return {};
      };
    };
  };

  function unsafeClassContains(value) {
    return function (src) {
      return function () {
        return src.classList.contains(value);
      };
    };
  };

  function unsafeClick(src) {
    return function () {
      src.click();
      return {};
    };
  };

  function unsafeFocus(src) {
    return function () {
      src.focus();
      return {};
    };
  };

  function unsafeBlur(src) {
    return function () {
      src.blur();
      return {};
    };
  };
module.exports = {
    unsafeBlur: unsafeBlur, 
    unsafeFocus: unsafeFocus, 
    unsafeClick: unsafeClick, 
    unsafeClassContains: unsafeClassContains, 
    unsafeClassToggle: unsafeClassToggle, 
    unsafeClassRemove: unsafeClassRemove, 
    unsafeClassAdd: unsafeClassAdd, 
    unsafeContentWindow: unsafeContentWindow, 
    unsafeSetValue: unsafeSetValue, 
    unsafeValue: unsafeValue, 
    unsafeSetTextContent: unsafeSetTextContent, 
    unsafeTextContent: unsafeTextContent, 
    unsafeSetInnerHTML: unsafeSetInnerHTML, 
    unsafeInnerHTML: unsafeInnerHTML, 
    unsafeAppendChild: unsafeAppendChild, 
    unsafeChildren: unsafeChildren, 
    unsafeSetStyleAttr: unsafeSetStyleAttr, 
    unsafeGetStyleAttr: unsafeGetStyleAttr, 
    unsafeRemoveAttribute: unsafeRemoveAttribute, 
    unsafeHasAttribute: unsafeHasAttribute, 
    unsafeSetAttribute: unsafeSetAttribute, 
    unsafeGetAttribute: unsafeGetAttribute, 
    unsafeQuerySelectorAll: unsafeQuerySelectorAll, 
    unsafeQuerySelector: unsafeQuerySelector, 
    unsafeGetElementsByName: unsafeGetElementsByName, 
    unsafeGetElementsByClassName: unsafeGetElementsByClassName, 
    unsafeGetElementById: unsafeGetElementById
};

},{"Control.Monad.Eff":39,"DOM":58,"Data.DOM.Simple.Types":65,"Prelude":127}],68:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");

  function ensure3(nothing) {
    return function(just) {
      return function(v) {
        if (v === undefined || v === null) {
          return nothing;
        } else {
          return just(v);
        }
      };
   };
  };

  function showImpl(v) {
    return function () {
      return v.toString();
    };
  };
var ensure = ensure3(Data_Maybe.Nothing.value)(Data_Maybe.Just.create);
module.exports = {
    showImpl: showImpl, 
    ensure: ensure, 
    ensure3: ensure3
};

},{"Data.Maybe":90,"Prelude":127}],69:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");

  function unsafeDocument(win) {
    return function () {
      return win.document;
    };
  };

  function unsafeNavigator(win) {
    return function () {
      return win.navigator;
    };
  };

  function unsafeLocation(win) {
    return function () {
      return win.location;
    };
  };

  function unsafeGetLocation(loc) {
    return function () {
      return loc;
    };
  };

  function unsafeSetLocation(value) {
    return function (loc) {
      return function () {
        location.assign(value);
      };
    };
  };

  function unsafeGetSearchLocation(loc) {
    return function () {
      return loc.search;
    };
  };

  function unsafeSetTimeout(win) {
    return function(delay) {
      return function(func) {
        return function() {
          return win.setTimeout(func, delay);
        };
      };
    };
  };

  function unsafeSetInterval(win) {
    return function(delay) {
      return function(func) {
        return function() {
          return win.setInterval(func, delay);
        };
      };
    };
  };

  function unsafeClearTimeout(win) {
    return function(timeout) {
      return function() {
        win.clearTimeout(timeout);
      };
    };
  };

  function unsafeInnerWidth(win) {
    return function() {
      return win.innerWidth;
    };
  };

  function unsafeInnerHeight(win) {
    return function() {
      return win.innerHeight;
    };
  };
module.exports = {
    unsafeInnerHeight: unsafeInnerHeight, 
    unsafeInnerWidth: unsafeInnerWidth, 
    unsafeClearTimeout: unsafeClearTimeout, 
    unsafeSetInterval: unsafeSetInterval, 
    unsafeSetTimeout: unsafeSetTimeout, 
    unsafeGetSearchLocation: unsafeGetSearchLocation, 
    unsafeSetLocation: unsafeSetLocation, 
    unsafeGetLocation: unsafeGetLocation, 
    unsafeLocation: unsafeLocation, 
    unsafeNavigator: unsafeNavigator, 
    unsafeDocument: unsafeDocument
};

},{"Control.Monad.Eff":39,"DOM":58,"Data.DOM.Simple.Types":65,"Prelude":127}],70:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Data_DOM_Simple_Unsafe_Window = require("Data.DOM.Simple.Unsafe.Window");
var Prelude = require("Prelude");
var Data_String = require("Data.String");
var Data_Array = require("Data.Array");
var DOM = require("DOM");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_Maybe = require("Data.Maybe");
var globalWindow = window;;
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
            if (value.length === 2 && value[0] === key) {
                return new Data_Maybe.Just(value[1]);
            };
            return Data_Maybe.Nothing.value;
        };
        var sanitizedInput = (function () {
            var _1774 = Data_String.indexOf("?")(input) === 0;
            if (_1774) {
                return Data_String.drop(1)(input);
            };
            if (!_1774) {
                return input;
            };
            throw new Error("Failed pattern match");
        })();
        var kv = Data_Array.map(Data_String.split("="))(Data_String.split("&")(sanitizedInput));
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
    globalWindow: globalWindow, 
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
    domLocation: domLocation
};

},{"Control.Monad.Eff":39,"DOM":58,"Data.Array":61,"Data.DOM.Simple.Types":65,"Data.DOM.Simple.Unsafe.Window":69,"Data.Maybe":90,"Data.String":105,"Prelude":127}],71:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Data_Date = require("Data.Date");
var Data_Function = require("Data.Function");
var Data_Enum = require("Data.Enum");
var Prelude = require("Prelude");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var Data_Int = require("Data.Int");
var Data_Maybe = require("Data.Maybe");
var Data_Time = require("Data.Time");

  function dateMethod(method, date) {
    return date[method]();
  }
  ;

  function jsDateFromValues(y, mo, d, h, mi, s, ms) {
    return new Date(Date.UTC(y, mo, d, h, mi, s, ms));
  }
  ;

/**
 *  | Gets the UTC year component for a date.
 */
var year = function (d) {
    return dateMethod("getUTCFullYear", d);
};

/**
 *  | Get the UTC second-of-minute value for a date.
 */
var secondOfMinute = function (d) {
    return dateMethod("getUTCSeconds", d);
};

/**
 *  | Gets the UTC month component for a date.
 */
var month = function (d) {
    return Data_Maybe_Unsafe.fromJust(Data_Enum.toEnum(Data_Date.enumMonth)(dateMethod("getUTCMonth", d)));
};

/**
 *  | Gets the UTC minute-of-hour value for a date.
 */
var minuteOfHour = function (d) {
    return dateMethod("getUTCMinutes", d);
};

/**
 *  | Get the UTC millisecond-of-second value for a date.
 */
var millisecondOfSecond = function (d) {
    return dateMethod("getUTCMilliseconds", d);
};

/**
 *  | Gets the UTC hour-of-day value for a date.
 */
var hourOfDay = function (d) {
    return dateMethod("getUTCHours", d);
};

/**
 *  | Gets the UTC day-of-week value for a date.
 */
var dayOfWeek = function (d) {
    return Data_Maybe_Unsafe.fromJust(Data_Enum.toEnum(Data_Date.enumDayOfWeek)(dateMethod("getUTCDay", d)));
};

/**
 *  | Gets the UTC day-of-month value for a date.
 */
var dayOfMonth = function (d) {
    return dateMethod("getUTCDate", d);
};

/**
 *  | Attempts to create a `Date` from UTC date and time components. `Nothing`
 *  | is returned if the resulting date is invalid.
 */
var dateTime = function (y) {
    return function (mo) {
        return function (d) {
            return function (h) {
                return function (mi) {
                    return function (s) {
                        return function (ms) {
                            return Data_Date.fromJSDate(jsDateFromValues(y, Data_Enum.fromEnum(Data_Date.enumMonth)(mo), d, h, mi, s, ms));
                        };
                    };
                };
            };
        };
    };
};

/**
 *  | Attempts to create a `Date` from UTC date components. `Nothing` is
 *  | returned if the resulting date is invalid.
 */
var date = function (y) {
    return function (m) {
        return function (d) {
            return dateTime(y)(m)(d)(Prelude.zero(Data_Int.semiringInt))(Prelude.zero(Data_Int.semiringInt))(Prelude.zero(Data_Int.semiringInt))(Prelude.zero(Data_Int.semiringInt));
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

},{"Data.Date":72,"Data.Enum":74,"Data.Function":83,"Data.Int":86,"Data.Maybe":90,"Data.Maybe.Unsafe":89,"Data.Time":106,"Prelude":127}],72:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Global = require("Global");
var Data_Function = require("Data.Function");
var Data_Enum = require("Data.Enum");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_Int = require("Data.Int");
var Data_Maybe = require("Data.Maybe");
var Data_Time = require("Data.Time");

  function nowEpochMilliseconds() {
    return Date.now();
  }
  ;

  function nowImpl(ctor) {
    return function(){
      return ctor(new Date());
    };
  }
  ;

  function jsDateConstructor(x) {
    return new Date(x);
  }
  ;

  function jsDateMethod(method, date) {
    return date[method]();
  }
  ;

  function strictJsDate(Just, Nothing, s) {
    var epoch = Date.parse(s);
    if (isNaN(epoch)) return Nothing;
    var date = new Date(epoch);
    var s2 = date.toISOString();
    var idx = s2.indexOf(s);
    if (idx < 0) return Nothing;
    else return Just(date);
  }
  ;

/**
 *  | A year date component value.
 */
var Year = function (x) {
    return x;
};

/**
 *  | A month date component value.
 */
var January = (function () {
    function January() {

    };
    January.value = new January();
    return January;
})();

/**
 *  | A month date component value.
 */
var February = (function () {
    function February() {

    };
    February.value = new February();
    return February;
})();

/**
 *  | A month date component value.
 */
var March = (function () {
    function March() {

    };
    March.value = new March();
    return March;
})();

/**
 *  | A month date component value.
 */
var April = (function () {
    function April() {

    };
    April.value = new April();
    return April;
})();

/**
 *  | A month date component value.
 */
var May = (function () {
    function May() {

    };
    May.value = new May();
    return May;
})();

/**
 *  | A month date component value.
 */
var June = (function () {
    function June() {

    };
    June.value = new June();
    return June;
})();

/**
 *  | A month date component value.
 */
var July = (function () {
    function July() {

    };
    July.value = new July();
    return July;
})();

/**
 *  | A month date component value.
 */
var August = (function () {
    function August() {

    };
    August.value = new August();
    return August;
})();

/**
 *  | A month date component value.
 */
var September = (function () {
    function September() {

    };
    September.value = new September();
    return September;
})();

/**
 *  | A month date component value.
 */
var October = (function () {
    function October() {

    };
    October.value = new October();
    return October;
})();

/**
 *  | A month date component value.
 */
var November = (function () {
    function November() {

    };
    November.value = new November();
    return November;
})();

/**
 *  | A month date component value.
 */
var December = (function () {
    function December() {

    };
    December.value = new December();
    return December;
})();

/**
 *  | A timezone locale offset, measured in minutes.
 */
var LocaleOffset = function (x) {
    return x;
};

/**
 *  | A day-of-week date component value.
 */
var Sunday = (function () {
    function Sunday() {

    };
    Sunday.value = new Sunday();
    return Sunday;
})();

/**
 *  | A day-of-week date component value.
 */
var Monday = (function () {
    function Monday() {

    };
    Monday.value = new Monday();
    return Monday;
})();

/**
 *  | A day-of-week date component value.
 */
var Tuesday = (function () {
    function Tuesday() {

    };
    Tuesday.value = new Tuesday();
    return Tuesday;
})();

/**
 *  | A day-of-week date component value.
 */
var Wednesday = (function () {
    function Wednesday() {

    };
    Wednesday.value = new Wednesday();
    return Wednesday;
})();

/**
 *  | A day-of-week date component value.
 */
var Thursday = (function () {
    function Thursday() {

    };
    Thursday.value = new Thursday();
    return Thursday;
})();

/**
 *  | A day-of-week date component value.
 */
var Friday = (function () {
    function Friday() {

    };
    Friday.value = new Friday();
    return Friday;
})();

/**
 *  | A day-of-week date component value.
 */
var Saturday = (function () {
    function Saturday() {

    };
    Saturday.value = new Saturday();
    return Saturday;
})();

/**
 *  | A day-of-month date component value.
 */
var DayOfMonth = function (x) {
    return x;
};

/**
 *  | A combined date/time value. `Date`s cannot be constructed directly to
 *  | ensure they are not the `Invalid Date` value, and instead must be created
 *  | via `fromJSDate`, `fromEpochMilliseconds`, `fromString`, etc. or the `date`
 *  | and `dateTime` functions in the `Data.Date.Locale` and `Data.Date.UTC`
 *  | modules.
 */
var DateTime = function (x) {
    return x;
};

/**
 *  | Extracts a `JSDate` from a `Date`.
 */
var toJSDate = function (_131) {
    return _131;
};

/**
 *  | Gets the number of milliseconds elapsed since 1st January 1970 00:00:00
 *  | UTC for a `Date`.
 */
var toEpochMilliseconds = function (_132) {
    return jsDateMethod("getTime", _132);
};

/**
 *  | Get the locale time offset for a `Date`.
 */
var timezoneOffset = function (_133) {
    return jsDateMethod("getTimezoneOffset", _133);
};
var showYear = new Prelude.Show(function (_150) {
    return "(Year " + (Prelude.show(Data_Int.showInt)(_150) + ")");
});
var showMonth = new Prelude.Show(function (_153) {
    if (_153 instanceof January) {
        return "January";
    };
    if (_153 instanceof February) {
        return "February";
    };
    if (_153 instanceof March) {
        return "March";
    };
    if (_153 instanceof April) {
        return "April";
    };
    if (_153 instanceof May) {
        return "May";
    };
    if (_153 instanceof June) {
        return "June";
    };
    if (_153 instanceof July) {
        return "July";
    };
    if (_153 instanceof August) {
        return "August";
    };
    if (_153 instanceof September) {
        return "September";
    };
    if (_153 instanceof October) {
        return "October";
    };
    if (_153 instanceof November) {
        return "November";
    };
    if (_153 instanceof December) {
        return "December";
    };
    throw new Error("Failed pattern match");
});
var showDayOfWeek = new Prelude.Show(function (_162) {
    if (_162 instanceof Sunday) {
        return "Sunday";
    };
    if (_162 instanceof Monday) {
        return "Monday";
    };
    if (_162 instanceof Tuesday) {
        return "Tuesday";
    };
    if (_162 instanceof Wednesday) {
        return "Wednesday";
    };
    if (_162 instanceof Thursday) {
        return "Thursday";
    };
    if (_162 instanceof Friday) {
        return "Friday";
    };
    if (_162 instanceof Saturday) {
        return "Saturday";
    };
    throw new Error("Failed pattern match");
});
var showDate = new Prelude.Show(function (d) {
    return "(fromEpochMilliseconds " + (Prelude.show(Data_Time.showMilliseconds)(toEpochMilliseconds(d)) + ")");
});
var semiringYear = new Prelude.Semiring(function (_146) {
    return function (_147) {
        return Prelude["*"](Data_Int.semiringInt)(_146)(_147);
    };
}, function (_144) {
    return function (_145) {
        return Prelude["+"](Data_Int.semiringInt)(_144)(_145);
    };
}, Prelude.one(Data_Int.semiringInt), Prelude.zero(Data_Int.semiringInt));
var ringYear = new Prelude.Ring(function (_148) {
    return function (_149) {
        return Prelude["-"](Data_Int.ringInt)(_148)(_149);
    };
}, function () {
    return semiringYear;
});

/**
 *  | Gets a `Date` value for the current date/time according to the current
 *  | machine’s local time.
 */
var now = nowImpl(DateTime);
var monthToEnum = function (_134) {
    if (_134 === 0) {
        return new Data_Maybe.Just(January.value);
    };
    if (_134 === 1) {
        return new Data_Maybe.Just(February.value);
    };
    if (_134 === 2) {
        return new Data_Maybe.Just(March.value);
    };
    if (_134 === 3) {
        return new Data_Maybe.Just(April.value);
    };
    if (_134 === 4) {
        return new Data_Maybe.Just(May.value);
    };
    if (_134 === 5) {
        return new Data_Maybe.Just(June.value);
    };
    if (_134 === 6) {
        return new Data_Maybe.Just(July.value);
    };
    if (_134 === 7) {
        return new Data_Maybe.Just(August.value);
    };
    if (_134 === 8) {
        return new Data_Maybe.Just(September.value);
    };
    if (_134 === 9) {
        return new Data_Maybe.Just(October.value);
    };
    if (_134 === 10) {
        return new Data_Maybe.Just(November.value);
    };
    if (_134 === 11) {
        return new Data_Maybe.Just(December.value);
    };
    return Data_Maybe.Nothing.value;
};
var monthFromEnum = function (_135) {
    if (_135 instanceof January) {
        return 0;
    };
    if (_135 instanceof February) {
        return 1;
    };
    if (_135 instanceof March) {
        return 2;
    };
    if (_135 instanceof April) {
        return 3;
    };
    if (_135 instanceof May) {
        return 4;
    };
    if (_135 instanceof June) {
        return 5;
    };
    if (_135 instanceof July) {
        return 6;
    };
    if (_135 instanceof August) {
        return 7;
    };
    if (_135 instanceof September) {
        return 8;
    };
    if (_135 instanceof October) {
        return 9;
    };
    if (_135 instanceof November) {
        return 10;
    };
    if (_135 instanceof December) {
        return 11;
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Attempts to create a `Date` from a `JSDate`. If the `JSDate` is an invalid
 *  | date `Nothing` is returned.
 */
var fromJSDate = function (d) {
    var _334 = Global.isNaN(jsDateMethod("getTime", d));
    if (_334) {
        return Data_Maybe.Nothing.value;
    };
    if (!_334) {
        return new Data_Maybe.Just(d);
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Attempts to construct a date from a string value using JavaScript’s
 *  | [Date.parse() method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *  | `Nothing` is returned if the parse fails or the resulting date is invalid.
 */
var fromString = Prelude["<<<"](Prelude.semigroupoidArr)(fromJSDate)(jsDateConstructor);

/**
 *  | Attempts to construct a date from a simplified extended ISO 8601 format
 *  | (`YYYY-MM-DDTHH:mm:ss.sssZ`). `Nothing` is returned if the format is not
 *  | an exact match or the resulting date is invalid.
 */
var fromStringStrict = function (s) {
    return Prelude[">>="](Data_Maybe.bindMaybe)(strictJsDate(Data_Maybe.Just.create, Data_Maybe.Nothing.value, s))(fromJSDate);
};

/**
 *  | Creates a `Date` value from a number of milliseconds elapsed since 1st
 *  | January 1970 00:00:00 UTC.
 */
var fromEpochMilliseconds = Prelude["<<<"](Prelude.semigroupoidArr)(fromJSDate)(jsDateConstructor);
var eqYear = new Prelude.Eq(function (_140) {
    return function (_141) {
        return Prelude["/="](Data_Int.eqInt)(_140)(_141);
    };
}, function (_138) {
    return function (_139) {
        return Prelude["=="](Data_Int.eqInt)(_138)(_139);
    };
});
var ordYear = new Prelude.Ord(function () {
    return eqYear;
}, function (_142) {
    return function (_143) {
        return Prelude.compare(Data_Int.ordInt)(_142)(_143);
    };
});
var eqMonth = new Prelude.Eq(function (a) {
    return function (b) {
        return !Prelude["=="](eqMonth)(a)(b);
    };
}, function (_151) {
    return function (_152) {
        if (_151 instanceof January && _152 instanceof January) {
            return true;
        };
        if (_151 instanceof February && _152 instanceof February) {
            return true;
        };
        if (_151 instanceof March && _152 instanceof March) {
            return true;
        };
        if (_151 instanceof April && _152 instanceof April) {
            return true;
        };
        if (_151 instanceof May && _152 instanceof May) {
            return true;
        };
        if (_151 instanceof June && _152 instanceof June) {
            return true;
        };
        if (_151 instanceof July && _152 instanceof July) {
            return true;
        };
        if (_151 instanceof August && _152 instanceof August) {
            return true;
        };
        if (_151 instanceof September && _152 instanceof September) {
            return true;
        };
        if (_151 instanceof October && _152 instanceof October) {
            return true;
        };
        if (_151 instanceof November && _152 instanceof November) {
            return true;
        };
        if (_151 instanceof December && _152 instanceof December) {
            return true;
        };
        return false;
    };
});
var eqDayOfWeek = new Prelude.Eq(function (a) {
    return function (b) {
        return !Prelude["=="](eqDayOfWeek)(a)(b);
    };
}, function (_160) {
    return function (_161) {
        if (_160 instanceof Sunday && _161 instanceof Sunday) {
            return true;
        };
        if (_160 instanceof Monday && _161 instanceof Monday) {
            return true;
        };
        if (_160 instanceof Tuesday && _161 instanceof Tuesday) {
            return true;
        };
        if (_160 instanceof Wednesday && _161 instanceof Wednesday) {
            return true;
        };
        if (_160 instanceof Thursday && _161 instanceof Thursday) {
            return true;
        };
        if (_160 instanceof Friday && _161 instanceof Friday) {
            return true;
        };
        if (_160 instanceof Saturday && _161 instanceof Saturday) {
            return true;
        };
        return false;
    };
});
var eqDayOfMonth = new Prelude.Eq(function (_156) {
    return function (_157) {
        return Prelude["/="](Data_Int.eqInt)(_156)(_157);
    };
}, function (_154) {
    return function (_155) {
        return Prelude["=="](Data_Int.eqInt)(_154)(_155);
    };
});
var ordDayOfMonth = new Prelude.Ord(function () {
    return eqDayOfMonth;
}, function (_158) {
    return function (_159) {
        return Prelude.compare(Data_Int.ordInt)(_158)(_159);
    };
});
var eqDate = new Prelude.Eq(Data_Function.on(Prelude["/="](Data_Time.eqMilliseconds))(toEpochMilliseconds), Data_Function.on(Prelude["=="](Data_Time.eqMilliseconds))(toEpochMilliseconds));
var ordDate = new Prelude.Ord(function () {
    return eqDate;
}, Data_Function.on(Prelude.compare(Data_Time.ordMilliseconds))(toEpochMilliseconds));
var enumMonth = new Data_Enum.Enum(function () {
    return ordMonth;
}, 12, January.value, monthFromEnum, December.value, Data_Enum.defaultPred(monthToEnum)(monthFromEnum), Data_Enum.defaultSucc(monthToEnum)(monthFromEnum), monthToEnum);
var ordMonth = new Prelude.Ord(function () {
    return eqMonth;
}, Data_Function.on(Prelude.compare(Prelude.ordNumber))(Data_Enum.fromEnum(enumMonth)));
var dayOfWeekToEnum = function (_136) {
    if (_136 === 0) {
        return new Data_Maybe.Just(Sunday.value);
    };
    if (_136 === 1) {
        return new Data_Maybe.Just(Monday.value);
    };
    if (_136 === 2) {
        return new Data_Maybe.Just(Tuesday.value);
    };
    if (_136 === 3) {
        return new Data_Maybe.Just(Wednesday.value);
    };
    if (_136 === 4) {
        return new Data_Maybe.Just(Thursday.value);
    };
    if (_136 === 5) {
        return new Data_Maybe.Just(Friday.value);
    };
    if (_136 === 6) {
        return new Data_Maybe.Just(Saturday.value);
    };
    return Data_Maybe.Nothing.value;
};
var dayOfWeekFromEnum = function (_137) {
    if (_137 instanceof Sunday) {
        return 0;
    };
    if (_137 instanceof Monday) {
        return 1;
    };
    if (_137 instanceof Tuesday) {
        return 2;
    };
    if (_137 instanceof Wednesday) {
        return 3;
    };
    if (_137 instanceof Thursday) {
        return 4;
    };
    if (_137 instanceof Friday) {
        return 5;
    };
    if (_137 instanceof Saturday) {
        return 6;
    };
    throw new Error("Failed pattern match");
};
var enumDayOfWeek = new Data_Enum.Enum(function () {
    return ordDayOfWeek;
}, 7, Sunday.value, dayOfWeekFromEnum, Saturday.value, Data_Enum.defaultPred(dayOfWeekToEnum)(dayOfWeekFromEnum), Data_Enum.defaultSucc(dayOfWeekToEnum)(dayOfWeekFromEnum), dayOfWeekToEnum);
var ordDayOfWeek = new Prelude.Ord(function () {
    return eqDayOfWeek;
}, Data_Function.on(Prelude.compare(Prelude.ordNumber))(Data_Enum.fromEnum(enumDayOfWeek)));
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
    nowEpochMilliseconds: nowEpochMilliseconds, 
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
    showMonth: showMonth, 
    enumMonth: enumMonth, 
    eqDayOfMonth: eqDayOfMonth, 
    ordDayOfMonth: ordDayOfMonth, 
    eqDayOfWeek: eqDayOfWeek, 
    ordDayOfWeek: ordDayOfWeek, 
    showDayOfWeek: showDayOfWeek, 
    enumDayOfWeek: enumDayOfWeek
};

},{"Control.Monad.Eff":39,"Data.Enum":74,"Data.Function":83,"Data.Int":86,"Data.Maybe":90,"Data.Time":106,"Global":112,"Prelude":127}],73:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Extend = require("Control.Extend");

/**
 *  | The `Either` type is used to represent a choice between two types of value.
 *  |
 *  | A common use case for `Either` is error handling, where `Left` is used to
 *  | carry an error value and `Right` is used to carry a success value.
 */
var Left = (function () {
    function Left(value0) {
        this.value0 = value0;
    };
    Left.create = function (value0) {
        return new Left(value0);
    };
    return Left;
})();

/**
 *  | The `Either` type is used to represent a choice between two types of value.
 *  |
 *  | A common use case for `Either` is error handling, where `Left` is used to
 *  | carry an error value and `Right` is used to carry a success value.
 */
var Right = (function () {
    function Right(value0) {
        this.value0 = value0;
    };
    Right.create = function (value0) {
        return new Right(value0);
    };
    return Right;
})();

/**
 *  | The `Show` instance allows `Either` values to be rendered as a string with
 *  | `show` whenever there is an `Show` instance for both type the `Either` can
 *  | contain.
 */
var showEither = function (__dict_Show_0) {
    return function (__dict_Show_1) {
        return new Prelude.Show(function (_140) {
            if (_140 instanceof Left) {
                return "Left (" + (Prelude.show(__dict_Show_0)(_140.value0) + ")");
            };
            if (_140 instanceof Right) {
                return "Right (" + (Prelude.show(__dict_Show_1)(_140.value0) + ")");
            };
            throw new Error("Failed pattern match");
        });
    };
};

/**
 *  | The `Functor` instance allows functions to transform the contents of a
 *  | `Right` with the `<$>` operator:
 *  |
 *  | ``` purescript
 *  | f <$> Right x == Right (f x)
 *  | ```
 *  |
 *  | `Left` values are untouched:
 *  |
 *  | ``` purescript
 *  | f <$> Left y == Left y
 *  | ```
 */
var functorEither = new Prelude.Functor(function (f) {
    return function (_138) {
        if (_138 instanceof Left) {
            return new Left(_138.value0);
        };
        if (_138 instanceof Right) {
            return new Right(f(_138.value0));
        };
        throw new Error("Failed pattern match");
    };
});

/**
 *  | The `Extend` instance allows sequencing of `Either` values and functions
 *  | that accept an `Either` and return a non-`Either` result using the
 *  | `<<=` operator.
 *  |
 *  | ``` purescript
 *  | f <<= Left x = Left x
 *  | f <<= Right x = Right (f x)
 *  | ```
 */
var extendEither = new Control_Extend.Extend(function (f) {
    return function (x) {
        if (x instanceof Left) {
            return new Left(x.value0);
        };
        return new Right(f(x));
    };
}, function () {
    return functorEither;
});

/**
 *  | The `Eq` instance allows `Either` values to be checked for equality with
 *  | `==` and inequality with `/=` whenever there is an `Eq` instance for both
 *  | types the `Either` can contain.
 */
var eqEither = function (__dict_Eq_4) {
    return function (__dict_Eq_5) {
        return new Prelude.Eq(function (a) {
            return function (b) {
                return !Prelude["=="](eqEither(__dict_Eq_4)(__dict_Eq_5))(a)(b);
            };
        }, function (_141) {
            return function (_142) {
                if (_141 instanceof Left && _142 instanceof Left) {
                    return Prelude["=="](__dict_Eq_4)(_141.value0)(_142.value0);
                };
                if (_141 instanceof Right && _142 instanceof Right) {
                    return Prelude["=="](__dict_Eq_5)(_141.value0)(_142.value0);
                };
                return false;
            };
        });
    };
};

/**
 *  | The `Ord` instance allows `Either` values to be compared with
 *  | `compare`, `>`, `>=`, `<` and `<=` whenever there is an `Ord` instance for
 *  | both types the `Either` can contain.
 *  |
 *  | Any `Left` value is considered to be less than a `Right` value.
 */
var ordEither = function (__dict_Ord_2) {
    return function (__dict_Ord_3) {
        return new Prelude.Ord(function () {
            return eqEither(__dict_Ord_2["__superclass_Prelude.Eq_0"]())(__dict_Ord_3["__superclass_Prelude.Eq_0"]());
        }, function (_143) {
            return function (_144) {
                if (_143 instanceof Left && _144 instanceof Left) {
                    return Prelude.compare(__dict_Ord_2)(_143.value0)(_144.value0);
                };
                if (_143 instanceof Right && _144 instanceof Right) {
                    return Prelude.compare(__dict_Ord_3)(_143.value0)(_144.value0);
                };
                if (_143 instanceof Left) {
                    return Prelude.LT.value;
                };
                if (_144 instanceof Left) {
                    return Prelude.GT.value;
                };
                throw new Error("Failed pattern match");
            };
        });
    };
};

/**
 *  | Takes two functions and an `Either` value, if the value is a `Left` the
 *  | inner value is applied to the first function, if the value is a `Right`
 *  | the inner value is applied to the second function.
 *  |
 *  | ``` purescript
 *  | either f g (Left x) == f x
 *  | either f g (Right y) == g y
 *  | ```
 */
var either = function (f) {
    return function (g) {
        return function (_137) {
            if (_137 instanceof Left) {
                return f(_137.value0);
            };
            if (_137 instanceof Right) {
                return g(_137.value0);
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Returns `true` when the `Either` value was constructed with `Left`.
 */
var isLeft = either(Prelude["const"](true))(Prelude["const"](false));

/**
 *  | Returns `true` when the `Either` value was constructed with `Right`.
 */
var isRight = either(Prelude["const"](false))(Prelude["const"](true));

/**
 *  | The `Apply` instance allows functions contained within a `Right` to
 *  | transform a value contained within a `Right` using the `(<*>)` operator:
 *  |
 *  | ``` purescript
 *  | Right f <*> Right x == Right (f x)
 *  | ```
 *  |
 *  | `Left` values are left untouched:
 *  |
 *  | ``` purescript
 *  | Left f <*> Right x == Left x
 *  | Right f <*> Left y == Left y
 *  | ```
 *  |
 *  | Combining `Functor`'s `<$>` with `Apply`'s `<*>` can be used transform a
 *  | pure function to take `Either`-typed arguments so `f :: a -> b -> c`
 *  | becomes `f :: Either l a -> Either l b -> Either l c`:
 *  |
 *  | ``` purescript
 *  | f <$> Right x <*> Right y == Right (f x y)
 *  | ```
 *  |
 *  | The `Left`-preserving behaviour of both operators means the result of
 *  | an expression like the above but where any one of the values is `Left`
 *  | means the whole result becomes `Left` also, taking the first `Left` value
 *  | found:
 *  |
 *  | ``` purescript
 *  | f <$> Left x <*> Right y == Left x
 *  | f <$> Right x <*> Left y == Left y
 *  | f <$> Left x <*> Left y == Left x
 *  | ```
 */
var applyEither = new Prelude.Apply(function (_139) {
    return function (r) {
        if (_139 instanceof Left) {
            return new Left(_139.value0);
        };
        if (_139 instanceof Right) {
            return Prelude["<$>"](functorEither)(_139.value0)(r);
        };
        throw new Error("Failed pattern match");
    };
}, function () {
    return functorEither;
});

/**
 *  | The `Bind` instance allows sequencing of `Either` values and functions that
 *  | return an `Either` by using the `>>=` operator:
 *  |
 *  | ``` purescript
 *  | Left x >>= f = Left x
 *  | Right x >>= f = f x
 *  | ```
 */
var bindEither = new Prelude.Bind(either(function (e) {
    return function (_136) {
        return new Left(e);
    };
})(function (a) {
    return function (f) {
        return f(a);
    };
}), function () {
    return applyEither;
});

/**
 *  | The `Applicative` instance enables lifting of values into `Either` with the
 *  | `pure` or `return` function (`return` is an alias for `pure`):
 *  |
 *  | ``` purescript
 *  | pure x :: Either _ _ == Right x
 *  | return x :: Either _ _ == Right x
 *  | ```
 *  |
 *  | Combining `Functor`'s `<$>` with `Apply`'s `<*>` and `Applicative`'s
 *  | `pure` can be used to pass a mixture of `Either` and non-`Either` typed
 *  | values to a function that does not usually expect them, by using `pure`
 *  | for any value that is not already `Either` typed:
 *  |
 *  | ``` purescript
 *  | f <$> Right x <*> pure y == Right (f x y)
 *  | ```
 *  |
 *  | Even though `pure = Right` it is recommended to use `pure` in situations
 *  | like this as it allows the choice of `Applicative` to be changed later
 *  | without having to go through and replace `Right` with a new constructor.
 */
var applicativeEither = new Prelude.Applicative(function () {
    return applyEither;
}, Right.create);

/**
 *  | The `Monad` instance guarantees that there are both `Applicative` and
 *  | `Bind` instances for `Either`. This also enables the `do` syntactic sugar:
 *  |
 *  | ``` purescript
 *  | do
 *  |   x' <- x
 *  |   y' <- y
 *  |   pure (f x' y')
 *  | ```
 *  |
 *  | Which is equivalent to:
 *  |
 *  | ``` purescript
 *  | x >>= (\x' -> y >>= (\y' -> pure (f x' y')))
 *  | ```
 */
var monadEither = new Prelude.Monad(function () {
    return applicativeEither;
}, function () {
    return bindEither;
});

/**
 *  | The `Alt` instance allows for a choice to be made between two `Either`
 *  | values with the `<|>` operator, where the first `Right` encountered
 *  | is taken.
 *  |
 *  | ``` purescript
 *  | Right x <|> Right y == Right x
 *  | Left x <|> Right y == Right y
 *  | Left x <|> Left y == Left y
 *  | ```
 */
var altEither = new Control_Alt.Alt(function (l) {
    return function (r) {
        if (l instanceof Left) {
            return r;
        };
        return l;
    };
}, function () {
    return functorEither;
});
module.exports = {
    Left: Left, 
    Right: Right, 
    isRight: isRight, 
    isLeft: isLeft, 
    either: either, 
    functorEither: functorEither, 
    applyEither: applyEither, 
    applicativeEither: applicativeEither, 
    altEither: altEither, 
    bindEither: bindEither, 
    monadEither: monadEither, 
    extendEither: extendEither, 
    showEither: showEither, 
    eqEither: eqEither, 
    ordEither: ordEither
};

},{"Control.Alt":26,"Control.Extend":31,"Prelude":127}],74:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Maybe_Unsafe = require("Data.Maybe.Unsafe");
var Data_Unfoldable = require("Data.Unfoldable");
var Data_Char = require("Data.Char");
var Data_Either = require("Data.Either");
var Data_Tuple = require("Data.Tuple");
var Data_Array = require("Data.Array");
function floor(n){ return Math.floor(n); };
var Cardinality = function (x) {
    return x;
};

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var Enum = function (__superclass_Prelude$dotOrd_0, cardinality, firstEnum, fromEnum, lastEnum, pred, succ, toEnum) {
    this["__superclass_Prelude.Ord_0"] = __superclass_Prelude$dotOrd_0;
    this.cardinality = cardinality;
    this.firstEnum = firstEnum;
    this.fromEnum = fromEnum;
    this.lastEnum = lastEnum;
    this.pred = pred;
    this.succ = succ;
    this.toEnum = toEnum;
};

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var toEnum = function (dict) {
    return dict.toEnum;
};

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var succ = function (dict) {
    return dict.succ;
};
var runCardinality = function (_119) {
    return _119;
};
var tupleCardinality = function (__dict_Enum_0) {
    return function (__dict_Enum_1) {
        return function (l) {
            return function (r) {
                return Cardinality(runCardinality(l) * runCardinality(r));
            };
        };
    };
};

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var pred = function (dict) {
    return dict.pred;
};
var maybeCardinality = function (__dict_Enum_2) {
    return function (c) {
        return Cardinality(1 + runCardinality(c));
    };
};
var maybeToEnum = function (__dict_Enum_3) {
    return function (carda) {
        return function (n) {
            if (n <= runCardinality(maybeCardinality(__dict_Enum_3)(carda))) {
                var _284 = n === 0;
                if (_284) {
                    return Data_Maybe.Just.create(Data_Maybe.Nothing.value);
                };
                if (!_284) {
                    return Data_Maybe.Just.create(toEnum(__dict_Enum_3)(n - 1));
                };
                throw new Error("Failed pattern match");
            };
            return Data_Maybe.Nothing.value;
        };
    };
};

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var lastEnum = function (dict) {
    return dict.lastEnum;
};

/**
 *  | Property: ```forall e in intStepFromTo step a b: a <= e <= b```
 */
var intStepFromTo = function (step) {
    return function (from) {
        return function (to) {
            return Data_Unfoldable.unfoldr(Data_Unfoldable.unfoldableArray)(function (e) {
                var _285 = e <= to;
                if (_285) {
                    return Data_Maybe.Just.create(new Data_Tuple.Tuple(e, e + step));
                };
                if (!_285) {
                    return Data_Maybe.Nothing.value;
                };
                throw new Error("Failed pattern match");
            })(from);
        };
    };
};

/**
 *  | Property: ```forall e in intFromTo a b: a <= e <= b```
 */
var intFromTo = intStepFromTo(1);

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var fromEnum = function (dict) {
    return dict.fromEnum;
};
var tupleFromEnum = function (__dict_Enum_4) {
    return function (__dict_Enum_5) {
        return function (cardb) {
            return function (_122) {
                return fromEnum(__dict_Enum_4)(_122.value0) * runCardinality(cardb) + fromEnum(__dict_Enum_5)(_122.value1);
            };
        };
    };
};

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var firstEnum = function (dict) {
    return dict.firstEnum;
};

/**
 *  | Property: ```fromEnum a = a', fromEnum b = b' => forall e', a' <= e' <= b': Exists e: toEnum e' = Just e```
 *  |
 *  | Following from the propery of `intFromTo`, we are sure all elements in `intFromTo (fromEnum a) (fromEnum b)` are `Just`s.
 */
var enumFromTo = function (__dict_Enum_6) {
    return function (a) {
        return function (b) {
            var b$prime = fromEnum(__dict_Enum_6)(b);
            var a$prime = fromEnum(__dict_Enum_6)(a);
            return Prelude["<$>"](Data_Array.functorArray)(Prelude[">>>"](Prelude.semigroupoidArr)(toEnum(__dict_Enum_6))(Data_Maybe_Unsafe.fromJust))(intFromTo(a$prime)(b$prime));
        };
    };
};

/**
 *  | `[a,b..c]`
 *  | 
 *  | Correctness for using `fromJust` is the same as for `enumFromTo`.
 */
var enumFromThenTo = function (__dict_Enum_7) {
    return function (a) {
        return function (b) {
            return function (c) {
                var c$prime = fromEnum(__dict_Enum_7)(c);
                var b$prime = fromEnum(__dict_Enum_7)(b);
                var a$prime = fromEnum(__dict_Enum_7)(a);
                return Prelude["<$>"](Data_Array.functorArray)(Prelude[">>>"](Prelude.semigroupoidArr)(toEnum(__dict_Enum_7))(Data_Maybe_Unsafe.fromJust))(intStepFromTo(b$prime - a$prime)(a$prime)(c$prime));
            };
        };
    };
};
var eitherFromEnum = function (__dict_Enum_8) {
    return function (__dict_Enum_9) {
        return function (carda) {
            return function (_123) {
                if (_123 instanceof Data_Either.Left) {
                    return fromEnum(__dict_Enum_8)(_123.value0);
                };
                if (_123 instanceof Data_Either.Right) {
                    return fromEnum(__dict_Enum_9)(_123.value0) + runCardinality(carda);
                };
                throw new Error("Failed pattern match");
            };
        };
    };
};
var eitherCardinality = function (__dict_Enum_10) {
    return function (__dict_Enum_11) {
        return function (l) {
            return function (r) {
                return Cardinality(runCardinality(l) + runCardinality(r));
            };
        };
    };
};
var eitherToEnum = function (__dict_Enum_12) {
    return function (__dict_Enum_13) {
        return function (carda) {
            return function (cardb) {
                return function (n) {
                    var _294 = n >= 0 && n < runCardinality(carda);
                    if (_294) {
                        return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Either.Left.create)(toEnum(__dict_Enum_12)(n));
                    };
                    if (!_294) {
                        var _295 = n >= runCardinality(carda) && n < runCardinality(eitherCardinality(__dict_Enum_12)(__dict_Enum_13)(carda)(cardb));
                        if (_295) {
                            return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Either.Right.create)(toEnum(__dict_Enum_13)(n - runCardinality(carda)));
                        };
                        if (!_295) {
                            return Data_Maybe.Nothing.value;
                        };
                        throw new Error("Failed pattern match");
                    };
                    throw new Error("Failed pattern match");
                };
            };
        };
    };
};
var div = function (a) {
    return function (b) {
        return floor(a / b);
    };
};

/**
 *  | All of these are as a workaround for `ScopedTypeVariables`. (not yet supported in Purescript)
 */
var tupleToEnum = function (__dict_Enum_14) {
    return function (__dict_Enum_15) {
        return function (cardb) {
            return function (n) {
                return Prelude["<*>"](Data_Maybe.applyMaybe)(Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Tuple.Tuple.create)(toEnum(__dict_Enum_14)(div(n)(runCardinality(cardb)))))(toEnum(__dict_Enum_15)(n % runCardinality(cardb)));
            };
        };
    };
};

/**
 *  | Runs in `O(n)` where `n` is `fromEnum a`
 *  |
 *  | ```defaultToEnum succ firstEnum = toEnum```
 */
var defaultToEnum = function (succ$prime) {
    return function (firstEnum$prime) {
        return function (n) {
            if (n < 0) {
                return Data_Maybe.Nothing.value;
            };
            if (n === 0) {
                return new Data_Maybe.Just(firstEnum$prime);
            };
            return Prelude[">>="](Data_Maybe.bindMaybe)(defaultToEnum(succ$prime)(firstEnum$prime)(n - 1))(succ$prime);
        };
    };
};

/**
 *  | ```defaultSucc toEnum fromEnum = succ```
 */
var defaultSucc = function (toEnum$prime) {
    return function (fromEnum$prime) {
        return function (a) {
            return toEnum$prime(fromEnum$prime(a) + 1);
        };
    };
};

/**
 *  | ```defaultPred toEnum fromEnum = pred```
 */
var defaultPred = function (toEnum$prime) {
    return function (fromEnum$prime) {
        return function (a) {
            return toEnum$prime(fromEnum$prime(a) - 1);
        };
    };
};

/**
 *  | Runs in `O(n)` where `n` is `fromEnum a`
 *  |
 *  | ```defaultFromEnum pred = fromEnum```
 */
var defaultFromEnum = function (pred$prime) {
    return function (e) {
        return Data_Maybe.maybe(0)(function (prd) {
            return defaultFromEnum(pred$prime)(prd) + 1;
        })(pred$prime(e));
    };
};

/**
 *  | To avoid a compiler bug - can't pass self-class functions, workaround: need to make a concrete function.
 */
var charToEnum = function (n) {
    if (n >= 0 && n <= 65535) {
        return Data_Maybe.Just.create(Data_Char.fromCharCode(n));
    };
    return Data_Maybe.Nothing.value;
};
var charFromEnum = Data_Char.toCharCode;

/**
 *  | ## Instances
 */
var enumChar = new Enum(function () {
    return Data_Char.ordChar;
}, 65535 + 1, Data_Char.fromCharCode(0), charFromEnum, Data_Char.fromCharCode(65535), defaultPred(charToEnum)(charFromEnum), defaultSucc(charToEnum)(charFromEnum), charToEnum);

/**
 *  | Type class for enumerations. This should not be considered a part of a
 *  | numeric hierarchy, ala Haskell. Rather, this is a type class for small,
 *  | ordered sum types with statically-determined cardinality and the ability 
 *  | to easily compute successor and predecessor elements. e.g. `DayOfWeek`, etc.
 *  |
 *  | Laws:
 *  |
 *  | - ```succ firstEnum >>= succ >>= succ ... succ [cardinality - 1 times] == lastEnum```
 *  | - ```pred lastEnum  >>= pred >>= pred ... pred [cardinality - 1 times] == firstEnum```
 *  | - ```e1 `compare` e2 == fromEnum e1 `compare` fromEnum e2```
 *  | - ```forall a > firstEnum: pred a >>= succ == Just a```
 *  | - ```forall a < lastEnum:  succ a >>= pred == Just a```
 *  | - ```pred >=> succ >=> pred = pred```
 *  | - ```succ >=> pred >=> succ = succ```
 *  | - ```toEnum (fromEnum a) = Just a```
 *  | - ```forall a > firstEnum: fromEnum <$> pred a = Just (fromEnum a - 1)```
 *  | - ```forall a < lastEnum:  fromEnum <$> succ a = Just (fromEnum a + 1)```
 */
var cardinality = function (dict) {
    return dict.cardinality;
};
var enumEither = function (__dict_Enum_16) {
    return function (__dict_Enum_17) {
        return new Enum(function () {
            return Data_Either.ordEither(__dict_Enum_16["__superclass_Prelude.Ord_0"]())(__dict_Enum_17["__superclass_Prelude.Ord_0"]());
        }, eitherCardinality(__dict_Enum_16)(__dict_Enum_17)(cardinality(__dict_Enum_16))(cardinality(__dict_Enum_17)), new Data_Either.Left(firstEnum(__dict_Enum_16)), eitherFromEnum(__dict_Enum_16)(__dict_Enum_17)(cardinality(__dict_Enum_16)), new Data_Either.Right(lastEnum(__dict_Enum_17)), function (_130) {
            if (_130 instanceof Data_Either.Left) {
                return Data_Maybe.maybe(Data_Maybe.Nothing.value)(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Either.Left.create))(pred(__dict_Enum_16)(_130.value0));
            };
            if (_130 instanceof Data_Either.Right) {
                return Data_Maybe.maybe(Data_Maybe.Just.create(new Data_Either.Left(lastEnum(__dict_Enum_16))))(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Either.Right.create))(pred(__dict_Enum_17)(_130.value0));
            };
            throw new Error("Failed pattern match");
        }, function (_129) {
            if (_129 instanceof Data_Either.Left) {
                return Data_Maybe.maybe(Data_Maybe.Just.create(new Data_Either.Right(firstEnum(__dict_Enum_17))))(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Either.Left.create))(succ(__dict_Enum_16)(_129.value0));
            };
            if (_129 instanceof Data_Either.Right) {
                return Data_Maybe.maybe(Data_Maybe.Nothing.value)(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Either.Right.create))(succ(__dict_Enum_17)(_129.value0));
            };
            throw new Error("Failed pattern match");
        }, eitherToEnum(__dict_Enum_16)(__dict_Enum_17)(cardinality(__dict_Enum_16))(cardinality(__dict_Enum_17)));
    };
};
var enumMaybe = function (__dict_Enum_18) {
    return new Enum(function () {
        return Data_Maybe.ordMaybe(__dict_Enum_18["__superclass_Prelude.Ord_0"]());
    }, maybeCardinality(__dict_Enum_18)(cardinality(__dict_Enum_18)), Data_Maybe.Nothing.value, function (_126) {
        if (_126 instanceof Data_Maybe.Nothing) {
            return 0;
        };
        if (_126 instanceof Data_Maybe.Just) {
            return fromEnum(__dict_Enum_18)(_126.value0) + 1;
        };
        throw new Error("Failed pattern match");
    }, Data_Maybe.Just.create(lastEnum(__dict_Enum_18)), function (_125) {
        if (_125 instanceof Data_Maybe.Nothing) {
            return Data_Maybe.Nothing.value;
        };
        if (_125 instanceof Data_Maybe.Just) {
            return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Maybe.Just.create)(pred(__dict_Enum_18)(_125.value0));
        };
        throw new Error("Failed pattern match");
    }, function (_124) {
        if (_124 instanceof Data_Maybe.Nothing) {
            return Data_Maybe.Just.create(firstEnum(enumMaybe(__dict_Enum_18)));
        };
        if (_124 instanceof Data_Maybe.Just) {
            return Prelude["<$>"](Data_Maybe.functorMaybe)(Data_Maybe.Just.create)(succ(__dict_Enum_18)(_124.value0));
        };
        throw new Error("Failed pattern match");
    }, maybeToEnum(__dict_Enum_18)(cardinality(__dict_Enum_18)));
};
var enumTuple = function (__dict_Enum_19) {
    return function (__dict_Enum_20) {
        return new Enum(function () {
            return Data_Tuple.ordTuple(__dict_Enum_19["__superclass_Prelude.Ord_0"]())(__dict_Enum_20["__superclass_Prelude.Ord_0"]());
        }, tupleCardinality(__dict_Enum_19)(__dict_Enum_20)(cardinality(__dict_Enum_19))(cardinality(__dict_Enum_20)), new Data_Tuple.Tuple(firstEnum(__dict_Enum_19), firstEnum(__dict_Enum_20)), tupleFromEnum(__dict_Enum_19)(__dict_Enum_20)(cardinality(__dict_Enum_20)), new Data_Tuple.Tuple(lastEnum(__dict_Enum_19), lastEnum(__dict_Enum_20)), function (_128) {
            return Data_Maybe.maybe(Prelude["<$>"](Data_Maybe.functorMaybe)(Prelude.flip(Data_Tuple.Tuple.create)(firstEnum(__dict_Enum_20)))(pred(__dict_Enum_19)(_128.value0)))(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Tuple.Tuple.create(_128.value0)))(pred(__dict_Enum_20)(_128.value1));
        }, function (_127) {
            return Data_Maybe.maybe(Prelude["<$>"](Data_Maybe.functorMaybe)(Prelude.flip(Data_Tuple.Tuple.create)(firstEnum(__dict_Enum_20)))(succ(__dict_Enum_19)(_127.value0)))(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Tuple.Tuple.create(_127.value0)))(succ(__dict_Enum_20)(_127.value1));
        }, tupleToEnum(__dict_Enum_19)(__dict_Enum_20)(cardinality(__dict_Enum_20)));
    };
};
var booleanSucc = function (_120) {
    if (!_120) {
        return new Data_Maybe.Just(true);
    };
    return Data_Maybe.Nothing.value;
};
var booleanPred = function (_121) {
    if (_121) {
        return new Data_Maybe.Just(false);
    };
    return Data_Maybe.Nothing.value;
};
var booleanFirstEnum = false;
var enumBoolean = new Enum(function () {
    return Prelude.ordBoolean;
}, 2, booleanFirstEnum, defaultFromEnum(booleanPred), true, booleanPred, booleanSucc, defaultToEnum(booleanSucc)(booleanFirstEnum));
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
    lastEnum: lastEnum, 
    fromEnum: fromEnum, 
    firstEnum: firstEnum, 
    cardinality: cardinality, 
    enumChar: enumChar, 
    enumMaybe: enumMaybe, 
    enumBoolean: enumBoolean, 
    enumTuple: enumTuple, 
    enumEither: enumEither
};

},{"Data.Array":61,"Data.Char":62,"Data.Either":73,"Data.Maybe":90,"Data.Maybe.Unsafe":89,"Data.Tuple":108,"Data.Unfoldable":109,"Prelude":127}],75:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
function mkExists(fa) {  return fa;};
function runExists(f) {  return function(fa) {    return f(fa);  };};
module.exports = {
    runExists: runExists, 
    mkExists: mkExists
};

},{"Prelude":127}],76:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Monoid = require("Data.Monoid");
var Control_Apply = require("Control.Apply");
var Data_Monoid_First = require("Data.Monoid.First");
var Data_Either = require("Data.Either");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid_Additive = require("Data.Monoid.Additive");
var Data_Monoid_Dual = require("Data.Monoid.Dual");
var Data_Monoid_Last = require("Data.Monoid.Last");
var Data_Monoid_Multiplicative = require("Data.Monoid.Multiplicative");
var Data_Tuple = require("Data.Tuple");

  function foldrArray(f) {
    return function(z) {
      return function(xs) {
        var acc = z;
        for (var i = xs.length - 1; i >= 0; --i) {
          acc = f(xs[i])(acc);
        }
        return acc;
      };
    };
  }
  ;

  function foldlArray(f) {
    return function(z) {
      return function(xs) {
        var acc = z;
        for (var i = 0, len = xs.length; i < len; ++i) {
          acc = f(acc)(xs[i]);
        }
        return acc;
      };
    };
  }
  ;

/**
 *  | `Foldable` represents data structures which can be _folded_.
 *  |
 *  | - `foldr` folds a structure from the right
 *  | - `foldl` folds a structure from the left
 *  | - `foldMap` folds a structure by accumulating values in a `Monoid`
 */
var Foldable = function (foldMap, foldl, foldr) {
    this.foldMap = foldMap;
    this.foldl = foldl;
    this.foldr = foldr;
};

/**
 *  | `Foldable` represents data structures which can be _folded_.
 *  |
 *  | - `foldr` folds a structure from the right
 *  | - `foldl` folds a structure from the left
 *  | - `foldMap` folds a structure by accumulating values in a `Monoid`
 */
var foldr = function (dict) {
    return dict.foldr;
};

/**
 *  | Traverse a data structure, performing some effects encoded by an
 *  | `Applicative` functor at each value, ignoring the final result.
 *  |
 *  | For example:
 *  |
 *  | ```purescript
 *  | traverse_ print [1, 2, 3]
 *  | ```
 */
var traverse_ = function (__dict_Applicative_0) {
    return function (__dict_Foldable_1) {
        return function (f) {
            return foldr(__dict_Foldable_1)(Prelude["<<<"](Prelude.semigroupoidArr)(Control_Apply["*>"](__dict_Applicative_0["__superclass_Prelude.Apply_0"]()))(f))(Prelude.pure(__dict_Applicative_0)(Prelude.unit));
        };
    };
};

/**
 *  | A version of `traverse_` with its arguments flipped.
 *  |
 *  | This can be useful when running an action written using do notation
 *  | for every element in a data structure:
 *  |
 *  | For example:
 *  |
 *  | ```purescript
 *  | for_ [1, 2, 3] \n -> do
 *  |   print n
 *  |   trace "squared is"
 *  |   print (n * n)
 *  | ```
 */
var for_ = function (__dict_Applicative_2) {
    return function (__dict_Foldable_3) {
        return Prelude.flip(traverse_(__dict_Applicative_2)(__dict_Foldable_3));
    };
};

/**
 *  | Perform all of the effects in some data structure in the order
 *  | given by the `Foldable` instance, ignoring the final result.
 *  |
 *  | For example:
 *  |
 *  | ```purescript
 *  | sequence_ [ trace "Hello, ", trace " world!" ]
 *  | ```
 */
var sequence_ = function (__dict_Applicative_4) {
    return function (__dict_Foldable_5) {
        return traverse_(__dict_Applicative_4)(__dict_Foldable_5)(Prelude.id(Prelude.categoryArr));
    };
};

/**
 *  | `Foldable` represents data structures which can be _folded_.
 *  |
 *  | - `foldr` folds a structure from the right
 *  | - `foldl` folds a structure from the left
 *  | - `foldMap` folds a structure by accumulating values in a `Monoid`
 */
var foldl = function (dict) {
    return dict.foldl;
};

/**
 *  | Fold a data structure, accumulating values in some `Monoid`,
 *  | combining adjacent elements using the specified separator. 
 */
var intercalate = function (__dict_Foldable_6) {
    return function (__dict_Monoid_7) {
        return function (sep) {
            return function (xs) {
                var go = function (_402) {
                    return function (x) {
                        if (_402.init) {
                            return {
                                init: false, 
                                acc: x
                            };
                        };
                        return {
                            init: false, 
                            acc: Prelude["<>"](__dict_Monoid_7["__superclass_Prelude.Semigroup_0"]())(_402.acc)(Prelude["<>"](__dict_Monoid_7["__superclass_Prelude.Semigroup_0"]())(sep)(x))
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

/**
 *  | Fold a data structure, accumulating values in some `Monoid`.
 */
var mconcat = function (__dict_Foldable_8) {
    return function (__dict_Monoid_9) {
        return foldl(__dict_Foldable_8)(Prelude["<>"](__dict_Monoid_9["__superclass_Prelude.Semigroup_0"]()))(Data_Monoid.mempty(__dict_Monoid_9));
    };
};

/**
 *  | Test whether any `Boolean` value in a data structure is `true`.
 */
var or = function (__dict_Foldable_10) {
    return foldl(__dict_Foldable_10)(Prelude["||"](Prelude.boolLikeBoolean))(false);
};

/**
 *  | Find the product of the numeric values in a data structure.
 */
var product = function (__dict_Foldable_11) {
    return foldl(__dict_Foldable_11)(Prelude["*"](Prelude.semiringNumber))(1);
};

/**
 *  | Find the sum of the numeric values in a data structure.
 */
var sum = function (__dict_Foldable_12) {
    return foldl(__dict_Foldable_12)(Prelude["+"](Prelude.semiringNumber))(0);
};
var foldableTuple = new Foldable(function (__dict_Monoid_13) {
    return function (f) {
        return function (_386) {
            return f(_386.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (_385) {
            return f(z)(_385.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (_384) {
            return f(_384.value1)(z);
        };
    };
});
var foldableMultiplicative = new Foldable(function (__dict_Monoid_14) {
    return function (f) {
        return function (_401) {
            return f(_401);
        };
    };
}, function (f) {
    return function (z) {
        return function (_400) {
            return f(z)(_400);
        };
    };
}, function (f) {
    return function (z) {
        return function (_399) {
            return f(_399)(z);
        };
    };
});
var foldableMaybe = new Foldable(function (__dict_Monoid_15) {
    return function (f) {
        return function (_383) {
            if (_383 instanceof Data_Maybe.Nothing) {
                return Data_Monoid.mempty(__dict_Monoid_15);
            };
            if (_383 instanceof Data_Maybe.Just) {
                return f(_383.value0);
            };
            throw new Error("Failed pattern match");
        };
    };
}, function (f) {
    return function (z) {
        return function (_382) {
            if (_382 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (_382 instanceof Data_Maybe.Just) {
                return f(z)(_382.value0);
            };
            throw new Error("Failed pattern match");
        };
    };
}, function (f) {
    return function (z) {
        return function (_381) {
            if (_381 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (_381 instanceof Data_Maybe.Just) {
                return f(_381.value0)(z);
            };
            throw new Error("Failed pattern match");
        };
    };
});
var foldableEither = new Foldable(function (__dict_Monoid_16) {
    return function (f) {
        return function (_380) {
            if (_380 instanceof Data_Either.Left) {
                return Data_Monoid.mempty(__dict_Monoid_16);
            };
            if (_380 instanceof Data_Either.Right) {
                return f(_380.value0);
            };
            throw new Error("Failed pattern match");
        };
    };
}, function (f) {
    return function (z) {
        return function (_379) {
            if (_379 instanceof Data_Either.Left) {
                return z;
            };
            if (_379 instanceof Data_Either.Right) {
                return f(z)(_379.value0);
            };
            throw new Error("Failed pattern match");
        };
    };
}, function (f) {
    return function (z) {
        return function (_378) {
            if (_378 instanceof Data_Either.Left) {
                return z;
            };
            if (_378 instanceof Data_Either.Right) {
                return f(_378.value0)(z);
            };
            throw new Error("Failed pattern match");
        };
    };
});
var foldableDual = new Foldable(function (__dict_Monoid_17) {
    return function (f) {
        return function (_392) {
            return f(_392);
        };
    };
}, function (f) {
    return function (z) {
        return function (_391) {
            return f(z)(_391);
        };
    };
}, function (f) {
    return function (z) {
        return function (_390) {
            return f(_390)(z);
        };
    };
});
var foldableArray = new Foldable(function (__dict_Monoid_18) {
    return function (f) {
        return function (xs) {
            return foldr(foldableArray)(function (x) {
                return function (acc) {
                    return Prelude["<>"](__dict_Monoid_18["__superclass_Prelude.Semigroup_0"]())(f(x))(acc);
                };
            })(Data_Monoid.mempty(__dict_Monoid_18))(xs);
        };
    };
}, function (f) {
    return function (z) {
        return function (xs) {
            return foldlArray(f)(z)(xs);
        };
    };
}, function (f) {
    return function (z) {
        return function (xs) {
            return foldrArray(f)(z)(xs);
        };
    };
});
var foldableAdditive = new Foldable(function (__dict_Monoid_19) {
    return function (f) {
        return function (_389) {
            return f(_389);
        };
    };
}, function (f) {
    return function (z) {
        return function (_388) {
            return f(z)(_388);
        };
    };
}, function (f) {
    return function (z) {
        return function (_387) {
            return f(_387)(z);
        };
    };
});

/**
 *  | `Foldable` represents data structures which can be _folded_.
 *  |
 *  | - `foldr` folds a structure from the right
 *  | - `foldl` folds a structure from the left
 *  | - `foldMap` folds a structure by accumulating values in a `Monoid`
 */
var foldMap = function (dict) {
    return dict.foldMap;
};
var foldableFirst = new Foldable(function (__dict_Monoid_20) {
    return function (f) {
        return function (_395) {
            return foldMap(foldableMaybe)(__dict_Monoid_20)(f)(_395);
        };
    };
}, function (f) {
    return function (z) {
        return function (_394) {
            return foldl(foldableMaybe)(f)(z)(_394);
        };
    };
}, function (f) {
    return function (z) {
        return function (_393) {
            return foldr(foldableMaybe)(f)(z)(_393);
        };
    };
});
var foldableLast = new Foldable(function (__dict_Monoid_21) {
    return function (f) {
        return function (_398) {
            return foldMap(foldableMaybe)(__dict_Monoid_21)(f)(_398);
        };
    };
}, function (f) {
    return function (z) {
        return function (_397) {
            return foldl(foldableMaybe)(f)(z)(_397);
        };
    };
}, function (f) {
    return function (z) {
        return function (_396) {
            return foldr(foldableMaybe)(f)(z)(_396);
        };
    };
});

/**
 *  | Lookup a value in a data structure of `Tuple`s, generalizing association lists.
 */
var lookup = function (__dict_Eq_22) {
    return function (__dict_Foldable_23) {
        return function (a) {
            return function (f) {
                return Data_Monoid_First.runFirst(foldMap(__dict_Foldable_23)(Data_Monoid_First.monoidFirst)(function (_377) {
                    var _1746 = Prelude["=="](__dict_Eq_22)(a)(_377.value0);
                    if (_1746) {
                        return new Data_Maybe.Just(_377.value1);
                    };
                    if (!_1746) {
                        return Data_Maybe.Nothing.value;
                    };
                    throw new Error("Failed pattern match");
                })(f));
            };
        };
    };
};

/**
 *  | Fold a data structure, accumulating values in some `Monoid`.
 */
var fold = function (__dict_Foldable_24) {
    return function (__dict_Monoid_25) {
        return foldMap(__dict_Foldable_24)(__dict_Monoid_25)(Prelude.id(Prelude.categoryArr));
    };
};

/**
 *  | Try to find an element in a data structure which satisfies a predicate.
 */
var find = function (__dict_Foldable_26) {
    return function (p) {
        return function (f) {
            var _1750 = foldMap(__dict_Foldable_26)(Data_Monoid.monoidArray)(function (x) {
                var _1749 = p(x);
                if (_1749) {
                    return [ x ];
                };
                if (!_1749) {
                    return [  ];
                };
                throw new Error("Failed pattern match");
            })(f);
            if (_1750.length >= 1) {
                var _1752 = _1750.slice(1);
                return new Data_Maybe.Just(_1750[0]);
            };
            if (_1750.length === 0) {
                return Data_Maybe.Nothing.value;
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Test whether a predicate holds for any element in a data structure.
 */
var any = function (__dict_Foldable_27) {
    return function (p) {
        return Prelude["<<<"](Prelude.semigroupoidArr)(or(foldableArray))(foldMap(__dict_Foldable_27)(Data_Monoid.monoidArray)(function (x) {
            return [ p(x) ];
        }));
    };
};

/**
 *  | Test whether a value is an element of a data structure.
 */
var elem = function (__dict_Eq_28) {
    return function (__dict_Foldable_29) {
        return Prelude["<<<"](Prelude.semigroupoidArr)(any(__dict_Foldable_29))(Prelude["=="](__dict_Eq_28));
    };
};

/**
 *  | Test whether a value is not an element of a data structure.
 */
var notElem = function (__dict_Eq_30) {
    return function (__dict_Foldable_31) {
        return function (x) {
            return Prelude["<<<"](Prelude.semigroupoidArr)(Prelude.not(Prelude.boolLikeBoolean))(elem(__dict_Eq_30)(__dict_Foldable_31)(x));
        };
    };
};

/**
 *  | Test whether all `Boolean` values in a data structure are `true`.
 */
var and = function (__dict_Foldable_32) {
    return foldl(__dict_Foldable_32)(Prelude["&&"](Prelude.boolLikeBoolean))(true);
};

/**
 *  | Test whether a predicate holds for all elements in a data structure.
 */
var all = function (__dict_Foldable_33) {
    return function (p) {
        return Prelude["<<<"](Prelude.semigroupoidArr)(and(foldableArray))(foldMap(__dict_Foldable_33)(Data_Monoid.monoidArray)(function (x) {
            return [ p(x) ];
        }));
    };
};
module.exports = {
    Foldable: Foldable, 
    foldlArray: foldlArray, 
    foldrArray: foldrArray, 
    lookup: lookup, 
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
    foldableEither: foldableEither, 
    foldableMaybe: foldableMaybe, 
    foldableTuple: foldableTuple, 
    foldableAdditive: foldableAdditive, 
    foldableDual: foldableDual, 
    foldableFirst: foldableFirst, 
    foldableLast: foldableLast, 
    foldableMultiplicative: foldableMultiplicative
};

},{"Control.Apply":28,"Data.Either":73,"Data.Maybe":90,"Data.Monoid":97,"Data.Monoid.Additive":91,"Data.Monoid.Dual":93,"Data.Monoid.First":94,"Data.Monoid.Last":95,"Data.Monoid.Multiplicative":96,"Data.Tuple":108,"Prelude":127}],77:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines a type class for reading foreign values.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Foreign = require("Data.Foreign");
var Data_Traversable = require("Data.Traversable");
var Data_Array = require("Data.Array");
var Data_Foreign_Null = require("Data.Foreign.Null");
var Data_Foreign_Undefined = require("Data.Foreign.Undefined");
var Data_Foreign_NullOrUndefined = require("Data.Foreign.NullOrUndefined");
var Data_Either = require("Data.Either");
var Data_Foreign_Index = require("Data.Foreign.Index");

/**
 *  | A type class instance for this class can be written for a type if it
 *  | is possible to attempt to _safely_ coerce a `Foreign` value to that
 *  | type.
 *  |
 *  | Instances are provided for standard data structures, and the `F` monad
 *  | can be used to construct instances for new data structures.
 */
var IsForeign = function (read) {
    this.read = read;
};
var stringIsForeign = new IsForeign(Data_Foreign.readString);

/**
 *  | A type class instance for this class can be written for a type if it
 *  | is possible to attempt to _safely_ coerce a `Foreign` value to that
 *  | type.
 *  |
 *  | Instances are provided for standard data structures, and the `F` monad
 *  | can be used to construct instances for new data structures.
 */
var read = function (dict) {
    return dict.read;
};

/**
 *  | Attempt to read a data structure from a JSON string
 */
var readJSON = function (__dict_IsForeign_0) {
    return function (json) {
        return Prelude[">>="](Data_Either.bindEither)(Data_Foreign.parseJSON(json))(read(__dict_IsForeign_0));
    };
};

/**
 *  | Attempt to read a foreign value, handling errors using the specified function
 */
var readWith = function (__dict_IsForeign_1) {
    return function (f) {
        return function (value) {
            return Data_Either.either(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Either.Left.create)(f))(Data_Either.Right.create)(read(__dict_IsForeign_1)(value));
        };
    };
};

/**
 *  | Attempt to read a property of a foreign value at the specified index
 */
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
var foreignIsForeign = new IsForeign(function (f) {
    return Prelude["return"](Data_Either.monadEither)(f);
});
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
    booleanIsForeign: booleanIsForeign, 
    numberIsForeign: numberIsForeign, 
    arrayIsForeign: arrayIsForeign, 
    nullIsForeign: nullIsForeign, 
    undefinedIsForeign: undefinedIsForeign, 
    nullOrUndefinedIsForeign: nullOrUndefinedIsForeign
};

},{"Data.Array":61,"Data.Either":73,"Data.Foreign":82,"Data.Foreign.Index":78,"Data.Foreign.Null":79,"Data.Foreign.NullOrUndefined":80,"Data.Foreign.Undefined":81,"Data.Traversable":107,"Prelude":127}],78:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines a type class for types which act like 
 *  | _property indices_.
 */
"use strict";
var Data_Function = require("Data.Function");
var Data_Foreign = require("Data.Foreign");
var Prelude = require("Prelude");
var Data_Either = require("Data.Either");

  function unsafeReadPropImpl(f, s, key, value) {
    return value == null ? f : s(value[key]);
  }
  ;

  function unsafeHasOwnProperty(prop, value) {
    return Object.prototype.hasOwnProperty.call(value, prop);
  }
  ;

  function unsafeHasProperty(prop, value) {
    return prop in value;
  }
  ;

/**
 *  | This type class identifies types wich act like _property indices_.
 *  |
 *  | The canonical instances are for `String`s and `Number`s.
 */
var Index = function ($bang, errorAt, hasOwnProperty, hasProperty) {
    this["!"] = $bang;
    this.errorAt = errorAt;
    this.hasOwnProperty = hasOwnProperty;
    this.hasProperty = hasProperty;
};

/**
 *  | This type class identifies types wich act like _property indices_.
 *  |
 *  | The canonical instances are for `String`s and `Number`s.
 */
var $bang = function (dict) {
    return dict["!"];
};
var unsafeReadProp = function (k) {
    return function (value) {
        return unsafeReadPropImpl(new Data_Either.Left(new Data_Foreign.TypeMismatch("object", Data_Foreign.typeOf(value))), Prelude.pure(Data_Either.applicativeEither), k, value);
    };
};

/**
 *  | Attempt to read a value from a foreign value property
 */
var prop = unsafeReadProp;

/**
 *  | Attempt to read a value from a foreign value at the specified numeric index
 */
var index = unsafeReadProp;
var hasPropertyImpl = function (prop_1) {
    return function (value) {
        if (Data_Foreign.isNull(value)) {
            return false;
        };
        if (Data_Foreign.isUndefined(value)) {
            return false;
        };
        if (Data_Foreign.typeOf(value) === "object" || Data_Foreign.typeOf(value) === "function") {
            return unsafeHasProperty(prop_1, value);
        };
        return false;
    };
};

/**
 *  | This type class identifies types wich act like _property indices_.
 *  |
 *  | The canonical instances are for `String`s and `Number`s.
 */
var hasProperty = function (dict) {
    return dict.hasProperty;
};
var hasOwnPropertyImpl = function (prop_1) {
    return function (value) {
        if (Data_Foreign.isNull(value)) {
            return false;
        };
        if (Data_Foreign.isUndefined(value)) {
            return false;
        };
        if (Data_Foreign.typeOf(value) === "object" || Data_Foreign.typeOf(value) === "function") {
            return unsafeHasOwnProperty(prop_1, value);
        };
        return false;
    };
};
var indexNumber = new Index(Prelude.flip(index), Data_Foreign.ErrorAtIndex.create, hasOwnPropertyImpl, hasPropertyImpl);
var indexString = new Index(Prelude.flip(prop), Data_Foreign.ErrorAtProperty.create, hasOwnPropertyImpl, hasPropertyImpl);

/**
 *  | This type class identifies types wich act like _property indices_.
 *  |
 *  | The canonical instances are for `String`s and `Number`s.
 */
var hasOwnProperty = function (dict) {
    return dict.hasOwnProperty;
};

/**
 *  | This type class identifies types wich act like _property indices_.
 *  |
 *  | The canonical instances are for `String`s and `Number`s.
 */
var errorAt = function (dict) {
    return dict.errorAt;
};
module.exports = {
    Index: Index, 
    errorAt: errorAt, 
    hasOwnProperty: hasOwnProperty, 
    hasProperty: hasProperty, 
    "!": $bang, 
    index: index, 
    prop: prop, 
    indexString: indexString, 
    indexNumber: indexNumber
};

},{"Data.Either":73,"Data.Foreign":82,"Data.Function":83,"Prelude":127}],79:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Data_Foreign = require("Data.Foreign");
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Either = require("Data.Either");

/**
 *  | A `newtype` wrapper whose `IsForeign` instance correctly handles
 *  | null values.
 *  |
 *  | Conceptually, this type represents values which may be `null`, 
 *  | but not `undefined`.
 */
var Null = function (x) {
    return x;
};

/**
 *  | Unwrap a `Null` value 
 */
var runNull = function (_168) {
    return _168;
};

/**
 *  | Read a `Null` value
 */
var readNull = function (f) {
    return function (value) {
        if (Data_Foreign.isNull(value)) {
            return Prelude.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
        };
        return Prelude["<$>"](Data_Either.functorEither)(Prelude["<<<"](Prelude.semigroupoidArr)(Null)(Data_Maybe.Just.create))(f(value));
    };
};
module.exports = {
    Null: Null, 
    readNull: readNull, 
    runNull: runNull
};

},{"Data.Either":73,"Data.Foreign":82,"Data.Maybe":90,"Prelude":127}],80:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Foreign = require("Data.Foreign");
var Data_Maybe = require("Data.Maybe");
var Data_Either = require("Data.Either");

/**
 *  | A `newtype` wrapper whose `IsForeign` instance correctly handles
 *  | null and undefined values.
 *  |
 *  | Conceptually, this type represents values which may be `null`
 *  | or `undefined`.
 */
var NullOrUndefined = function (x) {
    return x;
};

/**
 *  | Unwrap a `NullOrUndefined` value
 */
var runNullOrUndefined = function (_169) {
    return _169;
};

/**
 *  | Read a `NullOrUndefined` value
 */
var readNullOrUndefined = function (f) {
    return function (value) {
        if (Data_Foreign.isNull(value) || Data_Foreign.isUndefined(value)) {
            return Prelude.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
        };
        return Prelude["<$>"](Data_Either.functorEither)(Prelude["<<<"](Prelude.semigroupoidArr)(NullOrUndefined)(Data_Maybe.Just.create))(f(value));
    };
};
module.exports = {
    NullOrUndefined: NullOrUndefined, 
    readNullOrUndefined: readNullOrUndefined, 
    runNullOrUndefined: runNullOrUndefined
};

},{"Data.Either":73,"Data.Foreign":82,"Data.Maybe":90,"Prelude":127}],81:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Data_Foreign = require("Data.Foreign");
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");
var Data_Either = require("Data.Either");

/**
 *  | A `newtype` wrapper whose `IsForeign` instance correctly handles
 *  | undefined values.
 *  |
 *  | Conceptually, this type represents values which may be `undefined`, 
 *  | but not `null`.
 */
var Undefined = function (x) {
    return x;
};

/**
 *  | Unwrap an `Undefined` value
 */
var runUndefined = function (_170) {
    return _170;
};

/**
 *  | Read an `Undefined` value
 */
var readUndefined = function (f) {
    return function (value) {
        if (Data_Foreign.isUndefined(value)) {
            return Prelude.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
        };
        return Prelude["<$>"](Data_Either.functorEither)(Prelude["<<<"](Prelude.semigroupoidArr)(Undefined)(Data_Maybe.Just.create))(f(value));
    };
};
module.exports = {
    Undefined: Undefined, 
    readUndefined: readUndefined, 
    runUndefined: runUndefined
};

},{"Data.Either":73,"Data.Foreign":82,"Data.Maybe":90,"Prelude":127}],82:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines types and functions for working with _foreign_
 *  | data.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Function = require("Data.Function");
var Data_Array = require("Data.Array");
var Data_Either = require("Data.Either");

  function parseJSONImpl(left, right, str) {
    try {
      return right(JSON.parse(str));
    } catch (e) {
      return left(e.toString());
    }
  }
  ;

  function toForeign(value) {
    return value;
  }
  ;

  function unsafeFromForeign(value) {
    return value;
  }
  ;

  function typeOf(value) {
    return typeof value;
  }
  ;

  function tagOf(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }
  ;

  function isNull(value) {
    return value === null;
  }
  ;

  function isUndefined(value) {
    return value === undefined;
  }
  ;

  var isArray = Array.isArray || function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };
  ;

/**
 *  | A type for runtime type errors
 */
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

/**
 *  | A type for runtime type errors
 */
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

/**
 *  | A type for runtime type errors
 */
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

/**
 *  | A type for runtime type errors
 */
var JSONError = (function () {
    function JSONError(value0) {
        this.value0 = value0;
    };
    JSONError.create = function (value0) {
        return new JSONError(value0);
    };
    return JSONError;
})();

/**
 *  | Unsafely coerce a `Foreign` value when the value has a particular `tagOf`
 *  | value.
 */
var unsafeReadTagged = function (tag) {
    return function (value) {
        if (tagOf(value) === tag) {
            return Prelude.pure(Data_Either.applicativeEither)(unsafeFromForeign(value));
        };
        return new Data_Either.Left(new TypeMismatch(tag, tagOf(value)));
    };
};
var showForeignError = new Prelude.Show(function (_162) {
    if (_162 instanceof TypeMismatch) {
        return "Type mismatch: expected " + (_162.value0 + (", found " + _162.value1));
    };
    if (_162 instanceof ErrorAtIndex) {
        return "Error at array index " + (Prelude.show(Prelude.showNumber)(_162.value0) + (": " + Prelude.show(showForeignError)(_162.value1)));
    };
    if (_162 instanceof ErrorAtProperty) {
        return "Error at property " + (Prelude.show(Prelude.showString)(_162.value0) + (": " + Prelude.show(showForeignError)(_162.value1)));
    };
    if (_162 instanceof JSONError) {
        return "JSON error: " + _162.value0;
    };
    throw new Error("Failed pattern match");
});

/**
 *  | Attempt to coerce a foreign value to a `String`.
 */
var readString = unsafeReadTagged("String");

/**
 *  | Attempt to coerce a foreign value to a `Number`.
 */
var readNumber = unsafeReadTagged("Number");

/**
 *  | Attempt to coerce a foreign value to a `Boolean`.
 */
var readBoolean = unsafeReadTagged("Boolean");

/**
 *  | Attempt to coerce a foreign value to an array.
 */
var readArray = function (value) {
    if (isArray(value)) {
        return Prelude.pure(Data_Either.applicativeEither)(unsafeFromForeign(value));
    };
    return new Data_Either.Left(new TypeMismatch("array", tagOf(value)));
};

/**
 *  | Attempt to parse a JSON string, returning the result as foreign data.
 */
var parseJSON = function (json) {
    return parseJSONImpl(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Either.Left.create)(JSONError.create), Data_Either.Right.create, json);
};
var eqForeignError = new Prelude.Eq(function (a) {
    return function (b) {
        return !Prelude["=="](eqForeignError)(a)(b);
    };
}, function (_163) {
    return function (_164) {
        if (_163 instanceof TypeMismatch && _164 instanceof TypeMismatch) {
            return _163.value0 === _164.value0 && _163.value1 === _164.value1;
        };
        if (_163 instanceof ErrorAtIndex && _164 instanceof ErrorAtIndex) {
            return _163.value0 === _164.value0 && Prelude["=="](eqForeignError)(_163.value1)(_164.value1);
        };
        if (_163 instanceof ErrorAtProperty && _164 instanceof ErrorAtProperty) {
            return _163.value0 === _164.value0 && Prelude["=="](eqForeignError)(_163.value1)(_164.value1);
        };
        if (_163 instanceof JSONError && _164 instanceof JSONError) {
            return _163.value0 === _164.value0;
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
    readNumber: readNumber, 
    readBoolean: readBoolean, 
    readString: readString, 
    isArray: isArray, 
    isUndefined: isUndefined, 
    isNull: isNull, 
    tagOf: tagOf, 
    typeOf: typeOf, 
    unsafeReadTagged: unsafeReadTagged, 
    unsafeFromForeign: unsafeFromForeign, 
    toForeign: toForeign, 
    parseJSON: parseJSON, 
    showForeignError: showForeignError, 
    eqForeignError: eqForeignError
};

},{"Data.Array":61,"Data.Either":73,"Data.Function":83,"Prelude":127}],83:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");

    function mkFn0(fn) {
      return function() {
        return fn({});
      };
    }
    ;

    function mkFn1(fn) {
      return function(a) {
        return fn(a);
      };
    }
    ;

    function mkFn2(fn) {
      return function(a, b) {
        return fn(a)(b);
      };
    }
    ;

    function mkFn3(fn) {
      return function(a, b, c) {
        return fn(a)(b)(c);
      };
    }
    ;

    function mkFn4(fn) {
      return function(a, b, c, d) {
        return fn(a)(b)(c)(d);
      };
    }
    ;

    function mkFn5(fn) {
      return function(a, b, c, d, e) {
        return fn(a)(b)(c)(d)(e);
      };
    }
    ;

    function mkFn6(fn) {
      return function(a, b, c, d, e, f) {
        return fn(a)(b)(c)(d)(e)(f);
      };
    }
    ;

    function mkFn7(fn) {
      return function(a, b, c, d, e, f, g) {
        return fn(a)(b)(c)(d)(e)(f)(g);
      };
    }
    ;

    function mkFn8(fn) {
      return function(a, b, c, d, e, f, g, h) {
        return fn(a)(b)(c)(d)(e)(f)(g)(h);
      };
    }
    ;

    function mkFn9(fn) {
      return function(a, b, c, d, e, f, g, h, i) {
        return fn(a)(b)(c)(d)(e)(f)(g)(h)(i);
      };
    }
    ;

    function mkFn10(fn) {
      return function(a, b, c, d, e, f, g, h, i, j) {
        return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)(j);
      };
    }
    ;

    function runFn0(fn) {
      return fn();
    }
    ;

    function runFn1(fn) {
      return function(a) {
        return fn(a);
      };
    }
    ;

    function runFn2(fn) {
      return function(a) {
        return function(b) {
          return fn(a, b);
        };
      };
    }
    ;

    function runFn3(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return fn(a, b, c);
          };
        };
      };
    }
    ;

    function runFn4(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return fn(a, b, c, d);
            };
          };
        };
      };
    }
    ;

    function runFn5(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                return fn(a, b, c, d, e);
              };
            };
          };
        };
      };
    }
    ;

    function runFn6(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                return function(f) {
                  return fn(a, b, c, d, e, f);
                };
              };
            };
          };
        };
      };
    }
    ;

    function runFn7(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                return function(f) {
                  return function(g) {
                    return fn(a, b, c, d, e, f, g);
                  };
                };
              };
            };
          };
        };
      };
    }
    ;

    function runFn8(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                return function(f) {
                  return function(g) {
                    return function(h) {
                      return fn(a, b, c, d, e, f, g, h);
                    };
                  };
                };
              };
            };
          };
        };
      };
    }
    ;

    function runFn9(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                return function(f) {
                  return function(g) {
                    return function(h) {
                      return function(i) {
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
    }
    ;

    function runFn10(fn) {
      return function(a) {
        return function(b) {
          return function(c) {
            return function(d) {
              return function(e) {
                return function(f) {
                  return function(g) {
                    return function(h) {
                      return function(i) {
                        return function(j) {
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
    }
    ;

/**
 *  | The `on` function is used to change the domain of a binary operator.
 *  |
 *  | For example, we can create a function which compares two records based on the values of their `x` properties:
 *  |
 *  | ```purescript
 *  | compareX :: forall r. { x :: Number | r } -> { x :: Number | r } -> Ordering
 *  | compareX = compare `on` _.x
 *  | ```
 */
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
    runFn10: runFn10, 
    runFn9: runFn9, 
    runFn8: runFn8, 
    runFn7: runFn7, 
    runFn6: runFn6, 
    runFn5: runFn5, 
    runFn4: runFn4, 
    runFn3: runFn3, 
    runFn2: runFn2, 
    runFn1: runFn1, 
    runFn0: runFn0, 
    mkFn10: mkFn10, 
    mkFn9: mkFn9, 
    mkFn8: mkFn8, 
    mkFn7: mkFn7, 
    mkFn6: mkFn6, 
    mkFn5: mkFn5, 
    mkFn4: mkFn4, 
    mkFn3: mkFn3, 
    mkFn2: mkFn2, 
    mkFn1: mkFn1, 
    mkFn0: mkFn0, 
    on: on
};

},{"Prelude":127}],84:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");

/**
 *  | A `Contravariant` functor can be seen as a way of changing the input type
 *  | of a consumer of input, in contrast to the standard covariant `Functor`
 *  | that can be seen as a way of changing the output type of a producer of
 *  | output.
 *  |
 *  | `Contravariant` instances should satisfy the following laws:
 *  |
 *  | - Identity `(>$<) id = id`
 *  | - Composition `(f >$<) <<< (g >$<) = (>$<) (g <<< f)`
 */
var Contravariant = function ($greater$dollar$less) {
    this[">$<"] = $greater$dollar$less;
};

/**
 *  | A `Contravariant` functor can be seen as a way of changing the input type
 *  | of a consumer of input, in contrast to the standard covariant `Functor`
 *  | that can be seen as a way of changing the output type of a producer of
 *  | output.
 *  |
 *  | `Contravariant` instances should satisfy the following laws:
 *  |
 *  | - Identity `(>$<) id = id`
 *  | - Composition `(f >$<) <<< (g >$<) = (>$<) (g <<< f)`
 */
var $greater$dollar$less = function (dict) {
    return dict[">$<"];
};

/**
 *  | `(>#<)` is `(>$<)` with its arguments reversed.
 */
var $greater$hash$less = function (__dict_Contravariant_0) {
    return function (x) {
        return function (f) {
            return $greater$dollar$less(__dict_Contravariant_0)(f)(x);
        };
    };
};
module.exports = {
    Contravariant: Contravariant, 
    ">#<": $greater$hash$less, 
    ">$<": $greater$dollar$less
};

},{"Prelude":127}],85:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Foldable = require("Data.Foldable");
var Data_Traversable = require("Data.Traversable");
var Identity = function (x) {
    return x;
};
var showConst = function (__dict_Show_2) {
    return new Prelude.Show(function (_567) {
        return "Identity (" + (Prelude.show(__dict_Show_2)(_567) + ")");
    });
};
var runIdentity = function (_562) {
    return _562;
};
var functorIdentity = new Prelude.Functor(function (f) {
    return function (_568) {
        return f(_568);
    };
});
var foldableIdentity = new Data_Foldable.Foldable(function (__dict_Monoid_4) {
    return function (f) {
        return function (_574) {
            return f(_574);
        };
    };
}, function (f) {
    return function (z) {
        return function (_573) {
            return f(z)(_573);
        };
    };
}, function (f) {
    return function (z) {
        return function (_572) {
            return f(_572)(z);
        };
    };
});
var traversableIdentity = new Data_Traversable.Traversable(function () {
    return foldableIdentity;
}, function () {
    return functorIdentity;
}, function (__dict_Applicative_1) {
    return function (_576) {
        return Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Identity)(_576);
    };
}, function (__dict_Applicative_0) {
    return function (f) {
        return function (_575) {
            return Prelude["<$>"]((__dict_Applicative_0["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Identity)(f(_575));
        };
    };
});
var extendIdentity = new Control_Extend.Extend(function (f) {
    return function (m) {
        return f(m);
    };
}, function () {
    return functorIdentity;
});
var eqIdentity = function (__dict_Eq_5) {
    return new Prelude.Eq(function (x) {
        return function (y) {
            return !Prelude["=="](eqIdentity(__dict_Eq_5))(x)(y);
        };
    }, function (_563) {
        return function (_564) {
            return Prelude["=="](__dict_Eq_5)(_563)(_564);
        };
    });
};
var ordIdentity = function (__dict_Ord_3) {
    return new Prelude.Ord(function () {
        return eqIdentity(__dict_Ord_3["__superclass_Prelude.Eq_0"]());
    }, function (_565) {
        return function (_566) {
            return Prelude.compare(__dict_Ord_3)(_565)(_566);
        };
    });
};
var comonadIdentity = new Control_Comonad.Comonad(function () {
    return extendIdentity;
}, function (_571) {
    return _571;
});
var applyIdentity = new Prelude.Apply(function (_569) {
    return function (_570) {
        return _569(_570);
    };
}, function () {
    return functorIdentity;
});
var bindIdentity = new Prelude.Bind(function (m) {
    return function (f) {
        return f(runIdentity(m));
    };
}, function () {
    return applyIdentity;
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
    showConst: showConst, 
    functorIdentity: functorIdentity, 
    applyIdentity: applyIdentity, 
    applicativeIdentity: applicativeIdentity, 
    bindIdentity: bindIdentity, 
    monadIdentity: monadIdentity, 
    extendIdentity: extendIdentity, 
    comonadIdentity: comonadIdentity, 
    foldableIdentity: foldableIdentity, 
    traversableIdentity: traversableIdentity
};

},{"Control.Comonad":30,"Control.Extend":31,"Data.Foldable":76,"Data.Traversable":107,"Prelude":127}],86:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");

  function fromNumber(n) {
    return n|0;
  }
  ;

  function intAdd(x) {
    return function(y) {
      return (x + y)|0;
    };
  }
  ;

  function intMul(x) {
    return function(y) {
      return (x * y)|0;
    };
  }
  ;

  function intDiv(x) {
    return function(y) {
      return (x / y)|0;
    };
  }
  ;

  function intMod(x) {
    return function(y) {
      return x % y;
    };
  }
  ;

  function intSub(x) {
    return function(y) {
      return (x - y)|0;
    };
  }
  ;
var Int = function (x) {
    return x;
};
var toNumber = function (_96) {
    return _96;
};
var showInt = new Prelude.Show(function (_97) {
    return "fromNumber " + Prelude.show(Prelude.showNumber)(_97);
});
var semiringInt = new Prelude.Semiring(intMul, intAdd, 1, 0);
var ringInt = new Prelude.Ring(intSub, function () {
    return semiringInt;
});
var moduloSemiringInt = new Prelude.ModuloSemiring(intDiv, function () {
    return semiringInt;
}, intMod);
var eqInt = new Prelude.Eq(function (_100) {
    return function (_101) {
        return _100 !== _101;
    };
}, function (_98) {
    return function (_99) {
        return _98 === _99;
    };
});
var ordInt = new Prelude.Ord(function () {
    return eqInt;
}, function (_102) {
    return function (_103) {
        return Prelude.compare(Prelude.ordNumber)(_102)(_103);
    };
});
module.exports = {
    toNumber: toNumber, 
    fromNumber: fromNumber, 
    showInt: showInt, 
    eqInt: eqInt, 
    ordInt: ordInt, 
    semiringInt: semiringInt, 
    moduloSemiringInt: moduloSemiringInt, 
    ringInt: ringInt
};

},{"Prelude":127}],87:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | A monad for lazily-computed values
 */
"use strict";
var Prelude = require("Prelude");
var Control_Lazy = require("Control.Lazy");
var Control_Extend = require("Control.Extend");
var Control_Comonad = require("Control.Comonad");
function defer(thunk) {    if (this instanceof defer) {      this.thunk = thunk;      return this;    } else {      return new defer(thunk);    }}defer.prototype.force = function () {    var value = this.thunk();    delete this.thunk;    this.force = function () {        return value;    };    return value;};;
function force(l) {  return l.force();};
var showLazy = function (__dict_Show_0) {
    return new Prelude.Show(function (x) {
        return "Lazy " + Prelude.show(__dict_Show_0)(force(x));
    });
};
var lazy1Lazy = new Control_Lazy.Lazy1(function (f) {
    return defer(function (_132) {
        return force(f(Prelude.unit));
    });
});
var functorLazy = new Prelude.Functor(function (f) {
    return function (l) {
        return defer(function (_127) {
            return f(force(l));
        });
    };
});
var extendLazy = new Control_Extend.Extend(function (f) {
    return function (x) {
        return defer(function (_131) {
            return f(x);
        });
    };
}, function () {
    return functorLazy;
});
var eqLazy = function (__dict_Eq_2) {
    return new Prelude.Eq(function (x) {
        return function (y) {
            return !Prelude["=="](eqLazy(__dict_Eq_2))(x)(y);
        };
    }, function (x) {
        return function (y) {
            return Prelude["=="](__dict_Eq_2)(force(x))(force(y));
        };
    });
};
var ordLazy = function (__dict_Ord_1) {
    return new Prelude.Ord(function () {
        return eqLazy(__dict_Ord_1["__superclass_Prelude.Eq_0"]());
    }, function (x) {
        return function (y) {
            return Prelude.compare(__dict_Ord_1)(force(x))(force(y));
        };
    });
};
var comonadLazy = new Control_Comonad.Comonad(function () {
    return extendLazy;
}, force);
var applyLazy = new Prelude.Apply(function (f) {
    return function (x) {
        return defer(function (_128) {
            return force(f)(force(x));
        });
    };
}, function () {
    return functorLazy;
});
var bindLazy = new Prelude.Bind(function (l) {
    return function (f) {
        return defer(function (_130) {
            return Prelude["<<<"](Prelude.semigroupoidArr)(force)(Prelude["<<<"](Prelude.semigroupoidArr)(f)(force))(l);
        });
    };
}, function () {
    return applyLazy;
});
var applicativeLazy = new Prelude.Applicative(function () {
    return applyLazy;
}, function (a) {
    return defer(function (_129) {
        return a;
    });
});
var monadLazy = new Prelude.Monad(function () {
    return applicativeLazy;
}, function () {
    return bindLazy;
});
module.exports = {
    force: force, 
    defer: defer, 
    functorLazy: functorLazy, 
    applyLazy: applyLazy, 
    applicativeLazy: applicativeLazy, 
    bindLazy: bindLazy, 
    monadLazy: monadLazy, 
    extendLazy: extendLazy, 
    comonadLazy: comonadLazy, 
    eqLazy: eqLazy, 
    ordLazy: ordLazy, 
    showLazy: showLazy, 
    lazy1Lazy: lazy1Lazy
};

},{"Control.Comonad":30,"Control.Extend":31,"Control.Lazy":32,"Prelude":127}],88:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines a type of maps as balanced 2-3 trees, based on
 *  | <http://www.cs.princeton.edu/~dpw/courses/cos326-12/ass/2-3-trees.pdf>
 */
"use strict";
var Prelude = require("Prelude");
var Data_Foldable = require("Data.Foldable");
var Data_Tuple = require("Data.Tuple");
var Data_Traversable = require("Data.Traversable");
var Data_Array = require("Data.Array");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");

/**
 *  | `Map k v` represents maps from keys of type `k` to values of type `v`.
 */
var Leaf = (function () {
    function Leaf() {

    };
    Leaf.value = new Leaf();
    return Leaf;
})();

/**
 *  | `Map k v` represents maps from keys of type `k` to values of type `v`.
 */
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

/**
 *  | `Map k v` represents maps from keys of type `k` to values of type `v`.
 */
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

/**
 *  | Get an array of the values contained in a map
 */
var values = function (_607) {
    if (_607 instanceof Leaf) {
        return [  ];
    };
    if (_607 instanceof Two) {
        return Prelude["++"](Data_Array.semigroupArray)(values(_607.value0))(Prelude["++"](Data_Array.semigroupArray)([ _607.value2 ])(values(_607.value3)));
    };
    if (_607 instanceof Three) {
        return Prelude["++"](Data_Array.semigroupArray)(values(_607.value0))(Prelude["++"](Data_Array.semigroupArray)([ _607.value2 ])(Prelude["++"](Data_Array.semigroupArray)(values(_607.value3))(Prelude["++"](Data_Array.semigroupArray)([ _607.value5 ])(values(_607.value6)))));
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Convert a map to an array of key/value pairs
 */
var toList = function (_605) {
    if (_605 instanceof Leaf) {
        return [  ];
    };
    if (_605 instanceof Two) {
        return Prelude["++"](Data_Array.semigroupArray)(toList(_605.value0))(Prelude["++"](Data_Array.semigroupArray)([ new Data_Tuple.Tuple(_605.value1, _605.value2) ])(toList(_605.value3)));
    };
    if (_605 instanceof Three) {
        return Prelude["++"](Data_Array.semigroupArray)(toList(_605.value0))(Prelude["++"](Data_Array.semigroupArray)([ new Data_Tuple.Tuple(_605.value1, _605.value2) ])(Prelude["++"](Data_Array.semigroupArray)(toList(_605.value3))(Prelude["++"](Data_Array.semigroupArray)([ new Data_Tuple.Tuple(_605.value4, _605.value5) ])(toList(_605.value6)))));
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Calculate the number of key/value pairs in a map
 */
var size = Prelude["<<<"](Prelude.semigroupoidArr)(Data_Array.length)(values);

/**
 *  | Create a map with one key/value pair
 */
var singleton = function (k) {
    return function (v) {
        return new Two(Leaf.value, k, v, Leaf.value);
    };
};

/**
 *  | Render a `Map` as a `String`
 */
var showTree = function (__dict_Show_0) {
    return function (__dict_Show_1) {
        return function (_600) {
            if (_600 instanceof Leaf) {
                return "Leaf";
            };
            if (_600 instanceof Two) {
                return "Two (" + (showTree(__dict_Show_0)(__dict_Show_1)(_600.value0) + (") (" + (Prelude.show(__dict_Show_0)(_600.value1) + (") (" + (Prelude.show(__dict_Show_1)(_600.value2) + (") (" + (showTree(__dict_Show_0)(__dict_Show_1)(_600.value3) + ")")))))));
            };
            if (_600 instanceof Three) {
                return "Three (" + (showTree(__dict_Show_0)(__dict_Show_1)(_600.value0) + (") (" + (Prelude.show(__dict_Show_0)(_600.value1) + (") (" + (Prelude.show(__dict_Show_1)(_600.value2) + (") (" + (showTree(__dict_Show_0)(__dict_Show_1)(_600.value3) + (") (" + (Prelude.show(__dict_Show_0)(_600.value4) + (") (" + (Prelude.show(__dict_Show_1)(_600.value5) + (") (" + (showTree(__dict_Show_0)(__dict_Show_1)(_600.value6) + ")")))))))))))));
            };
            throw new Error("Failed pattern match");
        };
    };
};
var showMap = function (__dict_Show_2) {
    return function (__dict_Show_3) {
        return new Prelude.Show(function (m) {
            return "fromList " + Prelude.show(Prelude.showArray(Data_Tuple.showTuple(__dict_Show_2)(__dict_Show_3)))(toList(m));
        });
    };
};

/**
 *  | Lookup a value for the specified key
 */
var lookup = function (__copy___dict_Ord_6) {
    return function (__copy_k) {
        return function (__copy__602) {
            var __dict_Ord_6 = __copy___dict_Ord_6;
            var k = __copy_k;
            var _602 = __copy__602;
            tco: while (true) {
                if (_602 instanceof Leaf) {
                    return Data_Maybe.Nothing.value;
                };
                if (_602 instanceof Two && Prelude["=="](__dict_Ord_6["__superclass_Prelude.Eq_0"]())(k)(_602.value1)) {
                    return new Data_Maybe.Just(_602.value2);
                };
                if (_602 instanceof Two && Prelude["<"](__dict_Ord_6)(k)(_602.value1)) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco_k = k;
                    var __tco__602 = _602.value0;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = __tco_k;
                    _602 = __tco__602;
                    continue tco;
                };
                if (_602 instanceof Two) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco_k = k;
                    var __tco__602 = _602.value3;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = __tco_k;
                    _602 = __tco__602;
                    continue tco;
                };
                if (_602 instanceof Three && Prelude["=="](__dict_Ord_6["__superclass_Prelude.Eq_0"]())(k)(_602.value1)) {
                    return new Data_Maybe.Just(_602.value2);
                };
                if (_602 instanceof Three && Prelude["=="](__dict_Ord_6["__superclass_Prelude.Eq_0"]())(k)(_602.value4)) {
                    return new Data_Maybe.Just(_602.value5);
                };
                if (_602 instanceof Three && Prelude["<"](__dict_Ord_6)(k)(_602.value1)) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco_k = k;
                    var __tco__602 = _602.value0;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = __tco_k;
                    _602 = __tco__602;
                    continue tco;
                };
                if (_602 instanceof Three && (Prelude["<"](__dict_Ord_6)(_602.value1)(k) && Prelude["<="](__dict_Ord_6)(k)(_602.value4))) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco_k = k;
                    var __tco__602 = _602.value3;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = __tco_k;
                    _602 = __tco__602;
                    continue tco;
                };
                if (_602 instanceof Three) {
                    var __tco___dict_Ord_6 = __dict_Ord_6;
                    var __tco_k = k;
                    var __tco__602 = _602.value6;
                    __dict_Ord_6 = __tco___dict_Ord_6;
                    k = __tco_k;
                    _602 = __tco__602;
                    continue tco;
                };
                throw new Error("Failed pattern match");
            };
        };
    };
};

/**
 *  | Test if a key is a member of a map
 */
var member = function (__dict_Ord_7) {
    return function (k) {
        return function (m) {
            return Data_Maybe.isJust(lookup(__dict_Ord_7)(k)(m));
        };
    };
};

/**
 *  | Get an array of the keys contained in a map
 */
var keys = function (_606) {
    if (_606 instanceof Leaf) {
        return [  ];
    };
    if (_606 instanceof Two) {
        return Prelude["++"](Data_Array.semigroupArray)(keys(_606.value0))(Prelude["++"](Data_Array.semigroupArray)([ _606.value1 ])(keys(_606.value3)));
    };
    if (_606 instanceof Three) {
        return Prelude["++"](Data_Array.semigroupArray)(keys(_606.value0))(Prelude["++"](Data_Array.semigroupArray)([ _606.value1 ])(Prelude["++"](Data_Array.semigroupArray)(keys(_606.value3))(Prelude["++"](Data_Array.semigroupArray)([ _606.value4 ])(keys(_606.value6)))));
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Test if a map is empty
 */
var isEmpty = function (_601) {
    if (_601 instanceof Leaf) {
        return true;
    };
    return false;
};
var functorMap = new Prelude.Functor(function (f) {
    return function (_608) {
        if (_608 instanceof Leaf) {
            return Leaf.value;
        };
        if (_608 instanceof Two) {
            return new Two(Prelude["<$>"](functorMap)(f)(_608.value0), _608.value1, f(_608.value2), Prelude["<$>"](functorMap)(f)(_608.value3));
        };
        if (_608 instanceof Three) {
            return new Three(Prelude["<$>"](functorMap)(f)(_608.value0), _608.value1, f(_608.value2), Prelude["<$>"](functorMap)(f)(_608.value3), _608.value4, f(_608.value5), Prelude["<$>"](functorMap)(f)(_608.value6));
        };
        throw new Error("Failed pattern match");
    };
});

/**
 *  | Apply a function to the values in a map
 */
var map = Prelude["<$>"](functorMap);
var fromZipper = function (__copy___dict_Ord_8) {
    return function (__copy__603) {
        return function (__copy__604) {
            var __dict_Ord_8 = __copy___dict_Ord_8;
            var _603 = __copy__603;
            var _604 = __copy__604;
            tco: while (true) {
                if (_603.length === 0) {
                    return _604;
                };
                if (_603.length >= 1) {
                    var _2389 = _603.slice(1);
                    if (_603[0] instanceof TwoLeft) {
                        var __tco___dict_Ord_8 = __dict_Ord_8;
                        var __tco__604 = new Two(_604, (_603[0]).value0, (_603[0]).value1, (_603[0]).value2);
                        __dict_Ord_8 = __tco___dict_Ord_8;
                        _603 = _2389;
                        _604 = __tco__604;
                        continue tco;
                    };
                };
                if (_603.length >= 1) {
                    var _2394 = _603.slice(1);
                    if (_603[0] instanceof TwoRight) {
                        var __tco___dict_Ord_8 = __dict_Ord_8;
                        var __tco__604 = new Two((_603[0]).value0, (_603[0]).value1, (_603[0]).value2, _604);
                        __dict_Ord_8 = __tco___dict_Ord_8;
                        _603 = _2394;
                        _604 = __tco__604;
                        continue tco;
                    };
                };
                if (_603.length >= 1) {
                    var _2402 = _603.slice(1);
                    if (_603[0] instanceof ThreeLeft) {
                        var __tco___dict_Ord_8 = __dict_Ord_8;
                        var __tco__604 = new Three(_604, (_603[0]).value0, (_603[0]).value1, (_603[0]).value2, (_603[0]).value3, (_603[0]).value4, (_603[0]).value5);
                        __dict_Ord_8 = __tco___dict_Ord_8;
                        _603 = _2402;
                        _604 = __tco__604;
                        continue tco;
                    };
                };
                if (_603.length >= 1) {
                    var _2410 = _603.slice(1);
                    if (_603[0] instanceof ThreeMiddle) {
                        var __tco___dict_Ord_8 = __dict_Ord_8;
                        var __tco__604 = new Three((_603[0]).value0, (_603[0]).value1, (_603[0]).value2, _604, (_603[0]).value3, (_603[0]).value4, (_603[0]).value5);
                        __dict_Ord_8 = __tco___dict_Ord_8;
                        _603 = _2410;
                        _604 = __tco__604;
                        continue tco;
                    };
                };
                if (_603.length >= 1) {
                    var _2418 = _603.slice(1);
                    if (_603[0] instanceof ThreeRight) {
                        var __tco___dict_Ord_8 = __dict_Ord_8;
                        var __tco__604 = new Three((_603[0]).value0, (_603[0]).value1, (_603[0]).value2, (_603[0]).value3, (_603[0]).value4, (_603[0]).value5, _604);
                        __dict_Ord_8 = __tco___dict_Ord_8;
                        _603 = _2418;
                        _604 = __tco__604;
                        continue tco;
                    };
                };
                throw new Error("Failed pattern match");
            };
        };
    };
};

/**
 *  | Insert a key/value pair into a map
 */
var insert = function (__dict_Ord_9) {
    var up = function (__copy___dict_Ord_10) {
        return function (__copy__611) {
            return function (__copy__612) {
                var __dict_Ord_10 = __copy___dict_Ord_10;
                var _611 = __copy__611;
                var _612 = __copy__612;
                tco: while (true) {
                    if (_611.length === 0) {
                        return new Two(_612.value0, _612.value1, _612.value2, _612.value3);
                    };
                    if (_611.length >= 1) {
                        var _2433 = _611.slice(1);
                        if (_611[0] instanceof TwoLeft) {
                            return fromZipper(__dict_Ord_10)(_2433)(new Three(_612.value0, _612.value1, _612.value2, _612.value3, (_611[0]).value0, (_611[0]).value1, (_611[0]).value2));
                        };
                    };
                    if (_611.length >= 1) {
                        var _2442 = _611.slice(1);
                        if (_611[0] instanceof TwoRight) {
                            return fromZipper(__dict_Ord_10)(_2442)(new Three((_611[0]).value0, (_611[0]).value1, (_611[0]).value2, _612.value0, _612.value1, _612.value2, _612.value3));
                        };
                    };
                    if (_611.length >= 1) {
                        var _2454 = _611.slice(1);
                        if (_611[0] instanceof ThreeLeft) {
                            var __tco___dict_Ord_10 = __dict_Ord_10;
                            var __tco__612 = new KickUp(new Two(_612.value0, _612.value1, _612.value2, _612.value3), (_611[0]).value0, (_611[0]).value1, new Two((_611[0]).value2, (_611[0]).value3, (_611[0]).value4, (_611[0]).value5));
                            __dict_Ord_10 = __tco___dict_Ord_10;
                            _611 = _2454;
                            _612 = __tco__612;
                            continue tco;
                        };
                    };
                    if (_611.length >= 1) {
                        var _2466 = _611.slice(1);
                        if (_611[0] instanceof ThreeMiddle) {
                            var __tco___dict_Ord_10 = __dict_Ord_10;
                            var __tco__612 = new KickUp(new Two((_611[0]).value0, (_611[0]).value1, (_611[0]).value2, _612.value0), _612.value1, _612.value2, new Two(_612.value3, (_611[0]).value3, (_611[0]).value4, (_611[0]).value5));
                            __dict_Ord_10 = __tco___dict_Ord_10;
                            _611 = _2466;
                            _612 = __tco__612;
                            continue tco;
                        };
                    };
                    if (_611.length >= 1) {
                        var _2478 = _611.slice(1);
                        if (_611[0] instanceof ThreeRight) {
                            var __tco___dict_Ord_10 = __dict_Ord_10;
                            var __tco__612 = new KickUp(new Two((_611[0]).value0, (_611[0]).value1, (_611[0]).value2, (_611[0]).value3), (_611[0]).value4, (_611[0]).value5, new Two(_612.value0, _612.value1, _612.value2, _612.value3));
                            __dict_Ord_10 = __tco___dict_Ord_10;
                            _611 = _2478;
                            _612 = __tco__612;
                            continue tco;
                        };
                    };
                    throw new Error("Failed pattern match");
                };
            };
        };
    };
    var down = function (__copy___dict_Ord_11) {
        return function (__copy_ctx) {
            return function (__copy_k) {
                return function (__copy_v) {
                    return function (__copy__610) {
                        var __dict_Ord_11 = __copy___dict_Ord_11;
                        var ctx = __copy_ctx;
                        var k = __copy_k;
                        var v = __copy_v;
                        var _610 = __copy__610;
                        tco: while (true) {
                            if (_610 instanceof Leaf) {
                                return up(__dict_Ord_11)(ctx)(new KickUp(Leaf.value, k, v, Leaf.value));
                            };
                            if (_610 instanceof Two && Prelude["=="](__dict_Ord_11["__superclass_Prelude.Eq_0"]())(k)(_610.value1)) {
                                return fromZipper(__dict_Ord_11)(ctx)(new Two(_610.value0, k, v, _610.value3));
                            };
                            if (_610 instanceof Two && Prelude["<"](__dict_Ord_11)(k)(_610.value1)) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = Prelude[":"](new TwoLeft(_610.value1, _610.value2, _610.value3))(ctx);
                                var __tco_k = k;
                                var __tco_v = v;
                                var __tco__610 = _610.value0;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                v = __tco_v;
                                _610 = __tco__610;
                                continue tco;
                            };
                            if (_610 instanceof Two) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = Prelude[":"](new TwoRight(_610.value0, _610.value1, _610.value2))(ctx);
                                var __tco_k = k;
                                var __tco_v = v;
                                var __tco__610 = _610.value3;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                v = __tco_v;
                                _610 = __tco__610;
                                continue tco;
                            };
                            if (_610 instanceof Three && Prelude["=="](__dict_Ord_11["__superclass_Prelude.Eq_0"]())(k)(_610.value1)) {
                                return fromZipper(__dict_Ord_11)(ctx)(new Three(_610.value0, k, v, _610.value3, _610.value4, _610.value5, _610.value6));
                            };
                            if (_610 instanceof Three && Prelude["=="](__dict_Ord_11["__superclass_Prelude.Eq_0"]())(k)(_610.value4)) {
                                return fromZipper(__dict_Ord_11)(ctx)(new Three(_610.value0, _610.value1, _610.value2, _610.value3, k, v, _610.value6));
                            };
                            if (_610 instanceof Three && Prelude["<"](__dict_Ord_11)(k)(_610.value1)) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = Prelude[":"](new ThreeLeft(_610.value1, _610.value2, _610.value3, _610.value4, _610.value5, _610.value6))(ctx);
                                var __tco_k = k;
                                var __tco_v = v;
                                var __tco__610 = _610.value0;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                v = __tco_v;
                                _610 = __tco__610;
                                continue tco;
                            };
                            if (_610 instanceof Three && (Prelude["<"](__dict_Ord_11)(_610.value1)(k) && Prelude["<="](__dict_Ord_11)(k)(_610.value4))) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = Prelude[":"](new ThreeMiddle(_610.value0, _610.value1, _610.value2, _610.value4, _610.value5, _610.value6))(ctx);
                                var __tco_k = k;
                                var __tco_v = v;
                                var __tco__610 = _610.value3;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                v = __tco_v;
                                _610 = __tco__610;
                                continue tco;
                            };
                            if (_610 instanceof Three) {
                                var __tco___dict_Ord_11 = __dict_Ord_11;
                                var __tco_ctx = Prelude[":"](new ThreeRight(_610.value0, _610.value1, _610.value2, _610.value3, _610.value4, _610.value5))(ctx);
                                var __tco_k = k;
                                var __tco_v = v;
                                var __tco__610 = _610.value6;
                                __dict_Ord_11 = __tco___dict_Ord_11;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                v = __tco_v;
                                _610 = __tco__610;
                                continue tco;
                            };
                            throw new Error("Failed pattern match");
                        };
                    };
                };
            };
        };
    };
    return down(__dict_Ord_9)([  ]);
};
var foldableMap = new Data_Foldable.Foldable(function (__dict_Monoid_12) {
    return function (f) {
        return function (m) {
            return Data_Foldable.foldMap(Data_Foldable.foldableArray)(__dict_Monoid_12)(f)(values(m));
        };
    };
}, function (f) {
    return function (z) {
        return function (m) {
            return Data_Foldable.foldl(Data_Foldable.foldableArray)(f)(z)(values(m));
        };
    };
}, function (f) {
    return function (z) {
        return function (m) {
            return Data_Foldable.foldr(Data_Foldable.foldableArray)(f)(z)(values(m));
        };
    };
});
var eqMap = function (__dict_Eq_13) {
    return function (__dict_Eq_14) {
        return new Prelude.Eq(function (m1) {
            return function (m2) {
                return !Prelude["=="](eqMap(__dict_Eq_13)(__dict_Eq_14))(m1)(m2);
            };
        }, function (m1) {
            return function (m2) {
                return Prelude["=="](Prelude.eqArray(Data_Tuple.eqTuple(__dict_Eq_13)(__dict_Eq_14)))(toList(m1))(toList(m2));
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
                return Prelude.compare(Prelude.ordArray(Data_Tuple.ordTuple(__dict_Ord_4)(__dict_Ord_5)))(toList(m1))(toList(m2));
            };
        });
    };
};

/**
 *  | An empty map
 */
var empty = Leaf.value;

/**
 *  | Create a map from an array of key/value pairs
 */
var fromList = function (__dict_Ord_15) {
    return Data_Foldable.foldl(Data_Foldable.foldableArray)(function (m) {
        return function (_598) {
            return insert(__dict_Ord_15)(_598.value0)(_598.value1)(m);
        };
    })(empty);
};

/**
 *  | Delete a key and its corresponding value from a map
 */
var $$delete = function (__dict_Ord_17) {
    var up = function (__copy___dict_Ord_18) {
        return function (__copy__614) {
            return function (__copy_e) {
                var __dict_Ord_18 = __copy___dict_Ord_18;
                var _614 = __copy__614;
                var e = __copy_e;
                tco: while (true) {
                    if (_614.length === 0) {
                        return e;
                    };
                    if (_614.length >= 1) {
                        var _2539 = _614.slice(1);
                        if (_614[0] instanceof TwoLeft && ((_614[0]).value2 instanceof Leaf && e instanceof Leaf)) {
                            return fromZipper(__dict_Ord_18)(_2539)(new Two(Leaf.value, (_614[0]).value0, (_614[0]).value1, Leaf.value));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2544 = _614.slice(1);
                        if (_614[0] instanceof TwoRight && ((_614[0]).value0 instanceof Leaf && e instanceof Leaf)) {
                            return fromZipper(__dict_Ord_18)(_2544)(new Two(Leaf.value, (_614[0]).value1, (_614[0]).value2, Leaf.value));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2553 = _614.slice(1);
                        if (_614[0] instanceof TwoLeft && (_614[0]).value2 instanceof Two) {
                            var __tco___dict_Ord_18 = __dict_Ord_18;
                            var __tco_e = new Three(e, (_614[0]).value0, (_614[0]).value1, (_614[0]).value2.value0, (_614[0]).value2.value1, (_614[0]).value2.value2, (_614[0]).value2.value3);
                            __dict_Ord_18 = __tco___dict_Ord_18;
                            _614 = _2553;
                            e = __tco_e;
                            continue tco;
                        };
                    };
                    if (_614.length >= 1) {
                        var _2562 = _614.slice(1);
                        if (_614[0] instanceof TwoRight && (_614[0]).value0 instanceof Two) {
                            var __tco___dict_Ord_18 = __dict_Ord_18;
                            var __tco_e = new Three((_614[0]).value0.value0, (_614[0]).value0.value1, (_614[0]).value0.value2, (_614[0]).value0.value3, (_614[0]).value1, (_614[0]).value2, e);
                            __dict_Ord_18 = __tco___dict_Ord_18;
                            _614 = _2562;
                            e = __tco_e;
                            continue tco;
                        };
                    };
                    if (_614.length >= 1) {
                        var _2574 = _614.slice(1);
                        if (_614[0] instanceof TwoLeft && (_614[0]).value2 instanceof Three) {
                            return fromZipper(__dict_Ord_18)(_2574)(new Two(new Two(e, (_614[0]).value0, (_614[0]).value1, (_614[0]).value2.value0), (_614[0]).value2.value1, (_614[0]).value2.value2, new Two((_614[0]).value2.value3, (_614[0]).value2.value4, (_614[0]).value2.value5, (_614[0]).value2.value6)));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2586 = _614.slice(1);
                        if (_614[0] instanceof TwoRight && (_614[0]).value0 instanceof Three) {
                            return fromZipper(__dict_Ord_18)(_2586)(new Two(new Two((_614[0]).value0.value0, (_614[0]).value0.value1, (_614[0]).value0.value2, (_614[0]).value0.value3), (_614[0]).value0.value4, (_614[0]).value0.value5, new Two((_614[0]).value0.value6, (_614[0]).value1, (_614[0]).value2, e)));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2594 = _614.slice(1);
                        if (_614[0] instanceof ThreeLeft && ((_614[0]).value2 instanceof Leaf && ((_614[0]).value5 instanceof Leaf && e instanceof Leaf))) {
                            return fromZipper(__dict_Ord_18)(_2594)(new Three(Leaf.value, (_614[0]).value0, (_614[0]).value1, Leaf.value, (_614[0]).value3, (_614[0]).value4, Leaf.value));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2602 = _614.slice(1);
                        if (_614[0] instanceof ThreeMiddle && ((_614[0]).value0 instanceof Leaf && ((_614[0]).value5 instanceof Leaf && e instanceof Leaf))) {
                            return fromZipper(__dict_Ord_18)(_2602)(new Three(Leaf.value, (_614[0]).value1, (_614[0]).value2, Leaf.value, (_614[0]).value3, (_614[0]).value4, Leaf.value));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2610 = _614.slice(1);
                        if (_614[0] instanceof ThreeRight && ((_614[0]).value0 instanceof Leaf && ((_614[0]).value3 instanceof Leaf && e instanceof Leaf))) {
                            return fromZipper(__dict_Ord_18)(_2610)(new Three(Leaf.value, (_614[0]).value1, (_614[0]).value2, Leaf.value, (_614[0]).value4, (_614[0]).value5, Leaf.value));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2622 = _614.slice(1);
                        if (_614[0] instanceof ThreeLeft && (_614[0]).value2 instanceof Two) {
                            return fromZipper(__dict_Ord_18)(_2622)(new Two(new Three(e, (_614[0]).value0, (_614[0]).value1, (_614[0]).value2.value0, (_614[0]).value2.value1, (_614[0]).value2.value2, (_614[0]).value2.value3), (_614[0]).value3, (_614[0]).value4, (_614[0]).value5));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2634 = _614.slice(1);
                        if (_614[0] instanceof ThreeMiddle && (_614[0]).value0 instanceof Two) {
                            return fromZipper(__dict_Ord_18)(_2634)(new Two(new Three((_614[0]).value0.value0, (_614[0]).value0.value1, (_614[0]).value0.value2, (_614[0]).value0.value3, (_614[0]).value1, (_614[0]).value2, e), (_614[0]).value3, (_614[0]).value4, (_614[0]).value5));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2646 = _614.slice(1);
                        if (_614[0] instanceof ThreeMiddle && (_614[0]).value5 instanceof Two) {
                            return fromZipper(__dict_Ord_18)(_2646)(new Two((_614[0]).value0, (_614[0]).value1, (_614[0]).value2, new Three(e, (_614[0]).value3, (_614[0]).value4, (_614[0]).value5.value0, (_614[0]).value5.value1, (_614[0]).value5.value2, (_614[0]).value5.value3)));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2658 = _614.slice(1);
                        if (_614[0] instanceof ThreeRight && (_614[0]).value3 instanceof Two) {
                            return fromZipper(__dict_Ord_18)(_2658)(new Two((_614[0]).value0, (_614[0]).value1, (_614[0]).value2, new Three((_614[0]).value3.value0, (_614[0]).value3.value1, (_614[0]).value3.value2, (_614[0]).value3.value3, (_614[0]).value4, (_614[0]).value5, e)));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2673 = _614.slice(1);
                        if (_614[0] instanceof ThreeLeft && (_614[0]).value2 instanceof Three) {
                            return fromZipper(__dict_Ord_18)(_2673)(new Three(new Two(e, (_614[0]).value0, (_614[0]).value1, (_614[0]).value2.value0), (_614[0]).value2.value1, (_614[0]).value2.value2, new Two((_614[0]).value2.value3, (_614[0]).value2.value4, (_614[0]).value2.value5, (_614[0]).value2.value6), (_614[0]).value3, (_614[0]).value4, (_614[0]).value5));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2688 = _614.slice(1);
                        if (_614[0] instanceof ThreeMiddle && (_614[0]).value0 instanceof Three) {
                            return fromZipper(__dict_Ord_18)(_2688)(new Three(new Two((_614[0]).value0.value0, (_614[0]).value0.value1, (_614[0]).value0.value2, (_614[0]).value0.value3), (_614[0]).value0.value4, (_614[0]).value0.value5, new Two((_614[0]).value0.value6, (_614[0]).value1, (_614[0]).value2, e), (_614[0]).value3, (_614[0]).value4, (_614[0]).value5));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2703 = _614.slice(1);
                        if (_614[0] instanceof ThreeMiddle && (_614[0]).value5 instanceof Three) {
                            return fromZipper(__dict_Ord_18)(_2703)(new Three((_614[0]).value0, (_614[0]).value1, (_614[0]).value2, new Two(e, (_614[0]).value3, (_614[0]).value4, (_614[0]).value5.value0), (_614[0]).value5.value1, (_614[0]).value5.value2, new Two((_614[0]).value5.value3, (_614[0]).value5.value4, (_614[0]).value5.value5, (_614[0]).value5.value6)));
                        };
                    };
                    if (_614.length >= 1) {
                        var _2718 = _614.slice(1);
                        if (_614[0] instanceof ThreeRight && (_614[0]).value3 instanceof Three) {
                            return fromZipper(__dict_Ord_18)(_2718)(new Three((_614[0]).value0, (_614[0]).value1, (_614[0]).value2, new Two((_614[0]).value3.value0, (_614[0]).value3.value1, (_614[0]).value3.value2, (_614[0]).value3.value3), (_614[0]).value3.value4, (_614[0]).value3.value5, new Two((_614[0]).value3.value6, (_614[0]).value4, (_614[0]).value5, e)));
                        };
                    };
                    throw new Error("Failed pattern match");
                };
            };
        };
    };
    var removeMaxNode = function (__copy___dict_Ord_19) {
        return function (__copy_ctx) {
            return function (__copy__616) {
                var __dict_Ord_19 = __copy___dict_Ord_19;
                var ctx = __copy_ctx;
                var _616 = __copy__616;
                tco: while (true) {
                    if (_616 instanceof Two && (_616.value0 instanceof Leaf && _616.value3 instanceof Leaf)) {
                        return up(__dict_Ord_19)(ctx)(Leaf.value);
                    };
                    if (_616 instanceof Two) {
                        var __tco___dict_Ord_19 = __dict_Ord_19;
                        var __tco_ctx = Prelude[":"](new TwoRight(_616.value0, _616.value1, _616.value2))(ctx);
                        var __tco__616 = _616.value3;
                        __dict_Ord_19 = __tco___dict_Ord_19;
                        ctx = __tco_ctx;
                        _616 = __tco__616;
                        continue tco;
                    };
                    if (_616 instanceof Three && (_616.value0 instanceof Leaf && (_616.value3 instanceof Leaf && _616.value6 instanceof Leaf))) {
                        return up(__dict_Ord_19)(Prelude[":"](new TwoRight(Leaf.value, _616.value1, _616.value2))(ctx))(Leaf.value);
                    };
                    if (_616 instanceof Three) {
                        var __tco___dict_Ord_19 = __dict_Ord_19;
                        var __tco_ctx = Prelude[":"](new ThreeRight(_616.value0, _616.value1, _616.value2, _616.value3, _616.value4, _616.value5))(ctx);
                        var __tco__616 = _616.value6;
                        __dict_Ord_19 = __tco___dict_Ord_19;
                        ctx = __tco_ctx;
                        _616 = __tco__616;
                        continue tco;
                    };
                    throw new Error("Failed pattern match");
                };
            };
        };
    };
    var maxNode = function (__copy___dict_Ord_20) {
        return function (__copy__615) {
            var __dict_Ord_20 = __copy___dict_Ord_20;
            var _615 = __copy__615;
            tco: while (true) {
                if (_615 instanceof Two && _615.value3 instanceof Leaf) {
                    return {
                        key: _615.value1, 
                        value: _615.value2
                    };
                };
                if (_615 instanceof Two) {
                    var __tco___dict_Ord_20 = __dict_Ord_20;
                    var __tco__615 = _615.value3;
                    __dict_Ord_20 = __tco___dict_Ord_20;
                    _615 = __tco__615;
                    continue tco;
                };
                if (_615 instanceof Three && _615.value6 instanceof Leaf) {
                    return {
                        key: _615.value4, 
                        value: _615.value5
                    };
                };
                if (_615 instanceof Three) {
                    var __tco___dict_Ord_20 = __dict_Ord_20;
                    var __tco__615 = _615.value6;
                    __dict_Ord_20 = __tco___dict_Ord_20;
                    _615 = __tco__615;
                    continue tco;
                };
                throw new Error("Failed pattern match");
            };
        };
    };
    var down = function (__copy___dict_Ord_21) {
        return function (__copy_ctx) {
            return function (__copy_k) {
                return function (__copy__613) {
                    var __dict_Ord_21 = __copy___dict_Ord_21;
                    var ctx = __copy_ctx;
                    var k = __copy_k;
                    var _613 = __copy__613;
                    tco: while (true) {
                        if (_613 instanceof Leaf) {
                            return fromZipper(__dict_Ord_21)(ctx)(Leaf.value);
                        };
                        if (_613 instanceof Two && (_613.value0 instanceof Leaf && (_613.value3 instanceof Leaf && Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_613.value1)))) {
                            return up(__dict_Ord_21)(ctx)(Leaf.value);
                        };
                        if (_613 instanceof Two) {
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_613.value1)) {
                                var max = maxNode(__dict_Ord_21)(_613.value0);
                                return removeMaxNode(__dict_Ord_21)(Prelude[":"](new TwoLeft(max.key, max.value, _613.value3))(ctx))(_613.value0);
                            };
                            if (Prelude["<"](__dict_Ord_21)(k)(_613.value1)) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = Prelude[":"](new TwoLeft(_613.value1, _613.value2, _613.value3))(ctx);
                                var __tco_k = k;
                                var __tco__613 = _613.value0;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _613 = __tco__613;
                                continue tco;
                            };
                            if (Prelude.otherwise) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = Prelude[":"](new TwoRight(_613.value0, _613.value1, _613.value2))(ctx);
                                var __tco_k = k;
                                var __tco__613 = _613.value3;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _613 = __tco__613;
                                continue tco;
                            };
                        };
                        if (_613 instanceof Three && (_613.value0 instanceof Leaf && (_613.value3 instanceof Leaf && _613.value6 instanceof Leaf))) {
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_613.value1)) {
                                return fromZipper(__dict_Ord_21)(ctx)(new Two(Leaf.value, _613.value4, _613.value5, Leaf.value));
                            };
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_613.value4)) {
                                return fromZipper(__dict_Ord_21)(ctx)(new Two(Leaf.value, _613.value1, _613.value2, Leaf.value));
                            };
                        };
                        if (_613 instanceof Three) {
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_613.value1)) {
                                var max = maxNode(__dict_Ord_21)(_613.value0);
                                return removeMaxNode(__dict_Ord_21)(Prelude[":"](new ThreeLeft(max.key, max.value, _613.value3, _613.value4, _613.value5, _613.value6))(ctx))(_613.value0);
                            };
                            if (Prelude["=="](__dict_Ord_21["__superclass_Prelude.Eq_0"]())(k)(_613.value4)) {
                                var max = maxNode(__dict_Ord_21)(_613.value3);
                                return removeMaxNode(__dict_Ord_21)(Prelude[":"](new ThreeMiddle(_613.value0, _613.value1, _613.value2, max.key, max.value, _613.value6))(ctx))(_613.value3);
                            };
                            if (Prelude["<"](__dict_Ord_21)(k)(_613.value1)) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = Prelude[":"](new ThreeLeft(_613.value1, _613.value2, _613.value3, _613.value4, _613.value5, _613.value6))(ctx);
                                var __tco_k = k;
                                var __tco__613 = _613.value0;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _613 = __tco__613;
                                continue tco;
                            };
                            if (Prelude["<"](__dict_Ord_21)(_613.value1)(k) && Prelude["<"](__dict_Ord_21)(k)(_613.value4)) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = Prelude[":"](new ThreeMiddle(_613.value0, _613.value1, _613.value2, _613.value4, _613.value5, _613.value6))(ctx);
                                var __tco_k = k;
                                var __tco__613 = _613.value3;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _613 = __tco__613;
                                continue tco;
                            };
                            if (Prelude.otherwise) {
                                var __tco___dict_Ord_21 = __dict_Ord_21;
                                var __tco_ctx = Prelude[":"](new ThreeRight(_613.value0, _613.value1, _613.value2, _613.value3, _613.value4, _613.value5))(ctx);
                                var __tco_k = k;
                                var __tco__613 = _613.value6;
                                __dict_Ord_21 = __tco___dict_Ord_21;
                                ctx = __tco_ctx;
                                k = __tco_k;
                                _613 = __tco__613;
                                continue tco;
                            };
                        };
                        throw new Error("Failed pattern match");
                    };
                };
            };
        };
    };
    return down(__dict_Ord_17)([  ]);
};

/**
 *  | Check whether the underlying tree satisfies the 2-3 invariant
 *  |
 *  | This function is provided for internal use.
 */
var checkValid = function (tree) {
    var allHeights = function (_609) {
        if (_609 instanceof Leaf) {
            return [ 0 ];
        };
        if (_609 instanceof Two) {
            return Data_Array.map(function (n) {
                return n + 1;
            })(Prelude["++"](Data_Array.semigroupArray)(allHeights(_609.value0))(allHeights(_609.value3)));
        };
        if (_609 instanceof Three) {
            return Data_Array.map(function (n) {
                return n + 1;
            })(Prelude["++"](Data_Array.semigroupArray)(allHeights(_609.value0))(Prelude["++"](Data_Array.semigroupArray)(allHeights(_609.value3))(allHeights(_609.value6))));
        };
        throw new Error("Failed pattern match");
    };
    return Data_Array.length(Data_Array.nub(Prelude.eqNumber)(allHeights(tree))) === 1;
};

/**
 *  | Insert the value, delete a value, or update a value for a key in a map
 */
var alter = function (__dict_Ord_22) {
    return function (f) {
        return function (k) {
            return function (m) {
                var _2803 = f(lookup(__dict_Ord_22)(k)(m));
                if (_2803 instanceof Data_Maybe.Nothing) {
                    return $$delete(__dict_Ord_22)(k)(m);
                };
                if (_2803 instanceof Data_Maybe.Just) {
                    return insert(__dict_Ord_22)(k)(_2803.value0)(m);
                };
                throw new Error("Failed pattern match");
            };
        };
    };
};

/**
 *  | Create a map from an array of key/value pairs, using the specified function
 *  | to combine values for duplicate keys.
 */
var fromListWith = function (__dict_Ord_23) {
    return function (f) {
        var combine = function (v) {
            return function (_617) {
                if (_617 instanceof Data_Maybe.Just) {
                    return Data_Maybe.Just.create(f(v)(_617.value0));
                };
                if (_617 instanceof Data_Maybe.Nothing) {
                    return new Data_Maybe.Just(v);
                };
                throw new Error("Failed pattern match");
            };
        };
        return Data_Foldable.foldl(Data_Foldable.foldableArray)(function (m) {
            return function (_599) {
                return alter(__dict_Ord_23)(combine(_599.value1))(_599.value0)(m);
            };
        })(empty);
    };
};

/**
 *  | Compute the union of two maps, using the specified function
 *  | to combine values for duplicate keys.
 */
var unionWith = function (__dict_Ord_24) {
    return function (f) {
        return function (m1) {
            return function (m2) {
                var go = function (m) {
                    return function (_618) {
                        return alter(__dict_Ord_24)(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Maybe.Just.create)(Data_Maybe.maybe(_618.value1)(f(_618.value1))))(_618.value0)(m);
                    };
                };
                return Data_Foldable.foldl(Data_Foldable.foldableArray)(go)(m2)(toList(m1));
            };
        };
    };
};

/**
 *  | Compute the union of two maps, preferring values from the first map in the case
 *  | of duplicate keys
 */
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
        return Data_Traversable.traverse(traversableMap(__dict_Ord_27))(__dict_Applicative_29)(Prelude.id(Prelude.categoryArr));
    }, function (__dict_Applicative_28) {
        return function (f) {
            return function (ms) {
                return Data_Foldable.foldr(Data_Foldable.foldableArray)(function (x) {
                    return function (acc) {
                        return Prelude["<*>"](__dict_Applicative_28["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_28["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(union(__dict_Ord_27))(x))(acc);
                    };
                })(Prelude.pure(__dict_Applicative_28)(empty))(Prelude["<$>"](Data_Array.functorArray)(Prelude["<$>"]((__dict_Applicative_28["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Tuple.uncurry(singleton)))(Prelude["<$>"](Data_Array.functorArray)(Data_Traversable.traverse(Data_Traversable.traversableTuple)(__dict_Applicative_28)(f))(toList(ms))));
            };
        };
    });
};

/**
 *  | Compute the union of a collection of maps
 */
var unions = function (__dict_Ord_30) {
    return Data_Foldable.foldl(Data_Foldable.foldableArray)(union(__dict_Ord_30))(empty);
};

/**
 *  | Update or delete the value for a key in a map
 */
var update = function (__dict_Ord_31) {
    return function (f) {
        return function (k) {
            return function (m) {
                return alter(__dict_Ord_31)(Data_Maybe.maybe(Data_Maybe.Nothing.value)(f))(k)(m);
            };
        };
    };
};
module.exports = {
    size: size, 
    map: map, 
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

},{"Data.Array":61,"Data.Foldable":76,"Data.Maybe":90,"Data.Monoid":97,"Data.Traversable":107,"Data.Tuple":108,"Prelude":127}],89:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Maybe = require("Data.Maybe");

/**
 *  | A partial function that extracts the value from the `Just` data
 *  | constructor. Passing `Nothing` to `fromJust` will throw an error at
 *  | runtime.
 */
var fromJust = function (_171) {
    if (_171 instanceof Data_Maybe.Just) {
        return _171.value0;
    };
    throw new Error("Failed pattern match");
};
module.exports = {
    fromJust: fromJust
};

},{"Data.Maybe":90,"Prelude":127}],90:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Alt = require("Control.Alt");
var Control_Alternative = require("Control.Alternative");
var Control_Extend = require("Control.Extend");
var Control_MonadPlus = require("Control.MonadPlus");
var Control_Plus = require("Control.Plus");

/**
 *  | The `Maybe` type is used to represent optional values and can be seen as
 *  | something like a type-safe `null`, where `Nothing` is `null` and `Just x`
 *  | is the non-null value `x`.
 */
var Nothing = (function () {
    function Nothing() {

    };
    Nothing.value = new Nothing();
    return Nothing;
})();

/**
 *  | The `Maybe` type is used to represent optional values and can be seen as
 *  | something like a type-safe `null`, where `Nothing` is `null` and `Just x`
 *  | is the non-null value `x`.
 */
var Just = (function () {
    function Just(value0) {
        this.value0 = value0;
    };
    Just.create = function (value0) {
        return new Just(value0);
    };
    return Just;
})();

/**
 *  | The `Show` instance allows `Maybe` values to be rendered as a string with
 *  | `show` whenever there is an `Show` instance for the type the `Maybe`
 *  | contains.
 */
var showMaybe = function (__dict_Show_0) {
    return new Prelude.Show(function (_152) {
        if (_152 instanceof Just) {
            return "Just (" + (Prelude.show(__dict_Show_0)(_152.value0) + ")");
        };
        if (_152 instanceof Nothing) {
            return "Nothing";
        };
        throw new Error("Failed pattern match");
    });
};

/**
 *  | The `Semigroup` instance enables use of the operator `<>` on `Maybe` values
 *  | whenever there is a `Semigroup` instance for the type the `Maybe` contains.
 *  | The exact behaviour of `<>` depends on the "inner" `Semigroup` instance,
 *  | but generally captures the notion of appending or combining things.
 *  |
 *  | ``` purescript
 *  | Just x <> Just y = Just (x <> y)
 *  | Just x <> Nothing = Just x
 *  | Nothing <> Just y = Just y
 *  | Nothing <> Nothing = Nothing
 *  | ```
 */
var semigroupMaybe = function (__dict_Semigroup_1) {
    return new Prelude.Semigroup(function (x) {
        return function (x_1) {
            if (x_1 instanceof Nothing) {
                return x_1;
            };
            if (x_1 instanceof Nothing) {
                return x_1;
            };
            if (x_1 instanceof Just && x_1 instanceof Just) {
                return new Just(Prelude["<>"](__dict_Semigroup_1)(x_1.value0)(x_1.value0));
            };
            throw new Error("Failed pattern match");
        };
    });
};

/**
 *  | Takes a default value, a function, and a `Maybe` value. If the `Maybe`
 *  | value is `Nothing` the default value is returned, otherwise the function
 *  | is applied to the value inside the `Just` and the result is returned.
 *  |
 *  | ``` purescript
 *  | maybe x f Nothing == x
 *  | maybe x f (Just y) == f y
 *  | ```
 */
var maybe = function (b) {
    return function (f) {
        return function (_148) {
            if (_148 instanceof Nothing) {
                return b;
            };
            if (_148 instanceof Just) {
                return f(_148.value0);
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Returns `true` when the `Maybe` value is `Nothing`.
 */
var isNothing = maybe(true)(Prelude["const"](false));

/**
 *  | Returns `true` when the `Maybe` value was constructed with `Just`.
 */
var isJust = maybe(false)(Prelude["const"](true));

/**
 *  | The `Functor` instance allows functions to transform the contents of a
 *  | `Just` with the `<$>` operator:
 *  |
 *  | ``` purescript
 *  | f <$> Just x == Just (f x)
 *  | ```
 *  |
 *  | `Nothing` values are left untouched:
 *  |
 *  | ``` purescript
 *  | f <$> Nothing == Nothing
 *  | ```
 */
var functorMaybe = new Prelude.Functor(function (fn) {
    return function (_149) {
        if (_149 instanceof Just) {
            return new Just(fn(_149.value0));
        };
        return Nothing.value;
    };
});

/**
 *  | Takes a default value, and a `Maybe` value. If the `Maybe` value is
 *  | `Nothing` the default value is returned, otherwise the value inside the
 *  | `Just` is returned.
 *  |
 *  | ``` purescript
 *  | fromMaybe x Nothing == x
 *  | fromMaybe x (Just y) == y
 *  | ```
 */
var fromMaybe = function (a) {
    return maybe(a)(Prelude.id(Prelude.categoryArr));
};

/**
 *  | The `Extend` instance allows sequencing of `Maybe` values and functions
 *  | that accept a `Maybe a` and return a non-`Maybe` result using the
 *  | `<<=` operator.
 *  |
 *  | ``` purescript
 *  | f <<= Nothing = Nothing
 *  | f <<= Just x = Just (f x)
 *  | ```
 */
var extendMaybe = new Control_Extend.Extend(function (f) {
    return function (x) {
        if (x instanceof Nothing) {
            return Nothing.value;
        };
        return new Just(f(x));
    };
}, function () {
    return functorMaybe;
});

/**
 *  | The `Eq` instance allows `Maybe` values to be checked for equality with
 *  | `==` and inequality with `/=` whenever there is an `Eq` instance for the
 *  | type the `Maybe` contains.
 */
var eqMaybe = function (__dict_Eq_3) {
    return new Prelude.Eq(function (a) {
        return function (b) {
            return !Prelude["=="](eqMaybe(__dict_Eq_3))(a)(b);
        };
    }, function (_153) {
        return function (_154) {
            if (_153 instanceof Nothing && _154 instanceof Nothing) {
                return true;
            };
            if (_153 instanceof Just && _154 instanceof Just) {
                return Prelude["=="](__dict_Eq_3)(_153.value0)(_154.value0);
            };
            return false;
        };
    });
};

/**
 *  | The `Ord` instance allows `Maybe` values to be compared with
 *  | `compare`, `>`, `>=`, `<` and `<=` whenever there is an `Ord` instance for
 *  | the type the `Maybe` contains.
 *  |
 *  | `Nothing` is considered to be less than any `Just` value.
 */
var ordMaybe = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqMaybe(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_155) {
        return function (_156) {
            if (_155 instanceof Just && _156 instanceof Just) {
                return Prelude.compare(__dict_Ord_2)(_155.value0)(_156.value0);
            };
            if (_155 instanceof Nothing && _156 instanceof Nothing) {
                return Prelude.EQ.value;
            };
            if (_155 instanceof Nothing) {
                return Prelude.LT.value;
            };
            if (_156 instanceof Nothing) {
                return Prelude.GT.value;
            };
            throw new Error("Failed pattern match");
        };
    });
};

/**
 *  | The `Apply` instance allows functions contained within a `Just` to
 *  | transform a value contained within a `Just` using the `(<*>)` operator:
 *  |
 *  | ``` purescript
 *  | Just f <*> Just x == Just (f x)
 *  | ```
 *  |
 *  | `Nothing` values are left untouched:
 *  |
 *  | ``` purescript
 *  | Just f <*> Nothing == Nothing
 *  | Nothing <*> Just x == Nothing
 *  | ```
 *  |
 *  | Combining `Functor`'s `<$>` with `Apply`'s `<*>` can be used transform a
 *  | pure function to take `Maybe`-typed arguments so `f :: a -> b -> c`
 *  | becomes `f :: Maybe a -> Maybe b -> Maybe c`:
 *  |
 *  | ``` purescript
 *  | f <$> Just x <*> Just y == Just (f x y)
 *  | ```
 *  |
 *  | The `Nothing`-preserving behaviour of both operators means the result of
 *  | an expression like the above but where any one of the values is `Nothing`
 *  | means the whole result becomes `Nothing` also:
 *  |
 *  | ``` purescript
 *  | f <$> Nothing <*> Just y == Nothing
 *  | f <$> Just x <*> Nothing == Nothing
 *  | f <$> Nothing <*> Nothing == Nothing
 *  | ```
 */
var applyMaybe = new Prelude.Apply(function (_150) {
    return function (x) {
        if (_150 instanceof Just) {
            return Prelude["<$>"](functorMaybe)(_150.value0)(x);
        };
        if (_150 instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match");
    };
}, function () {
    return functorMaybe;
});

/**
 *  | The `Bind` instance allows sequencing of `Maybe` values and functions that
 *  | return a `Maybe` by using the `>>=` operator:
 *  |
 *  | ``` purescript
 *  | Just x >>= f = f x
 *  | Nothing >>= f = Nothing
 *  | ```
 */
var bindMaybe = new Prelude.Bind(function (_151) {
    return function (k) {
        if (_151 instanceof Just) {
            return k(_151.value0);
        };
        if (_151 instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match");
    };
}, function () {
    return applyMaybe;
});

/**
 *  | The `Applicative` instance enables lifting of values into `Maybe` with the
 *  | `pure` or `return` function (`return` is an alias for `pure`):
 *  |
 *  | ``` purescript
 *  | pure x :: Maybe _ == Just x
 *  | return x :: Maybe _ == Just x
 *  | ```
 *  |
 *  | Combining `Functor`'s `<$>` with `Apply`'s `<*>` and `Applicative`'s
 *  | `pure` can be used to pass a mixture of `Maybe` and non-`Maybe` typed
 *  | values to a function that does not usually expect them, by using `pure`
 *  | for any value that is not already `Maybe` typed:
 *  |
 *  | ``` purescript
 *  | f <$> Just x <*> pure y == Just (f x y)
 *  | ```
 *  |
 *  | Even though `pure = Just` it is recommended to use `pure` in situations
 *  | like this as it allows the choice of `Applicative` to be changed later
 *  | without having to go through and replace `Just` with a new constructor.
 */
var applicativeMaybe = new Prelude.Applicative(function () {
    return applyMaybe;
}, Just.create);

/**
 *  | The `Monad` instance guarantees that there are both `Applicative` and
 *  | `Bind` instances for `Maybe`. This also enables the `do` syntactic sugar:
 *  |
 *  | ``` purescript
 *  | do
 *  |   x' <- x
 *  |   y' <- y
 *  |   pure (f x' y')
 *  | ```
 *  |
 *  | Which is equivalent to:
 *  |
 *  | ``` purescript
 *  | x >>= (\x' -> y >>= (\y' -> pure (f x' y')))
 *  | ```
 */
var monadMaybe = new Prelude.Monad(function () {
    return applicativeMaybe;
}, function () {
    return bindMaybe;
});

/**
 *  | The `Alt` instance allows for a choice to be made between two `Maybe`
 *  | values with the `<|>` operator, where the first `Just` encountered
 *  | is taken.
 *  |
 *  | ``` purescript
 *  | Just x <|> Just y == Just x
 *  | Nothing <|> Just y == Just y
 *  | Nothing <|> Nothing == Nothing
 *  | ```
 */
var altMaybe = new Control_Alt.Alt(function (l) {
    return function (r) {
        if (l instanceof Nothing) {
            return r;
        };
        return l;
    };
}, function () {
    return functorMaybe;
});

/**
 *  | The `Plus` instance provides a default `Maybe` value:
 *  |
 *  | ``` purescript
 *  | empty :: Maybe _ == Nothing
 *  | ```
 */
var plusMaybe = new Control_Plus.Plus(function () {
    return altMaybe;
}, Nothing.value);

/**
 *  | The `Alternative` instance guarantees that there are both `Applicative` and
 *  | `Plus` instances for `Maybe`.
 */
var alternativeMaybe = new Control_Alternative.Alternative(function () {
    return plusMaybe;
}, function () {
    return applicativeMaybe;
});

/**
 *  | The `MonadPlus` instance guarantees that there are both `Monad` and
 *  | `Alternative` instances for `Maybe`.
 */
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
    fromMaybe: fromMaybe, 
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
    semigroupMaybe: semigroupMaybe, 
    showMaybe: showMaybe, 
    eqMaybe: eqMaybe, 
    ordMaybe: ordMaybe
};

},{"Control.Alt":26,"Control.Alternative":27,"Control.Extend":31,"Control.MonadPlus":56,"Control.Plus":57,"Prelude":127}],91:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Monoid = require("Data.Monoid");

/**
 *  | Monoid and semigroup for semirings under addition.
 *  |
 *  | ``` purescript
 *  | Additive x <> Additive y == Additive (x + y)
 *  | mempty :: Additive _ == Additive zero
 *  | ```
 */
var Additive = function (x) {
    return x;
};
var showAdditive = function (__dict_Show_0) {
    return new Prelude.Show(function (_201) {
        return "Additive (" + (Prelude.show(__dict_Show_0)(_201) + ")");
    });
};
var semigroupAdditive = function (__dict_Semiring_1) {
    return new Prelude.Semigroup(function (_202) {
        return function (_203) {
            return Prelude["+"](__dict_Semiring_1)(_202)(_203);
        };
    });
};
var runAdditive = function (_190) {
    return _190;
};
var monoidAdditive = function (__dict_Semiring_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupAdditive(__dict_Semiring_3);
    }, Prelude.zero(__dict_Semiring_3));
};
var functorAdditive = new Prelude.Functor(function (f) {
    return function (_197) {
        return f(_197);
    };
});
var extendAdditive = new Control_Extend.Extend(function (f) {
    return function (x) {
        return f(x);
    };
}, function () {
    return functorAdditive;
});
var eqAdditive = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_193) {
        return function (_194) {
            return Prelude["/="](__dict_Eq_4)(_193)(_194);
        };
    }, function (_191) {
        return function (_192) {
            return Prelude["=="](__dict_Eq_4)(_191)(_192);
        };
    });
};
var ordAdditive = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqAdditive(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_195) {
        return function (_196) {
            return Prelude.compare(__dict_Ord_2)(_195)(_196);
        };
    });
};
var comonadAdditive = new Control_Comonad.Comonad(function () {
    return extendAdditive;
}, runAdditive);
var applyAdditive = new Prelude.Apply(function (_198) {
    return function (_199) {
        return _198(_199);
    };
}, function () {
    return functorAdditive;
});
var bindAdditive = new Prelude.Bind(function (_200) {
    return function (f) {
        return f(_200);
    };
}, function () {
    return applyAdditive;
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
    showAdditive: showAdditive, 
    semigroupAdditive: semigroupAdditive, 
    monoidAdditive: monoidAdditive
};

},{"Control.Comonad":30,"Control.Extend":31,"Data.Monoid":97,"Prelude":127}],92:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Monoid = require("Data.Monoid");

/**
 *  | Boolean monoid and semigroup under conjunction.
 *  |
 *  | ``` purescript
 *  | All x <> All y == All (x && y)
 *  | mempty :: All == All true
 *  | ```
 */
var All = function (x) {
    return x;
};
var showAll = new Prelude.Show(function (_211) {
    return "All (" + (Prelude.show(Prelude.showBoolean)(_211) + ")");
});
var semigroupAll = new Prelude.Semigroup(function (_212) {
    return function (_213) {
        return _212 && _213;
    };
});
var runAll = function (_204) {
    return _204;
};
var monoidAll = new Data_Monoid.Monoid(function () {
    return semigroupAll;
}, true);
var eqAll = new Prelude.Eq(function (_207) {
    return function (_208) {
        return _207 !== _208;
    };
}, function (_205) {
    return function (_206) {
        return _205 === _206;
    };
});
var ordAll = new Prelude.Ord(function () {
    return eqAll;
}, function (_209) {
    return function (_210) {
        return Prelude.compare(Prelude.ordBoolean)(_209)(_210);
    };
});
module.exports = {
    All: All, 
    runAll: runAll, 
    eqAll: eqAll, 
    ordAll: ordAll, 
    showAll: showAll, 
    semigroupAll: semigroupAll, 
    monoidAll: monoidAll
};

},{"Data.Monoid":97,"Prelude":127}],93:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Monoid = require("Data.Monoid");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");

/**
 *  | The dual of a monoid.
 *  |
 *  | ``` purescript
 *  | Dual x <> Dual y == Dual (y <> x)
 *  | mempty :: Dual _ == Dual mempty
 *  | ```
 */
var Dual = function (x) {
    return x;
};
var showDual = function (__dict_Show_0) {
    return new Prelude.Show(function (_235) {
        return "Dual (" + (Prelude.show(__dict_Show_0)(_235) + ")");
    });
};
var semigroupDual = function (__dict_Semigroup_1) {
    return new Prelude.Semigroup(function (_236) {
        return function (_237) {
            return Prelude["<>"](__dict_Semigroup_1)(_237)(_236);
        };
    });
};
var runDual = function (_224) {
    return _224;
};
var monoidDual = function (__dict_Monoid_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDual(__dict_Monoid_3["__superclass_Prelude.Semigroup_0"]());
    }, Data_Monoid.mempty(__dict_Monoid_3));
};
var functorDual = new Prelude.Functor(function (f) {
    return function (_231) {
        return f(_231);
    };
});
var extendDual = new Control_Extend.Extend(function (f) {
    return function (x) {
        return f(x);
    };
}, function () {
    return functorDual;
});
var eqDual = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_227) {
        return function (_228) {
            return Prelude["/="](__dict_Eq_4)(_227)(_228);
        };
    }, function (_225) {
        return function (_226) {
            return Prelude["=="](__dict_Eq_4)(_225)(_226);
        };
    });
};
var ordDual = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqDual(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_229) {
        return function (_230) {
            return Prelude.compare(__dict_Ord_2)(_229)(_230);
        };
    });
};
var comonadDual = new Control_Comonad.Comonad(function () {
    return extendDual;
}, runDual);
var applyDual = new Prelude.Apply(function (_232) {
    return function (_233) {
        return _232(_233);
    };
}, function () {
    return functorDual;
});
var bindDual = new Prelude.Bind(function (_234) {
    return function (f) {
        return f(_234);
    };
}, function () {
    return applyDual;
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
    showDual: showDual, 
    semigroupDual: semigroupDual, 
    monoidDual: monoidDual
};

},{"Control.Comonad":30,"Control.Extend":31,"Data.Monoid":97,"Prelude":127}],94:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Extend = require("Control.Extend");
var Control_Comonad = require("Control.Comonad");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");

/**
 *  | Monoid returning the first (left-most) non-Nothing value.
 *  |
 *  | ``` purescript
 *  | First (Just x) <> First (Just y) == First (Just x)
 *  | First Nothing <> First (Just y) == First (Just x)
 *  | First Nothing <> Nothing == First Nothing
 *  | mempty :: First _ == First Nothing
 *  | ```
 */
var First = function (x) {
    return x;
};
var showFirst = function (__dict_Show_0) {
    return new Prelude.Show(function (_362) {
        return "First (" + (Prelude.show(Data_Maybe.showMaybe(__dict_Show_0))(_362) + ")");
    });
};
var semigroupFirst = new Prelude.Semigroup(function (_363) {
    return function (second) {
        if (_363 instanceof Data_Maybe.Just) {
            return _363;
        };
        return second;
    };
});
var runFirst = function (_351) {
    return _351;
};
var monoidFirst = new Data_Monoid.Monoid(function () {
    return semigroupFirst;
}, Data_Maybe.Nothing.value);
var functorFirst = new Prelude.Functor(function (f) {
    return function (_358) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(f)(_358);
    };
});
var extendFirst = new Control_Extend.Extend(function (f) {
    return function (x) {
        return Control_Extend["<<="](extendFirst)(f)(x);
    };
}, function () {
    return functorFirst;
});
var eqFirst = function (__dict_Eq_2) {
    return new Prelude.Eq(function (_354) {
        return function (_355) {
            return Prelude["/="](Data_Maybe.eqMaybe(__dict_Eq_2))(_354)(_355);
        };
    }, function (_352) {
        return function (_353) {
            return Prelude["=="](Data_Maybe.eqMaybe(__dict_Eq_2))(_352)(_353);
        };
    });
};
var ordFirst = function (__dict_Ord_1) {
    return new Prelude.Ord(function () {
        return eqFirst(__dict_Ord_1["__superclass_Prelude.Eq_0"]());
    }, function (_356) {
        return function (_357) {
            return Prelude.compare(Data_Maybe.ordMaybe(__dict_Ord_1))(_356)(_357);
        };
    });
};
var applyFirst = new Prelude.Apply(function (_359) {
    return function (_360) {
        return Prelude["<*>"](Data_Maybe.applyMaybe)(_359)(_360);
    };
}, function () {
    return functorFirst;
});
var bindFirst = new Prelude.Bind(function (_361) {
    return function (f) {
        return Prelude[">>="](Data_Maybe.bindMaybe)(_361)(Prelude["<<<"](Prelude.semigroupoidArr)(runFirst)(f));
    };
}, function () {
    return applyFirst;
});
var applicativeFirst = new Prelude.Applicative(function () {
    return applyFirst;
}, Prelude["<<<"](Prelude.semigroupoidArr)(First)(Prelude.pure(Data_Maybe.applicativeMaybe)));
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
    functorFirst: functorFirst, 
    applyFirst: applyFirst, 
    applicativeFirst: applicativeFirst, 
    bindFirst: bindFirst, 
    monadFirst: monadFirst, 
    extendFirst: extendFirst, 
    showFirst: showFirst, 
    semigroupFirst: semigroupFirst, 
    monoidFirst: monoidFirst
};

},{"Control.Comonad":30,"Control.Extend":31,"Data.Maybe":90,"Data.Monoid":97,"Prelude":127}],95:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Extend = require("Control.Extend");
var Control_Comonad = require("Control.Comonad");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid = require("Data.Monoid");

/**
 *  | Monoid returning the last (right-most) non-Nothing value.
 *  |
 *  | ``` purescript
 *  | Last (Just x) <> Last (Just y) == Last (Just y)
 *  | Last (Just x) <> Nothing == Last (Just x)
 *  | Last Nothing <> Nothing == Last Nothing
 *  | mempty :: Last _ == Last Nothing
 *  | ```
 */
var Last = function (x) {
    return x;
};
var showLast = function (__dict_Show_0) {
    return new Prelude.Show(function (_375) {
        return "Last (" + (Prelude.show(Data_Maybe.showMaybe(__dict_Show_0))(_375) + ")");
    });
};
var semigroupLast = new Prelude.Semigroup(function (last) {
    return function (_376) {
        if (_376 instanceof Data_Maybe.Just) {
            return _376;
        };
        if (_376 instanceof Data_Maybe.Nothing) {
            return last;
        };
        throw new Error("Failed pattern match");
    };
});
var runLast = function (_364) {
    return _364;
};
var monoidLast = new Data_Monoid.Monoid(function () {
    return semigroupLast;
}, Data_Maybe.Nothing.value);
var functorLast = new Prelude.Functor(function (f) {
    return function (_371) {
        return Prelude["<$>"](Data_Maybe.functorMaybe)(f)(_371);
    };
});
var extendLast = new Control_Extend.Extend(function (f) {
    return function (x) {
        return Control_Extend["<<="](extendLast)(f)(x);
    };
}, function () {
    return functorLast;
});
var eqLast = function (__dict_Eq_2) {
    return new Prelude.Eq(function (_367) {
        return function (_368) {
            return Prelude["/="](Data_Maybe.eqMaybe(__dict_Eq_2))(_367)(_368);
        };
    }, function (_365) {
        return function (_366) {
            return Prelude["=="](Data_Maybe.eqMaybe(__dict_Eq_2))(_365)(_366);
        };
    });
};
var ordLast = function (__dict_Ord_1) {
    return new Prelude.Ord(function () {
        return eqLast(__dict_Ord_1["__superclass_Prelude.Eq_0"]());
    }, function (_369) {
        return function (_370) {
            return Prelude.compare(Data_Maybe.ordMaybe(__dict_Ord_1))(_369)(_370);
        };
    });
};
var applyLast = new Prelude.Apply(function (_372) {
    return function (_373) {
        return Prelude["<*>"](Data_Maybe.applyMaybe)(_372)(_373);
    };
}, function () {
    return functorLast;
});
var bindLast = new Prelude.Bind(function (_374) {
    return function (f) {
        return Prelude[">>="](Data_Maybe.bindMaybe)(_374)(Prelude["<<<"](Prelude.semigroupoidArr)(runLast)(f));
    };
}, function () {
    return applyLast;
});
var applicativeLast = new Prelude.Applicative(function () {
    return applyLast;
}, Prelude["<<<"](Prelude.semigroupoidArr)(Last)(Prelude.pure(Data_Maybe.applicativeMaybe)));
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
    functorLast: functorLast, 
    applyLast: applyLast, 
    applicativeLast: applicativeLast, 
    bindLast: bindLast, 
    monadLast: monadLast, 
    extendLast: extendLast, 
    showLast: showLast, 
    semigroupLast: semigroupLast, 
    monoidLast: monoidLast
};

},{"Control.Comonad":30,"Control.Extend":31,"Data.Maybe":90,"Data.Monoid":97,"Prelude":127}],96:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");
var Data_Monoid = require("Data.Monoid");

/**
 *  | Monoid and semigroup for semirings under multiplication.
 *  |
 *  | ``` purescript
 *  | Multiplicative x <> Multiplicative y == Multiplicative (x * y)
 *  | mempty :: Multiplicative _ == Multiplicative one
 *  | ```
 */
var Multiplicative = function (x) {
    return x;
};
var showMultiplicative = function (__dict_Show_0) {
    return new Prelude.Show(function (_252) {
        return "Multiplicative (" + (Prelude.show(__dict_Show_0)(_252) + ")");
    });
};
var semigroupMultiplicative = function (__dict_Semiring_1) {
    return new Prelude.Semigroup(function (_253) {
        return function (_254) {
            return Prelude["*"](__dict_Semiring_1)(_253)(_254);
        };
    });
};
var runMultiplicative = function (_241) {
    return _241;
};
var monoidMultiplicative = function (__dict_Semiring_3) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMultiplicative(__dict_Semiring_3);
    }, Prelude.one(__dict_Semiring_3));
};
var functorMultiplicative = new Prelude.Functor(function (f) {
    return function (_248) {
        return f(_248);
    };
});
var extendAdditive = new Control_Extend.Extend(function (f) {
    return function (x) {
        return f(x);
    };
}, function () {
    return functorMultiplicative;
});
var eqMultiplicative = function (__dict_Eq_4) {
    return new Prelude.Eq(function (_244) {
        return function (_245) {
            return Prelude["/="](__dict_Eq_4)(_244)(_245);
        };
    }, function (_242) {
        return function (_243) {
            return Prelude["=="](__dict_Eq_4)(_242)(_243);
        };
    });
};
var ordMultiplicative = function (__dict_Ord_2) {
    return new Prelude.Ord(function () {
        return eqMultiplicative(__dict_Ord_2["__superclass_Prelude.Eq_0"]());
    }, function (_246) {
        return function (_247) {
            return Prelude.compare(__dict_Ord_2)(_246)(_247);
        };
    });
};
var comonadAdditive = new Control_Comonad.Comonad(function () {
    return extendAdditive;
}, runMultiplicative);
var applyMultiplicative = new Prelude.Apply(function (_249) {
    return function (_250) {
        return _249(_250);
    };
}, function () {
    return functorMultiplicative;
});
var bindMultiplicative = new Prelude.Bind(function (_251) {
    return function (f) {
        return f(_251);
    };
}, function () {
    return applyMultiplicative;
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
    extendAdditive: extendAdditive, 
    comonadAdditive: comonadAdditive, 
    showMultiplicative: showMultiplicative, 
    semigroupMultiplicative: semigroupMultiplicative, 
    monoidMultiplicative: monoidMultiplicative
};

},{"Control.Comonad":30,"Control.Extend":31,"Data.Monoid":97,"Prelude":127}],97:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Array = require("Data.Array");
var Data_Maybe = require("Data.Maybe");
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
var monoidMaybe = function (__dict_Semigroup_0) {
    return new Monoid(function () {
        return Data_Maybe.semigroupMaybe(__dict_Semigroup_0);
    }, Data_Maybe.Nothing.value);
};
var monoidArray = new Monoid(function () {
    return Data_Array.semigroupArray;
}, [  ]);
var mempty = function (dict) {
    return dict.mempty;
};
var monoidArr = function (__dict_Monoid_1) {
    return new Monoid(function () {
        return Prelude.semigroupArr(__dict_Monoid_1["__superclass_Prelude.Semigroup_0"]());
    }, Prelude["const"](mempty(__dict_Monoid_1)));
};
module.exports = {
    Monoid: Monoid, 
    mempty: mempty, 
    monoidString: monoidString, 
    monoidArray: monoidArray, 
    monoidUnit: monoidUnit, 
    monoidArr: monoidArr, 
    monoidMaybe: monoidMaybe
};

},{"Data.Array":61,"Data.Maybe":90,"Prelude":127}],98:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Data_Maybe = require("Data.Maybe");
var Data_Function = require("Data.Function");
var Prelude = require("Prelude");
var $$null = null;
function nullable(a, r, f) {  return a === null || typeof a === 'undefined' ? r : f(a);};
function notNull(x) {  return x;};
var toNullable = Data_Maybe.maybe($$null)(notNull);
var toMaybe = function (n) {
    return nullable(n, Data_Maybe.Nothing.value, Data_Maybe.Just.create);
};
var showNullable = function (__dict_Show_0) {
    return new Prelude.Show(function (n) {
        var _1768 = toMaybe(n);
        if (_1768 instanceof Data_Maybe.Nothing) {
            return "null";
        };
        if (_1768 instanceof Data_Maybe.Just) {
            return Prelude.show(__dict_Show_0)(_1768.value0);
        };
        throw new Error("Failed pattern match");
    });
};
var eqNullable = function (__dict_Eq_2) {
    return new Prelude.Eq(Data_Function.on(Prelude["/="](Data_Maybe.eqMaybe(__dict_Eq_2)))(toMaybe), Data_Function.on(Prelude["=="](Data_Maybe.eqMaybe(__dict_Eq_2)))(toMaybe));
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

},{"Data.Function":83,"Data.Maybe":90,"Prelude":127}],99:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Profunctor = require("Data.Profunctor");
var Data_Either = require("Data.Either");

/**
 *  | The `Choice` class extends `Profunctor` with combinators for working with
 *  | sum types.
 *  |
 *  | `left` and `right` lift values in a `Profunctor` to act on the `Left` and
 *  | `Right` components of a sum, respectively.
 *  |
 */
var Choice = function (__superclass_Data$dotProfunctor$dotProfunctor_0, left, right) {
    this["__superclass_Data.Profunctor.Profunctor_0"] = __superclass_Data$dotProfunctor$dotProfunctor_0;
    this.left = left;
    this.right = right;
};

/**
 *  | The `Choice` class extends `Profunctor` with combinators for working with
 *  | sum types.
 *  |
 *  | `left` and `right` lift values in a `Profunctor` to act on the `Left` and
 *  | `Right` components of a sum, respectively.
 *  |
 */
var right = function (dict) {
    return dict.right;
};

/**
 *  | The `Choice` class extends `Profunctor` with combinators for working with
 *  | sum types.
 *  |
 *  | `left` and `right` lift values in a `Profunctor` to act on the `Left` and
 *  | `Right` components of a sum, respectively.
 *  |
 */
var left = function (dict) {
    return dict.left;
};

/**
 *  | Compose a value acting on a sum from two values, each acting on one of
 *  | the components of the sum.
 */
var $plus$plus$plus = function (__dict_Category_0) {
    return function (__dict_Choice_1) {
        return function (l) {
            return function (r) {
                return Prelude[">>>"](__dict_Category_0["__superclass_Prelude.Semigroupoid_0"]())(left(__dict_Choice_1)(l))(right(__dict_Choice_1)(r));
            };
        };
    };
};

/**
 *  | Compose a value which eliminates a sum from two values, each eliminating
 *  | one side of the sum.
 *  |
 *  | This combinator is useful when assembling values from smaller components,
 *  | because it provides a way to support two different types of input.
 */
var $bar$bar$bar = function (__dict_Category_2) {
    return function (__dict_Choice_3) {
        return function (l) {
            return function (r) {
                var join = Data_Profunctor.dimap(__dict_Choice_3["__superclass_Data.Profunctor.Profunctor_0"]())(Data_Either.either(Prelude.id(Prelude.categoryArr))(Prelude.id(Prelude.categoryArr)))(Prelude.id(Prelude.categoryArr))(Prelude.id(__dict_Category_2));
                return Prelude[">>>"](__dict_Category_2["__superclass_Prelude.Semigroupoid_0"]())($plus$plus$plus(__dict_Category_2)(__dict_Choice_3)(l)(r))(join);
            };
        };
    };
};
var choiceArr = new Choice(function () {
    return Data_Profunctor.profunctorArr;
}, function (a2b) {
    return function (_147) {
        if (_147 instanceof Data_Either.Left) {
            return Data_Either.Left.create(a2b(_147.value0));
        };
        if (_147 instanceof Data_Either.Right) {
            return new Data_Either.Right(_147.value0);
        };
        throw new Error("Failed pattern match");
    };
}, Prelude["<$>"](Data_Either.functorEither));
module.exports = {
    Choice: Choice, 
    "|||": $bar$bar$bar, 
    "+++": $plus$plus$plus, 
    right: right, 
    left: left, 
    choiceArr: choiceArr
};

},{"Data.Either":73,"Data.Profunctor":101,"Prelude":127}],100:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Profunctor = require("Data.Profunctor");
var Data_Tuple = require("Data.Tuple");

/**
 *  | The `Strong` class extends `Profunctor` with combinators for working with
 *  | product types.
 *  |
 *  | `first` and `first` lift values in a `Profunctor` to act on the first and 
 *  | second components of a `Tuple`, respectively.
 *  |
 */
var Strong = function (__superclass_Data$dotProfunctor$dotProfunctor_0, first, second) {
    this["__superclass_Data.Profunctor.Profunctor_0"] = __superclass_Data$dotProfunctor$dotProfunctor_0;
    this.first = first;
    this.second = second;
};
var strongArr = new Strong(function () {
    return Data_Profunctor.profunctorArr;
}, function (a2b) {
    return function (_328) {
        return new Data_Tuple.Tuple(a2b(_328.value0), _328.value1);
    };
}, Prelude["<$>"](Data_Tuple.functorTuple));

/**
 *  | The `Strong` class extends `Profunctor` with combinators for working with
 *  | product types.
 *  |
 *  | `first` and `first` lift values in a `Profunctor` to act on the first and 
 *  | second components of a `Tuple`, respectively.
 *  |
 */
var second = function (dict) {
    return dict.second;
};

/**
 *  | The `Strong` class extends `Profunctor` with combinators for working with
 *  | product types.
 *  |
 *  | `first` and `first` lift values in a `Profunctor` to act on the first and 
 *  | second components of a `Tuple`, respectively.
 *  |
 */
var first = function (dict) {
    return dict.first;
};

/**
 *  | Compose a value acting on a `Tuple` from two values, each acting on one of
 *  | the components of the `Tuple`.
 */
var $times$times$times = function (__dict_Category_0) {
    return function (__dict_Strong_1) {
        return function (l) {
            return function (r) {
                return Prelude[">>>"](__dict_Category_0["__superclass_Prelude.Semigroupoid_0"]())(first(__dict_Strong_1)(l))(second(__dict_Strong_1)(r));
            };
        };
    };
};

/**
 *  | Compose a value which introduces a `Tuple` from two values, each introducing
 *  | one side of the `Tuple`.
 *  |
 *  | This combinator is useful when assembling values from smaller components,
 *  | because it provides a way to support two different types of output.
 */
var $amp$amp$amp = function (__dict_Category_2) {
    return function (__dict_Strong_3) {
        return function (l) {
            return function (r) {
                var split = Data_Profunctor.dimap(__dict_Strong_3["__superclass_Data.Profunctor.Profunctor_0"]())(Prelude.id(Prelude.categoryArr))(function (a) {
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
    strongArr: strongArr
};

},{"Data.Profunctor":101,"Data.Tuple":108,"Prelude":127}],101:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");

/**
 *  | A `Profunctor` is a `Functor` from the pair category `(Type^op, Type)`
 *  | to `Type`.
 *  |
 *  | In other words, a `Profunctor` is a type constructor of two type
 *  | arguments, which is contravariant in its first argument and covariant
 *  | in its second argument.
 *  | 
 *  | The `dimap` function can be used to map functions over both arguments
 *  | simultaneously.
 *  |
 *  | A straightforward example of a profunctor is the function arrow `(->)`.
 *  |
 *  | Laws:
 *  | 
 *  | - Identity: `dimap id id = id`
 *  | - Composition: `dimap f1 g1 <<< dimap f2 g2 = dimap (f1 >>> f2) (g1 <<< g2)`
 */
var Profunctor = function (dimap) {
    this.dimap = dimap;
};
var profunctorArr = new Profunctor(function (a2b) {
    return function (c2d) {
        return function (b2c) {
            return Prelude[">>>"](Prelude.semigroupoidArr)(a2b)(Prelude[">>>"](Prelude.semigroupoidArr)(b2c)(c2d));
        };
    };
});

/**
 *  | A `Profunctor` is a `Functor` from the pair category `(Type^op, Type)`
 *  | to `Type`.
 *  |
 *  | In other words, a `Profunctor` is a type constructor of two type
 *  | arguments, which is contravariant in its first argument and covariant
 *  | in its second argument.
 *  | 
 *  | The `dimap` function can be used to map functions over both arguments
 *  | simultaneously.
 *  |
 *  | A straightforward example of a profunctor is the function arrow `(->)`.
 *  |
 *  | Laws:
 *  | 
 *  | - Identity: `dimap id id = id`
 *  | - Composition: `dimap f1 g1 <<< dimap f2 g2 = dimap (f1 >>> f2) (g1 <<< g2)`
 */
var dimap = function (dict) {
    return dict.dimap;
};

/**
 *  | Map a function over the (contravariant) first type argument only.
 */
var lmap = function (__dict_Profunctor_0) {
    return function (a2b) {
        return dimap(__dict_Profunctor_0)(a2b)(Prelude.id(Prelude.categoryArr));
    };
};

/**
 *  | Map a function over the (covariant) second type argument only.
 */
var rmap = function (__dict_Profunctor_1) {
    return function (b2c) {
        return dimap(__dict_Profunctor_1)(Prelude.id(Prelude.categoryArr))(b2c);
    };
};

/**
 *  | Lift a pure function into any `Profunctor` which is also a `Category`.
 */
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
    profunctorArr: profunctorArr
};

},{"Prelude":127}],102:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Helper functions for working with mutable maps using the `ST` effect.
 *  |
 *  | This module can be used when performance is important and mutation is a local effect.
 */
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Control_Monad_ST = require("Control.Monad.ST");
var Data_Maybe = require("Data.Maybe");

  function _new() {
    return {};
  }
  ;

  function peek(m) {
    return function(k) {
      return function() {
        return m[k];
      }
    }
  }
  ;

  function poke(m) {
    return function(k) {
      return function(v) {
        return function() {
          m[k] = v;
          return m;
        };
      };
    };
  }
  ;

  function _delete(m) {
    return function(k) {
      return function() {
        delete m[k];
        return m;
      };
    };
  }
  ;

/**
 *  | Create a new, empty mutable map
 */
var $$new = _new;

/**
 *  | Remove a key and the corresponding value from a mutable map
 */
var $$delete = _delete;
module.exports = {
    "delete": $$delete, 
    poke: poke, 
    peek: peek, 
    "new": $$new
};

},{"Control.Monad.Eff":39,"Control.Monad.ST":49,"Data.Maybe":90,"Prelude":127}],103:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines a type of native Javascript maps which 
 *  | require the keys to be strings.
 *  | 
 *  | To maximize performance, Javascript objects are not wrapped,
 *  | and some native code is used even when it's not necessary.
 */
"use strict";
var Control_Monad_Eff = require("Control.Monad.Eff");
var Prelude = require("Prelude");
var Data_Function = require("Data.Function");
var Data_Monoid = require("Data.Monoid");
var Data_Foldable = require("Data.Foldable");
var Data_Tuple = require("Data.Tuple");
var Data_Traversable = require("Data.Traversable");
var Data_Maybe = require("Data.Maybe");
var Data_StrMap_ST = require("Data.StrMap.ST");
var Data_Monoid_All = require("Data.Monoid.All");
var Control_Monad_ST = require("Control.Monad.ST");
var Data_Array = require("Data.Array");

  function _copy(m) {
    var r = {};
    for (var k in m) {
      r[k] = m[k];
    }
    return r;
  }
  ;

  function _copyEff(m) {
    return function() {
      var r = {};
      for (var k in m) {
        r[k] = m[k];
      }
      return r;
    };
  }
  ;

  function runST(f) {
    return f;
  }
  ;

  function _fmapStrMap(m0, f) {
    var m = {};
    for (var k in m0) {
      m[k] = f(m0[k]);
    }
    return m;
  }
  ;

  function _foldM(bind) {
    return function(f) {
      return function(mz) {
        return function(m) {
          function g(k) {
            return function (z) {
              return f(z)(k)(m[k]);
            };
          }
          for (var k in m) {
            mz = bind(mz)(g(k));
          }
          return mz;
        };
      };
    };
  }
  ;

  function _foldSCStrMap(m, z, f, fromMaybe) {
    for (var k in m) {
      var maybeR = f(z)(k)(m[k]);
      var r = fromMaybe(null)(maybeR);
      if (r === null) return z;
      else z = r;
    }
    return z;
  }
  ;

  function all(f) {
    return function(m) {
      for (var k in m) {
        if (!f(k)(m[k])) return false;
      }
      return true;
    };
  }
  ;
var empty = {};;

  function size(m) {
    var s = 0;
    for (var k in m) {
      ++s;
    }
    return s;
  }
  ;

  function _lookup(no, yes, k, m) {
    return k in m ? yes(m[k]) : no;
  }
  ;

  function _unsafeDeleteStrMap(m, k) {
     delete m[k];
     return m;
  }
  ;

  function _lookupST(no, yes, k, m) {
    return function() {
      return k in m ? yes(m[k]) : no;
    }
  }
  ;

  function _collect(f) {
    return function(m) {
      var r = [];
      for (var k in m) {
        r.push(f(k)(m[k]));
      }
      return r;
    };
  }
  ;

  var keys = Object.keys || _collect(function(k) {
    return function() { return k; };
  });
  ;

/**
 *  | Get an array of the values in a map
 */
var values = _collect(function (_636) {
    return function (v) {
        return v;
    };
});

/**
 *  | Convert a map into an array of key/value pairs
 */
var toList = _collect(Data_Tuple.Tuple.create);

/**
 *  | Convert an immutable map into a mutable map
 */
var thawST = _copyEff;
var showStrMap = function (__dict_Show_0) {
    return new Prelude.Show(function (m) {
        return "fromList " + Prelude.show(Prelude.showArray(Data_Tuple.showTuple(Prelude.showString)(__dict_Show_0)))(toList(m));
    });
};
var pureST = function (f) {
    return Control_Monad_Eff.runPure(runST(f));
};

/**
 *  | Create a map with one key/value pair
 */
var singleton = function (k) {
    return function (v) {
        return pureST(function __do() {
            var _53 = Data_StrMap_ST["new"]();
            Data_StrMap_ST.poke(_53)(k)(v)();
            return _53;
        });
    };
};
var mutate = function (f) {
    return function (m) {
        return pureST(function __do() {
            var _52 = thawST(m)();
            f(_52)();
            return _52;
        });
    };
};

/**
 *  | Test whether a `String` appears as a key in a map
 */
var member = Data_Function.runFn4(_lookup)(false)(Prelude["const"](true));

/**
 *  | Lookup the value for a key in a map
 */
var lookup = Data_Function.runFn4(_lookup)(Data_Maybe.Nothing.value)(Data_Maybe.Just.create);

/**
 *  | Test whether one map contains all of the keys and values contained in another map
 */
var isSubmap = function (__dict_Eq_2) {
    return function (m1) {
        return function (m2) {
            var f = function (k) {
                return function (v) {
                    return _lookup(false, Prelude["=="](__dict_Eq_2)(v), k, m2);
                };
            };
            return all(f)(m1);
        };
    };
};

/**
 *  | Test whether a map is empty
 */
var isEmpty = all(function (_633) {
    return function (_632) {
        return false;
    };
});

/**
 *  | Insert a key and value into a map
 */
var insert = function (k) {
    return function (v) {
        return mutate(function (s) {
            return Data_StrMap_ST.poke(s)(k)(v);
        });
    };
};
var functorStrMap = new Prelude.Functor(function (f) {
    return function (m) {
        return _fmapStrMap(m, f);
    };
});

/**
 *  | Map a function over the values in a map
 */
var map = Prelude["<$>"](functorStrMap);

/**
 *  | Create a map from an array of key/value pairs, using the specified function
 *  | to combine values for duplicate keys.
 */
var fromListWith = function (f) {
    return function (l) {
        return pureST(function __do() {
            var _55 = Data_StrMap_ST["new"]();
            Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_Foldable.foldableArray)(l)(function (_635) {
                return Prelude[">>="](Control_Monad_Eff.bindEff)(_lookupST(_635.value1, f(_635.value1), _635.value0, _55))(Data_StrMap_ST.poke(_55)(_635.value0));
            })();
            return _55;
        });
    };
};

/**
 *  | Create a map from an array of key/value pairs
 */
var fromList = function (l) {
    return pureST(function __do() {
        var _54 = Data_StrMap_ST["new"]();
        Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_Foldable.foldableArray)(l)(function (_634) {
            return Data_StrMap_ST.poke(_54)(_634.value0)(_634.value1);
        })();
        return _54;
    });
};

/**
 *  | Convert a mutable map into an immutable map
 */
var freezeST = _copyEff;

/**
 *  | Fold the keys and values of a map.
 *  |
 *  | This function allows the folding function to terminate the fold early,
 *  | using `Maybe`.
 */
var foldMaybe = function (f) {
    return function (z) {
        return function (m) {
            return _foldSCStrMap(m, z, f, Data_Maybe.fromMaybe);
        };
    };
};

/**
 *  | Fold the keys and values of a map, accumulating values and effects in
 *  | some `Monad`.
 */
var foldM = function (__dict_Monad_3) {
    return function (f) {
        return function (z) {
            return _foldM(Prelude[">>="](__dict_Monad_3["__superclass_Prelude.Bind_1"]()))(f)(Prelude.pure(__dict_Monad_3["__superclass_Prelude.Applicative_0"]())(z));
        };
    };
};
var semigroupStrMap = function (__dict_Semigroup_4) {
    return new Prelude.Semigroup(function (m1) {
        return function (m2) {
            return mutate(function (s) {
                return foldM(Control_Monad_Eff.monadEff)(function (s_1) {
                    return function (k) {
                        return function (v2) {
                            return Data_StrMap_ST.poke(s_1)(k)(_lookup(v2, function (v1) {
                                return Prelude["<>"](__dict_Semigroup_4)(v1)(v2);
                            }, k, m2));
                        };
                    };
                })(s)(m1);
            })(m2);
        };
    });
};
var monoidStrMap = function (__dict_Semigroup_1) {
    return new Data_Monoid.Monoid(function () {
        return semigroupStrMap(__dict_Semigroup_1);
    }, empty);
};

/**
 *  | Compute the union of two maps, preferring the first map in the case of 
 *  | duplicate keys.
 */
var union = function (m) {
    return mutate(function (s) {
        return foldM(Control_Monad_Eff.monadEff)(Data_StrMap_ST.poke)(s)(m);
    });
};

/**
 *  | Compute the union of a collection of maps
 */
var unions = Data_Foldable.foldl(Data_Foldable.foldableArray)(union)(empty);

/**
 *  | Fold the keys and values of a map
 */
var fold = _foldM(Prelude["#"]);

/**
 *  | Fold the keys and values of a map, accumulating values using
 *  | some `Monoid`.
 */
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
        return function (_631) {
            return f(z);
        };
    });
}, function (f) {
    return function (z) {
        return function (m) {
            return Data_Foldable.foldr(Data_Foldable.foldableArray)(f)(z)(values(m));
        };
    };
});
var traversableStrMap = new Data_Traversable.Traversable(function () {
    return foldableStrMap;
}, function () {
    return functorStrMap;
}, function (__dict_Applicative_6) {
    return Data_Traversable.traverse(traversableStrMap)(__dict_Applicative_6)(Prelude.id(Prelude.categoryArr));
}, function (__dict_Applicative_5) {
    return function (f) {
        return function (ms) {
            return Data_Foldable.foldr(Data_Foldable.foldableArray)(function (x) {
                return function (acc) {
                    return Prelude["<*>"](__dict_Applicative_5["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(union)(x))(acc);
                };
            })(Prelude.pure(__dict_Applicative_5)(empty))(Prelude["<$>"](Data_Array.functorArray)(Prelude["<$>"]((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Tuple.uncurry(singleton)))(Prelude["<$>"](Data_Array.functorArray)(Data_Traversable.traverse(Data_Traversable.traversableTuple)(__dict_Applicative_5)(f))(toList(ms))));
        };
    };
});
var eqStrMap = function (__dict_Eq_9) {
    return new Prelude.Eq(function (m1) {
        return function (m2) {
            return !Prelude["=="](eqStrMap(__dict_Eq_9))(m1)(m2);
        };
    }, function (m1) {
        return function (m2) {
            return isSubmap(__dict_Eq_9)(m1)(m2) && isSubmap(__dict_Eq_9)(m2)(m1);
        };
    });
};

/**
 *  | Delete a key and value from a map
 */
var $$delete = function (k) {
    return mutate(function (s) {
        return Data_StrMap_ST["delete"](s)(k);
    });
};

/**
 *  | Insert, remove or update a value for a key in a map
 */
var alter = function (f) {
    return function (k) {
        return function (m) {
            var _2856 = f(lookup(k)(m));
            if (_2856 instanceof Data_Maybe.Nothing) {
                return $$delete(k)(m);
            };
            if (_2856 instanceof Data_Maybe.Just) {
                return insert(k)(_2856.value0)(m);
            };
            throw new Error("Failed pattern match");
        };
    };
};

/**
 *  | Remove or update a value for a key in a map
 */
var update = function (f) {
    return function (k) {
        return function (m) {
            return alter(Data_Maybe.maybe(Data_Maybe.Nothing.value)(f))(k)(m);
        };
    };
};
module.exports = {
    runST: runST, 
    freezeST: freezeST, 
    thawST: thawST, 
    all: all, 
    foldMaybe: foldMaybe, 
    foldM: foldM, 
    foldMap: foldMap, 
    fold: fold, 
    isSubmap: isSubmap, 
    map: map, 
    unions: unions, 
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
    singleton: singleton, 
    size: size, 
    isEmpty: isEmpty, 
    empty: empty, 
    functorStrMap: functorStrMap, 
    foldableStrMap: foldableStrMap, 
    traversableStrMap: traversableStrMap, 
    eqStrMap: eqStrMap, 
    showStrMap: showStrMap, 
    semigroupStrMap: semigroupStrMap, 
    monoidStrMap: monoidStrMap
};

},{"Control.Monad.Eff":39,"Control.Monad.ST":49,"Data.Array":61,"Data.Foldable":76,"Data.Function":83,"Data.Maybe":90,"Data.Monoid":97,"Data.Monoid.All":92,"Data.StrMap.ST":102,"Data.Traversable":107,"Data.Tuple":108,"Prelude":127}],104:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Unsafe string and character functions.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Char = require("Data.Char");

    function charCodeAt(i) {
      return function(s) {
        if (s.length <= i) {
          throw new Error("Data.String.Unsafe.charCodeAt: Invalid index.");
        };
        return s.charCodeAt(i);
      };
    }
    ;

    function charAt(i) {
      return function(s) {
        if (s.length <= i) {
          throw new Error("Data.String.Unsafe.charAt: Invalid index.");
        };
        return s.charAt(i);
      };
    }
    ;

    function $$char(s) {
      if (s.length != 1) {
        throw new Error("Data.String.Unsafe.char: Expected string of length 1.");
      };
      return s.charAt(0);
    }
    ;
module.exports = {
    charCodeAt: charCodeAt, 
    charAt: charAt, 
    "char": $$char
};

},{"Data.Char":62,"Prelude":127}],105:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Wraps the functions of Javascript's `String` object.
 *  | A String represents a sequence of characters.
 *  | For details of the underlying implementation, see [String Reference at MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).
 */
"use strict";
var Data_Function = require("Data.Function");
var Data_Char = require("Data.Char");
var Prelude = require("Prelude");
var Data_String_Unsafe = require("Data.String.Unsafe");
var Data_Maybe = require("Data.Maybe");

    function _charAt(i, s, Just, Nothing) {
      return i >= 0 && i < s.length ? Just(s.charAt(i)) : Nothing;
    }
    ;

    function _charCodeAt(i, s, Just, Nothing) {
      return i >= 0 && i < s.length ? Just(s.charCodeAt(i)) : Nothing;
    }
    ;

    function fromCharArray(a) {
      return a.join('');
    }
    ;

    function indexOf(x) {
      return function(s) {
        return s.indexOf(x);
      };
    }
    ;

    function indexOf$prime(x) {
      return function(startAt) {
        return function(s) {
          return s.indexOf(x, startAt);
        };
      };
    }
    ;

    function lastIndexOf(x) {
      return function(s) {
        return s.lastIndexOf(x);
      };
    }
    ;

    function lastIndexOf$prime(x) {
      return function(startAt) {
        return function(s) {
          return s.lastIndexOf(x, startAt);
        };
      };
    }
    ;

    function length(s) {
      return s.length;
    }
    ;

    function localeCompare(s1) {
      return function(s2) {
        return s1.localeCompare(s2);
      };
    }
    ;

    function replace(s1) {
      return function(s2) {
        return function(s3) {
          return s3.replace(s1, s2);
        };
      };
    }
    ;

    function take(n) {
      return function(s) {
        return s.substr(0, n);
      };
    }
    ;

    function drop(n) {
      return function(s) {
        return s.substr(n);
      };
    }
    ;

    function count(p){
      return function(s){
        var i;
        for(i = 0; i < s.length && p(s.charAt(i)); i++){};
        return i;
      };
    }
    ;

    function split(sep) {
      return function(s) {
        return s.split(sep);
      };
    }
    ;

    function toCharArray(s) {
      return s.split('');
    }
    ;

    function toLower(s) {
      return s.toLowerCase();
    }
    ;

    function toUpper(s) {
      return s.toUpperCase();
    }
    ;

    function trim(s) {
      return s.trim();
    }
    ;

    function joinWith(s) {
      return function(xs) {
        return xs.join(s);
      };
    }
    ;

/**
 *  | Returns the longest prefix (possibly empty) of characters that satisfy
 *  | the predicate:
 */
var takeWhile = function (p) {
    return function (s) {
        return take(count(p)(s))(s);
    };
};

/**
 *  | Returns `true` if the given string is empty.
 */
var $$null = function (s) {
    return length(s) === 0;
};

/**
 *  | Returns the first character and the rest of the string,
 *  | if the string is not empty.
 */
var uncons = function (s) {
    if ($$null(s)) {
        return Data_Maybe.Nothing.value;
    };
    return new Data_Maybe.Just({
        head: Data_String_Unsafe.charAt(0)(s), 
        tail: drop(1)(s)
    });
};

/**
 *  | Returns a string of length `1` containing the given character.
 */
var fromChar = Data_Char.charString;

/**
 *  | Returns a string of length `1` containing the given character.
 *  | Same as `fromChar`.
 */
var singleton = fromChar;

/**
 *  | Returns the suffix remaining after `takeWhile`.
 */
var dropWhile = function (p) {
    return function (s) {
        return drop(count(p)(s))(s);
    };
};

/**
 *  | Returns the numeric Unicode value of the character at the given index,
 *  | if the index is within bounds.
 */
var charCodeAt = function (n) {
    return function (s) {
        return _charCodeAt(n, s, Data_Maybe.Just.create, Data_Maybe.Nothing.value);
    };
};

/**
 *  | Returns the character at the given index, if the index is within bounds.
 */
var charAt = function (n) {
    return function (s) {
        return _charAt(n, s, Data_Maybe.Just.create, Data_Maybe.Nothing.value);
    };
};
module.exports = {
    joinWith: joinWith, 
    trim: trim, 
    toUpper: toUpper, 
    toLower: toLower, 
    toCharArray: toCharArray, 
    split: split, 
    dropWhile: dropWhile, 
    drop: drop, 
    takeWhile: takeWhile, 
    take: take, 
    count: count, 
    replace: replace, 
    localeCompare: localeCompare, 
    singleton: singleton, 
    length: length, 
    uncons: uncons, 
    "null": $$null, 
    "lastIndexOf'": lastIndexOf$prime, 
    lastIndexOf: lastIndexOf, 
    "indexOf'": indexOf$prime, 
    indexOf: indexOf, 
    fromChar: fromChar, 
    fromCharArray: fromCharArray, 
    charCodeAt: charCodeAt, 
    charAt: charAt
};

},{"Data.Char":62,"Data.Function":83,"Data.Maybe":90,"Data.String.Unsafe":104,"Prelude":127}],106:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Int = require("Data.Int");

/**
 *  | A quantity of seconds (not necessarily a value between 0 and 60).
 */
var Seconds = function (x) {
    return x;
};

/**
 *  | A second component from a time value. Should fall between 0 and 59
 *  | inclusive.
 */
var SecondOfMinute = function (x) {
    return x;
};

/**
 *  | A quantity of minutes (not necessarily a value between 0 and 60).
 */
var Minutes = function (x) {
    return x;
};

/**
 *  | A minute component from a time value. Should fall between 0 and 59
 *  | inclusive.
 */
var MinuteOfHour = function (x) {
    return x;
};

/**
 *  | A quantity of milliseconds (not necessarily a value between 0 and 1000).
 */
var Milliseconds = function (x) {
    return x;
};

/**
 *  | A millisecond component from a time value. Should fall between 0 and 999
 *  | inclusive.
 */
var MillisecondOfSecond = function (x) {
    return x;
};

/**
 *  | A quantity of hours (not necessarily a value between 0 and 23).
 */
var Hours = function (x) {
    return x;
};

/**
 *  | An hour component from a time value. Should fall between 0 and 23
 *  | inclusive.
 */
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
var timeValueSeconds = new TimeValue(function (_110) {
    return _110 * 3600;
}, function (_112) {
    return _112 / 1000;
}, function (_111) {
    return _111 * 60;
}, function (n) {
    return n;
}, function (_107) {
    return _107 / 3600;
}, function (_109) {
    return _109 * 1000;
}, function (_108) {
    return _108 / 60;
}, function (n) {
    return n;
});
var timeValueMinutes = new TimeValue(function (_104) {
    return _104 * 60;
}, function (_106) {
    return _106 / 60000;
}, function (n) {
    return n;
}, function (_105) {
    return _105 / 60;
}, function (_101) {
    return _101 / 60;
}, function (_103) {
    return _103 * 60000;
}, function (n) {
    return n;
}, function (_102) {
    return _102 * 60;
});
var timeValueMilliseconds = new TimeValue(function (_116) {
    return _116 * 3600000;
}, function (n) {
    return n;
}, function (_117) {
    return _117 * 60000;
}, function (_118) {
    return _118 * 1000;
}, function (_113) {
    return _113 / 3600000;
}, function (n) {
    return n;
}, function (_114) {
    return _114 / 60000;
}, function (_115) {
    return _115 / 1000;
});
var timeValueHours = new TimeValue(function (n) {
    return n;
}, function (_100) {
    return _100 / 3600000;
}, function (_98) {
    return _98 / 60;
}, function (_99) {
    return _99 / 3600;
}, function (n) {
    return n;
}, function (_97) {
    return _97 * 3600000;
}, function (_95) {
    return _95 * 60;
}, function (_96) {
    return _96 * 3600;
});
var showSeconds = new Prelude.Show(function (_71) {
    return "(Seconds " + (Prelude.show(Prelude.showNumber)(_71) + ")");
});
var showMinutes = new Prelude.Show(function (_48) {
    return "(Minutes " + (Prelude.show(Prelude.showNumber)(_48) + ")");
});
var showMilliseconds = new Prelude.Show(function (_94) {
    return "(Milliseconds " + (Prelude.show(Prelude.showNumber)(_94) + ")");
});
var showHours = new Prelude.Show(function (_25) {
    return "(Hours " + (Prelude.show(Prelude.showNumber)(_25) + ")");
});
var semiringSeconds = new Prelude.Semiring(function (_63) {
    return function (_64) {
        return _63 * _64;
    };
}, function (_61) {
    return function (_62) {
        return _61 + _62;
    };
}, 1, 0);
var semiringMinutes = new Prelude.Semiring(function (_40) {
    return function (_41) {
        return _40 * _41;
    };
}, function (_38) {
    return function (_39) {
        return _38 + _39;
    };
}, 1, 0);
var semiringMilliseconds = new Prelude.Semiring(function (_86) {
    return function (_87) {
        return _86 * _87;
    };
}, function (_84) {
    return function (_85) {
        return _84 + _85;
    };
}, 1, 0);
var semiringHours = new Prelude.Semiring(function (_17) {
    return function (_18) {
        return _17 * _18;
    };
}, function (_15) {
    return function (_16) {
        return _15 + _16;
    };
}, 1, 0);
var ringSeconds = new Prelude.Ring(function (_65) {
    return function (_66) {
        return _65 - _66;
    };
}, function () {
    return semiringSeconds;
});
var ringMinutes = new Prelude.Ring(function (_42) {
    return function (_43) {
        return _42 - _43;
    };
}, function () {
    return semiringMinutes;
});
var ringMilliseconds = new Prelude.Ring(function (_88) {
    return function (_89) {
        return _88 - _89;
    };
}, function () {
    return semiringMilliseconds;
});
var ringHours = new Prelude.Ring(function (_19) {
    return function (_20) {
        return _19 - _20;
    };
}, function () {
    return semiringHours;
});
var moduloSemiringSeconds = new Prelude.ModuloSemiring(function (_67) {
    return function (_68) {
        return _67 / _68;
    };
}, function () {
    return semiringSeconds;
}, function (_69) {
    return function (_70) {
        return 0;
    };
});
var moduloSemiringMinutes = new Prelude.ModuloSemiring(function (_44) {
    return function (_45) {
        return _44 / _45;
    };
}, function () {
    return semiringMinutes;
}, function (_46) {
    return function (_47) {
        return 0;
    };
});
var moduloSemiringMilliseconds = new Prelude.ModuloSemiring(function (_90) {
    return function (_91) {
        return _90 / _91;
    };
}, function () {
    return semiringMilliseconds;
}, function (_92) {
    return function (_93) {
        return 0;
    };
});
var moduloSemiringHours = new Prelude.ModuloSemiring(function (_21) {
    return function (_22) {
        return _21 / _22;
    };
}, function () {
    return semiringHours;
}, function (_23) {
    return function (_24) {
        return 0;
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
var eqSeconds = new Prelude.Eq(function (_57) {
    return function (_58) {
        return _57 !== _58;
    };
}, function (_55) {
    return function (_56) {
        return _55 === _56;
    };
});
var ordSeconds = new Prelude.Ord(function () {
    return eqSeconds;
}, function (_59) {
    return function (_60) {
        return Prelude.compare(Prelude.ordNumber)(_59)(_60);
    };
});
var eqSecondOfMinute = new Prelude.Eq(function (_51) {
    return function (_52) {
        return Prelude["/="](Data_Int.eqInt)(_51)(_52);
    };
}, function (_49) {
    return function (_50) {
        return Prelude["=="](Data_Int.eqInt)(_49)(_50);
    };
});
var ordSecondOfMinute = new Prelude.Ord(function () {
    return eqSecondOfMinute;
}, function (_53) {
    return function (_54) {
        return Prelude.compare(Data_Int.ordInt)(_53)(_54);
    };
});
var eqMinutes = new Prelude.Eq(function (_34) {
    return function (_35) {
        return _34 !== _35;
    };
}, function (_32) {
    return function (_33) {
        return _32 === _33;
    };
});
var ordMinutes = new Prelude.Ord(function () {
    return eqMinutes;
}, function (_36) {
    return function (_37) {
        return Prelude.compare(Prelude.ordNumber)(_36)(_37);
    };
});
var eqMinuteOfHour = new Prelude.Eq(function (_28) {
    return function (_29) {
        return Prelude["/="](Data_Int.eqInt)(_28)(_29);
    };
}, function (_26) {
    return function (_27) {
        return Prelude["=="](Data_Int.eqInt)(_26)(_27);
    };
});
var ordMinuteOfHour = new Prelude.Ord(function () {
    return eqMinuteOfHour;
}, function (_30) {
    return function (_31) {
        return Prelude.compare(Data_Int.ordInt)(_30)(_31);
    };
});
var eqMilliseconds = new Prelude.Eq(function (_80) {
    return function (_81) {
        return _80 !== _81;
    };
}, function (_78) {
    return function (_79) {
        return _78 === _79;
    };
});
var ordMilliseconds = new Prelude.Ord(function () {
    return eqMilliseconds;
}, function (_82) {
    return function (_83) {
        return Prelude.compare(Prelude.ordNumber)(_82)(_83);
    };
});
var eqMillisecondOfSecond = new Prelude.Eq(function (_74) {
    return function (_75) {
        return Prelude["/="](Data_Int.eqInt)(_74)(_75);
    };
}, function (_72) {
    return function (_73) {
        return Prelude["=="](Data_Int.eqInt)(_72)(_73);
    };
});
var ordMillisecondOfSecond = new Prelude.Ord(function () {
    return eqMillisecondOfSecond;
}, function (_76) {
    return function (_77) {
        return Prelude.compare(Data_Int.ordInt)(_76)(_77);
    };
});
var eqHours = new Prelude.Eq(function (_11) {
    return function (_12) {
        return _11 !== _12;
    };
}, function (_9) {
    return function (_10) {
        return _9 === _10;
    };
});
var ordHours = new Prelude.Ord(function () {
    return eqHours;
}, function (_13) {
    return function (_14) {
        return Prelude.compare(Prelude.ordNumber)(_13)(_14);
    };
});
var eqHourOfDay = new Prelude.Eq(function (_5) {
    return function (_6) {
        return Prelude["/="](Data_Int.eqInt)(_5)(_6);
    };
}, function (_3) {
    return function (_4) {
        return Prelude["=="](Data_Int.eqInt)(_3)(_4);
    };
});
var ordHourOfDay = new Prelude.Ord(function () {
    return eqHourOfDay;
}, function (_7) {
    return function (_8) {
        return Prelude.compare(Data_Int.ordInt)(_7)(_8);
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

},{"Data.Int":86,"Prelude":127}],107:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Array = require("Data.Array");
var Data_Tuple = require("Data.Tuple");
var Data_Either = require("Data.Either");
var Data_Foldable = require("Data.Foldable");
var Data_Maybe = require("Data.Maybe");
var Data_Monoid_Additive = require("Data.Monoid.Additive");
var Data_Monoid_Dual = require("Data.Monoid.Dual");
var Data_Monoid_First = require("Data.Monoid.First");
var Data_Monoid_Last = require("Data.Monoid.Last");
var Data_Monoid_Multiplicative = require("Data.Monoid.Multiplicative");
var StateR = function (x) {
    return x;
};
var StateL = function (x) {
    return x;
};

/**
 *  | `Traversable` represents data structures which can be _traversed_,
 *  | accumulating results and effects in some `Applicative` functor.
 *  |
 *  | - `traverse` runs an action for every element in a data structure,
 *  |   and accumulates the results.
 *  | - `sequence` runs the actions _contained_ in a data structure,
 *  |   and accumulates the results.
 *  |
 *  | The `traverse` and `sequence` functions should be compatible in the
 *  | following sense:
 *  |
 *  | - `traverse f xs = sequence (f <$> xs)`
 *  | - `sequence = traverse id` 
 *  | 
 *  | `Traversable` instances should also be compatible with the corresponding
 *  | `Foldable` instances, in the following sense:
 *  |
 *  | - `foldMap f = runConst <<< traverse (Const <<< f)`
 */
var Traversable = function (__superclass_Data$dotFoldable$dotFoldable_1, __superclass_Prelude$dotFunctor_0, sequence, traverse) {
    this["__superclass_Data.Foldable.Foldable_1"] = __superclass_Data$dotFoldable$dotFoldable_1;
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
    this.sequence = sequence;
    this.traverse = traverse;
};

/**
 *  | `Traversable` represents data structures which can be _traversed_,
 *  | accumulating results and effects in some `Applicative` functor.
 *  |
 *  | - `traverse` runs an action for every element in a data structure,
 *  |   and accumulates the results.
 *  | - `sequence` runs the actions _contained_ in a data structure,
 *  |   and accumulates the results.
 *  |
 *  | The `traverse` and `sequence` functions should be compatible in the
 *  | following sense:
 *  |
 *  | - `traverse f xs = sequence (f <$> xs)`
 *  | - `sequence = traverse id` 
 *  | 
 *  | `Traversable` instances should also be compatible with the corresponding
 *  | `Foldable` instances, in the following sense:
 *  |
 *  | - `foldMap f = runConst <<< traverse (Const <<< f)`
 */
var traverse = function (dict) {
    return dict.traverse;
};
var traversableTuple = new Traversable(function () {
    return Data_Foldable.foldableTuple;
}, function () {
    return Data_Tuple.functorTuple;
}, function (__dict_Applicative_1) {
    return function (_424) {
        return Prelude["<$>"]((__dict_Applicative_1["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Tuple.Tuple.create(_424.value0))(_424.value1);
    };
}, function (__dict_Applicative_0) {
    return function (f) {
        return function (_423) {
            return Prelude["<$>"]((__dict_Applicative_0["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Tuple.Tuple.create(_423.value0))(f(_423.value1));
        };
    };
});
var traversableMultiplicative = new Traversable(function () {
    return Data_Foldable.foldableMultiplicative;
}, function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
}, function (__dict_Applicative_3) {
    return function (_434) {
        return Prelude["<$>"]((__dict_Applicative_3["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Multiplicative.Multiplicative)(_434);
    };
}, function (__dict_Applicative_2) {
    return function (f) {
        return function (_433) {
            return Prelude["<$>"]((__dict_Applicative_2["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Multiplicative.Multiplicative)(f(_433));
        };
    };
});
var traversableMaybe = new Traversable(function () {
    return Data_Foldable.foldableMaybe;
}, function () {
    return Data_Maybe.functorMaybe;
}, function (__dict_Applicative_5) {
    return function (_422) {
        if (_422 instanceof Data_Maybe.Nothing) {
            return Prelude.pure(__dict_Applicative_5)(Data_Maybe.Nothing.value);
        };
        if (_422 instanceof Data_Maybe.Just) {
            return Prelude["<$>"]((__dict_Applicative_5["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe.Just.create)(_422.value0);
        };
        throw new Error("Failed pattern match");
    };
}, function (__dict_Applicative_4) {
    return function (f) {
        return function (_421) {
            if (_421 instanceof Data_Maybe.Nothing) {
                return Prelude.pure(__dict_Applicative_4)(Data_Maybe.Nothing.value);
            };
            if (_421 instanceof Data_Maybe.Just) {
                return Prelude["<$>"]((__dict_Applicative_4["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Maybe.Just.create)(f(_421.value0));
            };
            throw new Error("Failed pattern match");
        };
    };
});
var traversableEither = new Traversable(function () {
    return Data_Foldable.foldableEither;
}, function () {
    return Data_Either.functorEither;
}, function (__dict_Applicative_7) {
    return function (_420) {
        if (_420 instanceof Data_Either.Left) {
            return Prelude.pure(__dict_Applicative_7)(new Data_Either.Left(_420.value0));
        };
        if (_420 instanceof Data_Either.Right) {
            return Prelude["<$>"]((__dict_Applicative_7["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Either.Right.create)(_420.value0);
        };
        throw new Error("Failed pattern match");
    };
}, function (__dict_Applicative_6) {
    return function (f) {
        return function (_419) {
            if (_419 instanceof Data_Either.Left) {
                return Prelude.pure(__dict_Applicative_6)(new Data_Either.Left(_419.value0));
            };
            if (_419 instanceof Data_Either.Right) {
                return Prelude["<$>"]((__dict_Applicative_6["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Either.Right.create)(f(_419.value0));
            };
            throw new Error("Failed pattern match");
        };
    };
});
var traversableDual = new Traversable(function () {
    return Data_Foldable.foldableDual;
}, function () {
    return Data_Monoid_Dual.functorDual;
}, function (__dict_Applicative_9) {
    return function (_428) {
        return Prelude["<$>"]((__dict_Applicative_9["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Dual.Dual)(_428);
    };
}, function (__dict_Applicative_8) {
    return function (f) {
        return function (_427) {
            return Prelude["<$>"]((__dict_Applicative_8["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Dual.Dual)(f(_427));
        };
    };
});
var traversableAdditive = new Traversable(function () {
    return Data_Foldable.foldableAdditive;
}, function () {
    return Data_Monoid_Additive.functorAdditive;
}, function (__dict_Applicative_11) {
    return function (_426) {
        return Prelude["<$>"]((__dict_Applicative_11["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Additive.Additive)(_426);
    };
}, function (__dict_Applicative_10) {
    return function (f) {
        return function (_425) {
            return Prelude["<$>"]((__dict_Applicative_10["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Additive.Additive)(f(_425));
        };
    };
});
var stateR = function (_416) {
    return _416;
};
var stateL = function (_415) {
    return _415;
};

/**
 *  | `Traversable` represents data structures which can be _traversed_,
 *  | accumulating results and effects in some `Applicative` functor.
 *  |
 *  | - `traverse` runs an action for every element in a data structure,
 *  |   and accumulates the results.
 *  | - `sequence` runs the actions _contained_ in a data structure,
 *  |   and accumulates the results.
 *  |
 *  | The `traverse` and `sequence` functions should be compatible in the
 *  | following sense:
 *  |
 *  | - `traverse f xs = sequence (f <$> xs)`
 *  | - `sequence = traverse id` 
 *  | 
 *  | `Traversable` instances should also be compatible with the corresponding
 *  | `Foldable` instances, in the following sense:
 *  |
 *  | - `foldMap f = runConst <<< traverse (Const <<< f)`
 */
var sequence = function (dict) {
    return dict.sequence;
};
var traversableArray = new Traversable(function () {
    return Data_Foldable.foldableArray;
}, function () {
    return Data_Array.functorArray;
}, function (__dict_Applicative_13) {
    return function (_418) {
        if (_418.length === 0) {
            return Prelude.pure(__dict_Applicative_13)([  ]);
        };
        if (_418.length >= 1) {
            var _1819 = _418.slice(1);
            return Prelude["<*>"](__dict_Applicative_13["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_13["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude[":"])(_418[0]))(sequence(traversableArray)(__dict_Applicative_13)(_1819));
        };
        throw new Error("Failed pattern match");
    };
}, function (__dict_Applicative_12) {
    return function (f) {
        return function (_417) {
            if (_417.length === 0) {
                return Prelude.pure(__dict_Applicative_12)([  ]);
            };
            if (_417.length >= 1) {
                var _1823 = _417.slice(1);
                return Prelude["<*>"](__dict_Applicative_12["__superclass_Prelude.Apply_0"]())(Prelude["<$>"]((__dict_Applicative_12["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Prelude[":"])(f(_417[0])))(traverse(traversableArray)(__dict_Applicative_12)(f)(_1823));
            };
            throw new Error("Failed pattern match");
        };
    };
});
var traversableFirst = new Traversable(function () {
    return Data_Foldable.foldableFirst;
}, function () {
    return Data_Monoid_First.functorFirst;
}, function (__dict_Applicative_15) {
    return function (_430) {
        return Prelude["<$>"]((__dict_Applicative_15["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_First.First)(sequence(traversableMaybe)(__dict_Applicative_15)(_430));
    };
}, function (__dict_Applicative_14) {
    return function (f) {
        return function (_429) {
            return Prelude["<$>"]((__dict_Applicative_14["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_First.First)(traverse(traversableMaybe)(__dict_Applicative_14)(f)(_429));
        };
    };
});
var traversableLast = new Traversable(function () {
    return Data_Foldable.foldableLast;
}, function () {
    return Data_Monoid_Last.functorLast;
}, function (__dict_Applicative_17) {
    return function (_432) {
        return Prelude["<$>"]((__dict_Applicative_17["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Last.Last)(sequence(traversableMaybe)(__dict_Applicative_17)(_432));
    };
}, function (__dict_Applicative_16) {
    return function (f) {
        return function (_431) {
            return Prelude["<$>"]((__dict_Applicative_16["__superclass_Prelude.Apply_0"]())["__superclass_Prelude.Functor_0"]())(Data_Monoid_Last.Last)(traverse(traversableMaybe)(__dict_Applicative_16)(f)(_431));
        };
    };
});

/**
 *  | A generalization of `zipWith` which accumulates results in some `Applicative`
 *  | functor.
 */
var zipWithA = function (__dict_Applicative_18) {
    return function (f) {
        return function (xs) {
            return function (ys) {
                return sequence(traversableArray)(__dict_Applicative_18)(Data_Array.zipWith(f)(xs)(ys));
            };
        };
    };
};
var functorStateR = new Prelude.Functor(function (f) {
    return function (k) {
        return StateR(function (s) {
            var _1830 = stateR(k)(s);
            return new Data_Tuple.Tuple(_1830.value0, f(_1830.value1));
        });
    };
});
var functorStateL = new Prelude.Functor(function (f) {
    return function (k) {
        return StateL(function (s) {
            var _1833 = stateL(k)(s);
            return new Data_Tuple.Tuple(_1833.value0, f(_1833.value1));
        });
    };
});

/**
 *  | A version of `traverse` with its arguments flipped.
 *  |
 *  | 
 *  | This can be useful when running an action written using do notation
 *  | for every element in a data structure:
 *  |
 *  | For example:
 *  |
 *  | ```purescript
 *  | for [1, 2, 3] \n -> do
 *  |   print n
 *  |   return (n * n)
 *  | ```
 */
var $$for = function (__dict_Applicative_23) {
    return function (__dict_Traversable_24) {
        return function (x) {
            return function (f) {
                return traverse(__dict_Traversable_24)(__dict_Applicative_23)(f)(x);
            };
        };
    };
};
var applyStateR = new Prelude.Apply(function (f) {
    return function (x) {
        return StateR(function (s) {
            var _1836 = stateR(x)(s);
            var _1837 = stateR(f)(_1836.value0);
            return new Data_Tuple.Tuple(_1837.value0, _1837.value1(_1836.value1));
        });
    };
}, function () {
    return functorStateR;
});
var applyStateL = new Prelude.Apply(function (f) {
    return function (x) {
        return StateL(function (s) {
            var _1842 = stateL(f)(s);
            var _1843 = stateL(x)(_1842.value0);
            return new Data_Tuple.Tuple(_1843.value0, _1842.value1(_1843.value1));
        });
    };
}, function () {
    return functorStateL;
});
var applicativeStateR = new Prelude.Applicative(function () {
    return applyStateR;
}, function (a) {
    return StateR(function (s) {
        return new Data_Tuple.Tuple(s, a);
    });
});

/**
 *  | Fold a data structure from the right, keeping all intermediate results
 *  | instead of only the final result.
 *  |
 *  | Unlike `scanr`, `mapAccumR` allows the type of accumulator to differ
 *  | from the element type of the final data structure.
 */
var mapAccumR = function (__dict_Traversable_19) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return stateR(traverse(__dict_Traversable_19)(applicativeStateR)(function (a) {
                    return StateR(function (s) {
                        return f(s)(a);
                    });
                })(xs))(s0);
            };
        };
    };
};

/**
 *  | Fold a data structure from the right, keeping all intermediate results
 *  | instead of only the final result.
 */
var scanr = function (__dict_Traversable_20) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return Data_Tuple.snd(mapAccumR(__dict_Traversable_20)(function (b) {
                    return function (a) {
                        var b$prime = f(a)(b);
                        return new Data_Tuple.Tuple(b$prime, b$prime);
                    };
                })(b0)(xs));
            };
        };
    };
};
var applicativeStateL = new Prelude.Applicative(function () {
    return applyStateL;
}, function (a) {
    return StateL(function (s) {
        return new Data_Tuple.Tuple(s, a);
    });
});

/**
 *  | Fold a data structure from the left, keeping all intermediate results
 *  | instead of only the final result.
 *  |
 *  | Unlike `scanl`, `mapAccumL` allows the type of accumulator to differ
 *  | from the element type of the final data structure.
 */
var mapAccumL = function (__dict_Traversable_21) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return stateL(traverse(__dict_Traversable_21)(applicativeStateL)(function (a) {
                    return StateL(function (s) {
                        return f(s)(a);
                    });
                })(xs))(s0);
            };
        };
    };
};

/**
 *  | Fold a data structure from the left, keeping all intermediate results
 *  | instead of only the final result.
 */
var scanl = function (__dict_Traversable_22) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return Data_Tuple.snd(mapAccumL(__dict_Traversable_22)(function (b) {
                    return function (a) {
                        var b$prime = f(b)(a);
                        return new Data_Tuple.Tuple(b$prime, b$prime);
                    };
                })(b0)(xs));
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
    zipWithA: zipWithA, 
    "for": $$for, 
    sequence: sequence, 
    traverse: traverse, 
    traversableArray: traversableArray, 
    traversableEither: traversableEither, 
    traversableMaybe: traversableMaybe, 
    traversableTuple: traversableTuple, 
    traversableAdditive: traversableAdditive, 
    traversableDual: traversableDual, 
    traversableFirst: traversableFirst, 
    traversableLast: traversableLast, 
    traversableMultiplicative: traversableMultiplicative
};

},{"Data.Array":61,"Data.Either":73,"Data.Foldable":76,"Data.Maybe":90,"Data.Monoid.Additive":91,"Data.Monoid.Dual":93,"Data.Monoid.First":94,"Data.Monoid.Last":95,"Data.Monoid.Multiplicative":96,"Data.Tuple":108,"Prelude":127}],108:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | A data type and functions for working with ordered pairs and sequences of values.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Monoid = require("Data.Monoid");
var Control_Lazy = require("Control.Lazy");
var Data_Array = require("Data.Array");
var Control_Comonad = require("Control.Comonad");
var Control_Extend = require("Control.Extend");

/**
 *  | A simple product type for wrapping a pair of component values.
 */
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

/**
 *  | Rakes two lists and returns a list of corresponding pairs.
 *  | If one input list is short, excess elements of the longer list are discarded.
 */
var zip = Data_Array.zipWith(Tuple.create);

/**
 *  | Transforms a list of pairs into a list of first components and a list of
 *  | second components.
 */
var unzip = function (_264) {
    if (_264.length >= 1) {
        var _1242 = _264.slice(1);
        var _1236 = unzip(_1242);
        return new Tuple(Prelude[":"]((_264[0]).value0)(_1236.value0), Prelude[":"]((_264[0]).value1)(_1236.value1));
    };
    if (_264.length === 0) {
        return new Tuple([  ], [  ]);
    };
    throw new Error("Failed pattern match");
};

/**
 *  | Turn a function of two arguments into a function that expects a tuple.
 */
var uncurry = function (f) {
    return function (_263) {
        return f(_263.value0)(_263.value1);
    };
};

/**
 *  | Exchange the first and second components of a tuple.
 */
var swap = function (_265) {
    return new Tuple(_265.value1, _265.value0);
};

/**
 *  | Returns the second component of a tuple.
 */
var snd = function (_262) {
    return _262.value1;
};

/**
 *  | Allows `Tuple`s to be rendered as a string with `show` whenever there are
 *  | `Show` instances for both component types.
 */
var showTuple = function (__dict_Show_0) {
    return function (__dict_Show_1) {
        return new Prelude.Show(function (_266) {
            return "Tuple (" + (Prelude.show(__dict_Show_0)(_266.value0) + (") (" + (Prelude.show(__dict_Show_1)(_266.value1) + ")")));
        });
    };
};
var semigroupoidTuple = new Prelude.Semigroupoid(function (_271) {
    return function (_272) {
        return new Tuple(_272.value0, _271.value1);
    };
});

/**
 *  | The `Semigroup` instance enables use of the associative operator `<>` on
 *  | `Tuple`s whenever there are `Semigroup` instances for the component
 *  | types. The `<>` operator is applied pairwise, so:
 *  | ```purescript
 *  | (Tuple a1 b1) <> (Tuple a2 b2) = Tuple (a1 <> a2) (b1 <> b2)
 *  | ```
 */
var semigroupTuple = function (__dict_Semigroup_2) {
    return function (__dict_Semigroup_3) {
        return new Prelude.Semigroup(function (_273) {
            return function (_274) {
                return new Tuple(Prelude["<>"](__dict_Semigroup_2)(_273.value0)(_274.value0), Prelude["<>"](__dict_Semigroup_3)(_273.value1)(_274.value1));
            };
        });
    };
};
var monoidTuple = function (__dict_Monoid_6) {
    return function (__dict_Monoid_7) {
        return new Data_Monoid.Monoid(function () {
            return semigroupTuple(__dict_Monoid_6["__superclass_Prelude.Semigroup_0"]())(__dict_Monoid_7["__superclass_Prelude.Semigroup_0"]());
        }, new Tuple(Data_Monoid.mempty(__dict_Monoid_6), Data_Monoid.mempty(__dict_Monoid_7)));
    };
};

/**
 *  | The `Functor` instance allows functions to transform the contents of a
 *  | `Tuple` with the `<$>` operator, applying the function to the second
 *  | component, so:
 *  | ```purescript
 *  | f <$> (Tuple x y) = Tuple x (f y)
 *  | ````
 */
var functorTuple = new Prelude.Functor(function (f) {
    return function (_275) {
        return new Tuple(_275.value0, f(_275.value1));
    };
});

/**
 *  | Returns the first component of a tuple.
 */
var fst = function (_261) {
    return _261.value0;
};
var lazyLazy1Tuple = function (__dict_Lazy1_9) {
    return function (__dict_Lazy1_10) {
        return new Control_Lazy.Lazy(function (f) {
            return new Tuple(Control_Lazy.defer1(__dict_Lazy1_9)(function (_257) {
                return fst(f(Prelude.unit));
            }), Control_Lazy.defer1(__dict_Lazy1_10)(function (_258) {
                return snd(f(Prelude.unit));
            }));
        });
    };
};
var lazyLazy2Tuple = function (__dict_Lazy2_11) {
    return function (__dict_Lazy2_12) {
        return new Control_Lazy.Lazy(function (f) {
            return new Tuple(Control_Lazy.defer2(__dict_Lazy2_11)(function (_259) {
                return fst(f(Prelude.unit));
            }), Control_Lazy.defer2(__dict_Lazy2_12)(function (_260) {
                return snd(f(Prelude.unit));
            }));
        });
    };
};
var lazyTuple = function (__dict_Lazy_13) {
    return function (__dict_Lazy_14) {
        return new Control_Lazy.Lazy(function (f) {
            return new Tuple(Control_Lazy.defer(__dict_Lazy_13)(function (_255) {
                return fst(f(Prelude.unit));
            }), Control_Lazy.defer(__dict_Lazy_14)(function (_256) {
                return snd(f(Prelude.unit));
            }));
        });
    };
};
var extendTuple = new Control_Extend.Extend(function (f) {
    return function (_279) {
        return new Tuple(_279.value0, f(_279));
    };
}, function () {
    return functorTuple;
});

/**
 *  | Allows `Tuple`s to be checked for equality with `==` and `/=` whenever
 *  | there are `Eq` instances for both component types.
 */
var eqTuple = function (__dict_Eq_15) {
    return function (__dict_Eq_16) {
        return new Prelude.Eq(function (t1) {
            return function (t2) {
                return !Prelude["=="](eqTuple(__dict_Eq_15)(__dict_Eq_16))(t1)(t2);
            };
        }, function (_267) {
            return function (_268) {
                return Prelude["=="](__dict_Eq_15)(_267.value0)(_268.value0) && Prelude["=="](__dict_Eq_16)(_267.value1)(_268.value1);
            };
        });
    };
};

/**
 *  | Allows `Tuple`s to be compared with `compare`, `>`, `>=`, `<` and `<=`
 *  | whenever there are `Ord` instances for both component types. To obtain
 *  | the result, the `fst`s are `compare`d, and if they are `EQ`ual, the
 *  | `snd`s are `compare`d.
 */
var ordTuple = function (__dict_Ord_4) {
    return function (__dict_Ord_5) {
        return new Prelude.Ord(function () {
            return eqTuple(__dict_Ord_4["__superclass_Prelude.Eq_0"]())(__dict_Ord_5["__superclass_Prelude.Eq_0"]());
        }, function (_269) {
            return function (_270) {
                var _1293 = Prelude.compare(__dict_Ord_4)(_269.value0)(_270.value0);
                if (_1293 instanceof Prelude.EQ) {
                    return Prelude.compare(__dict_Ord_5)(_269.value1)(_270.value1);
                };
                return _1293;
            };
        });
    };
};

/**
 *  | Turn a function that expects a tuple into a function of two arguments.
 */
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

/**
 *  | The `Functor` instance allows functions to transform the contents of a
 *  | `Tuple` with the `<*>` operator whenever there is a `Semigroup` instance
 *  | for the `fst` component, so:
 *  | ```purescript
 *  | (Tuple a1 f) <*> (Tuple a2 x) == Tuple (a1 <> a2) (f x)
 *  | ```
 */
var applyTuple = function (__dict_Semigroup_18) {
    return new Prelude.Apply(function (_276) {
        return function (_277) {
            return new Tuple(Prelude["<>"](__dict_Semigroup_18)(_276.value0)(_277.value0), _276.value1(_277.value1));
        };
    }, function () {
        return functorTuple;
    });
};
var bindTuple = function (__dict_Semigroup_17) {
    return new Prelude.Bind(function (_278) {
        return function (f) {
            var _1306 = f(_278.value1);
            return new Tuple(Prelude["<>"](__dict_Semigroup_17)(_278.value0)(_1306.value0), _1306.value1);
        };
    }, function () {
        return applyTuple(__dict_Semigroup_17);
    });
};
var applicativeTuple = function (__dict_Monoid_19) {
    return new Prelude.Applicative(function () {
        return applyTuple(__dict_Monoid_19["__superclass_Prelude.Semigroup_0"]());
    }, Tuple.create(Data_Monoid.mempty(__dict_Monoid_19)));
};
var monadTuple = function (__dict_Monoid_8) {
    return new Prelude.Monad(function () {
        return applicativeTuple(__dict_Monoid_8);
    }, function () {
        return bindTuple(__dict_Monoid_8["__superclass_Prelude.Semigroup_0"]());
    });
};
module.exports = {
    Tuple: Tuple, 
    swap: swap, 
    unzip: unzip, 
    zip: zip, 
    uncurry: uncurry, 
    curry: curry, 
    snd: snd, 
    fst: fst, 
    showTuple: showTuple, 
    eqTuple: eqTuple, 
    ordTuple: ordTuple, 
    semigroupoidTuple: semigroupoidTuple, 
    semigroupTuple: semigroupTuple, 
    monoidTuple: monoidTuple, 
    functorTuple: functorTuple, 
    applyTuple: applyTuple, 
    applicativeTuple: applicativeTuple, 
    bindTuple: bindTuple, 
    monadTuple: monadTuple, 
    extendTuple: extendTuple, 
    comonadTuple: comonadTuple, 
    lazyTuple: lazyTuple, 
    lazyLazy1Tuple: lazyLazy1Tuple, 
    lazyLazy2Tuple: lazyLazy2Tuple
};

},{"Control.Comonad":30,"Control.Extend":31,"Control.Lazy":32,"Data.Array":61,"Data.Monoid":97,"Prelude":127}],109:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module provides a type class for _unfoldable functors_, i.e.
 *  | functors which support an `unfoldr` operation.
 *  |
 *  | This allows us to unify various operations on arrays, lists,
 *  | sequences, etc.
 */
"use strict";
var Control_Monad_Eff = require("Control.Monad.Eff");
var Data_Array_ST = require("Data.Array.ST");
var Prelude = require("Prelude");
var Control_Monad_ST = require("Control.Monad.ST");
var Data_Maybe = require("Data.Maybe");
var Data_Tuple = require("Data.Tuple");

/**
 *  | This class identifies data structures which can be _unfolded_,
 *  | generalizing `unfoldr` on arrays.
 *  |
 *  | The generating function `f` in `unfoldr f` in understood as follows:
 *  |
 *  | - If `f b` is `Nothing`, then `unfoldr f b` should be empty.
 *  | - If `f b` is `Just (Tuple a b1)`, then `unfoldr f b` should consist of `a`
 *  |   appended to the result of `unfoldr f b1`.
 */
var Unfoldable = function (unfoldr) {
    this.unfoldr = unfoldr;
};

/**
 *  | This class identifies data structures which can be _unfolded_,
 *  | generalizing `unfoldr` on arrays.
 *  |
 *  | The generating function `f` in `unfoldr f` in understood as follows:
 *  |
 *  | - If `f b` is `Nothing`, then `unfoldr f b` should be empty.
 *  | - If `f b` is `Just (Tuple a b1)`, then `unfoldr f b` should consist of `a`
 *  |   appended to the result of `unfoldr f b1`.
 */
var unfoldr = function (dict) {
    return dict.unfoldr;
};
var unfoldableArray = new Unfoldable(function (f) {
    return function (b) {
        return Control_Monad_Eff.runPure(Data_Array_ST.runSTArray(function __do() {
            var _58 = Data_Array_ST.emptySTArray();
            var _57 = Control_Monad_ST.newSTRef(b)();
            (function () {
                while (!(function __do() {
                    var _56 = Control_Monad_ST.readSTRef(_57)();
                    return (function () {
                        var _2978 = f(_56);
                        if (_2978 instanceof Data_Maybe.Nothing) {
                            return Prelude["return"](Control_Monad_Eff.monadEff)(true);
                        };
                        if (_2978 instanceof Data_Maybe.Just) {
                            return function __do() {
                                Data_Array_ST.pushSTArray(_58)(_2978.value0.value0)();
                                Control_Monad_ST.writeSTRef(_57)(_2978.value0.value1)();
                                return false;
                            };
                        };
                        throw new Error("Failed pattern match");
                    })()();
                })()) {

                };
                return {};
            })();
            return _58;
        }));
    };
});
module.exports = {
    Unfoldable: Unfoldable, 
    unfoldr: unfoldr, 
    unfoldableArray: unfoldableArray
};

},{"Control.Monad.Eff":39,"Control.Monad.ST":49,"Data.Array.ST":59,"Data.Maybe":90,"Data.Tuple":108,"Prelude":127}],110:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_Functor_Contravariant = require("Data.Functor.Contravariant");
var Void = function (x) {
    return x;
};
var showVoid = new Prelude.Show(function (_110) {
    return "Void";
});
var eqVoid = new Prelude.Eq(function (_108) {
    return function (_109) {
        return false;
    };
}, function (_106) {
    return function (_107) {
        return true;
    };
});
var absurd = function (a) {
    var spin = function (__copy__111) {
        var _111 = __copy__111;
        tco: while (true) {
            var __tco__111 = _111;
            _111 = __tco__111;
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

},{"Data.Functor.Contravariant":84,"Prelude":127}],111:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Control_Monad_Eff = require("Control.Monad.Eff");

    function trace(s) {
      return function() {
        console.log(s);
        return {};
      };
    }
    ;

/**
 *  | Write a value to the console, using its `Show` instance to produce a `String`.
 */
var print = function (__dict_Show_0) {
    return function (o) {
        return trace(Prelude.show(__dict_Show_0)(o));
    };
};
module.exports = {
    print: print, 
    trace: trace
};

},{"Control.Monad.Eff":39,"Prelude":127}],112:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines types for some global Javascript functions
 *  | and values.
 */
"use strict";
var Prelude = require("Prelude");
var nan = NaN;;
var infinity = Infinity;;

  function readInt(radix) {
    return function(n) {
      return parseInt(n, radix);
    };
  }
  ;
var readFloat = parseFloat;;
module.exports = {
    readFloat: readFloat, 
    readInt: readInt, 
    isFinite: isFinite, 
    infinity: infinity, 
    isNaN: isNaN, 
    nan: nan
};

},{"Prelude":127}],113:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines a type of composable _components_, built from
 *  | the types provided by this library - signal functions and HTML documents.
 */
"use strict";
var Prelude = require("Prelude");
var Halogen_Signal = require("Halogen.Signal");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Data_Int = require("Data.Int");
var Data_Maybe = require("Data.Maybe");
var Data_Either = require("Data.Either");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Halogen_HTML = require("Halogen.HTML");

/**
 *  | Map a natural transformation over the monad type argument of a `Component`.
 *  |
 *  | This function may be useful during testing, to mock requests with a different monad.
 */
var hoistComponent = function (f) {
    return function (sf) {
        return Prelude["<$>"](Halogen_Signal.functorSF1)(Prelude["<$>"](Halogen_HTML.functorHTML)(f))(sf);
    };
};

/**
 *  | Combine two components into a single component.
 *  |
 *  | The first argument is a function which combines the two rendered HTML documents into a single document.
 *  |
 *  | This function works on request and response types by taking the _sum_ in each component. The left summand
 *  | gets dispatched to (resp. is generated by) the first component, and the right summand to the second component.
 */
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

},{"Control.Monad.Eff":39,"Data.DOM.Simple.Types":65,"Data.Either":73,"Data.Int":86,"Data.Maybe":90,"Halogen.HTML":121,"Halogen.Signal":123,"Prelude":127}],114:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module enumerates some common HTML attributes, and provides additional
 *  | helper functions for working with CSS classes.
 */
"use strict";
var Prelude = require("Prelude");
var Data_Exists = require("Data.Exists");
var Data_String = require("Data.String");
var Data_Array = require("Data.Array");
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
function unsafeCoerce(x) {  return x;};

/**
 *  | A type-safe wrapper for event names.
 *  |
 *  | The phantom type `fields` describes the event type which we can expect to exist on events
 *  | corresponding to this name.
 */
var EventName = function (x) {
    return x;
};

/**
 *  | The data which represents a typed event handler, hidden inside an existential package in
 *  | the `Attr` type.
 */
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

/**
 *  | A wrapper for strings which are used as CSS classes
 */
var ClassName = function (x) {
    return x;
};

/**
 *  | A type-safe wrapper for attribute names
 *  |
 *  | The phantom type `value` describes the type of value which this attribute requires.
 */
var AttributeName = function (x) {
    return x;
};

/**
 *  | The data which represents a typed attribute, hidden inside an existential package in
 *  | the `Attr` type.
 */
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

/**
 *  | A single attribute is either
 *  |
 *  | - An attribute
 *  | - An event handler
 */
var Attr = (function () {
    function Attr(value0) {
        this.value0 = value0;
    };
    Attr.create = function (value0) {
        return new Attr(value0);
    };
    return Attr;
})();

/**
 *  | A single attribute is either
 *  |
 *  | - An attribute
 *  | - An event handler
 */
var Handler = (function () {
    function Handler(value0) {
        this.value0 = value0;
    };
    Handler.create = function (value0) {
        return new Handler(value0);
    };
    return Handler;
})();

/**
 *  | A single attribute is either
 *  |
 *  | - An attribute
 *  | - An event handler
 */
var Initializer = (function () {
    function Initializer(value0) {
        this.value0 = value0;
    };
    Initializer.create = function (value0) {
        return new Initializer(value0);
    };
    return Initializer;
})();

/**
 *  | A single attribute is either
 *  |
 *  | - An attribute
 *  | - An event handler
 */
var Finalizer = (function () {
    function Finalizer(value0) {
        this.value0 = value0;
    };
    Finalizer.create = function (value0) {
        return new Finalizer(value0);
    };
    return Finalizer;
})();

/**
 *  | This type class captures those types which can be used as attribute values.
 *  |
 *  | `toAttrString` is an alternative to `show`, and is needed by `attr` in the string renderer.
 */
var IsAttribute = function (toAttrString) {
    this.toAttrString = toAttrString;
};

/**
 *  | This type class captures those types which can be used as attribute values.
 *  |
 *  | `toAttrString` is an alternative to `show`, and is needed by `attr` in the string renderer.
 */
var toAttrString = function (dict) {
    return dict.toAttrString;
};
var stringIsAttribute = new IsAttribute(function (_744) {
    return function (s) {
        return s;
    };
});
var runExistsR = unsafeCoerce;

/**
 *  | Unpack an event name
 */
var runEventName = function (_742) {
    return _742;
};

/**
 *  | Unpack a class name
 */
var runClassName = function (_740) {
    return _740;
};

/**
 *  | Unpack an attribute name
 */
var runAttributeName = function (_741) {
    return _741;
};
var numberIsAttribute = new IsAttribute(function (_745) {
    return function (n) {
        return Prelude.show(Prelude.showNumber)(n);
    };
});
var mkExistsR = unsafeCoerce;

/**
 *  | Attach an initializer.
 */
var initializer = Initializer.create;

/**
 *  | Create an event handler
 */
var handler = function (name_1) {
    return function (k) {
        return new Handler(mkExistsR(new HandlerF(name_1, k)));
    };
};

/**
 *  | Attach a finalizer.
 */
var finalizer = Finalizer.create;

/**
 *  Create an event name
 */
var eventName = EventName;

/**
 *  Create a class name
 */
var className = ClassName;
var booleanIsAttribute = new IsAttribute(function (name_1) {
    return function (_746) {
        if (_746) {
            return runAttributeName(name_1);
        };
        if (!_746) {
            return "";
        };
        throw new Error("Failed pattern match");
    };
});

/**
 *  | Create an attribute name
 */
var attributeName = AttributeName;

/**
 *  | Create an attribute
 */
var attr = function (__dict_IsAttribute_0) {
    return function (name_1) {
        return function (v) {
            return new Attr(Data_Exists.mkExists(new AttrF(toAttrString(__dict_IsAttribute_0), name_1, v)));
        };
    };
};
var charset = attr(stringIsAttribute)(attributeName("charset"));
var checked = attr(booleanIsAttribute)(attributeName("checked"));
var class_ = Prelude["<<<"](Prelude.semigroupoidArr)(attr(stringIsAttribute)(attributeName("className")))(runClassName);
var classes = function (ss) {
    return attr(stringIsAttribute)(attributeName("className"))(Data_String.joinWith(" ")(Data_Array.map(runClassName)(ss)));
};
var colSpan = Prelude["<<<"](Prelude.semigroupoidArr)(attr(stringIsAttribute)(attributeName("colSpan")))(Prelude.show(Prelude.showNumber));
var content = attr(stringIsAttribute)(attributeName("content"));
var disabled = attr(booleanIsAttribute)(attributeName("disabled"));
var enabled = Prelude["<<<"](Prelude.semigroupoidArr)(disabled)(Prelude.not(Prelude.boolLikeBoolean));
var $$for = attr(stringIsAttribute)(attributeName("for"));
var height = Prelude["<<<"](Prelude.semigroupoidArr)(attr(stringIsAttribute)(attributeName("height")))(Prelude.show(Prelude.showNumber));
var href = attr(stringIsAttribute)(attributeName("href"));
var httpEquiv = attr(stringIsAttribute)(attributeName("http-equiv"));
var id_ = attr(stringIsAttribute)(attributeName("id"));

/**
 *  Smart constructors
 *  | The `key` property associates a unique key with a node, which can be used to 
 *  | implement a more efficient diff/patch.
 */
var key = attr(stringIsAttribute)(attributeName("key"));
var name = attr(stringIsAttribute)(attributeName("name"));
var functorAttr = new Prelude.Functor(function (f) {
    return function (_743) {
        if (_743 instanceof Attr) {
            return new Attr(_743.value0);
        };
        if (_743 instanceof Handler) {
            return runExistsR(function (_739) {
                return new Handler(mkExistsR(new HandlerF(_739.value0, function (e_2) {
                    return Prelude["<$>"](Halogen_HTML_Events_Handler.functorEventHandler)(f)(_739.value1(e_2));
                })));
            })(_743.value0);
        };
        if (_743 instanceof Initializer) {
            return new Initializer(f(_743.value0));
        };
        if (_743 instanceof Finalizer) {
            return new Finalizer(f(_743.value0));
        };
        throw new Error("Failed pattern match");
    };
});
var placeholder = attr(stringIsAttribute)(attributeName("placeholder"));
var readonly = attr(booleanIsAttribute)(attributeName("readonly"));
var rel = attr(stringIsAttribute)(attributeName("rel"));
var required = attr(booleanIsAttribute)(attributeName("required"));
var rowSpan = Prelude["<<<"](Prelude.semigroupoidArr)(attr(stringIsAttribute)(attributeName("rowSpan")))(Prelude.show(Prelude.showNumber));
var selected = attr(booleanIsAttribute)(attributeName("selected"));
var spellcheck = attr(booleanIsAttribute)(attributeName("spellcheck"));
var src = attr(stringIsAttribute)(attributeName("src"));
var target = attr(stringIsAttribute)(attributeName("target"));
var title = attr(stringIsAttribute)(attributeName("title"));
var type_ = attr(stringIsAttribute)(attributeName("type"));
var value = attr(stringIsAttribute)(attributeName("value"));
var width = Prelude["<<<"](Prelude.semigroupoidArr)(attr(stringIsAttribute)(attributeName("width")))(Prelude.show(Prelude.showNumber));
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

},{"Control.Monad.Eff":39,"Control.Monad.ST":49,"DOM":58,"Data.Array":61,"Data.Either":73,"Data.Exists":75,"Data.Foreign":82,"Data.Maybe":90,"Data.Monoid":97,"Data.String":105,"Data.Traversable":107,"Data.Tuple":108,"Halogen.HTML.Events.Handler":116,"Halogen.HTML.Events.Types":118,"Halogen.Internal.VirtualDOM":122,"Prelude":127}],115:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | Convenience functions for working with form elements.
 */
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

/**
 *  | Attach event handler to event ```key``` with getting ```prop``` field
 *  | as an argument of handler
 */
var addForeignPropHandler = function (__dict_Alternative_0) {
    return function (__dict_IsForeign_1) {
        return function (key) {
            return function (prop) {
                return function (f) {
                    var handler = function (e) {
                        var _3329 = Data_Foreign_Class.readProp(__dict_IsForeign_1)(Data_Foreign_Index.indexString)(prop)(e);
                        if (_3329 instanceof Data_Either.Left) {
                            return Prelude.pure(Halogen_HTML_Events_Handler.applicativeEventHandler)(Control_Plus.empty(__dict_Alternative_0["__superclass_Control.Plus.Plus_1"]()));
                        };
                        if (_3329 instanceof Data_Either.Right) {
                            return f(_3329.value0);
                        };
                        throw new Error("Failed pattern match");
                    };
                    return Halogen_HTML_Attributes.handler(Halogen_HTML_Attributes.eventName(key))(function (e) {
                        return handler(Data_Foreign.toForeign(e.target));
                    });
                };
            };
        };
    };
};

/**
 *  | Attach an event handler which will fire when a checkbox is checked or unchecked
 */
var onChecked = function (__dict_Alternative_2) {
    return addForeignPropHandler(__dict_Alternative_2)(Data_Foreign_Class.booleanIsForeign)("change")("checked");
};

/**
 *  | Attach an event handler which will fire on input
 */
var onInput = function (__dict_Alternative_3) {
    return addForeignPropHandler(__dict_Alternative_3)(Data_Foreign_Class.stringIsForeign)("input")("value");
};

/**
 *  | Attach an event handler which will produce an input when the value of an input field changes
 *  |
 *  | An input will not be produced if the value cannot be cast to the appropriate type.
 */
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

},{"Control.Alternative":27,"Control.Plus":57,"DOM":58,"Data.Either":73,"Data.Foreign":82,"Data.Foreign.Class":77,"Data.Foreign.Index":78,"Data.Maybe":90,"Data.Traversable":107,"Halogen.HTML.Attributes":114,"Halogen.HTML.Events.Handler":116,"Prelude":127}],116:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `EventHandler` functor, which can be used
 *  | to perform standard operations on HTML events.
 */
"use strict";
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
function preventDefaultImpl(e) {  return function() {    e.preventDefault();  };};
function stopPropagationImpl(e) {  return function() {    e.stopPropagation();  };};
function stopImmediatePropagationImpl(e) {  return function() {    e.stopImmediatePropagation();  };};
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

/**
 *  | This monad supports the following operations on events:
 *  |
 *  | - `preventDefault`
 *  | - `stopPropagation`
 *  | - `stopImmediatePropagation`
 *  |
 *  | It can be used as follows:
 *  |
 *  | ```purescript
 *  | import Control.Functor (($>))
 *  |
 *  | H.a (E.onclick \_ -> E.preventDefault $> ClickHandler) (H.text "Click here")
 *  | ```
 */
var EventHandler = function (x) {
    return x;
};
var unEventHandler = function (_732) {
    return _732;
};

/**
 *  | Call the `stopPropagation` method on the current event
 */
var stopPropagation = Control_Monad_Writer_Class.tell(Data_Monoid.monoidArray)(Control_Monad_Writer_Trans.monadWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(Control_Monad_Writer_Class.monadWriterWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))([ StopPropagation.value ]);

/**
 *  | Call the `stopImmediatePropagation` method on the current event
 */
var stopImmediatePropagation = Control_Monad_Writer_Class.tell(Data_Monoid.monoidArray)(Control_Monad_Writer_Trans.monadWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(Control_Monad_Writer_Class.monadWriterWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))([ StopImmediatePropagation.value ]);

/**
 *  | This function can be used to update an event and return the wrapped value
 */
var runEventHandler = function (e) {
    return function (_733) {
        var applyUpdate = function (_738) {
            if (_738 instanceof PreventDefault) {
                return preventDefaultImpl(e);
            };
            if (_738 instanceof StopPropagation) {
                return stopPropagationImpl(e);
            };
            if (_738 instanceof StopImmediatePropagation) {
                return stopImmediatePropagationImpl(e);
            };
            throw new Error("Failed pattern match");
        };
        var _3294 = Control_Monad_Writer.runWriter(_733);
        return Control_Apply["*>"](Control_Monad_Eff.applyEff)(Data_Foldable.for_(Control_Monad_Eff.applicativeEff)(Data_Foldable.foldableArray)(_3294.value1)(applyUpdate))(Prelude["return"](Control_Monad_Eff.monadEff)(_3294.value0));
    };
};

/**
 *  | Call the `preventDefault` method on the current event
 */
var preventDefault = Control_Monad_Writer_Class.tell(Data_Monoid.monoidArray)(Control_Monad_Writer_Trans.monadWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(Control_Monad_Writer_Class.monadWriterWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))([ PreventDefault.value ]);
var functorEventHandler = new Prelude.Functor(function (f) {
    return function (_734) {
        return Prelude["<$>"](Control_Monad_Writer_Trans.functorWriterT(Data_Identity.functorIdentity))(f)(_734);
    };
});
var applyEventHandler = new Prelude.Apply(function (_735) {
    return function (_736) {
        return Prelude["<*>"](Control_Monad_Writer_Trans.applyWriterT(Data_Monoid.monoidArray)(Data_Identity.applyIdentity))(_735)(_736);
    };
}, function () {
    return functorEventHandler;
});
var bindEventHandler = new Prelude.Bind(function (_737) {
    return function (f) {
        return Prelude[">>="](Control_Monad_Writer_Trans.bindWriterT(Data_Monoid.monoidArray)(Data_Identity.monadIdentity))(_737)(Prelude["<<<"](Prelude.semigroupoidArr)(unEventHandler)(f));
    };
}, function () {
    return applyEventHandler;
});
var applicativeEventHandler = new Prelude.Applicative(function () {
    return applyEventHandler;
}, Prelude["<<<"](Prelude.semigroupoidArr)(EventHandler)(Prelude.pure(Control_Monad_Writer_Trans.applicativeWriterT(Data_Monoid.monoidArray)(Data_Identity.applicativeIdentity))));
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

},{"Control.Apply":28,"Control.Monad.Eff":39,"Control.Monad.Writer":54,"Control.Monad.Writer.Class":52,"Control.Monad.Writer.Trans":53,"Control.Plus":57,"DOM":58,"Data.Array":61,"Data.Foldable":76,"Data.Identity":85,"Data.Maybe":90,"Data.Monoid":97,"Data.Tuple":108,"Halogen.HTML.Events.Types":118,"Prelude":127}],117:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the `Event` monad.
 */
"use strict";
var Control_Monad_Aff = require("Control.Monad.Aff");
var Control_Monad_ListT = require("Control.Monad.ListT");
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

/**
 *  | The `Event` monad, which supports the asynchronous generation of events.
 *  | 
 *  | This monad is used in the definition of `runUI`.
 */
var Event = function (x) {
    return x;
};

/**
 *  | Unwrap the `Event` constructor.
 */
var unEvent = function (_766) {
    return _766;
};
var semigroupEvent = new Prelude.Semigroup(function (_769) {
    return function (_770) {
        return Prelude["<>"](Control_Monad_ListT.semigroupListT(Control_Monad_Aff.applicativeAff))(_769)(_770);
    };
});

/**
 *  | Run a computation in the `Event` monad by providing a callback function.
 *  |
 *  | The callback function will be invoked zero or more times.
 */
var runEvent = function (f) {
    return function (s) {
        var handler = function (_768) {
            if (_768 instanceof Data_Maybe.Nothing) {
                return Prelude["return"](Control_Monad_Eff.monadEff)(Prelude.unit);
            };
            if (_768 instanceof Data_Maybe.Just) {
                return Control_Apply["*>"](Control_Monad_Eff.applyEff)(s(_768.value0.value0))(go(_768.value0.value1));
            };
            throw new Error("Failed pattern match");
        };
        var go = function (l) {
            return Control_Monad_Aff.runAff(f)(handler)(Control_Monad_Aff.later(Control_Monad_ListT.uncons(Control_Monad_Aff.monadAff)(l)));
        };
        return Prelude["<<<"](Prelude.semigroupoidArr)(go)(unEvent);
    };
};
var monoidEvent = new Data_Monoid.Monoid(function () {
    return semigroupEvent;
}, Data_Monoid.mempty(Control_Monad_ListT.monoidListT(Control_Monad_Aff.applicativeAff)));
var monadAffEvent = new Control_Monad_Aff_Class.MonadAff(Prelude["<<<"](Prelude.semigroupoidArr)(Event)(Control_Monad_Trans.lift(Control_Monad_ListT.monadTransListT)(Control_Monad_Aff.monadAff)));
var functorEvent = new Prelude.Functor(function (f) {
    return function (_771) {
        return Prelude["<$>"](Control_Monad_ListT.functorListT(Control_Monad_Aff.functorAff))(f)(_771);
    };
});

/**
 *  | Lift an asynchronous computation into the `Event` monad.
 */
var async = Control_Monad_Aff_Class.liftAff(monadAffEvent);

/**
 *  | Yield an event. In practice, the event will be passed to the driver function.
 */
var $$yield = Prelude["<<<"](Prelude.semigroupoidArr)(async)(Prelude.pure(Control_Monad_Aff.applicativeAff));
var applyEvent = new Prelude.Apply(function (_772) {
    return function (_773) {
        return Prelude["<*>"](Control_Monad_ListT.applyListT(Control_Monad_Aff.monadAff))(_772)(_773);
    };
}, function () {
    return functorEvent;
});
var bindEvent = new Prelude.Bind(function (_774) {
    return function (f) {
        return Prelude[">>="](Control_Monad_ListT.bindListT(Control_Monad_Aff.monadAff))(_774)(Prelude[">>>"](Prelude.semigroupoidArr)(f)(unEvent));
    };
}, function () {
    return applyEvent;
});
var applicativeEvent = new Prelude.Applicative(function () {
    return applyEvent;
}, Prelude["<<<"](Prelude.semigroupoidArr)(Event)(Prelude.pure(Control_Monad_ListT.applicativeListT(Control_Monad_Aff.monadAff))));
var monadEvent = new Prelude.Monad(function () {
    return applicativeEvent;
}, function () {
    return bindEvent;
});
var monadEffEvent = new Control_Monad_Eff_Class.MonadEff(function () {
    return monadEvent;
}, Prelude["<<<"](Prelude.semigroupoidArr)(Event)(Prelude["<<<"](Prelude.semigroupoidArr)(Control_Monad_Trans.lift(Control_Monad_ListT.monadTransListT)(Control_Monad_Aff.monadAff))(Control_Monad_Eff_Class.liftEff(Control_Monad_Aff.monadEffAff))));

/**
 *  | A combinator which branches based on the supplied function after the first result,
 *  | and returns to the original stream of events after the secondary stream has been
 *  | exhausted.
 */
var andThen = function (_767) {
    return function (f) {
        var go = function (l_1) {
            return Control_Monad_ListT.wrapEffect(Control_Monad_Aff.monadAff)(Prelude[">>="](Control_Monad_Aff.bindAff)(Control_Monad_ListT.uncons(Control_Monad_Aff.monadAff)(l_1))(function (_66) {
                return Prelude["return"](Control_Monad_Aff.monadAff)((function () {
                    if (_66 instanceof Data_Maybe.Nothing) {
                        return Control_Monad_ListT.nil(Control_Monad_Aff.applicativeAff);
                    };
                    if (_66 instanceof Data_Maybe.Just) {
                        return Prelude["<>"](Control_Monad_ListT.semigroupListT(Control_Monad_Aff.applicativeAff))(Control_Monad_ListT.singleton(Control_Monad_Aff.applicativeAff)(_66.value0.value0))(Prelude["<>"](Control_Monad_ListT.semigroupListT(Control_Monad_Aff.applicativeAff))(unEvent(f(_66.value0.value0)))(go(_66.value0.value1)));
                    };
                    throw new Error("Failed pattern match");
                })());
            }));
        };
        return go(_767);
    };
};
var altEvent = new Control_Alt.Alt(function (_775) {
    return function (_776) {
        return Control_Alt["<|>"](Control_Monad_ListT.altListT(Control_Monad_Aff.applicativeAff))(_775)(_776);
    };
}, function () {
    return functorEvent;
});
var plusEvent = new Control_Plus.Plus(function () {
    return altEvent;
}, Control_Plus.empty(Control_Monad_ListT.plusListT(Control_Monad_Aff.monadAff)));
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

},{"Control.Alt":26,"Control.Alternative":27,"Control.Apply":28,"Control.Monad.Aff":34,"Control.Monad.Aff.Class":33,"Control.Monad.Eff":39,"Control.Monad.Eff.Class":35,"Control.Monad.Eff.Exception":36,"Control.Monad.ListT":44,"Control.Monad.Trans":51,"Control.MonadPlus":56,"Control.Plus":57,"Data.Maybe":90,"Data.Monoid":97,"Data.Tuple":108,"Prelude":127}],118:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines types for common DOM events
 */
"use strict";
var Prelude = require("Prelude");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
module.exports = {};

},{"Data.DOM.Simple.Types":65,"Prelude":127}],119:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines well-typed wrappers for common DOM events, so that
 *  | they may be safely embedded in HTML documents.
 */
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

/**
 *  | A helper function for simple event handlers that provide an input to the signal function,
 *  | where there is no need to make use of the event value to generate the input.
 *  |
 *  | ```purescript
 *  | onclick (input_ Input)
 *  | ```
 */
var input_ = function (__dict_Applicative_0) {
    return function (x) {
        return function (_749) {
            return Prelude.pure(Halogen_HTML_Events_Handler.applicativeEventHandler)(Prelude.pure(__dict_Applicative_0)(x));
        };
    };
};

/**
 *  | A helper function which can be used to create simple event handlers.
 *  |
 *  | Often we don't need to use `EventHandler` or the monad underlying our component, and just need
 *  | to generate an input to the signal function.
 *  |
 *  | This function provides an alternative to making two nested calls to `pure`:
 *  |
 *  | ```purescript
 *  | onClick (input \_ -> Input)
 *  | ```
 */
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

},{"Data.Maybe":90,"Halogen.HTML.Attributes":114,"Halogen.HTML.Events.Handler":116,"Halogen.HTML.Events.Types":118,"Prelude":127}],120:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
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
var Data_Array = require("Data.Array");
var Data_Monoid = require("Data.Monoid");
var Control_Monad_Eff = require("Control.Monad.Eff");
var Halogen_HTML_Events_Types = require("Halogen.HTML.Events.Types");
var renderAttr = function (dr) {
    return function (_755) {
        if (_755 instanceof Halogen_HTML_Attributes.Attr) {
            return Data_Exists.runExists(function (_753) {
                return Halogen_Internal_VirtualDOM.prop(Halogen_HTML_Attributes.runAttributeName(_753.value1), _753.value2);
            })(_755.value0);
        };
        if (_755 instanceof Halogen_HTML_Attributes.Handler) {
            return Halogen_HTML_Attributes.runExistsR(function (_754) {
                return Halogen_Internal_VirtualDOM.handlerProp(Halogen_HTML_Attributes.runEventName(_754.value0), function (ev) {
                    return function __do() {
                        var _63 = Control_Monad_Eff_Unsafe.unsafeInterleaveEff(Halogen_HTML_Events_Handler.runEventHandler(ev)(_754.value1(ev)))();
                        return dr(_63)();
                    };
                });
            })(_755.value0);
        };
        if (_755 instanceof Halogen_HTML_Attributes.Initializer) {
            return Halogen_Internal_VirtualDOM.initProp(dr(_755.value0));
        };
        if (_755 instanceof Halogen_HTML_Attributes.Finalizer) {
            return Halogen_Internal_VirtualDOM.finalizerProp(dr(_755.value0));
        };
        throw new Error("Failed pattern match");
    };
};

/**
 *  | Render a `HTML` document to a virtual DOM node
 *  |
 *  | The first argument is an event handler.
 */
var renderHTML = function (f) {
    var go = function (_756) {
        if (_756 instanceof Halogen_HTML.Text) {
            return Halogen_Internal_VirtualDOM.vtext(_756.value0);
        };
        if (_756 instanceof Halogen_HTML.Element) {
            return Halogen_Internal_VirtualDOM.vnode(Halogen_HTML.runTagName(_756.value0))(Data_Foldable.foldMap(Data_Foldable.foldableArray)(Halogen_Internal_VirtualDOM.monoidProps)(renderAttr(f))(_756.value1))(Data_Array.map(go)(_756.value2));
        };
        throw new Error("Failed pattern match");
    };
    return go;
};
module.exports = {
    renderHTML: renderHTML
};

},{"Control.Monad.Eff":39,"Control.Monad.Eff.Unsafe":38,"Data.Array":61,"Data.Exists":75,"Data.Foldable":76,"Data.Function":83,"Data.Monoid":97,"Halogen.HTML":121,"Halogen.HTML.Attributes":114,"Halogen.HTML.Events.Handler":116,"Halogen.HTML.Events.Types":118,"Halogen.Internal.VirtualDOM":122,"Prelude":127}],121:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines the HTML types required by the Halogen library, and provides
 *  | smart constructors for HTML5 elements.
 */
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
var Data_Array = require("Data.Array");

/**
 *  | A type-safe wrapper for a HTML tag name
 */
var TagName = function (x) {
    return x;
};

/**
 *  | An initial encoding of HTML nodes.
 */
var Text = (function () {
    function Text(value0) {
        this.value0 = value0;
    };
    Text.create = function (value0) {
        return new Text(value0);
    };
    return Text;
})();

/**
 *  | An initial encoding of HTML nodes.
 */
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

/**
 *  | Create a tag name
 */
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
    var go = function (_748) {
        if (_748 instanceof Text) {
            return new Text(_748.value0);
        };
        if (_748 instanceof Element) {
            return new Element(_748.value0, Prelude["<$>"](Data_Array.functorArray)(Prelude["<$>"](Halogen_HTML_Attributes.functorAttr)(f))(_748.value1), Prelude["<$>"](Data_Array.functorArray)(go)(_748.value2));
        };
        throw new Error("Failed pattern match");
    };
    return go;
});

/**
 *  | Unwrap a `TagName` to get the tag name as a `String`.
 */
var runTagName = function (_747) {
    return _747;
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

},{"Control.Monad.Eff":39,"Control.Monad.Eff.Unsafe":38,"Control.Monad.ST":49,"Data.Array":61,"Data.Foldable":76,"Data.Foreign":82,"Data.Function":83,"Data.Maybe":90,"Data.Monoid":97,"Data.StrMap":103,"Data.String":105,"Data.Tuple":108,"Data.Void":110,"Halogen.HTML.Attributes":114,"Halogen.Internal.VirtualDOM":122,"Prelude":127}],122:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module provides the FFI definitions required to render HTML documents
 *  | using the `virtual-dom` library.
 */
"use strict";
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
var emptyProps = {};

  function prop(key, value) {
    var props = {};
    props[key] = value;
    return props;
  }
  ;

  function handlerProp(key, f) {
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
    props['halogen-hook-' + key] = new Hook(f);
    return props;
  }
  ;

  function initProp(f) {
    var props = {};
    var Hook = function () {};
    Hook.prototype.hook = function (node, prop, prev) {
      if (typeof prev === 'undefined') {
        f();
      };
    };
    props['halogen-init'] = new Hook(f);
    return props;
  }
  ;

  function finalizerProp(f) {
    var props = {};
    var Hook = function () {};
    Hook.prototype.hook = function () { };
    Hook.prototype.unhook = function () {
      f();
    };
    props['halogen-finalizer'] = new Hook(f);
    return props;
  }
  ;

  function concatProps(p1, p2) {
    var props = {};
    for (var key in p1) {
      props[key] = p1[key];
    }
    for (var key in p2) {
      props[key] = p2[key];
    }
    return props;
  }
  ;

  var createElement = (function () {
    var vcreateElement = require('virtual-dom/create-element');
    return function (vtree) {
      return vcreateElement(vtree);
    };
  }());
  ;

  var diff = (function () {
    var vdiff = require('virtual-dom/diff');
    return function (vtree1) {
      return function (vtree2) {
        return vdiff(vtree1, vtree2);
      };
    };
  }());

  ;

  var patch = (function () {
    var vpatch = require('virtual-dom/patch');
    return function (p) {
      return function (node) {
        return function () {
          return vpatch(node, p);
        };
      };
    };
  }());
  ;

  var vtext = (function () {
    var VText = require('virtual-dom/vnode/vtext');
    return function (s) {
      return new VText(s);
    };
  }());
  ;

  var vnode = (function () {
    var VirtualNode = require('virtual-dom/vnode/vnode');
    var SoftSetHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');
    return function (name) {
      return function (attr) {
        return function (children) {
          var props = {
            attributes: {}
          };
          for (var key in attr) {
            if ((key.indexOf('data-') === 0) || (key === 'readonly')) {
              props.attributes[key] = attr[key];
            } else {
              props[key] = attr[key];
            }
          }
          if (name === 'input' && props.value !== undefined) {
            props.value = new SoftSetHook(props.value);
          }
          return new VirtualNode(name, props, children, attr.key);
        };
      };
    };
  }());
  ;
var semigroupProps = new Prelude.Semigroup(Data_Function.runFn2(concatProps));
var monoidProps = new Data_Monoid.Monoid(function () {
    return semigroupProps;
}, emptyProps);
module.exports = {
    vnode: vnode, 
    vtext: vtext, 
    patch: patch, 
    diff: diff, 
    createElement: createElement, 
    finalizerProp: finalizerProp, 
    initProp: initProp, 
    handlerProp: handlerProp, 
    prop: prop, 
    emptyProps: emptyProps, 
    semigroupProps: semigroupProps, 
    monoidProps: monoidProps
};

},{"Control.Monad.Eff":39,"Control.Monad.ST":49,"DOM":58,"Data.DOM.Simple.Types":65,"Data.Function":83,"Data.Int":86,"Data.Maybe":90,"Data.Monoid":97,"Data.Nullable":98,"Prelude":127,"virtual-dom/create-element":1,"virtual-dom/diff":2,"virtual-dom/patch":6,"virtual-dom/virtual-hyperscript/hooks/soft-set-hook":13,"virtual-dom/vnode/vnode":21,"virtual-dom/vnode/vtext":23}],123:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | This module defines signal functions (`SF`) and non-empty signal functions (`SF1`) and combinators
 *  | for working with them.
 */
"use strict";
var Data_Tuple = require("Data.Tuple");
var Prelude = require("Prelude");
var Data_Profunctor = require("Data.Profunctor");
var Data_Profunctor_Strong = require("Data.Profunctor.Strong");
var Data_Profunctor_Choice = require("Data.Profunctor.Choice");
var Data_Either = require("Data.Either");

/**
 *  | A `SF` represents a state machine which responds to inputs of type `i`, producing outputs of type `o`.
 */
var SF = function (x) {
    return x;
};

/**
 *  | `SF1` represents non-empty signals, i.e. signals with an initial output value.
 */
var SF1 = function (x) {
    return x;
};

/**
 *  | Convert a `SF1` to a `SF` by ignoring its initial value
 */
var tail = function (_344) {
    return _344.next;
};

/**
 *  | Creates a stateful `SF` based on a function which returns an output value
 */
var stateful$prime = function (s) {
    return function (step) {
        var go = function (s_1) {
            return function (i) {
                var _1589 = step(s_1)(i);
                return {
                    result: _1589.value0, 
                    next: go(_1589.value1)
                };
            };
        };
        return go(s);
    };
};

/**
 *  | Convert a `SF` to a `SF1` by providing an initial value
 */
var startingAt = function (s) {
    return function (o) {
        return {
            result: o, 
            next: s
        };
    };
};

/**
 *  | Creates a stateful `SF1`
 */
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

/**
 *  | Run a `SF1` to obtain the initial value and remaining signal
 */
var runSF1 = function (_342) {
    return _342;
};

/**
 *  | Run a `SF` by providing an input
 */
var runSF = function (_341) {
    return _341;
};
var profunctorSF1 = new Data_Profunctor.Profunctor(function (f) {
    return function (g) {
        return function (_350) {
            return {
                result: g(_350.result), 
                next: Data_Profunctor.dimap(profunctorSF)(f)(g)(_350.next)
            };
        };
    };
});
var profunctorSF = new Data_Profunctor.Profunctor(function (f) {
    return function (g) {
        return function (_349) {
            return function (i) {
                return Data_Profunctor.dimap(profunctorSF1)(f)(g)(_349(f(i)));
            };
        };
    };
});
var strongSF = new Data_Profunctor_Strong.Strong(function () {
    return profunctorSF;
}, function (s) {
    return function (_339) {
        var _1601 = runSF(s)(_339.value0);
        return {
            result: new Data_Tuple.Tuple(_1601.result, _339.value1), 
            next: Data_Profunctor_Strong.first(strongSF)(_1601.next)
        };
    };
}, function (s) {
    return function (_340) {
        var _1605 = runSF(s)(_340.value1);
        return {
            result: new Data_Tuple.Tuple(_340.value0, _1605.result), 
            next: Data_Profunctor_Strong.second(strongSF)(_1605.next)
        };
    };
});

/**
 *  | Create a `SF` which hides a piece of internal state of type `s`.
 */
var loop = function (s) {
    return function (signal) {
        return function (i) {
            var _1608 = runSF(signal)(new Data_Tuple.Tuple(s, i));
            return {
                result: Data_Tuple.snd(_1608.result), 
                next: loop(Data_Tuple.fst(_1608.result))(_1608.next)
            };
        };
    };
};

/**
 *  | A `SF` which returns the latest input
 */
var input = function (i) {
    return {
        result: i, 
        next: input
    };
};

/**
 *  | Get the current value of a `SF1`
 */
var head = function (_343) {
    return _343.result;
};

/**
 *  | A variant of `mergeWith` which takes an additional function to destructure
 *  | its inputs.
 */
var mergeWith$prime = function (f) {
    return function (g) {
        var o = function (s1) {
            return function (s2) {
                return {
                    result: g(head(s1))(head(s2)), 
                    next: function (i) {
                        var _1610 = f(i);
                        if (_1610 instanceof Data_Either.Left) {
                            return o(runSF(tail(s1))(_1610.value0))(s2);
                        };
                        if (_1610 instanceof Data_Either.Right) {
                            return o(s1)(runSF(tail(s2))(_1610.value0));
                        };
                        throw new Error("Failed pattern match");
                    }
                };
            };
        };
        return o;
    };
};

/**
 *  | Merge two non-empty signals, outputting the latest value from both
 *  | signals at each step.
 */
var mergeWith = mergeWith$prime(Prelude.id(Prelude.categoryArr));
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
    return function (_346) {
        return {
            result: f(_346.result), 
            next: Prelude["<$>"](functorSF)(f)(_346.next)
        };
    };
});
var functorSF = new Prelude.Functor(function (f) {
    return function (_345) {
        return function (i) {
            return Prelude["<$>"](functorSF1)(f)(_345(i));
        };
    };
});

/**
 *  | A `SF` which compares consecutive inputs using a helper function
 */
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
            var _1618 = runSF(s)(e.value0);
            return {
                result: new Data_Either.Left(_1618.result), 
                next: Data_Profunctor_Choice.left(choiceSF)(_1618.next)
            };
        };
        if (e instanceof Data_Either.Right) {
            return {
                result: new Data_Either.Right(e.value0), 
                next: Data_Profunctor_Choice.left(choiceSF)(s)
            };
        };
        throw new Error("Failed pattern match");
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
            var _1623 = runSF(s)(e.value0);
            return {
                result: new Data_Either.Right(_1623.result), 
                next: Data_Profunctor_Choice.right(choiceSF)(_1623.next)
            };
        };
        throw new Error("Failed pattern match");
    };
});
var categorySF = new Prelude.Category(function () {
    return semigroupoidSF;
}, input);
var applySF1 = new Prelude.Apply(function (_347) {
    return function (_348) {
        return {
            result: _347.result(_348.result), 
            next: Prelude["<*>"](applySF)(_347.next)(_348.next)
        };
    };
}, function () {
    return functorSF1;
});
var applySF = new Prelude.Apply(function (f) {
    return function (x) {
        return function (i) {
            return Prelude["<*>"](applySF1)(runSF(f)(i))(runSF(x)(i));
        };
    };
}, function () {
    return functorSF;
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
    return function (_338) {
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

},{"Data.Either":73,"Data.Profunctor":101,"Data.Profunctor.Choice":99,"Data.Profunctor.Strong":100,"Data.Tuple":108,"Prelude":127}],124:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3

/**
 *  | The main module of the Halogen library. It defines functions for running applications
 *  | assembled from the parts defined in the various submodules:
 *  |
 *  | - `Halogen.Signal` for responding to inputs and maintaining state
 *  | - `Halogen.HTML.*` for templating HTML documents
 *  | - `Halogen.Component` for building application components
 *  | - `Halogen.Themes.*` for rendering using common front-end libraries
 *  | - `Halogen.Mixin.*` for common additional application features
 *  |
 *  | The functionality of this library is completely described by the type signature of the `runUI`
 *  | function, which renders a `Component` to the DOM. The other modules exist to make the construction
 *  | of `Component`s as simple as possible.
 *  |
 */
"use strict";
var Halogen_Signal = require("Halogen.Signal");
var Halogen_Internal_VirtualDOM = require("Halogen.Internal.VirtualDOM");
var Prelude = require("Prelude");
var Halogen_HTML_Events_Monad = require("Halogen.HTML.Events.Monad");
var Debug_Trace = require("Debug.Trace");
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

/**
 *  | This function provides the low-level implementation of Halogen's DOM update loop.
 *  |
 *  | The first argument is a function which receives the `Driver` function as an argument and
 *  | constructs a `Process` which will update the DOM given an input.
 *  |
 *  | This function could be reused to create other types of applications based on signal functions
 *  | (2D and 3D canvas, text-based, etc.)
 */
var mainLoop = function (buildProcess) {
    var go = function (ref) {
        var driver = function (req) {
            return Prelude["void"](Control_Monad_Eff.functorEff)(Data_DOM_Simple_Window.setTimeout(Data_DOM_Simple_Window.htmlWindow)(Data_DOM_Simple_Window.globalWindow)(0)(function __do() {
                var _69 = Control_Monad_Eff_Ref.readRef(ref)();
                return (function () {
                    if (_69 instanceof Data_Maybe.Just) {
                        var work = Halogen_Signal.runSF(_69.value0.process)(new Data_Tuple.Tuple(req, _69.value0.node));
                        return function __do() {
                            var _68 = Halogen_Signal.head(work)();
                            return Control_Monad_Eff_Ref.writeRef(ref)(new Data_Maybe.Just({
                                process: Halogen_Signal.tail(work), 
                                node: _68
                            }))();
                        };
                    };
                    if (_69 instanceof Data_Maybe.Nothing) {
                        return Debug_Trace.trace("Error: An attempt to re-render was made during the initial render.");
                    };
                    throw new Error("Failed pattern match");
                })()();
            }));
        };
        return function __do() {
            var _70 = buildProcess(driver)();
            Control_Monad_Eff_Ref.writeRef(ref)(new Data_Maybe.Just({
                process: _70.value1, 
                node: _70.value0
            }))();
            return new Data_Tuple.Tuple(_70.value0, driver);
        };
    };
    return function __do() {
        var _71 = Control_Monad_Eff_Ref.newRef(Data_Maybe.Nothing.value)();
        return go(_71)();
    };
};

/**
 *  | A signal which emits patches corresponding to successive `VTree`s.
 *  |
 *  | This function can be used to create alternative top-level handlers which use `virtual-dom`.
 */
var changes = Halogen_Signal.differencesWith(Halogen_Internal_VirtualDOM.diff);

/**
 *  | Build a `Process` from a `Component`.
 */
var componentProcess = function (sf) {
    return function (postRender) {
        return function (driver) {
            var logger = function (e) {
                return Debug_Trace.trace("Uncaught error in asynchronous code: " + Control_Monad_Eff_Exception.message(e));
            };
            var requestHandler = function (aff) {
                return Halogen_HTML_Events_Monad.runEvent(logger)(driver)(aff);
            };
            var applyPatch = function (_780) {
                return function __do() {
                    var _67 = Halogen_Internal_VirtualDOM.patch(_780.value0.value0)(_780.value1)();
                    postRender(_780.value0.value1)(_67)(driver)();
                    return _67;
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

/**
 *  | A variant of `runUI` which supports a _post-render hook_. This allows applications
 *  | to support third-party components or other custom behaviors by modifying the DOM after
 *  | each update.
 *  |
 *  | This is considered an advanced feature, and should only be used with an understanding of
 *  | the rendering pipeline.
 */
var runUIWith = function (sf) {
    return function (postRender) {
        return mainLoop(Prelude["<<<"](Prelude.semigroupoidArr)(Prelude.pure(Control_Monad_Eff.applicativeEff))(componentProcess(sf)(postRender)));
    };
};

/**
 *  | `runUI` renders a `Component` to the DOM using `virtual-dom`.
 *  |
 *  | This function is the workhorse of the Halogen library. It can be called in `main`
 *  | to set up the application and create the driver function, which can be used to 
 *  | send inputs to the UI from external components.
 */
var runUI = function (sf) {
    return runUIWith(sf)(function (_779) {
        return function (_778) {
            return function (_777) {
                return Prelude["return"](Control_Monad_Eff.monadEff)(Prelude.unit);
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

},{"Control.Monad.Eff":39,"Control.Monad.Eff.Exception":36,"Control.Monad.Eff.Ref":37,"DOM":58,"Data.DOM.Simple.Types":65,"Data.DOM.Simple.Window":70,"Data.Either":73,"Data.Maybe":90,"Data.Profunctor.Strong":100,"Data.Tuple":108,"Debug.Trace":111,"Halogen.Component":113,"Halogen.HTML":121,"Halogen.HTML.Events.Monad":117,"Halogen.HTML.Renderer.VirtualDOM":120,"Halogen.Internal.VirtualDOM":122,"Halogen.Signal":123,"Prelude":127}],125:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");
var Data_DOM_Simple_Window = require("Data.DOM.Simple.Window");
var Data_DOM_Simple_Element = require("Data.DOM.Simple.Element");
var Data_Map = require("Data.Map");
var Data_Array_Unsafe = require("Data.Array.Unsafe");
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
var Data_Foldable = require("Data.Foldable");
var Data_Traversable = require("Data.Traversable");
var Data_DOM_Simple_Document = require("Data.DOM.Simple.Document");
var Data_DOM_Simple_Types = require("Data.DOM.Simple.Types");
var Halogen_Component = require("Halogen.Component");
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

/**
 *  | Inputs to the state machine
 */
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
var stats = Data_Map.fromList(Prelude.ordString)(Prelude["<$>"](Data_Array.functorArray)(function (pbs) {
    return new Data_Tuple.Tuple(pbs.label, pbs);
})(statistics));
var stat2 = {
    matches: 40, 
    label: "Last 40", 
    winPercentage: "80", 
    avgDuration: "15:24", 
    maxBreak: "44", 
    avgMax: "13", 
    ranking: "5100", 
    rankDiff: "10.99", 
    breakStats: [ {
        minimum: "10", 
        percent: "73.0", 
        absolute: "25", 
        wPercentage: "80.0"
    }, {
        minimum: "18", 
        percent: "81.0", 
        absolute: "14", 
        wPercentage: "70.0"
    }, {
        minimum: "30", 
        percent: "53.0", 
        absolute: "11", 
        wPercentage: "56.0"
    } ]
};

/**
 *  statistics = [stat1,stat2]
 */
var stat1 = {
    matches: 20, 
    label: "Last 20", 
    winPercentage: "20", 
    avgDuration: "10:24", 
    maxBreak: "99", 
    avgMax: "33", 
    ranking: "5300", 
    rankDiff: "30.99", 
    breakStats: [ {
        minimum: "10", 
        percent: "93.0", 
        absolute: "19", 
        wPercentage: "90.0"
    }, {
        minimum: "20", 
        percent: "88.0", 
        absolute: "17", 
        wPercentage: "80.0"
    }, {
        minimum: "30", 
        percent: "73.0", 
        absolute: "13", 
        wPercentage: "66.0"
    } ]
};
var showMyDate = new Prelude.Eq(function (d) {
    return function (d$prime) {
        return !Prelude["=="](showMyDate)(d)(d$prime);
    };
}, function (_12) {
    return function (_13) {
        return Prelude["=="](Data_Date.eqYear)(_12.value0.ye)(_13.value0.ye) && (Prelude["=="](Data_Date.eqMonth)(_12.value0.mo)(_13.value0.mo) && Prelude["=="](Data_Date.eqDayOfMonth)(_12.value0.da)(_13.value0.da));
    };
});
var showDayOfMonth = new Prelude.Show(function (_14) {
    return Prelude.show(Data_Int.showInt)(_14);
});
var padded = function (n) {
    if (n < 10) {
        return "0" + Prelude.show(Prelude.showNumber)(n);
    };
    return Prelude.show(Prelude.showNumber)(n);
};
var dayToMatches = function (matches) {
    var toDateAbout = function (m) {
        var d = toDate(m);
        return new MyDate({
            ye: Data_Date_UTC.year(d), 
            mo: Data_Date_UTC.month(d), 
            da: Data_Date_UTC.dayOfMonth(d)
        });
    };
    return Prelude["<$>"](Data_Array.functorArray)(Prelude["<<<"](Prelude.semigroupoidArr)(Data_Profunctor_Strong.first(Data_Profunctor_Strong.strongArr)(Data_Array_Unsafe.head))(Data_Tuple.unzip))(Data_Array.groupBy(Data_Function.on(Prelude["=="](showMyDate))(Data_Tuple.fst))(Prelude["<$>"](Data_Array.functorArray)(function (m) {
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
                return Prelude["<<<"](Prelude.semigroupoidArr)(padded)(Data_Int.toNumber)(_10);
            };
            var pad1 = function (_11) {
                return Prelude["<<<"](Prelude.semigroupoidArr)(padded)(Data_Int.toNumber)(_11);
            };
            var d = toDate(m);
            return pad1(Data_Date_UTC.hourOfDay(d)) + (":" + pad2(Data_Date_UTC.minuteOfHour(d)));
        };
        var renderBreak = function (b) {
            return Halogen_HTML.tr_([ Halogen_HTML.td_([ Halogen_HTML.text(b.minimum) ]), Halogen_HTML.td_([ Halogen_HTML.text(b.percent) ]), Halogen_HTML.td_([ Halogen_HTML.text(b.absolute) ]), Halogen_HTML.td_([ Halogen_HTML.text(b.wPercentage) ]) ]);
        };
        var niceDate = function (d) {
            var shY = function (_9) {
                return Prelude["<<<"](Prelude.semigroupoidArr)(padded)(Data_Int.toNumber)(_9);
            };
            var shD = function (_8) {
                return Prelude["<<<"](Prelude.semigroupoidArr)(padded)(Data_Int.toNumber)(_8);
            };
            return shD(d.da) + (". " + (Prelude.show(Data_Date.showMonth)(d.mo) + (" " + shY(d.ye))));
        };
        var markupPlayer = function (player) {
            return function (winner) {
                var _30 = player === winner;
                if (_30) {
                    return Halogen_HTML.b_([ Halogen_HTML.text(player) ]);
                };
                if (!_30) {
                    return Halogen_HTML.text(player);
                };
                throw new Error("Failed pattern match");
            };
        };
        var firstState = Data_Array_Unsafe.head(Data_Map.toList(stats));
        var class$prime = function (clazz) {
            return Halogen_HTML_Attributes.class_(Halogen_HTML_Attributes.className(clazz));
        };
        var renderMatch = function (m) {
            return Halogen_HTML.tr_([ Halogen_HTML.td([ class$prime("matchDate") ])([ Halogen_HTML.text(showTime(m)) ]), Halogen_HTML.td([ class$prime("player1") ])([ markupPlayer(m.player1)(m.winner) ]), Halogen_HTML.td([ class$prime("player1") ])([ Halogen_HTML.text(m.ranking1) ]), Halogen_HTML.td([ class$prime("player1") ])([ Halogen_HTML.text(m.maxBreak1) ]), Halogen_HTML.td([ class$prime("player2") ])([ markupPlayer(m.player2)(m.winner) ]), Halogen_HTML.td([ class$prime("player2") ])([ Halogen_HTML.text(m.ranking2) ]), Halogen_HTML.td([ class$prime("player2") ])([ Halogen_HTML.text(m.maxBreak2) ]) ]);
        };
        var renderMatches = function (matches) {
            return Prelude.flip(Prelude["<$>"](Data_Array.functorArray))(dayToMatches(matches))(function (_4) {
                return Halogen_HTML.div([ class$prime("matchesOfDay") ])([ Halogen_HTML.div_([ Halogen_HTML.h3_([ Halogen_HTML.text(niceDate(_4.value0.value0)) ]) ]), Halogen_HTML.table([ class$prime("matchesTable") ])([ Halogen_HTML.tbody_(Prelude["<$>"](Data_Array.functorArray)(renderMatch)(_4.value1)) ]) ]);
            });
        };
        var stat = function (key) {
            return function (value) {
                return Halogen_HTML.div([ class$prime("stat") ])([ Halogen_HTML.span([ class$prime("left") ])([ Halogen_HTML.text(key) ]), Halogen_HTML.span([ class$prime("right") ])([ Halogen_HTML.text(value) ]) ]);
            };
        };
        var render = function (_5) {
            return Halogen_HTML.div_([ Halogen_HTML.div([ class$prime("playerInfo") ])([ Halogen_HTML.select([ Halogen_HTML_Events_Forms.onValueChanged(__dict_Alternative_1)(Data_Foreign_Class.stringIsForeign)(Halogen_HTML_Events.input(__dict_Applicative_0)(Select.create)) ])(Prelude.flip(Prelude["<$>"](Data_Array.functorArray))(Data_Map.toList(stats))(function (_3) {
                return Halogen_HTML.option([ Halogen_HTML_Attributes.name(_3.value0) ])([ Halogen_HTML.text(_3.value0) ]);
            })), stat("Matches: ")(Prelude.show(Prelude.showNumber)(_5.value0.matches)), stat("Win %: ")(_5.value0.winPercentage), stat("Average Duration: ")(_5.value0.avgDuration), stat("Max Break:")(_5.value0.maxBreak), stat("Average Max:")(_5.value0.avgMax), stat("Ranking")(_5.value0.ranking), stat("Ranking difference")(_5.value0.rankDiff) ]), Halogen_HTML.table([ class$prime("breaksTable") ])([ Halogen_HTML.thead_([ Halogen_HTML.tr_([ Halogen_HTML.th_([ Halogen_HTML.text("Break >=") ]), Halogen_HTML.th_([ Halogen_HTML.text("Prozent") ]), Halogen_HTML.th_([ Halogen_HTML.text("Absolut") ]), Halogen_HTML.th_([ Halogen_HTML.text("Win %") ]) ]) ]), Halogen_HTML.tbody_(Prelude["<$>"](Data_Array.functorArray)(renderBreak)(_5.value0.breakStats)) ]), Halogen_HTML.div([ class$prime("rankingBox") ])([ Halogen_HTML.img([ Halogen_HTML_Attributes.src(_5.value1 + ("-" + (playerName + ".png"))) ])([  ]) ]), Halogen_HTML.div([ class$prime("matchesBox") ])([ Halogen_HTML.table([ class$prime("matchesTable") ])([ Halogen_HTML.tbody_(renderMatches(Data_Array.take(_5.value0.matches)(matchesOfPlayer))) ]) ]) ]);
        };
        return Prelude["<$>"](Halogen_Signal.functorSF1)(render)(Halogen_Signal.stateful(new State(Data_Tuple.snd(firstState), Data_Tuple.fst(firstState)))(update));
    };
};

/**
 *  for = flip (<$>)
 */
var appendToWrapper = function (e) {
    return function __do() {
        var _1 = Data_DOM_Simple_Window.document(Data_DOM_Simple_Window.htmlWindow)(Data_DOM_Simple_Window.globalWindow)();
        var _0 = Data_DOM_Simple_Element.querySelector(Data_DOM_Simple_Document.htmlDocumentElement)("#wrapper")(_1)();
        if (_0 instanceof Data_Maybe.Just) {
            return Data_DOM_Simple_Element.appendChild(Data_DOM_Simple_Element.htmlElement)(_0.value0)(e)();
        };
        throw new Error("Failed pattern match");
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
    stat2: stat2, 
    stat1: stat1, 
    playerName: playerName, 
    matchesOfPlayer: matchesOfPlayer, 
    statistics: statistics, 
    appendToWrapper: appendToWrapper, 
    showMyDate: showMyDate, 
    showDayOfMonth: showDayOfMonth
};

},{"Control.Bind":29,"Control.Monad.Eff":39,"DOM":58,"Data.Array":61,"Data.Array.Unsafe":60,"Data.DOM.Simple.Document":63,"Data.DOM.Simple.Element":64,"Data.DOM.Simple.Types":65,"Data.DOM.Simple.Window":70,"Data.Date":72,"Data.Date.UTC":71,"Data.Either":73,"Data.Foldable":76,"Data.Foreign.Class":77,"Data.Function":83,"Data.Int":86,"Data.Map":88,"Data.Maybe":90,"Data.Maybe.Unsafe":89,"Data.Profunctor.Strong":100,"Data.Time":106,"Data.Traversable":107,"Data.Tuple":108,"Data.Void":110,"Halogen":124,"Halogen.Component":113,"Halogen.HTML":121,"Halogen.HTML.Attributes":114,"Halogen.HTML.Events":119,"Halogen.HTML.Events.Forms":115,"Halogen.HTML.Events.Monad":117,"Halogen.Signal":123,"Prelude":127}],126:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";
var Prelude = require("Prelude");

    function unsafeIndex(xs) {
      return function(n) {
        return xs[n];
      };
    }
    ;
module.exports = {
    unsafeIndex: unsafeIndex
};

},{"Prelude":127}],127:[function(require,module,exports){
// Generated by psc-make version 0.6.9.3
"use strict";

    function cons(e) {
      return function(l) {
        return [e].concat(l);
      };
    }
    ;

    function showStringImpl(s) {
      return JSON.stringify(s);
    }
    ;

    function showNumberImpl(n) {
      return n.toString();
    }
    ;

    function showArrayImpl(f) {
      return function(xs) {
        var ss = [];
        for (var i = 0, l = xs.length; i < l; i++) {
          ss[i] = f(xs[i]);
        }
        return '[' + ss.join(',') + ']';
      };
    }
    ;

    function numAdd(n1) {
      return function(n2) {
        return n1 + n2;
      };
    }
    ;

    function numSub(n1) {
      return function(n2) {
        return n1 - n2;
      };
    }
    ;

    function numMul(n1) {
      return function(n2) {
        return n1 * n2;
      };
    }
    ;

    function numDiv(n1) {
      return function(n2) {
        return n1 / n2;
      };
    }
    ;

    function numMod(n1) {
      return function(n2) {
        return n1 % n2;
      };
    }
    ;

    function refEq(r1) {
      return function(r2) {
        return r1 === r2;
      };
    }
    ;

    function refIneq(r1) {
      return function(r2) {
        return r1 !== r2;
      };
    }
    ;

    function eqArrayImpl(f) {
      return function(xs) {
        return function(ys) {
          if (xs.length !== ys.length) return false;
          for (var i = 0; i < xs.length; i++) {
            if (!f(xs[i])(ys[i])) return false;
          }
          return true;
        };
      };
    }
    ;

    function unsafeCompareImpl(lt) {
      return function(eq) {
        return function(gt) {
          return function(x) {
            return function(y) {
              return x < y ? lt : x > y ? gt : eq;
            };
          };
        };
      };
    }
    ;

    function numShl(n1) {
      return function(n2) {
        return n1 << n2;
      };
    }
    ;

    function numShr(n1) {
      return function(n2) {
        return n1 >> n2;
      };
    }
    ;

    function numZshr(n1) {
      return function(n2) {
        return n1 >>> n2;
      };
    }
    ;

    function numAnd(n1) {
      return function(n2) {
        return n1 & n2;
      };
    }
    ;

    function numOr(n1) {
      return function(n2) {
        return n1 | n2;
      };
    }
    ;

    function numXor(n1) {
      return function(n2) {
        return n1 ^ n2;
      };
    }
    ;

    function numComplement(n) {
      return ~n;
    }
    ;

    function boolAnd(b1) {
      return function(b2) {
        return b1 && b2;
      };
    }
    ;

    function boolOr(b1) {
      return function(b2) {
        return b1 || b2;
      };
    }
    ;

    function boolNot(b) {
      return !b;
    }
    ;

    function concatString(s1) {
      return function(s2) {
        return s1 + s2;
      };
    }
    ;

/**
 *  | The `Unit` type has a single inhabitant, called `unit`. It represents values with no computational content.
 *  |
 *  | `Unit` is often used, wrapped in a monadic type constructor, as the return type of a computation where only
 *  | the _effects_ are important.
 */
var Unit = function (x) {
    return x;
};

/**
 *  | The `Ordering` data type represents the three possible outcomes of comparing two values:
 *  |
 *  | `LT` - The first value is _less than_ the second.
 *  | `GT` - The first value is _greater than_ the second.
 *  | `EQ` - The first value is _equal to_ or _incomparable to_ the second.
 */
var LT = (function () {
    function LT() {

    };
    LT.value = new LT();
    return LT;
})();

/**
 *  | The `Ordering` data type represents the three possible outcomes of comparing two values:
 *  |
 *  | `LT` - The first value is _less than_ the second.
 *  | `GT` - The first value is _greater than_ the second.
 *  | `EQ` - The first value is _equal to_ or _incomparable to_ the second.
 */
var GT = (function () {
    function GT() {

    };
    GT.value = new GT();
    return GT;
})();

/**
 *  | The `Ordering` data type represents the three possible outcomes of comparing two values:
 *  |
 *  | `LT` - The first value is _less than_ the second.
 *  | `GT` - The first value is _greater than_ the second.
 *  | `EQ` - The first value is _equal to_ or _incomparable to_ the second.
 */
var EQ = (function () {
    function EQ() {

    };
    EQ.value = new EQ();
    return EQ;
})();

/**
 *  | A `Semigroupoid` is similar to a [`Category`](#category) but does not require an identity
 *  | element `id`, just composable morphisms.
 *  |
 *  | `Semigroupoid`s should obey the following rule:
 *  |
 *  | - Associativity: `p <<< (q <<< r) = (p <<< q) <<< r`
 *  |
 *  | One example of a `Semigroupoid` is the function type constructor `(->)`, with `(<<<)` defined
 *  | as function composition.
 */
var Semigroupoid = function ($less$less$less) {
    this["<<<"] = $less$less$less;
};

/**
 *  | `Category`s consist of objects and composable morphisms between them, and as such are
 *  | [`Semigroupoids`](#semigroupoid), but unlike `semigroupoids` must have an identity element.
 *  |
 *  | `Category`s should obey the following rules.
 *  |
 *  | - Left Identity: `id <<< p = p`
 *  | - Right Identity: `p <<< id = p`
 *  |
 */
var Category = function (__superclass_Prelude$dotSemigroupoid_0, id) {
    this["__superclass_Prelude.Semigroupoid_0"] = __superclass_Prelude$dotSemigroupoid_0;
    this.id = id;
};

/**
 *  | The `Show` type class represents those types which can be converted into a human-readable `String` representation.
 *  |
 *  | While not required, it is recommended that for any expression `x`, the string `show x` be executable PureScript code
 *  | which evaluates to the same value as the expression `x`.
 */
var Show = function (show) {
    this.show = show;
};

/**
 *  | A `Functor` is a type constructor which supports a mapping operation `(<$>)`.
 *  |
 *  | `(<$>)` can be used to turn functions `a -> b` into functions `f a -> f b` whose argument and return
 *  | types use the type constructor `f` to represent some computational context.
 *  |
 *  | `Functor` instances should satisfy the following laws:
 *  |
 *  | - Identity: `(<$>) id = id`
 *  | - Composition: `(<$>) (f <<< g) = (f <$>) <<< (g <$>)`
 *  |
 */
var Functor = function ($less$dollar$greater) {
    this["<$>"] = $less$dollar$greater;
};

/**
 *  | The `Apply` class provides the `(<*>)` which is used to apply a function to an argument under a type constructor.
 *  |
 *  | `Apply` can be used to lift functions of two or more arguments to work on values wrapped with the type constructor `f`.
 *  | It might also be understood in terms of the `lift2` function:
 *  |
 *  | ```purescript
 *  | lift2 :: forall f a b c. (Apply f) => (a -> b -> c) -> f a -> f b -> f c
 *  | lift2 f a b = f <$> a <*> b
 *  | ```
 *  |
 *  | `(<*>)` is recovered from `lift2` as `lift2 ($)`. That is, `(<*>)` lifts the function application operator `($)` to arguments
 *  | wrapped with the type constructor `f`.
 *  |
 *  | `Apply` instances should satisfy the following law:
 *  |
 *  | - Associative Composition: `(<<<) <$> f <*> g <*> h = f <*> (g <*> h)`
 *  |
 *  | Formally, `Apply` represents a strong lax semi-monoidal endofunctor.
 */
var Apply = function ($less$times$greater, __superclass_Prelude$dotFunctor_0) {
    this["<*>"] = $less$times$greater;
    this["__superclass_Prelude.Functor_0"] = __superclass_Prelude$dotFunctor_0;
};

/**
 *  | The `Applicative` type class extends the [`Apply`](#apply) type class with a `pure` function, which can be used to
 *  | create values of type `f a` from values of type `a`.
 *  |
 *  | Where [`Apply`](#apply) provides the ability to lift functions of two or more arguments to functions whose arguments are wrapped using `f`,
 *  | and [`Functor`](#functor) provides the ability to lift functions of one argument, `pure` can be seen as the function which lifts functions of
 *  | _zero_ arguments. That is, `Applicative` functors support a lifting operation for any number of function arguments.
 *  |
 *  | `Applicative` instances should satisfy the following laws:
 *  |
 *  | - Identity: `(pure id) <*> v = v`
 *  | - Composition: `(pure <<<) <*> f <*> g <*> h = f <*> (g <*> h)`
 *  | - Homomorphism: `(pure f) <*> (pure x) = pure (f x)`
 *  | - Interchange: `u <*> (pure y) = (pure ($ y)) <*> u`
 *  |
 */
var Applicative = function (__superclass_Prelude$dotApply_0, pure) {
    this["__superclass_Prelude.Apply_0"] = __superclass_Prelude$dotApply_0;
    this.pure = pure;
};

/**
 *  | The `Bind` type class extends the [`Apply`](#apply) type class with a "bind" operation `(>>=)` which composes computations
 *  | in sequence, using the return value of one computation to determine the next computation.
 *  |
 *  | The `>>=` operator can also be expressed using `do` notation, as follows:
 *  |
 *  | ```purescript
 *  | x >>= f = do y <- x
 *  |              f y
 *  | ```
 *  |
 *  | where the function argument of `f` is given the name `y`.
 *  |
 *  | `Bind` instances should satisfy the following law:
 *  |
 *  | - Associativity: `(x >>= f) >>= g = x >>= (\k => f k >>= g)`
 *  |
 *  | Or, expressed using `do` notation:
 *  |
 *  | - Associativity: `do { z <- do { y <- x ; f y } ; g z } = do { k <- x ; do { y <- f k ; g y } }`
 *  |
 *  | Associativity tells us that we can regroup operations which use do-notation, so that we can unambiguously write, for example:
 *  |
 *  | ```purescript
 *  | do x <- m1
 *  |    y <- m2 x
 *  |    m3 x y
 *  | ```
 */
var Bind = function ($greater$greater$eq, __superclass_Prelude$dotApply_0) {
    this[">>="] = $greater$greater$eq;
    this["__superclass_Prelude.Apply_0"] = __superclass_Prelude$dotApply_0;
};

/**
 *  | The `Monad` type class combines the operations of the `Bind` and `Applicative` type classes. Therefore, `Monad` instances
 *  | represent type constructors which support sequential composition, and also lifting of functions of arbitrary arity.
 *  |
 *  | `Monad` instances should satisfy the following laws:
 *  |
 *  | - Left Identity: `pure x >>= f = f x`
 *  | - Right Identity: `x >>= pure = x`
 *  |
 *  | Or, expressed using `do` notation:
 *  |
 *  | - Left Identity: `do { y <- pure x ; f y } = f x`
 *  | - Right Identity: `do { y <- x ; pure y } = x`
 *  |
 */
var Monad = function (__superclass_Prelude$dotApplicative_0, __superclass_Prelude$dotBind_1) {
    this["__superclass_Prelude.Applicative_0"] = __superclass_Prelude$dotApplicative_0;
    this["__superclass_Prelude.Bind_1"] = __superclass_Prelude$dotBind_1;
};

/**
 *  | Addition and multiplication, satisfying the following laws:
 *  |
 *  | - `a` is a commutative monoid under addition
 *  | - `a` is a monoid under multiplication
 *  | - multiplication distributes over addition
 *  | - multiplication by `zero` annihilates `a`
 *  |
 */
var Semiring = function ($times, $plus, one, zero) {
    this["*"] = $times;
    this["+"] = $plus;
    this.one = one;
    this.zero = zero;
};

/**
 *  | Addition, multiplication, modulo operation and division, satisfying:
 *  |
 *  | - ```a / b * b + (a `mod` b) = a```
 *  |
 */
var ModuloSemiring = function ($div, __superclass_Prelude$dotSemiring_0, mod) {
    this["/"] = $div;
    this["__superclass_Prelude.Semiring_0"] = __superclass_Prelude$dotSemiring_0;
    this.mod = mod;
};

/**
 *  | Addition, multiplication, and subtraction.
 *  |
 *  | Has the same laws as `Semiring` but additionally satisfying:
 *  |
 *  | - `a` is an abelian group under addition
 *  |
 */
var Ring = function ($minus, __superclass_Prelude$dotSemiring_0) {
    this["-"] = $minus;
    this["__superclass_Prelude.Semiring_0"] = __superclass_Prelude$dotSemiring_0;
};

/**
 *  | Ring where every nonzero element has a multiplicative inverse so that:
 *  |
 *  | - ```a `mod` b = zero```
 *  |
 */
var DivisionRing = function (__superclass_Prelude$dotModuloSemiring_1, __superclass_Prelude$dotRing_0) {
    this["__superclass_Prelude.ModuloSemiring_1"] = __superclass_Prelude$dotModuloSemiring_1;
    this["__superclass_Prelude.Ring_0"] = __superclass_Prelude$dotRing_0;
};

/**
 *  | A commutative field
 */
var Num = function (__superclass_Prelude$dotDivisionRing_0) {
    this["__superclass_Prelude.DivisionRing_0"] = __superclass_Prelude$dotDivisionRing_0;
};

/**
 *  | The `Eq` type class represents types which support decidable equality.
 *  |
 *  | `Eq` instances should satisfy the following laws:
 *  |
 *  | - Reflexivity: `x == x = true`
 *  | - Symmetry: `x == y = y == x`
 *  | - Transitivity: if `x == y` and `y == z` then `x == z`
 *  | - Negation: `x /= y = not (x == y)`
 *  |
 *  | `(/=)` may be implemented in terms of `(==)`, but it might give a performance improvement to implement it separately.
 */
var Eq = function ($div$eq, $eq$eq) {
    this["/="] = $div$eq;
    this["=="] = $eq$eq;
};

/**
 *  | The `Ord` type class represents types which support comparisons.
 *  |
 *  | `Ord` instances should satisfy the laws of _partially orderings_:
 *  |
 *  | - Reflexivity: `a <= a`
 *  | - Antisymmetry: if `a <= b` and `b <= a` then `a = b`
 *  | - Transitivity: if `a <= b` and `b <= c` then `a <= c`
 *  |
 */
var Ord = function (__superclass_Prelude$dotEq_0, compare) {
    this["__superclass_Prelude.Eq_0"] = __superclass_Prelude$dotEq_0;
    this.compare = compare;
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var Bits = function ($dot$amp$dot, $dot$up$dot, $dot$bar$dot, complement, shl, shr, zshr) {
    this[".&."] = $dot$amp$dot;
    this[".^."] = $dot$up$dot;
    this[".|."] = $dot$bar$dot;
    this.complement = complement;
    this.shl = shl;
    this.shr = shr;
    this.zshr = zshr;
};

/**
 *  | The `BoolLike` type class identifies types which support Boolean operations.
 *  |
 *  | `BoolLike` instances are required to satisfy the laws of a _Boolean algebra_.
 *  |
 */
var BoolLike = function ($amp$amp, not, $bar$bar) {
    this["&&"] = $amp$amp;
    this.not = not;
    this["||"] = $bar$bar;
};

/**
 *  | The `Semigroup` type class identifies an associative operation on a type.
 *  |
 *  | `Semigroup` instances are required to satisfy the following law:
 *  |
 *  | - Associativity: `(x <> y) <> z = x <> (y <> z)`
 *  |
 *  | For example, the `String` type is an instance of `Semigroup`, where `(<>)` is defined to be string concatenation.
 */
var Semigroup = function ($less$greater) {
    this["<>"] = $less$greater;
};

/**
 *  | The `BoolLike` type class identifies types which support Boolean operations.
 *  |
 *  | `BoolLike` instances are required to satisfy the laws of a _Boolean algebra_.
 *  |
 */
var $bar$bar = function (dict) {
    return dict["||"];
};

/**
 *  | The `Bind` type class extends the [`Apply`](#apply) type class with a "bind" operation `(>>=)` which composes computations
 *  | in sequence, using the return value of one computation to determine the next computation.
 *  |
 *  | The `>>=` operator can also be expressed using `do` notation, as follows:
 *  |
 *  | ```purescript
 *  | x >>= f = do y <- x
 *  |              f y
 *  | ```
 *  |
 *  | where the function argument of `f` is given the name `y`.
 *  |
 *  | `Bind` instances should satisfy the following law:
 *  |
 *  | - Associativity: `(x >>= f) >>= g = x >>= (\k => f k >>= g)`
 *  |
 *  | Or, expressed using `do` notation:
 *  |
 *  | - Associativity: `do { z <- do { y <- x ; f y } ; g z } = do { k <- x ; do { y <- f k ; g y } }`
 *  |
 *  | Associativity tells us that we can regroup operations which use do-notation, so that we can unambiguously write, for example:
 *  |
 *  | ```purescript
 *  | do x <- m1
 *  |    y <- m2 x
 *  |    m3 x y
 *  | ```
 */
var $greater$greater$eq = function (dict) {
    return dict[">>="];
};

/**
 *  | The `Eq` type class represents types which support decidable equality.
 *  |
 *  | `Eq` instances should satisfy the following laws:
 *  |
 *  | - Reflexivity: `x == x = true`
 *  | - Symmetry: `x == y = y == x`
 *  | - Transitivity: if `x == y` and `y == z` then `x == z`
 *  | - Negation: `x /= y = not (x == y)`
 *  |
 *  | `(/=)` may be implemented in terms of `(==)`, but it might give a performance improvement to implement it separately.
 */
var $eq$eq = function (dict) {
    return dict["=="];
};

/**
 *  | The `Semigroup` type class identifies an associative operation on a type.
 *  |
 *  | `Semigroup` instances are required to satisfy the following law:
 *  |
 *  | - Associativity: `(x <> y) <> z = x <> (y <> z)`
 *  |
 *  | For example, the `String` type is an instance of `Semigroup`, where `(<>)` is defined to be string concatenation.
 */
var $less$greater = function (dict) {
    return dict["<>"];
};

/**
 *  | A `Semigroupoid` is similar to a [`Category`](#category) but does not require an identity
 *  | element `id`, just composable morphisms.
 *  |
 *  | `Semigroupoid`s should obey the following rule:
 *  |
 *  | - Associativity: `p <<< (q <<< r) = (p <<< q) <<< r`
 *  |
 *  | One example of a `Semigroupoid` is the function type constructor `(->)`, with `(<<<)` defined
 *  | as function composition.
 */
var $less$less$less = function (dict) {
    return dict["<<<"];
};

/**
 *  | Forwards composition, or `(<<<)` with its arguments reversed.
 */
var $greater$greater$greater = function (__dict_Semigroupoid_0) {
    return function (f) {
        return function (g) {
            return $less$less$less(__dict_Semigroupoid_0)(g)(f);
        };
    };
};

/**
 *  | The `Apply` class provides the `(<*>)` which is used to apply a function to an argument under a type constructor.
 *  |
 *  | `Apply` can be used to lift functions of two or more arguments to work on values wrapped with the type constructor `f`.
 *  | It might also be understood in terms of the `lift2` function:
 *  |
 *  | ```purescript
 *  | lift2 :: forall f a b c. (Apply f) => (a -> b -> c) -> f a -> f b -> f c
 *  | lift2 f a b = f <$> a <*> b
 *  | ```
 *  |
 *  | `(<*>)` is recovered from `lift2` as `lift2 ($)`. That is, `(<*>)` lifts the function application operator `($)` to arguments
 *  | wrapped with the type constructor `f`.
 *  |
 *  | `Apply` instances should satisfy the following law:
 *  |
 *  | - Associative Composition: `(<<<) <$> f <*> g <*> h = f <*> (g <*> h)`
 *  |
 *  | Formally, `Apply` represents a strong lax semi-monoidal endofunctor.
 */
var $less$times$greater = function (dict) {
    return dict["<*>"];
};

/**
 *  | A `Functor` is a type constructor which supports a mapping operation `(<$>)`.
 *  |
 *  | `(<$>)` can be used to turn functions `a -> b` into functions `f a -> f b` whose argument and return
 *  | types use the type constructor `f` to represent some computational context.
 *  |
 *  | `Functor` instances should satisfy the following laws:
 *  |
 *  | - Identity: `(<$>) id = id`
 *  | - Composition: `(<$>) (f <<< g) = (f <$>) <<< (g <$>)`
 *  |
 */
var $less$dollar$greater = function (dict) {
    return dict["<$>"];
};

/**
 *  | `(<#>)` is `(<$>)` with its arguments reversed. For example:
 *  |
 *  | ```purescript
 *  | [1, 2, 3] <#> \n -> n * n
 *  | ```
 */
var $less$hash$greater = function (__dict_Functor_1) {
    return function (fa) {
        return function (f) {
            return $less$dollar$greater(__dict_Functor_1)(f)(fa);
        };
    };
};

/**
 *  | An infix alias for `cons`.
 *  |
 *  | Note, the running time of this function is `O(n)`.
 */
var $colon = cons;

/**
 *  | The `Eq` type class represents types which support decidable equality.
 *  |
 *  | `Eq` instances should satisfy the following laws:
 *  |
 *  | - Reflexivity: `x == x = true`
 *  | - Symmetry: `x == y = y == x`
 *  | - Transitivity: if `x == y` and `y == z` then `x == z`
 *  | - Negation: `x /= y = not (x == y)`
 *  |
 *  | `(/=)` may be implemented in terms of `(==)`, but it might give a performance improvement to implement it separately.
 */
var $div$eq = function (dict) {
    return dict["/="];
};

/**
 *  | Addition, multiplication, modulo operation and division, satisfying:
 *  |
 *  | - ```a / b * b + (a `mod` b) = a```
 *  |
 */
var $div = function (dict) {
    return dict["/"];
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var $dot$bar$dot = function (dict) {
    return dict[".|."];
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var $dot$up$dot = function (dict) {
    return dict[".^."];
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var $dot$amp$dot = function (dict) {
    return dict[".&."];
};

/**
 *  | Addition, multiplication, and subtraction.
 *  |
 *  | Has the same laws as `Semiring` but additionally satisfying:
 *  |
 *  | - `a` is an abelian group under addition
 *  |
 */
var $minus = function (dict) {
    return dict["-"];
};

/**
 *  | `(++)` is an alias for `(<>)`.
 */
var $plus$plus = function (__dict_Semigroup_2) {
    return $less$greater(__dict_Semigroup_2);
};

/**
 *  | Addition and multiplication, satisfying the following laws:
 *  |
 *  | - `a` is a commutative monoid under addition
 *  | - `a` is a monoid under multiplication
 *  | - multiplication distributes over addition
 *  | - multiplication by `zero` annihilates `a`
 *  |
 */
var $plus = function (dict) {
    return dict["+"];
};

/**
 *  | Addition and multiplication, satisfying the following laws:
 *  |
 *  | - `a` is a commutative monoid under addition
 *  | - `a` is a monoid under multiplication
 *  | - multiplication distributes over addition
 *  | - multiplication by `zero` annihilates `a`
 *  |
 */
var $times = function (dict) {
    return dict["*"];
};

/**
 *  | The `BoolLike` type class identifies types which support Boolean operations.
 *  |
 *  | `BoolLike` instances are required to satisfy the laws of a _Boolean algebra_.
 *  |
 */
var $amp$amp = function (dict) {
    return dict["&&"];
};
var $percent = numMod;

/**
 *  | Applies a function to its argument
 *  |
 *  | ```purescript
 *  | length $ groupBy productCategory $ filter isInStock products
 *  | ```
 *  |
 *  | is equivalent to
 *  |
 *  | ```purescript
 *  | length (groupBy productCategory (filter isInStock (products)))
 *  | ```
 *  |
 *  | `($)` is different from [`(#)`](#-2) because it is right-infix instead of left, so
 *  | `a $ b $ c $ d x` = `a $ (b $ (c $ (d $ x)))` = `a (b (c (d x)))`
 *  |
 */
var $dollar = function (f) {
    return function (x) {
        return f(x);
    };
};

/**
 *  | Applies a function to its argument
 *  |
 *  | ```purescript
 *  | products # groupBy productCategory # filter isInStock # length
 *  | ```
 *  |
 *  | is equivalent to
 *  |
 *  | ```purescript
 *  | length (groupBy productCategory (filter isInStock (products)))
 *  | ```
 *  |
 *  | `(#)` is different from [`($)`](#-1) because it is left-infix instead of right, so
 *  | `x # a # b # c # d` = `(((x # a) # b) # c) # d` = `d (c (b (a x)))`
 *  |
 */
var $hash = function (x) {
    return function (f) {
        return f(x);
    };
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var zshr = function (dict) {
    return dict.zshr;
};

/**
 *  | Addition and multiplication, satisfying the following laws:
 *  |
 *  | - `a` is a commutative monoid under addition
 *  | - `a` is a monoid under multiplication
 *  | - multiplication distributes over addition
 *  | - multiplication by `zero` annihilates `a`
 *  |
 */
var zero = function (dict) {
    return dict.zero;
};
var unsafeCompare = unsafeCompareImpl(LT.value)(EQ.value)(GT.value);

/**
 *  | `unit` is the sole inhabitant of the `Unit` type.
 */
var unit = {};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var shr = function (dict) {
    return dict.shr;
};
var showUnit = new Show(function (_76) {
    return "Unit {}";
});
var showString = new Show(showStringImpl);
var showOrdering = new Show(function (_86) {
    if (_86 instanceof LT) {
        return "LT";
    };
    if (_86 instanceof GT) {
        return "GT";
    };
    if (_86 instanceof EQ) {
        return "EQ";
    };
    throw new Error("Failed pattern match");
});
var showNumber = new Show(showNumberImpl);
var showBoolean = new Show(function (_77) {
    if (_77) {
        return "true";
    };
    if (!_77) {
        return "false";
    };
    throw new Error("Failed pattern match");
});

/**
 *  | The `Show` type class represents those types which can be converted into a human-readable `String` representation.
 *  |
 *  | While not required, it is recommended that for any expression `x`, the string `show x` be executable PureScript code
 *  | which evaluates to the same value as the expression `x`.
 */
var show = function (dict) {
    return dict.show;
};
var showArray = function (__dict_Show_3) {
    return new Show(showArrayImpl(show(__dict_Show_3)));
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var shl = function (dict) {
    return dict.shl;
};
var semiringNumber = new Semiring(numMul, numAdd, 1, 0);
var semigroupoidArr = new Semigroupoid(function (f) {
    return function (g) {
        return function (x) {
            return f(g(x));
        };
    };
});
var semigroupUnit = new Semigroup(function (_94) {
    return function (_95) {
        return {};
    };
});
var semigroupString = new Semigroup(concatString);
var semigroupOrdering = new Semigroup(function (_87) {
    return function (y) {
        if (_87 instanceof LT) {
            return LT.value;
        };
        if (_87 instanceof GT) {
            return GT.value;
        };
        if (_87 instanceof EQ) {
            return y;
        };
        throw new Error("Failed pattern match");
    };
});
var semigroupArr = function (__dict_Semigroup_4) {
    return new Semigroup(function (f) {
        return function (g) {
            return function (x) {
                return $less$greater(__dict_Semigroup_4)(f(x))(g(x));
            };
        };
    });
};
var ringNumber = new Ring(numSub, function () {
    return semiringNumber;
});

/**
 *  | The `Applicative` type class extends the [`Apply`](#apply) type class with a `pure` function, which can be used to
 *  | create values of type `f a` from values of type `a`.
 *  |
 *  | Where [`Apply`](#apply) provides the ability to lift functions of two or more arguments to functions whose arguments are wrapped using `f`,
 *  | and [`Functor`](#functor) provides the ability to lift functions of one argument, `pure` can be seen as the function which lifts functions of
 *  | _zero_ arguments. That is, `Applicative` functors support a lifting operation for any number of function arguments.
 *  |
 *  | `Applicative` instances should satisfy the following laws:
 *  |
 *  | - Identity: `(pure id) <*> v = v`
 *  | - Composition: `(pure <<<) <*> f <*> g <*> h = f <*> (g <*> h)`
 *  | - Homomorphism: `(pure f) <*> (pure x) = pure (f x)`
 *  | - Interchange: `u <*> (pure y) = (pure ($ y)) <*> u`
 *  |
 */
var pure = function (dict) {
    return dict.pure;
};

/**
 *  | `return` is an alias for `pure`.
 */
var $$return = function (__dict_Monad_5) {
    return pure(__dict_Monad_5["__superclass_Prelude.Applicative_0"]());
};

/**
 *  | An alias for `true`, which can be useful in guard clauses:
 *  |
 *  | ```purescript
 *  | max x y | x >= y = x
 *  |         | otherwise = y
 *  | ```
 *  |
 */
var otherwise = true;

/**
 *  | Addition and multiplication, satisfying the following laws:
 *  |
 *  | - `a` is a commutative monoid under addition
 *  | - `a` is a monoid under multiplication
 *  | - multiplication distributes over addition
 *  | - multiplication by `zero` annihilates `a`
 *  |
 */
var one = function (dict) {
    return dict.one;
};

/**
 *  | The `BoolLike` type class identifies types which support Boolean operations.
 *  |
 *  | `BoolLike` instances are required to satisfy the laws of a _Boolean algebra_.
 *  |
 */
var not = function (dict) {
    return dict.not;
};
var negate = function (__dict_Ring_6) {
    return function (a) {
        return $minus(__dict_Ring_6)(zero(__dict_Ring_6["__superclass_Prelude.Semiring_0"]()))(a);
    };
};
var moduloSemiringNumber = new ModuloSemiring(numDiv, function () {
    return semiringNumber;
}, function (_78) {
    return function (_79) {
        return 0;
    };
});

/**
 *  | Addition, multiplication, modulo operation and division, satisfying:
 *  |
 *  | - ```a / b * b + (a `mod` b) = a```
 *  |
 */
var mod = function (dict) {
    return dict.mod;
};

/**
 *  | `liftM1` provides a default implementation of `(<$>)` for any [`Monad`](#monad),
 *  | without using `(<$>)` as provided by the [`Functor`](#functor)-[`Monad`](#monad) superclass relationship.
 *  |
 *  | `liftM1` can therefore be used to write [`Functor`](#functor) instances as follows:
 *  |
 *  | ```purescript
 *  | instance functorF :: Functor F where
 *  |   (<$>) = liftM1
 *  | ```
 */
var liftM1 = function (__dict_Monad_7) {
    return function (f) {
        return function (a) {
            return $greater$greater$eq(__dict_Monad_7["__superclass_Prelude.Bind_1"]())(a)(function (_7) {
                return $$return(__dict_Monad_7)(f(_7));
            });
        };
    };
};

/**
 *  | `liftA1` provides a default implementation of `(<$>)` for any [`Applicative`](#applicative) functor,
 *  | without using `(<$>)` as provided by the [`Functor`](#functor)-[`Applicative`](#applicative) superclass relationship.
 *  |
 *  | `liftA1` can therefore be used to write [`Functor`](#functor) instances as follows:
 *  |
 *  | ```purescript
 *  | instance functorF :: Functor F where
 *  |   (<$>) = liftA1
 *  | ```
 */
var liftA1 = function (__dict_Applicative_8) {
    return function (f) {
        return function (a) {
            return $less$times$greater(__dict_Applicative_8["__superclass_Prelude.Apply_0"]())(pure(__dict_Applicative_8)(f))(a);
        };
    };
};

/**
 *  | `Category`s consist of objects and composable morphisms between them, and as such are
 *  | [`Semigroupoids`](#semigroupoid), but unlike `semigroupoids` must have an identity element.
 *  |
 *  | `Category`s should obey the following rules.
 *  |
 *  | - Left Identity: `id <<< p = p`
 *  | - Right Identity: `p <<< id = p`
 *  |
 */
var id = function (dict) {
    return dict.id;
};
var functorArr = new Functor($less$less$less(semigroupoidArr));

/**
 *  | Flips the order of the arguments to a function of two arguments.
 *  |
 *  | ```purescript
 *  | flip const 1 2 = const 2 1 = 2
 *  | ```
 *  |
 */
var flip = function (f) {
    return function (b) {
        return function (a) {
            return f(a)(b);
        };
    };
};
var eqUnit = new Eq(function (_82) {
    return function (_83) {
        return false;
    };
}, function (_80) {
    return function (_81) {
        return true;
    };
});
var ordUnit = new Ord(function () {
    return eqUnit;
}, function (_88) {
    return function (_89) {
        return EQ.value;
    };
});
var eqString = new Eq(refIneq, refEq);
var ordString = new Ord(function () {
    return eqString;
}, unsafeCompare);
var eqNumber = new Eq(refIneq, refEq);
var ordNumber = new Ord(function () {
    return eqNumber;
}, unsafeCompare);
var eqBoolean = new Eq(refIneq, refEq);
var ordBoolean = new Ord(function () {
    return eqBoolean;
}, function (_90) {
    return function (_91) {
        if (!_90 && !_91) {
            return EQ.value;
        };
        if (!_90 && _91) {
            return LT.value;
        };
        if (_90 && _91) {
            return EQ.value;
        };
        if (_90 && !_91) {
            return GT.value;
        };
        throw new Error("Failed pattern match");
    };
});
var divisionRingNumber = new DivisionRing(function () {
    return moduloSemiringNumber;
}, function () {
    return ringNumber;
});
var numNumber = new Num(function () {
    return divisionRingNumber;
});

/**
 *  | Returns its first argument and ignores its second.
 *  |
 *  | ```purescript
 *  | const 1 "hello" = 1
 *  | ```
 *  |
 */
var $$const = function (a) {
    return function (_74) {
        return a;
    };
};

/**
 *  | The `void` function is used to ignore the type wrapped by a [`Functor`](#functor), replacing it with `Unit` and
 *  | keeping only the type information provided by the type constructor itself.
 *  |
 *  | `void` is often useful when using `do` notation to change the return type of a monadic computation:
 *  |
 *  | ```purescript
 *  | main = forE 1 10 \n -> void do
 *  |   print n
 *  |   print (n * n)
 *  | ```
 */
var $$void = function (__dict_Functor_10) {
    return function (fa) {
        return $less$dollar$greater(__dict_Functor_10)($$const(unit))(fa);
    };
};

/**
 *  | The `Bits` type class identifies types which support bitwise operations.
 */
var complement = function (dict) {
    return dict.complement;
};

/**
 *  | The `Ord` type class represents types which support comparisons.
 *  |
 *  | `Ord` instances should satisfy the laws of _partially orderings_:
 *  |
 *  | - Reflexivity: `a <= a`
 *  | - Antisymmetry: if `a <= b` and `b <= a` then `a = b`
 *  | - Transitivity: if `a <= b` and `b <= c` then `a <= c`
 *  |
 */
var compare = function (dict) {
    return dict.compare;
};

/**
 *  | Test whether one value is _strictly less than_ another.
 */
var $less = function (__dict_Ord_12) {
    return function (a1) {
        return function (a2) {
            var _883 = compare(__dict_Ord_12)(a1)(a2);
            if (_883 instanceof LT) {
                return true;
            };
            return false;
        };
    };
};

/**
 *  | Test whether one value is _non-strictly less than_ another.
 */
var $less$eq = function (__dict_Ord_13) {
    return function (a1) {
        return function (a2) {
            var _884 = compare(__dict_Ord_13)(a1)(a2);
            if (_884 instanceof GT) {
                return false;
            };
            return true;
        };
    };
};

/**
 *  | Test whether one value is _strictly greater than_ another.
 */
var $greater = function (__dict_Ord_14) {
    return function (a1) {
        return function (a2) {
            var _885 = compare(__dict_Ord_14)(a1)(a2);
            if (_885 instanceof GT) {
                return true;
            };
            return false;
        };
    };
};

/**
 *  | Test whether one value is _non-strictly greater than_ another.
 */
var $greater$eq = function (__dict_Ord_15) {
    return function (a1) {
        return function (a2) {
            var _886 = compare(__dict_Ord_15)(a1)(a2);
            if (_886 instanceof LT) {
                return false;
            };
            return true;
        };
    };
};
var categoryArr = new Category(function () {
    return semigroupoidArr;
}, function (x) {
    return x;
});
var boolLikeBoolean = new BoolLike(boolAnd, boolNot, boolOr);
var eqArray = function (__dict_Eq_9) {
    return new Eq(function (xs) {
        return function (ys) {
            return not(boolLikeBoolean)($eq$eq(eqArray(__dict_Eq_9))(xs)(ys));
        };
    }, function (xs) {
        return function (ys) {
            return eqArrayImpl($eq$eq(__dict_Eq_9))(xs)(ys);
        };
    });
};
var ordArray = function (__dict_Ord_11) {
    return new Ord(function () {
        return eqArray(__dict_Ord_11["__superclass_Prelude.Eq_0"]());
    }, function (_92) {
        return function (_93) {
            if (_92.length === 0 && _93.length === 0) {
                return EQ.value;
            };
            if (_92.length === 0) {
                return LT.value;
            };
            if (_93.length === 0) {
                return GT.value;
            };
            if (_92.length >= 1) {
                var _893 = _92.slice(1);
                if (_93.length >= 1) {
                    var _891 = _93.slice(1);
                    var _889 = compare(__dict_Ord_11)(_92[0])(_93[0]);
                    if (_889 instanceof EQ) {
                        return compare(ordArray(__dict_Ord_11))(_893)(_891);
                    };
                    return _889;
                };
            };
            throw new Error("Failed pattern match");
        };
    });
};
var eqOrdering = new Eq(function (x) {
    return function (y) {
        return not(boolLikeBoolean)($eq$eq(eqOrdering)(x)(y));
    };
}, function (_84) {
    return function (_85) {
        if (_84 instanceof LT && _85 instanceof LT) {
            return true;
        };
        if (_84 instanceof GT && _85 instanceof GT) {
            return true;
        };
        if (_84 instanceof EQ && _85 instanceof EQ) {
            return true;
        };
        return false;
    };
});
var bitsNumber = new Bits(numAnd, numXor, numOr, numComplement, numShl, numShr, numZshr);

/**
 *  | This function returns its first argument, and can be used to assert type equalities.
 *  | This can be useful when types are otherwise ambiguous.
 *  |
 *  | ```purescript
 *  | main = print $ [] `asTypeOf` [0]
 *  | ```
 *  |
 *  | If instead, we had written `main = print []`, the type of the argument `[]` would have
 *  | been ambiguous, resulting in a compile-time error.
 */
var asTypeOf = function (x) {
    return function (_75) {
        return x;
    };
};
var applyArr = new Apply(function (f) {
    return function (g) {
        return function (x) {
            return f(x)(g(x));
        };
    };
}, function () {
    return functorArr;
});
var bindArr = new Bind(function (m) {
    return function (f) {
        return function (x) {
            return f(m(x))(x);
        };
    };
}, function () {
    return applyArr;
});
var applicativeArr = new Applicative(function () {
    return applyArr;
}, $$const);
var monadArr = new Monad(function () {
    return applicativeArr;
}, function () {
    return bindArr;
});

/**
 *  | `ap` provides a default implementation of `(<*>)` for any [`Monad`](#monad),
 *  | without using `(<*>)` as provided by the [`Apply`](#apply)-[`Monad`](#monad) superclass relationship.
 *  |
 *  | `ap` can therefore be used to write [`Apply`](#apply) instances as follows:
 *  |
 *  | ```purescript
 *  | instance applyF :: Apply F where
 *  |   (<*>) = ap
 *  | ```
 */
var ap = function (__dict_Monad_16) {
    return function (f) {
        return function (a) {
            return $greater$greater$eq(__dict_Monad_16["__superclass_Prelude.Bind_1"]())(f)(function (_9) {
                return $greater$greater$eq(__dict_Monad_16["__superclass_Prelude.Bind_1"]())(a)(function (_8) {
                    return $$return(__dict_Monad_16)(_9(_8));
                });
            });
        };
    };
};
module.exports = {
    Unit: Unit, 
    LT: LT, 
    GT: GT, 
    EQ: EQ, 
    Semigroup: Semigroup, 
    BoolLike: BoolLike, 
    Bits: Bits, 
    Ord: Ord, 
    Eq: Eq, 
    Num: Num, 
    DivisionRing: DivisionRing, 
    Ring: Ring, 
    ModuloSemiring: ModuloSemiring, 
    Semiring: Semiring, 
    Monad: Monad, 
    Bind: Bind, 
    Applicative: Applicative, 
    Apply: Apply, 
    Functor: Functor, 
    Show: Show, 
    Category: Category, 
    Semigroupoid: Semigroupoid, 
    unit: unit, 
    "++": $plus$plus, 
    "<>": $less$greater, 
    not: not, 
    "||": $bar$bar, 
    "&&": $amp$amp, 
    complement: complement, 
    zshr: zshr, 
    shr: shr, 
    shl: shl, 
    ".^.": $dot$up$dot, 
    ".|.": $dot$bar$dot, 
    ".&.": $dot$amp$dot, 
    ">=": $greater$eq, 
    "<=": $less$eq, 
    ">": $greater, 
    "<": $less, 
    compare: compare, 
    "/=": $div$eq, 
    "==": $eq$eq, 
    negate: negate, 
    "%": $percent, 
    "-": $minus, 
    mod: mod, 
    "/": $div, 
    one: one, 
    "*": $times, 
    zero: zero, 
    "+": $plus, 
    ap: ap, 
    liftM1: liftM1, 
    "return": $$return, 
    ">>=": $greater$greater$eq, 
    liftA1: liftA1, 
    pure: pure, 
    "<*>": $less$times$greater, 
    "void": $$void, 
    "<#>": $less$hash$greater, 
    "<$>": $less$dollar$greater, 
    show: show, 
    cons: cons, 
    ":": $colon, 
    "#": $hash, 
    "$": $dollar, 
    id: id, 
    ">>>": $greater$greater$greater, 
    "<<<": $less$less$less, 
    asTypeOf: asTypeOf, 
    "const": $$const, 
    flip: flip, 
    otherwise: otherwise, 
    semigroupoidArr: semigroupoidArr, 
    categoryArr: categoryArr, 
    showUnit: showUnit, 
    showString: showString, 
    showBoolean: showBoolean, 
    showNumber: showNumber, 
    showArray: showArray, 
    functorArr: functorArr, 
    applyArr: applyArr, 
    applicativeArr: applicativeArr, 
    bindArr: bindArr, 
    monadArr: monadArr, 
    semiringNumber: semiringNumber, 
    ringNumber: ringNumber, 
    moduloSemiringNumber: moduloSemiringNumber, 
    divisionRingNumber: divisionRingNumber, 
    numNumber: numNumber, 
    eqUnit: eqUnit, 
    eqString: eqString, 
    eqNumber: eqNumber, 
    eqBoolean: eqBoolean, 
    eqArray: eqArray, 
    eqOrdering: eqOrdering, 
    showOrdering: showOrdering, 
    semigroupOrdering: semigroupOrdering, 
    ordUnit: ordUnit, 
    ordBoolean: ordBoolean, 
    ordNumber: ordNumber, 
    ordString: ordString, 
    ordArray: ordArray, 
    bitsNumber: bitsNumber, 
    boolLikeBoolean: boolLikeBoolean, 
    semigroupUnit: semigroupUnit, 
    semigroupString: semigroupString, 
    semigroupArr: semigroupArr
};

},{}],128:[function(require,module,exports){
require('Main').main();

},{"Main":125}],129:[function(require,module,exports){

},{}]},{},[128]);
