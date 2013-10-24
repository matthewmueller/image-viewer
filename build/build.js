
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-object-url/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Create object url.\n\
 */\n\
\n\
exports.create = (window.URL && URL.createObjectURL.bind(URL))\n\
  || (window.webkitURL && webkitURL.createObjectURL.bind(webkitURL))\n\
  || window.createObjectURL;\n\
\n\
/**\n\
 * Revoke object url.\n\
 */\n\
\n\
exports.revoke = (window.URL && URL.revokeObjectURL.bind(URL))\n\
  || (window.webkitURL && webkitURL.revokeObjectURL.bind(webkitURL))\n\
  || window.revokeObjectURL;\n\
//@ sourceURL=component-object-url/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-upload/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
\n\
/**\n\
 * Expose `Upload`.\n\
 */\n\
\n\
module.exports = Upload;\n\
\n\
/**\n\
 * Initialize a new `Upload` file`.\n\
 * This represents a single file upload.\n\
 *\n\
 * Events:\n\
 *\n\
 *   - `error` an error occurred\n\
 *   - `abort` upload was aborted\n\
 *   - `progress` upload in progress (`e.percent` etc)\n\
 *   - `end` upload is complete\n\
 *\n\
 * @param {File} file\n\
 * @api private\n\
 */\n\
\n\
function Upload(file) {\n\
  if (!(this instanceof Upload)) return new Upload(file);\n\
  Emitter.call(this);\n\
  this.file = file;\n\
  file.slice = file.slice || file.webkitSlice;\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Upload.prototype);\n\
\n\
/**\n\
 * Upload to the given `path`.\n\
 *\n\
 * @param {String} path\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
Upload.prototype.to = function(path, fn){\n\
  // TODO: x-browser\n\
  var self = this;\n\
  fn = fn || function(){};\n\
  var req = this.req = new XMLHttpRequest;\n\
  req.open('POST', path);\n\
  req.onload = this.onload.bind(this);\n\
  req.onerror = this.onerror.bind(this);\n\
  req.upload.onprogress = this.onprogress.bind(this);\n\
  req.onreadystatechange = function(){\n\
    if (4 == req.readyState) {\n\
      var type = req.status / 100 | 0;\n\
      if (2 == type) return fn(null, req);\n\
      var err = new Error(req.statusText + ': ' + req.response);\n\
      err.status = req.status;\n\
      fn(err);\n\
    }\n\
  };\n\
  var body = new FormData;\n\
  body.append('file', this.file);\n\
  req.send(body);\n\
};\n\
\n\
/**\n\
 * Abort the XHR.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Upload.prototype.abort = function(){\n\
  this.emit('abort');\n\
  this.req.abort();\n\
};\n\
\n\
/**\n\
 * Error handler.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Upload.prototype.onerror = function(e){\n\
  this.emit('error', e);\n\
};\n\
\n\
/**\n\
 * Onload handler.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Upload.prototype.onload = function(e){\n\
  this.emit('end', this.req);\n\
};\n\
\n\
/**\n\
 * Progress handler.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Upload.prototype.onprogress = function(e){\n\
  e.percent = e.loaded / e.total * 100;\n\
  this.emit('progress', e);\n\
};\n\
//@ sourceURL=component-upload/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("discore-closest/index.js", Function("exports, require, module",
"var matches = require('matches-selector')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? element : element.parentNode\n\
  root = root || document\n\
\n\
  do {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return\n\
    // Make sure `element !== document`\n\
    // otherwise we get an illegal invocation\n\
  } while ((element = element.parentNode) && element !== document)\n\
}//@ sourceURL=discore-closest/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('closest')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var events = require('event');\n\
var delegate = require('delegate');\n\
\n\
/**\n\
 * Expose `Events`.\n\
 */\n\
\n\
module.exports = Events;\n\
\n\
/**\n\
 * Initialize an `Events` with the given\n\
 * `el` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} el\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function Events(el, obj) {\n\
  if (!(this instanceof Events)) return new Events(el, obj);\n\
  if (!el) throw new Error('element required');\n\
  if (!obj) throw new Error('object required');\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this._events = {};\n\
}\n\
\n\
/**\n\
 * Subscription helper.\n\
 */\n\
\n\
Events.prototype.sub = function(event, method, cb){\n\
  this._events[event] = this._events[event] || {};\n\
  this._events[event][method] = cb;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Direct event handling:\n\
 *\n\
 *    events.bind('click') // implies \"onclick\"\n\
 *    events.bind('click', 'remove')\n\
 *    events.bind('click', 'sort', 'asc')\n\
 *\n\
 *  Delegated event handling:\n\
 *\n\
 *    events.bind('click li > a')\n\
 *    events.bind('click li > a', 'remove')\n\
 *    events.bind('click a.sort-ascending', 'sort', 'asc')\n\
 *    events.bind('click a.sort-descending', 'sort', 'desc')\n\
 *\n\
 * @param {String} event\n\
 * @param {String|function} [method]\n\
 * @return {Function} callback\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.bind = function(event, method){\n\
  var e = parse(event);\n\
  var el = this.el;\n\
  var obj = this.obj;\n\
  var name = e.name;\n\
  var method = method || 'on' + name;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function cb(){\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // bind\n\
  if (e.selector) {\n\
    cb = delegate.bind(el, e.selector, name, cb);\n\
  } else {\n\
    events.bind(el, name, cb);\n\
  }\n\
\n\
  // subscription for unbinding\n\
  this.sub(name, method, cb);\n\
\n\
  return cb;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Unbind direct handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * Unbind delegate handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * @param {String|Function} [event]\n\
 * @param {String|Function} [method]\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
\n\
  // no bindings for this event\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  // no bindings for this method\n\
  var cb = bindings[method];\n\
  if (!cb) return;\n\
\n\
  events.unbind(this.el, event, cb);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAll = function(){\n\
  for (var event in this._events) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAllOf = function(event){\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
\n\
/**\n\
 * Parse `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parse(event) {\n\
  var parts = event.split(/ +/);\n\
  return {\n\
    name: parts.shift(),\n\
    selector: parts.join(' ')\n\
  }\n\
}\n\
//@ sourceURL=component-events/index.js"
));
require.register("component-normalized-upload/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `normalize()`.\n\
 */\n\
\n\
module.exports = normalize;\n\
\n\
/**\n\
 * Normalize `e` adding the `e.items` array and invoke `fn()`.\n\
 *\n\
 * @param {Event} e\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function normalize(e, fn) {\n\
  e.items = [];\n\
\n\
  var ignore = [];\n\
\n\
  var files = e.clipboardData\n\
    ? e.clipboardData.files\n\
    : e.dataTransfer.files;\n\
\n\
  var items = e.clipboardData\n\
    ? e.clipboardData.items\n\
    : e.dataTransfer.items;\n\
\n\
  items = items || [];\n\
  files = files || [];\n\
\n\
  normalizeItems(e, items, ignore, function(){\n\
    normalizeFiles(e, files, ignore, function(){\n\
      fn(e)\n\
    });\n\
  });\n\
}\n\
\n\
/**\n\
 * Process `files`.\n\
 *\n\
 * Some browsers (chrome) populate both .items and .files\n\
 * with the same things, so we need to check that the `File`\n\
 * is not already present.\n\
 *\n\
 * @param {Event} e\n\
 * @param {FileList} files\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function normalizeFiles(e, files, ignore, fn) {\n\
  var pending = files.length;\n\
\n\
  if (!pending) return fn();\n\
\n\
  for (var i = 0; i < files.length; i++) {\n\
    var file = files[i];\n\
    if (~ignore.indexOf(file)) continue;\n\
    if (~e.items.indexOf(file)) continue;\n\
    file.kind = 'file';\n\
    e.items.push(file);\n\
  }\n\
\n\
  fn();\n\
}\n\
\n\
/**\n\
 * Process `items`.\n\
 *\n\
 * @param {Event} e\n\
 * @param {ItemList} items\n\
 * @param {Function} fn\n\
 * @return {Type}\n\
 * @api private\n\
 */\n\
\n\
function normalizeItems(e, items, ignore, fn){\n\
  var pending = items.length;\n\
\n\
  if (!pending) return fn();\n\
\n\
  for (var i = 0; i < items.length; i++) {\n\
    var item = items[i];\n\
\n\
    // directories\n\
    if ('file' == item.kind && item.webkitGetAsEntry) {\n\
      var entry = item.webkitGetAsEntry();\n\
      if (entry && entry.isDirectory) {\n\
        ignore.push(item.getAsFile());\n\
        walk(e, entry, function(){\n\
          --pending || fn(e);\n\
        });\n\
        continue;\n\
      }\n\
    }\n\
\n\
    // files\n\
    if ('file' == item.kind) {\n\
      var file = item.getAsFile();\n\
      file.kind = 'file';\n\
      e.items.push(file);\n\
      --pending || fn(e);\n\
      continue;\n\
    }\n\
\n\
    // others\n\
    (function(){\n\
      var type = item.type;\n\
      var kind = item.kind;\n\
      item.getAsString(function(str){\n\
        e.items.push({\n\
          kind: kind,\n\
          type: type,\n\
          string: str\n\
        });\n\
\n\
        --pending || fn(e);\n\
      })\n\
    })()\n\
  }\n\
};\n\
\n\
/**\n\
 * Walk `entry`.\n\
 *\n\
 * @param {Event} e\n\
 * @param {FileEntry} entry\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function walk(e, entry, fn){\n\
  if (entry.isFile) {\n\
    return entry.file(function(file){\n\
      file.entry = entry;\n\
      file.kind = 'file';\n\
      e.items.push(file);\n\
      fn();\n\
    })\n\
  }\n\
\n\
  if (entry.isDirectory) {\n\
    var dir = entry.createReader();\n\
    dir.readEntries(function(entries){\n\
      entries = filterHidden(entries);\n\
      var pending = entries.length;\n\
\n\
      for (var i = 0; i < entries.length; i++) {\n\
        walk(e, entries[i], function(){\n\
          --pending || fn();\n\
        });\n\
      }\n\
    })\n\
  }\n\
}\n\
\n\
/**\n\
 * Filter hidden entries.\n\
 *\n\
 * @param {Array} entries\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function filterHidden(entries) {\n\
  var arr = [];\n\
\n\
  for (var i = 0; i < entries.length; i++) {\n\
    if ('.' == entries[i].name[0]) continue;\n\
    arr.push(entries[i]);\n\
  }\n\
\n\
  return arr;\n\
}\n\
//@ sourceURL=component-normalized-upload/index.js"
));
require.register("component-drop/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var normalize = require('normalized-upload');\n\
var classes = require('classes');\n\
var events = require('events');\n\
\n\
/**\n\
 * Expose `Drop`.\n\
 */\n\
\n\
module.exports = Drop;\n\
\n\
/**\n\
 * Initialize a drop point\n\
 * on the given `el` and callback `fn(e)`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function Drop(el, fn) {\n\
  if (!(this instanceof Drop)) return new Drop(el, fn);\n\
  this.el = el;\n\
  this.callback = fn;\n\
  this.classes = classes(el);\n\
  this.events = events(el, this);\n\
  this.events.bind('drop');\n\
  this.events.bind('dragenter');\n\
  this.events.bind('dragleave');\n\
  this.events.bind('dragover');\n\
}\n\
\n\
/**\n\
 * Unbind event handlers.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Drop.prototype.unbind = function(){\n\
  this.events.unbind();\n\
};\n\
\n\
/**\n\
 * Dragenter handler.\n\
 */\n\
\n\
Drop.prototype.ondragenter = function(e){\n\
  this.classes.add('over');\n\
};\n\
\n\
/**\n\
 * Dragover handler.\n\
 */\n\
\n\
Drop.prototype.ondragover = function(e){\n\
  e.preventDefault();\n\
};\n\
\n\
/**\n\
 * Dragleave handler.\n\
 */\n\
\n\
Drop.prototype.ondragleave = function(e){\n\
  this.classes.remove('over');\n\
};\n\
\n\
/**\n\
 * Drop handler.\n\
 */\n\
\n\
Drop.prototype.ondrop = function(e){\n\
  e.stopPropagation();\n\
  e.preventDefault();\n\
  this.classes.remove('over');\n\
  normalize(e, this.callback);\n\
};\n\
\n\
//@ sourceURL=component-drop/index.js"
));
require.register("component-drop-anywhere/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var drop = require('drop');\n\
var events = require('events');\n\
var classes = require('classes');\n\
\n\
/**\n\
 * Expose `DropAnywhere`.\n\
 */\n\
\n\
module.exports = DropAnywhere;\n\
\n\
/**\n\
 * Make the document droppable and invoke `fn(err, upload)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function DropAnywhere(fn) {\n\
  if (!(this instanceof DropAnywhere)) return new DropAnywhere(fn);\n\
  this.callback = fn;\n\
  this.el = document.createElement('div');\n\
  this.el.id = 'drop-anywhere';\n\
  this.events = events(this.el, this);\n\
  this.classes = classes(this.el);\n\
  this.docEvents = events(document.body, this);\n\
  this.events.bind('click', 'hide');\n\
  this.events.bind('drop', 'hide');\n\
  this.events.bind('dragleave', 'hide');\n\
  this.docEvents.bind('dragenter', 'show');\n\
  this.drop = drop(this.el, this.callback);\n\
  this.add();\n\
}\n\
\n\
/**\n\
 * Add the element.\n\
 */\n\
\n\
DropAnywhere.prototype.add = function(){\n\
  document.body.appendChild(this.el);\n\
};\n\
\n\
/**\n\
 * Remove the element.\n\
 */\n\
\n\
DropAnywhere.prototype.remove = function(){\n\
  document.body.removeChild(this.el);\n\
};\n\
\n\
/**\n\
 * Show the dropzone.\n\
 */\n\
\n\
DropAnywhere.prototype.show = function(){\n\
  this.classes.add('show');\n\
};\n\
\n\
/**\n\
 * Hide the dropzone.\n\
 */\n\
\n\
DropAnywhere.prototype.hide = function(){\n\
  this.classes.remove('show');\n\
};\n\
\n\
/**\n\
 * Unbind.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
DropAnywhere.prototype.unbind = function(){\n\
  this.remove();\n\
  this.docEvents.unbind();\n\
  this.events.unbind();\n\
  this.drop.unbind();\n\
};\n\
//@ sourceURL=component-drop-anywhere/index.js"
));
require.register("component-file-picker/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var event = require('event');\n\
\n\
/**\n\
 * Expose `FilePicker`\n\
 */\n\
\n\
module.exports = FilePicker;\n\
\n\
/**\n\
 * Input template\n\
 */\n\
\n\
var form = document.createElement('form');\n\
form.innerHTML = '<input type=\"file\" style=\"top: -1000px; position: absolute\" aria-hidden=\"true\">';\n\
document.body.appendChild(form);\n\
var input = form.childNodes[0];\n\
\n\
/**\n\
 * Already bound\n\
 */\n\
\n\
var bound = false;\n\
\n\
/**\n\
 * Opens a file picker dialog.\n\
 *\n\
 * @param {Object} options (optional)\n\
 * @param {Function} fn callback function\n\
 * @api public\n\
 */\n\
\n\
function FilePicker(opts, fn){\n\
  if ('function' == typeof opts) {\n\
    fn = opts;\n\
    opts = {};\n\
  }\n\
  opts = opts || {};\n\
\n\
  // multiple files support\n\
  input.multiple = !!opts.multiple;\n\
\n\
  // directory support\n\
  input.webkitdirectory = input.mozdirectory = input.directory = !!opts.directory;\n\
\n\
  // accepted file types support\n\
  if (null == opts.accept) {\n\
    delete input.accept;\n\
  } else if (opts.accept.join) {\n\
    // got an array\n\
    input.accept = opts.accept.join(',');\n\
  } else if (opts.accept) {\n\
    // got a regular string\n\
    input.accept = opts.accept;\n\
  }\n\
\n\
  // listen to change event (unbind old one if already listening)\n\
  if (bound) event.unbind(input, 'change', bound);\n\
  event.bind(input, 'change', onchange);\n\
  bound = onchange;\n\
\n\
  function onchange(e) {\n\
    fn(input.files, e, input);\n\
    event.unbind(input, 'change', onchange);\n\
    bound = false;\n\
  }\n\
\n\
  // reset the form\n\
  form.reset();\n\
\n\
  // trigger input dialog\n\
  input.click();\n\
}\n\
//@ sourceURL=component-file-picker/index.js"
));
require.register("matthewmueller-ppi/index.js", Function("exports, require, module",
"/**\n\
 * Export `ppi`\n\
 */\n\
\n\
module.exports = ppi;\n\
\n\
/**\n\
 * Units\n\
 *\n\
 * (pixels / unit) * (units / inch) = pixels / inch\n\
 */\n\
\n\
var units = {\n\
  meters: 0.0254,\n\
  inches: 1,\n\
}\n\
\n\
/**\n\
 * Initialize `ppi`\n\
 *\n\
 * @param {Object} exif\n\
 * @return {Number|Boolean}\n\
 */\n\
\n\
function ppi(exif) {\n\
  // metric\n\
  var unit = exif['resolution unit'] || exif['pixel units'];\n\
  if (!unit) return false;\n\
  var ratio = units[unit.toLowerCase()];\n\
  if (!ratio) return false;\n\
\n\
  // x,y resolution\n\
  if (exif['x resolution'] && exif['y resolution']) {\n\
    var x = +exif['x resolution'];\n\
    var y = +exif['y resolution'];\n\
\n\
    // arbitrary avg, should normally be equal\n\
    var res = (x + y) / 2;\n\
    return Math.round(res * ratio);\n\
  }\n\
\n\
  // pixels per unit x,y\n\
  if (exif['pixels per unit x'] && exif['pixels per unit y']) {\n\
    var x = +exif['pixels per unit x'];\n\
    var y = +exif['pixels per unit y'];\n\
\n\
    // arbitrary avg, should normally be equal\n\
    var res = (x + y) / 2;\n\
    return Math.round(res * ratio);\n\
  }\n\
\n\
  return false;\n\
}\n\
//@ sourceURL=matthewmueller-ppi/index.js"
));
require.register("component-os/index.js", Function("exports, require, module",
"\n\
\n\
module.exports = os();\n\
\n\
function os() {\n\
  var ua = navigator.userAgent;\n\
  if (/mac/i.test(ua)) return 'mac';\n\
  if (/win/i.test(ua)) return 'windows';\n\
  if (/linux/i.test(ua)) return 'linux';\n\
}\n\
//@ sourceURL=component-os/index.js"
));
require.register("component-exif/js/ExifReader.js", Function("exports, require, module",
"// Generated by CoffeeScript 1.6.2\n\
/*\n\
# ExifReader 1.0.1\n\
# http://github.com/mattiasw/exifreader\n\
# Copyright (C) 2011-2013  Mattias Wallander <mattias@wallander.eu>\n\
# Licensed under the GNU Lesser General Public License version 3 or later\n\
# See license text at http://www.gnu.org/licenses/lgpl.txt\n\
*/\n\
\n\
\n\
(function() {\n\
  (typeof exports !== \"undefined\" && exports !== null ? exports : this).ExifReader = (function() {\n\
    ExifReader.prototype._MIN_DATA_BUFFER_LENGTH = 2;\n\
\n\
    ExifReader.prototype._JPEG_ID_SIZE = 2;\n\
\n\
    ExifReader.prototype._JPEG_ID = 0xffd8;\n\
\n\
    ExifReader.prototype._APP_MARKER_SIZE = 2;\n\
\n\
    ExifReader.prototype._APP0_MARKER = 0xffe0;\n\
\n\
    ExifReader.prototype._APP1_MARKER = 0xffe1;\n\
\n\
    ExifReader.prototype._APP15_MARKER = 0xffef;\n\
\n\
    ExifReader.prototype._APP_ID_OFFSET = 4;\n\
\n\
    ExifReader.prototype._BYTES_Exif = 0x45786966;\n\
\n\
    ExifReader.prototype._TIFF_HEADER_OFFSET = 10;\n\
\n\
    ExifReader.prototype._BYTE_ORDER_BIG_ENDIAN = 0x4949;\n\
\n\
    ExifReader.prototype._BYTE_ORDER_LITTLE_ENDIAN = 0x4d4d;\n\
\n\
    function ExifReader() {\n\
      var _this = this;\n\
\n\
      this._getTagValueAt = {\n\
        1: function(offset) {\n\
          return _this._getByteAt(offset);\n\
        },\n\
        2: function(offset) {\n\
          return _this._getAsciiAt(offset);\n\
        },\n\
        3: function(offset) {\n\
          return _this._getShortAt(offset);\n\
        },\n\
        4: function(offset) {\n\
          return _this._getLongAt(offset);\n\
        },\n\
        5: function(offset) {\n\
          return _this._getRationalAt(offset);\n\
        },\n\
        7: function(offset) {\n\
          return _this._getUndefinedAt(offset);\n\
        },\n\
        9: function(offset) {\n\
          return _this._getSlongAt(offset);\n\
        },\n\
        10: function(offset) {\n\
          return _this._getSrationalAt(offset);\n\
        }\n\
      };\n\
      this._tiffHeaderOffset = 0;\n\
    }\n\
\n\
    /*\n\
    # Loads all the Exif tags from the specified image file buffer.\n\
    #\n\
    # data ArrayBuffer Image file data\n\
    */\n\
\n\
\n\
    ExifReader.prototype.load = function(data) {\n\
      return this.loadView(new DataView(data));\n\
    };\n\
\n\
    /*\n\
    # Loads all the Exif tags from the specified image file buffer view. Probably\n\
    # used when DataView isn't supported by the browser.\n\
    #\n\
    # @_dataView DataView Image file data view\n\
    */\n\
\n\
\n\
    ExifReader.prototype.loadView = function(_dataView) {\n\
      this._dataView = _dataView;\n\
      this._tags = {};\n\
      this._checkImageHeader();\n\
      return this._readTags();\n\
    };\n\
\n\
    ExifReader.prototype._checkImageHeader = function() {\n\
      var dataView;\n\
\n\
      dataView = this._dataView;\n\
      if (dataView.byteLength < this._MIN_DATA_BUFFER_LENGTH || dataView.getUint16(0, false) !== this._JPEG_ID) {\n\
        throw new Error('Invalid image format');\n\
      }\n\
      this._parseAppMarkers(dataView);\n\
      if (!this._hasExifData()) {\n\
        throw new Error('No Exif data');\n\
      }\n\
    };\n\
\n\
    ExifReader.prototype._parseAppMarkers = function(dataView) {\n\
      var appMarkerPosition, fieldLength, _results;\n\
\n\
      appMarkerPosition = this._JPEG_ID_SIZE;\n\
      _results = [];\n\
      while (true) {\n\
        if (dataView.byteLength < appMarkerPosition + this._APP_ID_OFFSET + 5) {\n\
          break;\n\
        }\n\
        if (this._isApp1ExifMarker(dataView, appMarkerPosition)) {\n\
          fieldLength = dataView.getUint16(appMarkerPosition + this._APP_MARKER_SIZE, false);\n\
          this._tiffHeaderOffset = appMarkerPosition + this._TIFF_HEADER_OFFSET;\n\
        } else if (this._isAppMarker(dataView, appMarkerPosition)) {\n\
          fieldLength = dataView.getUint16(appMarkerPosition + this._APP_MARKER_SIZE, false);\n\
        } else {\n\
          break;\n\
        }\n\
        _results.push(appMarkerPosition += this._APP_MARKER_SIZE + fieldLength);\n\
      }\n\
      return _results;\n\
    };\n\
\n\
    ExifReader.prototype._isApp1ExifMarker = function(dataView, appMarkerPosition) {\n\
      return dataView.getUint16(appMarkerPosition, false) === this._APP1_MARKER && dataView.getUint32(appMarkerPosition + this._APP_ID_OFFSET, false) === this._BYTES_Exif && dataView.getUint8(appMarkerPosition + this._APP_ID_OFFSET + 4, false) === 0x00;\n\
    };\n\
\n\
    ExifReader.prototype._isAppMarker = function(dataView, appMarkerPosition) {\n\
      var appMarker;\n\
\n\
      appMarker = dataView.getUint16(appMarkerPosition, false);\n\
      return appMarker >= this._APP0_MARKER && appMarker <= this._APP15_MARKER;\n\
    };\n\
\n\
    ExifReader.prototype._hasExifData = function() {\n\
      return this._tiffHeaderOffset !== 0;\n\
    };\n\
\n\
    ExifReader.prototype._readTags = function() {\n\
      this._setByteOrder();\n\
      this._read0thIfd();\n\
      this._readExifIfd();\n\
      this._readGpsIfd();\n\
      return this._readInteroperabilityIfd();\n\
    };\n\
\n\
    ExifReader.prototype._setByteOrder = function() {\n\
      if (this._dataView.getUint16(this._tiffHeaderOffset) === this._BYTE_ORDER_BIG_ENDIAN) {\n\
        return this._littleEndian = true;\n\
      } else if (this._dataView.getUint16(this._tiffHeaderOffset) === this._BYTE_ORDER_LITTLE_ENDIAN) {\n\
        return this._littleEndian = false;\n\
      } else {\n\
        throw new Error('Illegal byte order value. Faulty image.');\n\
      }\n\
    };\n\
\n\
    ExifReader.prototype._read0thIfd = function() {\n\
      var ifdOffset;\n\
\n\
      ifdOffset = this._getIfdOffset();\n\
      return this._readIfd('0th', ifdOffset);\n\
    };\n\
\n\
    ExifReader.prototype._getIfdOffset = function() {\n\
      return this._tiffHeaderOffset + this._getLongAt(this._tiffHeaderOffset + 4);\n\
    };\n\
\n\
    ExifReader.prototype._readExifIfd = function() {\n\
      var ifdOffset;\n\
\n\
      if (this._tags['Exif IFD Pointer'] != null) {\n\
        ifdOffset = this._tiffHeaderOffset + this._tags['Exif IFD Pointer'].value;\n\
        return this._readIfd('exif', ifdOffset);\n\
      }\n\
    };\n\
\n\
    ExifReader.prototype._readGpsIfd = function() {\n\
      var ifdOffset;\n\
\n\
      if (this._tags['GPS Info IFD Pointer'] != null) {\n\
        ifdOffset = this._tiffHeaderOffset + this._tags['GPS Info IFD Pointer'].value;\n\
        return this._readIfd('gps', ifdOffset);\n\
      }\n\
    };\n\
\n\
    ExifReader.prototype._readInteroperabilityIfd = function() {\n\
      var ifdOffset;\n\
\n\
      if (this._tags['Interoperability IFD Pointer'] != null) {\n\
        ifdOffset = this._tiffHeaderOffset + this._tags['Interoperability IFD Pointer'].value;\n\
        return this._readIfd('interoperability', ifdOffset);\n\
      }\n\
    };\n\
\n\
    ExifReader.prototype._readIfd = function(ifdType, offset) {\n\
      var fieldIndex, numberOfFields, tag, _i, _results;\n\
\n\
      numberOfFields = this._getShortAt(offset);\n\
      offset += 2;\n\
      _results = [];\n\
      for (fieldIndex = _i = 0; 0 <= numberOfFields ? _i < numberOfFields : _i > numberOfFields; fieldIndex = 0 <= numberOfFields ? ++_i : --_i) {\n\
        tag = this._readTag(ifdType, offset);\n\
        this._tags[tag.name] = {\n\
          'value': tag.value,\n\
          'description': tag.description\n\
        };\n\
        _results.push(offset += 12);\n\
      }\n\
      return _results;\n\
    };\n\
\n\
    ExifReader.prototype._readTag = function(ifdType, offset) {\n\
      var tagCode, tagCount, tagDescription, tagName, tagType, tagValue, tagValueOffset;\n\
\n\
      tagCode = this._getShortAt(offset);\n\
      tagType = this._getShortAt(offset + 2);\n\
      tagCount = this._getLongAt(offset + 4);\n\
      if (this._typeSizes[tagType] * tagCount <= 4) {\n\
        tagValue = this._getTagValue(offset + 8, tagType, tagCount);\n\
      } else {\n\
        tagValueOffset = this._getLongAt(offset + 8);\n\
        tagValue = this._getTagValue(this._tiffHeaderOffset + tagValueOffset, tagType, tagCount);\n\
      }\n\
      if (tagType === this._tagTypes['ASCII']) {\n\
        tagValue = this._splitNullSeparatedAsciiString(tagValue);\n\
      }\n\
      if (this._tagNames[ifdType][tagCode] != null) {\n\
        if ((this._tagNames[ifdType][tagCode]['name'] != null) && (this._tagNames[ifdType][tagCode]['description'] != null)) {\n\
          tagName = this._tagNames[ifdType][tagCode]['name'];\n\
          tagDescription = this._tagNames[ifdType][tagCode]['description'](tagValue);\n\
        } else {\n\
          tagName = this._tagNames[ifdType][tagCode];\n\
          if (tagValue instanceof Array) {\n\
            tagDescription = tagValue.join(', ');\n\
          } else {\n\
            tagDescription = tagValue;\n\
          }\n\
        }\n\
        return {\n\
          'name': tagName,\n\
          'value': tagValue,\n\
          'description': tagDescription\n\
        };\n\
      } else {\n\
        return {\n\
          'name': \"undefined-\" + tagCode,\n\
          'value': tagValue,\n\
          'description': tagValue\n\
        };\n\
      }\n\
    };\n\
\n\
    ExifReader.prototype._getTagValue = function(offset, type, count) {\n\
      var tagValue, value, valueIndex;\n\
\n\
      value = (function() {\n\
        var _i, _results;\n\
\n\
        _results = [];\n\
        for (valueIndex = _i = 0; 0 <= count ? _i < count : _i > count; valueIndex = 0 <= count ? ++_i : --_i) {\n\
          tagValue = this._getTagValueAt[type](offset);\n\
          offset += this._typeSizes[type];\n\
          _results.push(tagValue);\n\
        }\n\
        return _results;\n\
      }).call(this);\n\
      if (value.length === 1) {\n\
        value = value[0];\n\
      } else if (type === this._tagTypes['ASCII']) {\n\
        value = this._getAsciiValue(value);\n\
      }\n\
      return value;\n\
    };\n\
\n\
    ExifReader.prototype._getAsciiValue = function(charArray) {\n\
      var charCode, newCharArray;\n\
\n\
      return newCharArray = (function() {\n\
        var _i, _len, _results;\n\
\n\
        _results = [];\n\
        for (_i = 0, _len = charArray.length; _i < _len; _i++) {\n\
          charCode = charArray[_i];\n\
          _results.push(String.fromCharCode(charCode));\n\
        }\n\
        return _results;\n\
      })();\n\
    };\n\
\n\
    ExifReader.prototype._getByteAt = function(offset) {\n\
      return this._dataView.getUint8(offset);\n\
    };\n\
\n\
    ExifReader.prototype._getAsciiAt = function(offset) {\n\
      return this._dataView.getUint8(offset);\n\
    };\n\
\n\
    ExifReader.prototype._getShortAt = function(offset) {\n\
      return this._dataView.getUint16(offset, this._littleEndian);\n\
    };\n\
\n\
    ExifReader.prototype._getLongAt = function(offset) {\n\
      return this._dataView.getUint32(offset, this._littleEndian);\n\
    };\n\
\n\
    ExifReader.prototype._getRationalAt = function(offset) {\n\
      return this._getLongAt(offset) / this._getLongAt(offset + 4);\n\
    };\n\
\n\
    ExifReader.prototype._getUndefinedAt = function(offset) {\n\
      return this._getByteAt(offset);\n\
    };\n\
\n\
    ExifReader.prototype._getSlongAt = function(offset) {\n\
      return this._dataView.getInt32(offset, this._littleEndian);\n\
    };\n\
\n\
    ExifReader.prototype._getSrationalAt = function(offset) {\n\
      return this._getSlongAt(offset) / this._getSlongAt(offset + 4);\n\
    };\n\
\n\
    ExifReader.prototype._splitNullSeparatedAsciiString = function(string) {\n\
      var character, i, tagValue, _i, _len;\n\
\n\
      tagValue = [];\n\
      i = 0;\n\
      for (_i = 0, _len = string.length; _i < _len; _i++) {\n\
        character = string[_i];\n\
        if (character === '\\x00') {\n\
          i++;\n\
          continue;\n\
        }\n\
        if (tagValue[i] == null) {\n\
          tagValue[i] = '';\n\
        }\n\
        tagValue[i] += character;\n\
      }\n\
      return tagValue;\n\
    };\n\
\n\
    ExifReader.prototype._typeSizes = {\n\
      1: 1,\n\
      2: 1,\n\
      3: 2,\n\
      4: 4,\n\
      5: 8,\n\
      7: 1,\n\
      9: 4,\n\
      10: 8\n\
    };\n\
\n\
    ExifReader.prototype._tagTypes = {\n\
      'BYTE': 1,\n\
      'ASCII': 2,\n\
      'SHORT': 3,\n\
      'LONG': 4,\n\
      'RATIONAL': 5,\n\
      'UNDEFINED': 7,\n\
      'SLONG': 9,\n\
      'SRATIONAL': 10\n\
    };\n\
\n\
    ExifReader.prototype._tagNames = {\n\
      '0th': {\n\
        0x0100: 'ImageWidth',\n\
        0x0101: 'ImageLength',\n\
        0x0102: 'BitsPerSample',\n\
        0x0103: 'Compression',\n\
        0x0106: 'PhotometricInterpretation',\n\
        0x010e: 'ImageDescription',\n\
        0x010f: 'Make',\n\
        0x0110: 'Model',\n\
        0x0111: 'StripOffsets',\n\
        0x0112: {\n\
          'name': 'Orientation',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'top-left';\n\
              case 2:\n\
                return 'top-right';\n\
              case 3:\n\
                return 'bottom-right';\n\
              case 4:\n\
                return 'bottom-left';\n\
              case 5:\n\
                return 'left-top';\n\
              case 6:\n\
                return 'right-top';\n\
              case 7:\n\
                return 'right-bottom';\n\
              case 8:\n\
                return 'left-bottom';\n\
              default:\n\
                return 'Undefined';\n\
            }\n\
          }\n\
        },\n\
        0x0115: 'SamplesPerPixel',\n\
        0x0116: 'RowsPerStrip',\n\
        0x0117: 'StripByteCounts',\n\
        0x011a: 'XResolution',\n\
        0x011b: 'YResolution',\n\
        0x011c: 'PlanarConfiguration',\n\
        0x0128: {\n\
          'name': 'ResolutionUnit',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 2:\n\
                return 'inches';\n\
              case 3:\n\
                return 'centimeters';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x012d: 'TransferFunction',\n\
        0x0131: 'Software',\n\
        0x0132: 'DateTime',\n\
        0x013b: 'Artist',\n\
        0x013e: 'WhitePoint',\n\
        0x013f: 'PrimaryChromaticities',\n\
        0x0201: 'JPEGInterchangeFormat',\n\
        0x0202: 'JPEGInterchangeFormatLength',\n\
        0x0211: 'YCbCrCoefficients',\n\
        0x0212: 'YCbCrSubSampling',\n\
        0x0213: {\n\
          'name': 'YCbCrPositioning',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'centered';\n\
              case 2:\n\
                return 'co-sited';\n\
              default:\n\
                return 'undefied ' + value;\n\
            }\n\
          }\n\
        },\n\
        0x0214: 'ReferenceBlackWhite',\n\
        0x8298: {\n\
          'name': 'Copyright',\n\
          'description': function(value) {\n\
            return value.join('; ');\n\
          }\n\
        },\n\
        0x8769: 'Exif IFD Pointer',\n\
        0x8825: 'GPS Info IFD Pointer'\n\
      },\n\
      'exif': {\n\
        0x829a: 'ExposureTime',\n\
        0x829d: 'FNumber',\n\
        0x8822: {\n\
          'name': 'ExposureProgram',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Undefined';\n\
              case 1:\n\
                return 'Manual';\n\
              case 2:\n\
                return 'Normal program';\n\
              case 3:\n\
                return 'Aperture priority';\n\
              case 4:\n\
                return 'Shutter priority';\n\
              case 5:\n\
                return 'Creative program';\n\
              case 6:\n\
                return 'Action program';\n\
              case 7:\n\
                return 'Portrait mode';\n\
              case 8:\n\
                return 'Landscape mode';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x8824: 'SpectralSensitivity',\n\
        0x8827: 'ISOSpeedRatings',\n\
        0x8828: {\n\
          'name': 'OECF',\n\
          'description': function(value) {\n\
            return '[Raw OECF table data]';\n\
          }\n\
        },\n\
        0x9000: {\n\
          'name': 'ExifVersion',\n\
          'description': function(value) {\n\
            var charCode, string, _i, _len;\n\
\n\
            string = '';\n\
            for (_i = 0, _len = value.length; _i < _len; _i++) {\n\
              charCode = value[_i];\n\
              string += String.fromCharCode(charCode);\n\
            }\n\
            return string;\n\
          }\n\
        },\n\
        0x9003: 'DateTimeOriginal',\n\
        0x9004: 'DateTimeDigitized',\n\
        0x9101: {\n\
          'name': 'ComponentsConfiguration',\n\
          'description': function(value) {\n\
            var character, string, _i, _len;\n\
\n\
            string = '';\n\
            for (_i = 0, _len = value.length; _i < _len; _i++) {\n\
              character = value[_i];\n\
              switch (character) {\n\
                case 0x31:\n\
                  string += 'Y';\n\
                  break;\n\
                case 0x32:\n\
                  string += 'Cb';\n\
                  break;\n\
                case 0x33:\n\
                  string += 'Cr';\n\
                  break;\n\
                case 0x34:\n\
                  string += 'R';\n\
                  break;\n\
                case 0x35:\n\
                  string += 'G';\n\
                  break;\n\
                case 0x36:\n\
                  string += 'B';\n\
              }\n\
            }\n\
            return string;\n\
          }\n\
        },\n\
        0x9102: 'CompressedBitsPerPixel',\n\
        0x9201: 'ShutterSpeedValue',\n\
        0x9202: 'ApertureValue',\n\
        0x9203: 'BrightnessValue',\n\
        0x9204: 'ExposureBiasValue',\n\
        0x9205: 'MaxApertureValue',\n\
        0x9206: 'SubjectDistance',\n\
        0x9207: {\n\
          'name': 'MeteringMode',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'Average';\n\
              case 2:\n\
                return 'CenterWeightedAverage';\n\
              case 3:\n\
                return 'Spot';\n\
              case 4:\n\
                return 'MultiSpot';\n\
              case 5:\n\
                return 'Pattern';\n\
              case 6:\n\
                return 'Partial';\n\
              case 255:\n\
                return 'Other';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x9208: {\n\
          'name': 'LightSource',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'Daylight';\n\
              case 2:\n\
                return 'Fluorescent';\n\
              case 3:\n\
                return 'Tungsten (incandescent light)';\n\
              case 4:\n\
                return 'Flash';\n\
              case 9:\n\
                return 'Fine weather';\n\
              case 10:\n\
                return 'Cloudy weather';\n\
              case 11:\n\
                return 'Shade';\n\
              case 12:\n\
                return 'Daylight fluorescent (D 5700 – 7100K)';\n\
              case 13:\n\
                return 'Day white fluorescent (N 4600 – 5400K)';\n\
              case 14:\n\
                return 'Cool white fluorescent (W 3900 – 4500K)';\n\
              case 15:\n\
                return 'White fluorescent (WW 3200 – 3700K)';\n\
              case 17:\n\
                return 'Standard light A';\n\
              case 18:\n\
                return 'Standard light B';\n\
              case 19:\n\
                return 'Standard light C';\n\
              case 20:\n\
                return 'D55';\n\
              case 21:\n\
                return 'D65';\n\
              case 22:\n\
                return 'D75';\n\
              case 23:\n\
                return 'D50';\n\
              case 24:\n\
                return 'ISO studio tungsten';\n\
              case 255:\n\
                return 'Other light source';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x9209: {\n\
          'name': 'Flash',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0x00:\n\
                return 'Flash did not fire';\n\
              case 0x01:\n\
                return 'Flash fired';\n\
              case 0x05:\n\
                return 'Strobe return light not detected';\n\
              case 0x07:\n\
                return 'Strobe return light detected';\n\
              case 0x09:\n\
                return 'Flash fired, compulsory flash mode';\n\
              case 0x0d:\n\
                return 'Flash fired, compulsory flash mode, return light not detected';\n\
              case 0x0f:\n\
                return 'Flash fired, compulsory flash mode, return light detected';\n\
              case 0x10:\n\
                return 'Flash did not fire, compulsory flash mode';\n\
              case 0x18:\n\
                return 'Flash did not fire, auto mode';\n\
              case 0x19:\n\
                return 'Flash fired, auto mode';\n\
              case 0x1d:\n\
                return 'Flash fired, auto mode, return light not detected';\n\
              case 0x1f:\n\
                return 'Flash fired, auto mode, return light detected';\n\
              case 0x20:\n\
                return 'No flash function';\n\
              case 0x41:\n\
                return 'Flash fired, red-eye reduction mode';\n\
              case 0x45:\n\
                return 'Flash fired, red-eye reduction mode, return light not detected';\n\
              case 0x47:\n\
                return 'Flash fired, red-eye reduction mode, return light detected';\n\
              case 0x49:\n\
                return 'Flash fired, compulsory flash mode, red-eye reduction mode';\n\
              case 0x4d:\n\
                return 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected';\n\
              case 0x4f:\n\
                return 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected';\n\
              case 0x59:\n\
                return 'Flash fired, auto mode, red-eye reduction mode';\n\
              case 0x5d:\n\
                return 'Flash fired, auto mode, return light not detected, red-eye reduction mode';\n\
              case 0x5f:\n\
                return 'Flash fired, auto mode, return light detected, red-eye reduction mode';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x920a: 'FocalLength',\n\
        0x9214: {\n\
          'name': 'SubjectArea',\n\
          'description': function(value) {\n\
            switch (value.length) {\n\
              case 2:\n\
                return \"Location; X: \" + value[0] + \", Y: \" + value[1];\n\
              case 3:\n\
                return \"Circle; X: \" + value[0] + \", Y: \" + value[1] + \", diameter: \" + value[2];\n\
              case 4:\n\
                return \"Rectangle; X: \" + value[0] + \", Y: \" + value[1] + \", width: \" + value[2] + \", height: \" + value[3];\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x927c: {\n\
          'name': 'MakerNote',\n\
          'description': function(value) {\n\
            return '[Raw maker note data]';\n\
          }\n\
        },\n\
        0x9286: {\n\
          'name': 'UserComment',\n\
          'description': function(value) {\n\
            switch (value.slice(0, 8).map(function(charCode) {\n\
                  return String.fromCharCode(charCode);\n\
                }).join('')) {\n\
              case 'ASCII\\x00\\x00\\x00':\n\
                return value.slice(8, value.length).map(function(charCode) {\n\
                  return String.fromCharCode(charCode);\n\
                }).join('');\n\
              case 'JIS\\x00\\x00\\x00\\x00\\x00':\n\
                return '[JIS encoded text]';\n\
              case 'UNICODE\\x00':\n\
                return '[Unicode encoded text]';\n\
              case '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00':\n\
                return '[Undefined encoding]';\n\
            }\n\
          }\n\
        },\n\
        0x9290: 'SubSecTime',\n\
        0x9291: 'SubSecTimeOriginal',\n\
        0x9292: 'SubSecTimeDigitized',\n\
        0xa000: {\n\
          'name': 'FlashpixVersion',\n\
          'description': function(value) {\n\
            var charCode, string, _i, _len;\n\
\n\
            string = '';\n\
            for (_i = 0, _len = value.length; _i < _len; _i++) {\n\
              charCode = value[_i];\n\
              string += String.fromCharCode(charCode);\n\
            }\n\
            return string;\n\
          }\n\
        },\n\
        0xa001: {\n\
          'name': 'ColorSpace',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'sRGB';\n\
              case 0xffff:\n\
                return 'Uncalibrated';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa002: 'PixelXDimension',\n\
        0xa003: 'PixelYDimension',\n\
        0xa004: 'RelatedSoundFile',\n\
        0xa005: 'Interoperability IFD Pointer',\n\
        0xa20b: 'FlashEnergy',\n\
        0xa20c: {\n\
          'name': 'SpatialFrequencyResponse',\n\
          'description': function(value) {\n\
            return '[Raw SFR table data]';\n\
          }\n\
        },\n\
        0xa20e: 'FocalPlaneXResolution',\n\
        0xa20f: 'FocalPlaneYResolution',\n\
        0xa210: {\n\
          'name': 'FocalPlaneResolutionUnit',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 2:\n\
                return 'inches';\n\
              case 3:\n\
                return 'centimeters';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa214: {\n\
          'name': 'SubjectLocation',\n\
          'description': function(value) {\n\
            return \"X: \" + value[0] + \", Y: \" + value[1];\n\
          }\n\
        },\n\
        0xa215: 'ExposureIndex',\n\
        0xa217: {\n\
          'name': 'SensingMethod',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'Undefined';\n\
              case 2:\n\
                return 'One-chip color area sensor';\n\
              case 3:\n\
                return 'Two-chip color area sensor';\n\
              case 4:\n\
                return 'Three-chip color area sensor';\n\
              case 5:\n\
                return 'Color sequential area sensor';\n\
              case 7:\n\
                return 'Trilinear sensor';\n\
              case 8:\n\
                return 'Color sequential linear sensor';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa300: {\n\
          'name': 'FileSource',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 3:\n\
                return 'DSC';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa301: {\n\
          'name': 'SceneType',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'A directly photographed image';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa302: {\n\
          'name': 'CFAPattern',\n\
          'description': function(value) {\n\
            return '[Raw CFA pattern table data]';\n\
          }\n\
        },\n\
        0xa401: {\n\
          'name': 'CustomRendered',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Normal process';\n\
              case 1:\n\
                return 'Custom process';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa402: {\n\
          'name': 'ExposureMode',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Auto exposure';\n\
              case 1:\n\
                return 'Manual exposure';\n\
              case 2:\n\
                return 'Auto bracket';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa403: {\n\
          'name': 'WhiteBalance',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Auto white balance';\n\
              case 1:\n\
                return 'Manual white balance';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa404: {\n\
          'name': 'DigitalZoomRatio',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Digital zoom was not used';\n\
              default:\n\
                return value;\n\
            }\n\
          }\n\
        },\n\
        0xa405: {\n\
          'name': 'FocalLengthIn35mmFilm',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Unknown';\n\
              default:\n\
                return value;\n\
            }\n\
          }\n\
        },\n\
        0xa406: {\n\
          'name': 'SceneCaptureType',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Standard';\n\
              case 1:\n\
                return 'Landscape';\n\
              case 2:\n\
                return 'Portrait';\n\
              case 3:\n\
                return 'Night scene';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa407: {\n\
          'name': 'GainControl',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'None';\n\
              case 1:\n\
                return 'Low gain up';\n\
              case 2:\n\
                return 'High gain up';\n\
              case 3:\n\
                return 'Low gain down';\n\
              case 4:\n\
                return 'High gain down';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa408: {\n\
          'name': 'Contrast',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Normal';\n\
              case 1:\n\
                return 'Soft';\n\
              case 2:\n\
                return 'Hard';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa409: {\n\
          'name': 'Saturation',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Normal';\n\
              case 1:\n\
                return 'Low saturation';\n\
              case 2:\n\
                return 'High saturation';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa40a: {\n\
          'name': 'Sharpness',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Normal';\n\
              case 1:\n\
                return 'Soft';\n\
              case 2:\n\
                return 'Hard';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa40b: {\n\
          'name': 'DeviceSettingDescription',\n\
          'description': function(value) {\n\
            return '[Raw device settings table data]';\n\
          }\n\
        },\n\
        0xa40c: {\n\
          'name': 'SubjectDistanceRange',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 1:\n\
                return 'Macro';\n\
              case 2:\n\
                return 'Close view';\n\
              case 3:\n\
                return 'Distant view';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0xa420: 'ImageUniqueID'\n\
      },\n\
      'gps': {\n\
        0x0000: {\n\
          'name': 'GPSVersionID',\n\
          'description': function(value) {\n\
            var _ref, _ref1;\n\
\n\
            if ((value[0] === (_ref = value[1]) && _ref === 2) && (value[2] === (_ref1 = value[3]) && _ref1 === 0)) {\n\
              return 'Version 2.2';\n\
            } else {\n\
              return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0001: {\n\
          'name': 'GPSLatitudeRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'N':\n\
                return 'North latitude';\n\
              case 'S':\n\
                return 'South latitude';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0002: {\n\
          'name': 'GPSLatitude',\n\
          'description': function(value) {\n\
            return value[0] + value[1] / 60 + value[2] / 3600;\n\
          }\n\
        },\n\
        0x0003: {\n\
          'name': 'GPSLongitudeRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'E':\n\
                return 'East longitude';\n\
              case 'W':\n\
                return 'West longitude';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0004: {\n\
          'name': 'GPSLongitude',\n\
          'description': function(value) {\n\
            return value[0] + value[1] / 60 + value[2] / 3600;\n\
          }\n\
        },\n\
        0x0005: {\n\
          'name': 'GPSAltitudeRef',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Sea level';\n\
              case 1:\n\
                return 'Sea level reference (negative value)';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0006: {\n\
          'name': 'GPSAltitude',\n\
          'description': function(value) {\n\
            return value + ' m';\n\
          }\n\
        },\n\
        0x0007: {\n\
          'name': 'GPSTimeStamp',\n\
          'description': function(value) {\n\
            var padZero;\n\
\n\
            padZero = function(num) {\n\
              var i;\n\
\n\
              return ((function() {\n\
                var _i, _ref, _results;\n\
\n\
                _results = [];\n\
                for (i = _i = 0, _ref = 2 - ('' + Math.floor(num)).length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {\n\
                  _results.push('0');\n\
                }\n\
                return _results;\n\
              })()) + num;\n\
            };\n\
            return value.map(padZero).join(':');\n\
          }\n\
        },\n\
        0x0008: 'GPSSatellites',\n\
        0x0009: {\n\
          'name': 'GPSStatus',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'A':\n\
                return 'Measurement in progress';\n\
              case 'V':\n\
                return 'Measurement Interoperability';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x000a: {\n\
          'name': 'GPSMeasureMode',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case '2':\n\
                return '2-dimensional measurement';\n\
              case '3':\n\
                return '3-dimensional measurement';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x000b: 'GPSDOP',\n\
        0x000c: {\n\
          'name': 'GPSSpeedRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'K':\n\
                return 'Kilometers per hour';\n\
              case 'M':\n\
                return 'Miles per hour';\n\
              case 'N':\n\
                return 'Knots';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x000d: 'GPSSpeed',\n\
        0x000e: {\n\
          'name': 'GPSTrackRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'T':\n\
                return 'True direction';\n\
              case 'M':\n\
                return 'Magnetic direction';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x000f: 'GPSTrack',\n\
        0x0010: {\n\
          'name': 'GPSImgDirectionRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'T':\n\
                return 'True direction';\n\
              case 'M':\n\
                return 'Magnetic direction';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0011: 'GPSImgDirection',\n\
        0x0012: 'GPSMapDatum',\n\
        0x0013: {\n\
          'name': 'GPSDestLatitudeRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'N':\n\
                return 'North latitude';\n\
              case 'S':\n\
                return 'South latitude';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0014: {\n\
          'name': 'GPSDestLatitude',\n\
          'description': function(value) {\n\
            return value[0] + value[1] / 60 + value[2] / 3600;\n\
          }\n\
        },\n\
        0x0015: {\n\
          'name': 'GPSDestLongitudeRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'E':\n\
                return 'East longitude';\n\
              case 'W':\n\
                return 'West longitude';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0016: {\n\
          'name': 'GPSDestLongitude',\n\
          'description': function(value) {\n\
            return value[0] + value[1] / 60 + value[2] / 3600;\n\
          }\n\
        },\n\
        0x0017: {\n\
          'name': 'GPSDestBearingRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'T':\n\
                return 'True direction';\n\
              case 'M':\n\
                return 'Magnetic direction';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x0018: 'GPSDestBearing',\n\
        0x0019: {\n\
          'name': 'GPSDestDistanceRef',\n\
          'description': function(value) {\n\
            switch (value.join('')) {\n\
              case 'K':\n\
                return 'Kilometers';\n\
              case 'M':\n\
                return 'Miles';\n\
              case 'N':\n\
                return 'Knots';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        },\n\
        0x001a: 'GPSDestDistance',\n\
        0x001b: {\n\
          'name': 'GPSProcessingMethod',\n\
          'description': function(value) {\n\
            switch (value.slice(0, 8).map(function(charCode) {\n\
                  return String.fromCharCode(charCode);\n\
                }).join('')) {\n\
              case 'ASCII\\x00\\x00\\x00':\n\
                return value.slice(8, value.length).map(function(charCode) {\n\
                  return String.fromCharCode(charCode);\n\
                }).join('');\n\
              case 'JIS\\x00\\x00\\x00\\x00\\x00':\n\
                return '[JIS encoded text]';\n\
              case 'UNICODE\\x00':\n\
                return '[Unicode encoded text]';\n\
              case '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00':\n\
                return '[Undefined encoding]';\n\
            }\n\
          }\n\
        },\n\
        0x001c: {\n\
          'name': 'GPSAreaInformation',\n\
          'description': function(value) {\n\
            switch (value.slice(0, 8).map(function(charCode) {\n\
                  return String.fromCharCode(charCode);\n\
                }).join('')) {\n\
              case 'ASCII\\x00\\x00\\x00':\n\
                return value.slice(8, value.length).map(function(charCode) {\n\
                  return String.fromCharCode(charCode);\n\
                }).join('');\n\
              case 'JIS\\x00\\x00\\x00\\x00\\x00':\n\
                return '[JIS encoded text]';\n\
              case 'UNICODE\\x00':\n\
                return '[Unicode encoded text]';\n\
              case '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00':\n\
                return '[Undefined encoding]';\n\
            }\n\
          }\n\
        },\n\
        0x001d: 'GPSDateStamp',\n\
        0x001e: {\n\
          'name': 'GPSDifferential',\n\
          'description': function(value) {\n\
            switch (value) {\n\
              case 0:\n\
                return 'Measurement without differential correction';\n\
              case 1:\n\
                return 'Differential correction applied';\n\
              default:\n\
                return 'Unknown';\n\
            }\n\
          }\n\
        }\n\
      },\n\
      'interoperability': {\n\
        0x0001: 'InteroperabilityIndex',\n\
        0x0002: 'UnknownInteroperabilityTag0x0002',\n\
        0x1001: 'UnknownInteroperabilityTag0x1001',\n\
        0x1002: 'UnknownInteroperabilityTag0x1002'\n\
      }\n\
    };\n\
\n\
    /*\n\
    # Gets the image's value of the tag with the given name.\n\
    #\n\
    # name string The name of the tag to get the value of\n\
    #\n\
    # Returns the value of the tag with the given name if it exists,\n\
    # otherwise throws \"Undefined\".\n\
    */\n\
\n\
\n\
    ExifReader.prototype.getTagValue = function(name) {\n\
      if (this._tags[name] != null) {\n\
        return this._tags[name].value;\n\
      } else {\n\
        return void 0;\n\
      }\n\
    };\n\
\n\
    /*\n\
    # Gets the image's description of the tag with the given name.\n\
    #\n\
    # name string The name of the tag to get the description of\n\
    #\n\
    # Returns the description of the tag with the given name if it exists,\n\
    # otherwise throws \"Undefined\".\n\
    */\n\
\n\
\n\
    ExifReader.prototype.getTagDescription = function(name) {\n\
      if (this._tags[name] != null) {\n\
        return this._tags[name].description;\n\
      } else {\n\
        return void 0;\n\
      }\n\
    };\n\
\n\
    /*\n\
    # Gets all the image's tags.\n\
    #\n\
    # Returns the image's tags as an associative array: name -> description.\n\
    */\n\
\n\
\n\
    ExifReader.prototype.getAllTags = function() {\n\
      return this._tags;\n\
    };\n\
\n\
    return ExifReader;\n\
\n\
  })();\n\
\n\
}).call(this);\n\
//@ sourceURL=component-exif/js/ExifReader.js"
));
require.register("component-exif/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var ExifReader = require('./js/ExifReader').ExifReader;\n\
\n\
/**\n\
 * Parse EXIF tags in `buf`.\n\
 *\n\
 * @param {ArrayBuffer} buf\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(buf){\n\
  var exif = new ExifReader;\n\
  exif.load(buf);\n\
  var tags = exif.getAllTags();\n\
  var out = {};\n\
\n\
  for(var tag in tags) {\n\
    out[spaces(tag)] = tags[tag].value;\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Convert camel-case to lowercase words\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function spaces(str) {\n\
  return str.replace(/([A-Z][a-z])|([a-z][A-Z])|([A-Z])/g, function(m) {\n\
    return (1 == m.length)\n\
      ? m.toLowerCase()\n\
      : (m[0] == m[0].toUpperCase()) ? ' ' + m.toLowerCase() : m[0] + ' ' + m[1].toLowerCase()\n\
  }).replace(/^\\s+|\\s+$/g, '');\n\
}\n\
//@ sourceURL=component-exif/index.js"
));
require.register("component-file/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var file = require('./file')\n\
  , reader = require('./reader');\n\
\n\
/**\n\
 * Expose `file()`.\n\
 */\n\
\n\
exports = module.exports = file;\n\
\n\
/**\n\
 * Expose `reader()`.\n\
 */\n\
\n\
exports.reader = reader;//@ sourceURL=component-file/index.js"
));
require.register("component-file/file.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , Reader = require('./reader');\n\
\n\
/**\n\
 * Expose `file()`.\n\
 */\n\
\n\
module.exports = file;\n\
\n\
/**\n\
 * Initialize a new `File` wrapping `file`.\n\
 *\n\
 * @param {File} file\n\
 * @return {File}\n\
 * @api public\n\
 */\n\
\n\
function file(file) {\n\
  return new File(file);\n\
}\n\
\n\
/**\n\
 * Initialize a new `File` wrapper.\n\
 *\n\
 * @param {File} file\n\
 * @api private\n\
 */\n\
\n\
function File(file) {\n\
  Emitter.call(this);\n\
  this.file = file;\n\
  for (var key in file) this[key] = file[key];\n\
}\n\
\n\
/**\n\
 * Inherits from `Emitter.prototype`.\n\
 */\n\
\n\
Emitter(File.prototype);\n\
\n\
/**\n\
 * Check if the mime type matches `type`.\n\
 *\n\
 * Examples:\n\
 *\n\
 *    file.is('image/jpeg')\n\
 *    file.is('image/*')\n\
 *\n\
 * @param {String} type\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
File.prototype.is = function(type){\n\
  var real = this.file.type;\n\
\n\
  // identical\n\
  if (type == real) return true;\n\
\n\
  real = real.split('/');\n\
  type = type.split('/');\n\
\n\
  // type/*\n\
  if (type[0] == real[0] && type[1] == '*') return true;\n\
\n\
  // */subtype\n\
  if (type[1] == real[1] && type[0] == '*') return true;\n\
\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Convert to `type` and invoke `fn(err, result)`.\n\
 *\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @return {Reader}\n\
 * @api private\n\
 */\n\
\n\
File.prototype.to = function(type, fn){\n\
  if (!window.FileReader) return fn();\n\
  var reader = Reader();\n\
  reader.on('error', fn);\n\
  reader.on('end', function(res){ fn(null, res) });\n\
  reader.read(this.file, type);\n\
  return reader;\n\
};\n\
\n\
/**\n\
 * Convert to an `ArrayBuffer`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Reader}\n\
 * @api public\n\
 */\n\
\n\
File.prototype.toArrayBuffer = function(fn){\n\
  return this.to('ArrayBuffer', fn);\n\
};\n\
\n\
/**\n\
 * Convert to text.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Reader}\n\
 * @api public\n\
 */\n\
\n\
File.prototype.toText = function(fn){\n\
  // TODO: encoding\n\
  return this.to('Text', fn);\n\
};\n\
\n\
/**\n\
 * Convert to a data uri.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Reader}\n\
 * @api public\n\
 */\n\
\n\
File.prototype.toDataURL = function(fn){\n\
  return this.to('DataURL', fn);\n\
};\n\
//@ sourceURL=component-file/file.js"
));
require.register("component-file/reader.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
\n\
/**\n\
 * Expose `reader()`.\n\
 */\n\
\n\
module.exports = reader;\n\
\n\
/**\n\
 * Initialize a new `Reader` from optional `reader`\n\
 * or a new `FileReader` is created.\n\
 *\n\
 * @param {FileReader} reader\n\
 * @return {Reader}\n\
 * @api public\n\
 */\n\
\n\
function reader(reader) {\n\
  return reader\n\
    ? new Reader(reader)\n\
    : new Reader(new FileReader);\n\
}\n\
\n\
/**\n\
 * Initialize a new `Reader`, a wrapper\n\
 * around a `FileReader`.\n\
 *\n\
 * Emits:\n\
 *\n\
 *   - `error` an error occurred\n\
 *   - `progress` in progress (`e.percent` etc)\n\
 *   - `end` read is complete\n\
 *\n\
 * @param {FileReader} reader\n\
 * @api private\n\
 */\n\
\n\
function Reader(reader) {\n\
  Emitter.call(this);\n\
  this.reader = reader;\n\
  reader.onerror = this.emit.bind(this, 'error');\n\
  reader.onabort = this.emit.bind(this, 'error', new Error('abort'));\n\
  reader.onprogress = this.onprogress.bind(this);\n\
  reader.onload = this.onload.bind(this);\n\
}\n\
\n\
/**\n\
 * Inherits from `Emitter.prototype`.\n\
 */\n\
\n\
Emitter(Reader.prototype);\n\
\n\
/**\n\
 * Onload handler.\n\
 * \n\
 * @api private\n\
 */\n\
\n\
Reader.prototype.onload = function(e){\n\
  this.emit('end', this.reader.result);\n\
};\n\
\n\
/**\n\
 * Progress handler.\n\
 * \n\
 * @api private\n\
 */\n\
\n\
Reader.prototype.onprogress = function(e){\n\
  e.percent = e.loaded / e.total * 100 | 0;\n\
  this.emit('progress', e);\n\
};\n\
\n\
/**\n\
 * Abort.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Reader.prototype.abort = function(){\n\
  this.reader.abort();\n\
};\n\
\n\
/**\n\
 * Read `file` as `type`.\n\
 *\n\
 * @param {File} file\n\
 * @param {String} type\n\
 * @api private\n\
 */\n\
\n\
Reader.prototype.read = function(file, type){\n\
  var method = 'readAs' + type;\n\
  this.reader[method](file);\n\
};\n\
\n\
//@ sourceURL=component-file/reader.js"
));
require.register("image-viewer/view.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var objecturl = require('object-url');\n\
var Upload = require('upload');\n\
var drop = require('drop-anywhere');\n\
var filepicker = require('file-picker');\n\
var File = require('file');\n\
var PPI = require('ppi');\n\
var os = require('os');\n\
var logger = document.querySelector('.log');\n\
var log = require('./logger')(logger);\n\
var Exif = require('exif');\n\
\n\
/**\n\
 * OS\n\
 */\n\
\n\
var dppi = {\n\
  mac: 72,\n\
  windows: 96,\n\
  linux: 96\n\
};\n\
\n\
var dpr = dppi[os];\n\
\n\
/**\n\
 * Wrapper\n\
 */\n\
\n\
var wrapper = document.querySelector('.img-wrapper');\n\
\n\
/**\n\
 * Click on upload button\n\
 */\n\
\n\
var uploadBtn = document.querySelector('.upload-btn');\n\
uploadBtn.onclick = function() {\n\
  filepicker(function(items) {\n\
    create(items[0]);\n\
  });\n\
};\n\
\n\
logger.onclick = function() {\n\
  logger.classList.toggle('hide');\n\
};\n\
\n\
/**\n\
 * Initialize drop anywhere\n\
 */\n\
\n\
drop(function(e) {\n\
  var item = e.items[0];\n\
  create(item);\n\
});\n\
\n\
/**\n\
 * Create the image\n\
 */\n\
\n\
function create(item) {\n\
  var clientExif;\n\
  if (!item) return;\n\
  logger.innerHTML = '';\n\
  log('object url', 'fetching for ' + item.name);\n\
\n\
  // image\n\
  var image = img(item);\n\
\n\
  exif(item, function(err, obj) {\n\
    if (!err) resize(image, obj);\n\
    log('exifreader (client) output', err || JSON.stringify(obj, true, 2));\n\
    wrapper.innerHTML = '';\n\
    wrapper.appendChild(image);\n\
  })\n\
\n\
  // fetch exif\n\
  // up(item, function(obj) {\n\
\n\
  // });\n\
}\n\
\n\
/**\n\
 * Upload the file\n\
 */\n\
\n\
function up(file, fn) {\n\
  var upload = Upload(file);\n\
  upload.to('/upload');\n\
  upload.on('end', function(res) {\n\
    fn(JSON.parse(res.responseText));\n\
  });\n\
}\n\
\n\
/**\n\
 * Create an image\n\
 */\n\
\n\
function img(file) {\n\
  var url = objecturl.create(file);\n\
  var img = document.createElement('img');\n\
  img.src = url;\n\
  return img;\n\
}\n\
\n\
/**\n\
 * Resize based on computer's resolution\n\
 */\n\
\n\
function resize(img, exif) {\n\
  log('original size', img.width + ' x ' + img.height);\n\
\n\
  var ppi = PPI(exif) || dpr;\n\
  log('image ppi', ppi);\n\
  var ratio = dpr / ppi;\n\
  log('resize ratio', ratio);\n\
  img.width *= ratio;\n\
  img.height *= ratio;\n\
\n\
  log('after resize', img.width + ' x ' + img.height);\n\
}\n\
\n\
/**\n\
 * File slice helper.\n\
 */\n\
\n\
function slice(file, a, b) {\n\
  file.slice = file.slice || file.webkitSlice || file.mozSlice;\n\
  if (!file.slice) return file;\n\
  return file.slice(a, b);\n\
}\n\
\n\
/**\n\
 * Parse the exif\n\
 */\n\
\n\
function exif(item, fn) {\n\
  var file = new File(item);\n\
  file.toArrayBuffer(function(err, buf){\n\
    if (err) return fn(err);\n\
    var obj;\n\
    try {\n\
      obj = Exif(buf);\n\
    } catch (err) {\n\
      return fn(err);\n\
    }\n\
\n\
    return fn(null, obj);\n\
  });\n\
}\n\
//@ sourceURL=image-viewer/view.js"
));
require.register("image-viewer/logger.js", Function("exports, require, module",
"/**\n\
 * Expose `log`\n\
 */\n\
\n\
module.exports = function(el) {\n\
  return function(header, str) {\n\
    var div = document.createElement('div');\n\
    div.innerHTML = '<strong>' + header + '</strong>: ' + str;\n\
    el.appendChild(div);\n\
  }\n\
};\n\
//@ sourceURL=image-viewer/logger.js"
));






















require.alias("component-object-url/index.js", "image-viewer/deps/object-url/index.js");
require.alias("component-object-url/index.js", "image-viewer/deps/object-url/index.js");
require.alias("component-object-url/index.js", "object-url/index.js");
require.alias("component-object-url/index.js", "component-object-url/index.js");
require.alias("component-upload/index.js", "image-viewer/deps/upload/index.js");
require.alias("component-upload/index.js", "upload/index.js");
require.alias("component-emitter/index.js", "component-upload/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-drop-anywhere/index.js", "image-viewer/deps/drop-anywhere/index.js");
require.alias("component-drop-anywhere/index.js", "drop-anywhere/index.js");
require.alias("component-classes/index.js", "component-drop-anywhere/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-events/index.js", "component-drop-anywhere/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-drop/index.js", "component-drop-anywhere/deps/drop/index.js");
require.alias("component-classes/index.js", "component-drop/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-events/index.js", "component-drop/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-normalized-upload/index.js", "component-drop/deps/normalized-upload/index.js");
require.alias("component-normalized-upload/index.js", "component-drop/deps/normalized-upload/index.js");
require.alias("component-normalized-upload/index.js", "component-normalized-upload/index.js");
require.alias("component-file-picker/index.js", "image-viewer/deps/file-picker/index.js");
require.alias("component-file-picker/index.js", "file-picker/index.js");
require.alias("component-event/index.js", "component-file-picker/deps/event/index.js");

require.alias("matthewmueller-ppi/index.js", "image-viewer/deps/ppi/index.js");
require.alias("matthewmueller-ppi/index.js", "image-viewer/deps/ppi/index.js");
require.alias("matthewmueller-ppi/index.js", "ppi/index.js");
require.alias("matthewmueller-ppi/index.js", "matthewmueller-ppi/index.js");
require.alias("component-os/index.js", "image-viewer/deps/os/index.js");
require.alias("component-os/index.js", "os/index.js");

require.alias("component-exif/js/ExifReader.js", "image-viewer/deps/exif/js/ExifReader.js");
require.alias("component-exif/index.js", "image-viewer/deps/exif/index.js");
require.alias("component-exif/index.js", "image-viewer/deps/exif/index.js");
require.alias("component-exif/index.js", "exif/index.js");
require.alias("component-exif/index.js", "component-exif/index.js");
require.alias("component-file/index.js", "image-viewer/deps/file/index.js");
require.alias("component-file/file.js", "image-viewer/deps/file/file.js");
require.alias("component-file/reader.js", "image-viewer/deps/file/reader.js");
require.alias("component-file/index.js", "file/index.js");
require.alias("component-emitter/index.js", "component-file/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("image-viewer/view.js", "image-viewer/index.js");