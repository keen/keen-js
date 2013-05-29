/**
 * Keen IO JavaScript Library
 * Version: 2.1.0
 */

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


// SPIN.JS v1.3
// Keen IO Customizes defaults in spin.js
//fgnass.github.com/spin.js#v1.3

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    if(s[prop] !== undefined) return prop
    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  // Built-in defaults
  // Keen modifications

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto',         // center horizontally
    position: 'relative'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    if (typeof this == 'undefined') return new Spinner(o)
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width
        , ep // element position
        , tp // target position

      if (target) {
        target.insertBefore(el, target.firstChild||null)
        tp = pos(target)
        ep = pos(el)
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid)  + 'px'
        })
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))

        ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: o.color, opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

var Keen = Keen || {};

(function() {

    // deal with some browsers not supporting console.log
    var alertFallback = false; //only use in dev
    if (typeof console === "undefined" || typeof console.log === "undefined") {
        console = {};
        if (alertFallback) {
            console.log = function(msg) {
                alert(msg);
            };
        } else {
            console.log = function() {};
        }
    }

    /*
     * -----------INHERITANCE STUFF-----------
     *
     * This is to give us inheritance capabilities in vanilla javascript.
     *
     * Docs: http://dean.edwards.name/weblog/2006/03/base/
     * Base.js, version 1.1a
     * Copyright 2006-2010, Dean Edwards
     * License: http://www.opensource.org/licenses/mit-license.php
     */

    var Base = function() {
        // dummy
    };

    Base.extend = function(_instance, _static) { // subclass
        var extend = Base.prototype.extend;

        // build the prototype
        Base._prototyping = true;
        var proto = new this;
        extend.call(proto, _instance);
        proto.base = function() {
            // call this method from any other method to invoke that method's ancestor
        };
        delete Base._prototyping;

        // create the wrapper for the constructor function
        //var constructor = proto.constructor.valueOf(); //-dean
        var constructor = proto.constructor;
        var klass = proto.constructor = function() {
            if (!Base._prototyping) {
                if (this._constructing || this.constructor == klass) { // instantiation
                    this._constructing = true;
                    constructor.apply(this, arguments);
                    delete this._constructing;
                } else if (arguments[0] != null) { // casting
                    return (arguments[0].extend || extend).call(arguments[0], proto);
                }
            }
        };

        // build the class interface
        klass.ancestor = this;
        klass.extend = this.extend;
        klass.forEach = this.forEach;
        klass.implement = this.implement;
        klass.prototype = proto;
        klass.toString = this.toString;
        klass.valueOf = function(type) {
            //return (type == "object") ? klass : constructor; //-dean
            return (type == "object") ? klass : constructor.valueOf();
        };
        extend.call(klass, _static);
        // class initialisation
        if (typeof klass.init == "function") klass.init();
        return klass;
    };

    Base.prototype = {
        extend: function(source, value) {
            if (arguments.length > 1) { // extending with a name/value pair
                var ancestor = this[source];
                if (ancestor && (typeof value == "function") && // overriding a method?
                    // the valueOf() comparison is to avoid circular references
                    (!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
                    /\bbase\b/.test(value)) {
                    // get the underlying method
                    var method = value.valueOf();
                    // override
                    value = function() {
                        var previous = this.base || Base.prototype.base;
                        this.base = ancestor;
                        var returnValue = method.apply(this, arguments);
                        this.base = previous;
                        return returnValue;
                    };
                    // point to the underlying method
                    value.valueOf = function(type) {
                        return (type == "object") ? value : method;
                    };
                    value.toString = Base.toString;
                }
                this[source] = value;
            } else if (source) { // extending with an object literal
                var extend = Base.prototype.extend;
                // if this object has a customised extend method then use it
                if (!Base._prototyping && typeof this != "function") {
                    extend = this.extend || extend;
                }
                var proto = {toSource: null};
                // do the "toString" and other methods manually
                var hidden = ["constructor", "toString", "valueOf"];
                // if we are prototyping then include the constructor
                var i = Base._prototyping ? 0 : 1;
                while (key = hidden[i++]) {
                    if (source[key] != proto[key]) {
                        extend.call(this, key, source[key]);

                    }
                }
                // copy each of the source object's properties to this object
                for (var key in source) {
                    if (!proto[key]) extend.call(this, key, source[key]);
                }
            }
            return this;
        }
    };

    // initialise
    Base = Base.extend({
        constructor: function() {
            this.extend(arguments[0]);
        }
    }, {
        ancestor: Object,
        version: "1.1",

        forEach: function(object, block, context) {
            for (var key in object) {
                if (this.prototype[key] === undefined) {
                    block.call(context, object[key], key, object);
                }
            }
        },

        implement: function() {
            for (var i = 0; i < arguments.length; i++) {
                if (typeof arguments[i] == "function") {
                    // if it's a function, call it
                    arguments[i](this.prototype);
                } else {
                    // add the interface using the extend method
                    this.prototype.extend(arguments[i]);
                }
            }
            return this;
        },

        toString: function() {
            return String(this.valueOf());
        }
    });

//-------KEEN OBJECT-----------

    /**
     * Configure the Keen IO JS Library with a Project ID and API Keys.
     * @param config object a config object that contains the project ID and
     *                      optional keys.
     *                      projectId -> the Keen IO Project ID
     *                      writeKey -> a Keen IO Scoped Write Key
     *                      readKey -> a Keen IO Scoped Read Key
     */
    Keen.configure = function (config) {
        this.client = new Keen.Client(config);
        return this.client;
    };

    /**
     * Add an event to Keen IO.
     * @param eventCollection string, the name of the event collection
     * @param event object, the actual event to send
     * @param success function (optional), invoked on success
     * @param error function (optional), invoked on failure
     */
    Keen.addEvent = function (eventCollection, event, success, error) {
        if (this.client) {
            this.client.uploadEvent(eventCollection, event, success, error);
        }
    };

    /**
     * Retrieve an array of event collection names and their properties
     * @param success function (optional), invoked on success
     * @param error function (optional), invoked on failure
     */
    Keen.getEventCollections = function(success, error) {
        var url = this.client.getKeenUrl("/events");
        this.client.getJSON(url, success, error);
    };

    /**
     * Retrieve the properties of a given event collection
     * @param eventCollection string, name of the event collection
     * @param success function (optional), invoked on success
     * @param error function (optional), invoked on failure
     */
    Keen.getEventCollectionProperties = function (eventCollection, success, error) {
        var url = this.client.getKeenUrl("/events/" + eventCollection);
        this.client.getJSON(url, success, error);
    };

    /**
     * Sets the global properties to use.
     * @param newGlobalProperties a function
     */
    Keen.setGlobalProperties = function (newGlobalProperties) {
        if (this.client) {
            if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
                this.client.globalProperties = newGlobalProperties;
            } else {
                throw new Error("Invalid value for global properties: " + newGlobalProperties);
            }
        }
    };

    Keen.addChartsReadyHandler = function(handler) {
        if(typeof(this.chartsReadyHandlers) == "undefined") {
            this.chartsReadyHandlers = [];
        }

        this.chartsReadyHandlers.push(handler);

        // If charts are already loaded, call all of the handlers
        if(this.chartsReady) {
            this.runChartsReadyHandlers();
        }
    };

    Keen.onChartsReady = function(handler) {
        if(this.chartsReady) {
            handler();
        }
        else {
            this.addChartsReadyHandler(handler);
            this.loadChartsDependencies();
        }
    };

    Keen.runChartsReadyHandlers = function() {
        _.each(this.chartsReadyHandlers, function(handler) {
            handler();
        }, this)
    };

    Keen.loadChartsDependencies = function() {

        if(this.startedLoadingChartsDependencies) {
            return;
        }

        this.startedLoadingChartsDependencies = true;

        // stolen and componentized from https://gist.github.com/603980
        var loadScript = function (url, callback) {
            var oDOC = document;
            var handler;
            var head = oDOC.head || oDOC.getElementsByTagName("head");

            // loading code borrowed directly from LABjs itself
            setTimeout(function () {
                if ("item" in head) { // check if ref is still a live node list
                    if (!head[0]) { // append_to node not yet ready
                        setTimeout(arguments.callee, 25);
                        return;
                    }
                    head = head[0]; // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
                }
                var scriptElem = oDOC.createElement("script"),
                    scriptdone = false;
                scriptElem.onload = scriptElem.onreadystatechange = function () {
                    if ((scriptElem.readyState && scriptElem.readyState !== "complete" && scriptElem.readyState !== "loaded") || scriptdone) {
                        return false;
                    }
                    scriptElem.onload = scriptElem.onreadystatechange = null;
                    scriptdone = true;
                    callback();
                };
                scriptElem.src = url;
                head.insertBefore(scriptElem, head.firstChild);
            }, 0);

            // required: shim for FF <= 3.5 not having document.readyState
            if (oDOC.readyState == null && oDOC.addEventListener) {
                oDOC.readyState = "loading";
                oDOC.addEventListener("DOMContentLoaded", handler = function () {
                    oDOC.removeEventListener("DOMContentLoaded", handler, false);
                    oDOC.readyState = "complete";
                }, false);
            }
        };

        var keenReference = this;
        var finalCallback = function() {
            keenReference.chartsReady = true;
            keenReference.runChartsReadyHandlers();
        };

        var loadGoogleVis = function() {

            if(typeof google === 'undefined'){
                console.log("Problem loading visualizations.  Please contact us!");
            }
            else{
                google.load('visualization', '1.0', {
                    packages: ['corechart'],
                    callback: finalCallback
                });
            }
        };

        loadScript("https://www.google.com/jsapi", function() {
            if(typeof(_) == "undefined") {
                loadScript("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore-min.js", loadGoogleVis);
            }
            else {
                loadGoogleVis();
            }
        });
    };

    // KEEN CLIENT OBJECT

    Keen.Client = function (config) {
        this.projectId = config.projectId;
        this.writeKey = config.writeKey;
        this.readKey = config.readKey;
        this.globalProperties = null;
        this.keenUrl = "https://api.keen.io";
        if(config !== undefined && config.keenUrl !== undefined){
            this.keenUrl = config.keenUrl;
        }
    };

    /**
     * Uploads a single event to the Keen IO servers.
     * @param eventCollection string, the name of the event collection to use
     * @param event JS object, the actual event to send
     * @param success optional function, invoked on success
     * @param error optional function, invoked on failure
     */
    Keen.Client.prototype.uploadEvent = function (eventCollection, event, success, error) {
        var url = this.getKeenUrl("/events/" + eventCollection);

        // handle global properties
        var newEvent = {};
        if (this.globalProperties) {
            newEvent = this.globalProperties(eventCollection);
        }
        // now add in the properties from the user-defined event
        for (var property in event) {
            if (event.hasOwnProperty(property)) {
                newEvent[property] = event[property];
            }
        }

        if (supportsXhr()) {
          sendXhr("POST", url, null, newEvent, this.writeKey, success, error);
        } else {
          var jsonBody = JSON.stringify(newEvent);
          var base64Body = Keen.Base64.encode(jsonBody);
          url = url + "?api_key=" + this.writeKey;
          url = url + "&data=" + base64Body;
          url = url + "&modified=" + new Date().getTime();
          sendJsonpRequest(url, null, success, error);
        }
    };

    /**
     * Returns a full URL by appending the provided path to the root Keen IO URL.
     * @param path
     * @return {String}
     */
    Keen.Client.prototype.getKeenUrl = function (path) {
        return this.keenUrl + "/3.0/projects/" + this.projectId + path;
    };

    function supportsXhr() {
      return "withCredentials" in new XMLHttpRequest();
    }

    function sendXhr(method, url, headers, body, apiKey, success, error) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                  var response;
                  try {
                      response = JSON.parse(xhr.responseText);
                  } catch (e) {
                      console.log("Could not JSON parse HTTP response: " + xhr.responseText);
                      if (error) {
                          error(xhr, e);
                      }
                  }

                  if (response) {
                      if (success) {
                          success(response);
                      }
                  }
              } else {
                  console.log("HTTP request failed.");
                  if (error) {
                      error(xhr, null);
                  }
              }
          }
      };

      xhr.open(method, url, true);

      if (apiKey){
          xhr.setRequestHeader("Authorization", apiKey);
      }
      if (body) {
          xhr.setRequestHeader("Content-Type", "application/json");
      }
      if (headers) {
          for (var headerName in headers) {
              if (headers.hasOwnProperty(headerName)) {
                  xhr.setRequestHeader(headerName, headers[headerName]);
              }
          }
      }

      var toSend = body ? JSON.stringify(body) : null;
      xhr.send(toSend);
    }

    function sendJsonpRequest(url, apiKey, success, error) {
      // have to fall back to JSONP for GET and sending data base64 encoded for POST

      // add api_key if it's not there
      if (apiKey && url.indexOf("api_key") < 0) {
          var delimiterChar = url.indexOf("?") > 0 ? "&" : "?";
          url = url + delimiterChar + "api_key=" + apiKey;
      }

      // do JSONP
      var callbackName = "keenJSONPCallback" + new Date().getTime();
      while (callbackName in window) {
          callbackName += "a";
      }

      var loaded = false;
      window[callbackName] = function (response) {
          loaded = true;

          if (success && response) {
              success(response);
          }

          // now remove this from the namespace
          window[callbackName] = undefined;
      };

      url = url + "&jsonp=" + callbackName;
      var script = document.createElement("script");
      script.id = "keen-jsonp";
      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);

      // for early IE w/ no onerror event
      script.onreadystatechange = function() {
        if (loaded === false && this.readyState === "loaded") {
          loaded = true;
          if (error) {
            error();
          }
        }
      }

      // non-ie, etc
      script.onerror = function() {
        if (loaded === false) { // on IE9 both onerror and onreadystatechange are called
          loaded = true;
          if (error) {
            error();
          }
        }
      }
    }

    /**
     * Asynchronously sends an HTTP GET via XHR or JSONP
     *
     * Automatically sets the Content-Type of the request to "application/json" and sets the Authorization
     * header.
     *
     * @param url what URL to send the request to
     * @param success optional callback for success
     * @param error optional callback for error
     */
    Keen.Client.prototype.getJSON = function (url, success, error) {
      if (supportsXhr()) {
        sendXhr("GET", url, null, null, this.readKey, success, error);
      } else {
        sendJsonpRequest(url, this.readKey, success, error);
      }
    };

    /**
     *
     *  Base64 encode / decode
     *  http://www.webtoolkit.info/
     *
     **/
    Keen.Base64 = {
        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Keen.Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    Keen.Base64._keyStr.charAt(enc1) + Keen.Base64._keyStr.charAt(enc2) +
                    Keen.Base64._keyStr.charAt(enc3) + Keen.Base64._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = Keen.Base64._keyStr.indexOf(input.charAt(i++));
                enc2 = Keen.Base64._keyStr.indexOf(input.charAt(i++));
                enc3 = Keen.Base64._keyStr.indexOf(input.charAt(i++));
                enc4 = Keen.Base64._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Keen.Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }
            return string;
        }
    };

    // handle any queued commands
    if (Keen._cf) {
        Keen.configure(Keen._cf);
        Keen._cf = null;
    }
    if (Keen._gp) {
        Keen.setGlobalProperties(Keen._gp);
        Keen._gp = null;
    }
    if (Keen._eq && Keen._eq.length > 0) {
        for (var i = 0; i < Keen._eq.length; i++) {
            var eventCollection = Keen._eq[i].shift();
            var event = Keen._eq[i].shift();
            var success = Keen._eq[i].shift();
            var error = Keen._eq[i].shift();
            Keen.addEvent(eventCollection, event, success, error);
        }
        Keen._eq = null;
    }
    if (Keen._ocrq && Keen._ocrq.length > 0) {
        for (var i = 0; i < Keen._ocrq.length; i++) {
            var onChartsReadyHandler = Keen._ocrq[i];
            Keen.onChartsReady(onChartsReadyHandler);
        }
        Keen._ocrq = null;
    }

    /**
     * Base Visualization - Inherited by all visualizations
     */
    Keen.BaseVisualization = Base.extend({});

    /**
     * Gets the label for the visualization.
     *
     * If none is provided in the options, it will use the queryName for saved
     * queries or the analysis type + event collection for ad hoc queries.
     */
    Keen.BaseVisualization.prototype.getLabel = function(){

        if(_.isUndefined(this.options.label) || this.options.label == null) {

            if(_.isUndefined(this.query.queryName)){
                var label = "";
                label += this.query.attributes.analysisType;
                label += " - ";
                label += this.query.attributes.eventCollection;
                return label;
            }
            else{
                return this.query.queryName;
            }
        }
        else {
            return this.options.label;
        }
    };

    /**
     * Number - A class to display the results of a metric.
     *
     * @param query a query object (either a Keen.Metric or Keen.SavedQuery)
     * @param options the options used to style the visualization (defaults are provided)
     */
    Keen.Number = Keen.BaseVisualization.extend({
        constructor : function(query, options){
            this.query = query;

            //These are the supported options and their default values.
            this.options = {
                height : "150px",
                width : "300px",
                "font-family" : "'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: "white",
                "border-radius" : "0px",
                "number-background-color" : "#7dcc77",
                "label-background-color" : "#9CD898",
                "prefix" : "",
                "suffix" : ""
            };

            this.options = _.extend(this.options, options);
        }
    });

    /**
     * Draws a Number visualization
     *
     * @param element the HTML element in which to put the visualization
     * @param response an optional param to pass the results of a Query directly into a visualization
     */
    Keen.Number.prototype.draw = function(element, response){

        var value = function(val){
            return +val.replace(/[^\d.-]+/gi, '');
        };

        var units = function(val){
            return val.replace(/[^A-Za-z%]+/gi, '');
        };

        element.innerHTML = "";

        //Create a div inside the element.
        var parentDiv = document.createElement("div");
        element.appendChild(parentDiv);

        //Place appropriate styles on it.
        parentDiv.style.width = this.options.width;
        parentDiv.style.height = this.options.height;
        parentDiv.style.display = "block";
        parentDiv.style.textAlign = "center";
        parentDiv.style.backgroundColor = this.options["number-background-color"];
        parentDiv.style.borderRadius = this.options["border-radius"];

        //Create the number element.
        var number = document.createElement("h1");
        parentDiv.appendChild(number);

        //Create the loading node
        var loading = document.createTextNode("Loading...");

        number.style.fontSize = ((value(this.options.height) * 8) / 15 * .5) + units(this.options.height);

        //Put it in the number.
        number.appendChild(loading);

        //Place appropriate styles on it.
        number.style.height = (value(this.options.height) * 2) / 3 + units(this.options.height);
        number.style.lineHeight = number.style.height;
        number.style.color = this.options.color;
        number.style.fontWeight = "bold";
        number.style.fontFamily = this.options["font-family"];
        number.style.margin = 0;
        number.style.padding = 0;
        number.style.textShadow = "none";

        //Create the label element.
        var label = document.createElement("h2");
        label.appendChild(document.createTextNode(this.getLabel()));
        parentDiv.appendChild(label);

        //Place appropriate styles on it.
        label.style.height = (value(this.options.height)) / 3 + units(this.options.height);
        label.style.lineHeight = label.style.height;
        label.style.fontSize = ((value(this.options.height)) / 3) * .32 + units(this.options.height);
        label.style.color = number.style.color;
        label.style.textTransform = "uppercase";
        label.style.fontWeight = "normal";
        label.style.fontFamily = number.style.fontFamily;
        label.style.margin = 0;
        label.style.padding = 0;
        label.style.borderTop = "1px solid";
        label.style.borderTopColor = this.options.color;
        label.style.backgroundColor = this.options["label-background-color"];
        label.style.textShadow = "none";

        var drawIt = _.bind(function(response){

            this.data = response.result;
            if(this.data == null){
                this.data = 0;
            }

            //Populate the number element
            number.replaceChild(document.createTextNode(this.options.prefix + Keen.prettyNumber(this.data) + this.options.suffix), loading);
            number.style.fontSize = (value(this.options.height) * 8) / 15 + units(this.options.height);

            if(this.data == null){
                this.data = 0;
            }

        }, this);

        if(_.isUndefined(response)){
            this.query.getResponse(drawIt);
        }
        else{
            drawIt(response);
        }
    };

    /**
     * Line Chart - A class to display the results of a series.
     *
     * @param query a query object (either a Keen.Series or Keen.SavedQuery)
     * @param options the options used to style the visualization (defaults are provided)
     */
    Keen.LineChart = Keen.BaseVisualization.extend({
        constructor : function(query, options) {
            this.query = query;

            //This contains the supported options and their default values.
            this.options = {
                chartAreaHeight: null,
                chartAreaWidth: null,
                chartAreaLeft: null,
                chartAreaTop: null,
                height: 300,
                width: 600,
                lineWidth: 5,
                color: "#00afd7",
                backgroundColor: "white",
                title: null,
                label: null,
                xAxisLabel: null,
                yAxisLabel: null,
                showLegend: true,
                xAxisLabelAngle: null
            };
            this.options = _.extend(this.options, options);

            // If they didn't send a client in the options, default to the Keen global client
            if(_.isUndefined(this.options.client) ) {
                this.client = Keen.client;
            }
            else {
                this.client = this.options.client;
            }
        }
    });

    /**
     * Draws a LineChart visualization
     *
     * @param element the HTML element in which to put the visualization
     * @param response an optional param to pass the results of a Query directly into a visualization
     */
    Keen.LineChart.prototype.draw = function(element, response){

        element.innerHTML = "";

        //Apply the width to the div so that it takes up the correct amount of space from the beginning
        element.style.width = this.options.width + "px";
        element.style.height = this.options.height + "px";
        element.style.display = "block";
        Keen.showLoading(element);
        

        //Converts options from our exposed option format to the way google charts expects.
        var convertOptions = function(opts){
            var options = {};
            options.height = opts.height;
            options.width = opts.width;
            options.lineWidth = opts.lineWidth;
            options.colors = [opts.color];
            options.backgroundColor = opts.backgroundColor;
            options.title = opts.title;
            options["hAxis"] = {title: opts.xAxisLabel};
            options["vAxis"] = {title: opts.yAxisLabel, viewWindow: {min:0}};
            if(!opts.showLegend){
                options["legend"] = {position: "none"}
            }
            if(opts.xAxisLabelAngle != null){
                options["hAxis"]["slantedText"] = true;
                options["hAxis"]["slantedTextAngle"] = opts.xAxisLabelAngle;
            }
            options["chartArea"] = {
                left: opts.chartAreaLeft,
                top: opts.chartAreaTop,
                height: opts.chartAreaHeight,
                width: opts.chartAreaWidth
            };

            return options;
        };

        var drawIt = _.bind(function(response){

            this.data = response.result;

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Date");
            dataTable.addColumn("number", this.getLabel());
            dataTable.addRows(_.map(this.data, function(item) {
                var date = parseDate(item.timeframe.start);
                var dateString = createDateString(date, this.query.attributes.interval, this.query, response);
                if(item.value == null){
                    item.value = 0;
                }
                return [dateString, item.value];
            }, this));

            if(google){
                var chart = new google.visualization.AreaChart(element);
                //Convert options into Google Charts options.
                var chartOptions = convertOptions(this.options);
                chart.draw(dataTable, chartOptions);
            }
            else{
                console.log("Charting is not yet ready.  Are you waiting for onChartsReady?");
            }

        }, this);

        if(_.isUndefined(response)){
            this.query.getResponse(drawIt);
        }
        else{
            drawIt(response);
        }
    };

    /**
     * Multi-Line Chart - A class to display the results of a series.
     *
     * @param query a query object (either a Keen.Series or Keen.SavedQuery with a groupBy property)
     * @param options the options used to style the visualization (defaults are provided)
     */
    Keen.MultiLineChart = Keen.BaseVisualization.extend({
        constructor : function(query, options) {
            this.query = query;

            //This contains the supported options and their default values.
            this.options = {
                height: 300, //Number of pixels
                width: 600, //Number of pixels
                chartAreaHeight: null,
                chartAreaWidth: null,
                chartAreaLeft: null,
                chartAreaTop: null,
                title: null,
                showLegend: true,
                colors: null,
                lineWidth: 5,
                backgroundColor: "white",
                fontColor: "black",
                xAxisLabel: null,
                yAxisLabel: null,
                xAxisLabelAngle: null,
                labelMapping: {}
            };
            this.options = _.extend(this.options, options);

            // If they didn't send a client in the options, default to the Keen global client
            if(_.isUndefined(this.options.client) ) {
                this.client = Keen.client;
            }
            else {
                this.client = this.options.client;
            }
        }
    });

    /**
     * Draws a MultiLineChart visualization
     *
     * @param element the HTML element in which to put the visualization
     * @param response an optional param to pass the results of a Query directly into a visualization
     */
    Keen.MultiLineChart.prototype.draw = function(element, response){

        element.innerHTML = "";

        //Apply the width to the div so that it takes up the correct amount of space from the beginning
        element.style.width = this.options.width + "px";
        element.style.height = this.options.height + "px";
        element.style.display = "block";
        Keen.showLoading(element);


        //Converts options from our exposed option format to the way google charts expects.
        var convertOptions = function(opts){
            var options = {};
            options.height = opts.height;
            options.width = opts.width;
            options.lineWidth = opts.lineWidth;
            options.colors = opts.colors;
            options.backgroundColor = opts.backgroundColor;
            options.title = opts.title;
            options["hAxis"] = {title: opts.xAxisLabel};
            options["vAxis"] = {title: opts.yAxisLabel, viewWindow: {min:0}};
            if(!opts.showLegend){
                options["legend"] = {position: "none"}
            }
            if(opts.xAxisLabelAngle != null){
                options["hAxis"]["slantedText"] = true;
                options["hAxis"]["slantedTextAngle"] = opts.xAxisLabelAngle;
            }
            options["chartArea"] = {
                left: opts.chartAreaLeft,
                top: opts.chartAreaTop,
                height: opts.chartAreaHeight,
                width: opts.chartAreaWidth
            };

            return options;
        };

        var drawIt = _.bind(function(response){

            this.data = response.result;

            var groups = [];

            //Get the groups into an array.
            _.each(this.data[0].value, function(val){
                if(this.options.labelMapping[val[this.query.attributes.groupBy]] != null){
                    groups.push(this.options.labelMapping[val[this.query.attributes.groupBy]]);
                }
                else{
                    groups.push(val[this.query.attributes.groupBy]);
                }
            }, this);

            //This is to handle an empty chart scenario.
            if(groups.length == 0){
                groups.push(null);
                this.options.showLegend = false;
            }

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Date");

            _.each(groups, function(group){
                dataTable.addColumn("number", group);
            });

            _.each(this.data, function(item) {

                var result = [];

                var date = parseDate(item.timeframe.start);
                var dateString = createDateString(date, this.query.attributes.interval, this.query, response);

                result.push(dateString);

                _.each(item.value, function(value){
                    //Turn null into 0 for graphing purposes.
                    if(value["result"] == null){
                        value["result"] = 0;
                    }
                    result.push(value["result"]);
                }, this);

                //This is to handle an empty chart scenario.
                if(result.length == 1){
                    result.push(null);
                }

                dataTable.addRow(result);
            }, this);

            if(google){
                var chart = new google.visualization.LineChart(element);
                //Convert options into Google Charts options.
                var chartOptions = convertOptions(this.options);
                chart.draw(dataTable, chartOptions);
            }
            else{
                console.log("Charting is not yet ready.  Are you waiting for onChartsReady?");
            }

        }, this);

        if(_.isUndefined(response)){
            this.query.getResponse(drawIt);
        }
        else{
            drawIt(response);
        }
    };

    /**
     * PieChart - A class to display the results of a Metric with a groupBy attribute.
     *
     * @param query a query object (either a Keen.Metric or Keen.SavedQuery with a groupBy attribute)
     * @param options the options used to style the visualization (defaults are provided)
     */
    Keen.PieChart = Keen.BaseVisualization.extend({
        constructor : function(query, options) {
            this.query = query;

            //This contains the supported options and their default values.
            this.options = {
                height: 300, //Number of pixels
                width: 600, //Number of pixels
                chartAreaHeight: null,
                chartAreaWidth: null,
                chartAreaLeft: null,
                chartAreaTop: null,
                minimumSlicePercentage: "1",
                title: null,
                showLegend: true,
                colors: null,
                backgroundColor: "white",
                fontColor: "black",
                labelMapping: {}
            };
            this.options = _.extend(this.options, options);

            // If they didn't send a client in the options, default to the Keen global client
            if(_.isUndefined(this.options.client) ) {
                this.client = Keen.client;
            }
            else {
                this.client = this.options.client;
            }
        }
    });

    /**
     * Draws a PieChart visualization
     *
     * @param element the HTML element in which to put the visualization
     * @param response an optional param to pass the results of a Query directly into a visualization
     */
    Keen.PieChart.prototype.draw = function(element, response){

        element.innerHTML = "";

        //Apply the width to the div so that it takes up the correct amount of space from the beginning
        element.style.width = (this.options.width + "px");
        element.style.height = (this.options.height + "px");
        element.style.display = "block";
        Keen.showLoading(element);

        var convertOptions = function(opts){
            var options = {};
            options.legend = {};
            options.height = opts.height;
            options.width = opts.width;
            options.title = opts.title;
            options.sliceVisibilityThreshold = (opts.minimumSlicePercentage * .01);
            options.colors = opts.colors;
            options.backgroundColor = opts.backgroundColor;
            if(!opts.showLegend){
                options.legend["position"] = "none";
            }
            options.titleTextStyle = {color: opts.fontColor};
            options.legend.textStyle = {color: opts.fontColor};
            options["chartArea"] = {
                left: opts.chartAreaLeft,
                top: opts.chartAreaTop,
                height: opts.chartAreaHeight,
                width: opts.chartAreaWidth
            };

            return options;
        };

        var drawIt = _.bind(function(response){

            this.data = response.result;

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Group By");
            dataTable.addColumn("number", this.getLabel());
            _.each(this.data, function(item) {

                var name = "";

                if(this.options.labelMapping[item[this.query.attributes.groupBy]] != null){
                    name = this.options.labelMapping[item[this.query.attributes.groupBy]];
                }
                else{
                    name = item[this.query.attributes.groupBy] + "";
                }

                var value = item.result;

                dataTable.addRow([name, value]);

            }, this);

            if(google){
                var chart = new google.visualization.PieChart(element);
                chart.draw(dataTable, convertOptions(this.options));
            }
            else{
                console.log("Charting is not yet ready.  Are you waiting for onChartsReady?");
            }

        }, this);

        if(_.isUndefined(response)){
            this.query.getResponse(drawIt);
        }
        else{
            drawIt(response);
        }
    };

    Keen.FunnelChart = Keen.BaseVisualization.extend({

        constructor : function(query, options) {
            this.query = query;

            //This contains the supported options and their default values.
            this.options = {
                height: 300, //Number of pixels
                width: 600, //Number of pixels
                chartAreaHeight: null,
                chartAreaWidth: null,
                chartAreaLeft: null,
                chartAreaTop: null,
                title: null,
                showLegend: false,
                color: "#f35757",
                backgroundColor: "white",
                fontColor: "black"
            };
            this.options = _.extend(this.options, options);

            // If they didn't send a client in the options, default to the Keen global client
            if(_.isUndefined(this.options.client) ) {
                this.client = Keen.client;
            }
            else {
                this.client = this.options.client;
            }
        }
    });

    Keen.FunnelChart.prototype.draw = function(element, response){

        element.innerHTML = "";

        //Apply the width to the div so that it takes up the correct amount of space from the beginning
        element.style.width = (this.options.width + "px");
        element.style.height = (this.options.height + "px");
        element.style.display = "block";
        Keen.showLoading(element);

        var convertOptions = function(opts){
            var options = {};
            options.legend = {};
            options.height = opts.height;
            options.width = opts.width;
            options.title = opts.title;
            options.colors = [opts.color];
            options.backgroundColor = opts.backgroundColor;
            if(!opts.showLegend){
                options.legend["position"] = "none";
            }
            options.titleTextStyle = {color: opts.fontColor};
            options.legend.textStyle = {color: opts.fontColor};
            options["chartArea"] = {
                left: opts.chartAreaLeft,
                top: opts.chartAreaTop,
                height: opts.chartAreaHeight,
                width: opts.chartAreaWidth
            };
            options.vAxis = {
                minValue: 0,
                format: '#'
            };
            options.bar = {
                groupWidth: "90%"
            };
            return options;
        };

        var drawIt = _.bind(function(response){

            this.numbers = response.result;
            this.steps = response.steps;

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Action");
            dataTable.addColumn("number", "Count");

            var firstNumber = null;

            for(var i = 0; i < this.numbers.length; i++){
                if(firstNumber == null){
                    firstNumber = this.numbers[i]
                }

                //Determine the percentage of the first number the current number is.
                var percentage = Math.round((this.numbers[i] / firstNumber) * 100);

                //Determine the label
                var label = this.steps[i].event_collection;
                if(!_.isUndefined(this.query.steps[i].name)){
                    label = this.query.steps[i].name;
                }

                dataTable.addRow([label + " (" + percentage + "%)", this.numbers[i]])
            }

            if(google){
                var chart = new google.visualization.ColumnChart(element);
                chart.draw(dataTable, convertOptions(this.options));
            }
            else{
                console.log("Charting is not yet ready.  Are you waiting for onChartsReady?");
            }

        }, this);

        if(_.isUndefined(response)){
            this.query.getResponse(drawIt);
        }
        else{
            drawIt(response);
        }
    };

    /**
     * BaseQuery - the base class for all queries
     */
    Keen.BaseQuery = Base.extend({
        getResponse : function(callback){
            if(_.isUndefined(this.client.readKey)){
                console.log("Error: Please add a readKey to Keen.configure() to perform analysis.")
            }
            else{
                var path = this.getPath();

                var params = this.buildParams();

                path += "?";
                path += makeQueryString(params);

                var url = this.client.getKeenUrl(path);

                function handleResponse(response) {
                    return callback(response);
                }
                function handleError(xhr, e) {
                    console.log("got an error:");
                    console.log(xhr);
                    console.log(e);
                }
                this.client.getJSON(url, handleResponse, handleError);
            }
        },

        getPath : function(){
            console.log("getPath() must be overridden");
        },

        buildParams : function(){
            console.log("buildParams() must be overridden");
        }
    });


    /**
     * SavedQuery - a class to model a Keen saved query.
     *
     * @param queryName the name of the saved query you want to use
     * @param client optional client, defaults to the current Keen.client
     */
    Keen.SavedQuery = Keen.BaseQuery.extend({
        constructor: function(queryName, client){
            this.queryName = queryName;

            if(client) {
                this.client = client;
            }
            else {
                this.client = Keen.client;
            }
        },

        getPath: function(){
            return "/saved_queries/" + encodeURIComponent(this.queryName) + "/result";
        },

        buildParams: function(){
            return {api_key : this.client.readKey}
        }
    });

    /**
     * AdHocQuery - a class to model a Keen query.
     *
     * @param eventCollection the name of the eventCollection you wish to query
     * @param attributes optional params for the query
     * @param client optional client, defaults to the current Keen.client
     */
    Keen.AdHocQuery = Keen.BaseQuery.extend({
        constructor: function(eventCollection, attributes, client){
            if(_.isUndefined(attributes)) {
                attributes = {};
            }
            this.attributes = _.defaults(attributes, {filters:[]});

            this.attributes.eventCollection = eventCollection;

            //Get the current client's timezone offset.
            if(_.isUndefined(this.attributes.timezone)){
                this.attributes.timezone = getTimezoneOffset();
            }

            if(client) {
                this.client = client;
            }
            else {
                this.client = Keen.client;
            }
        },

        getPath : function(){
            return "/queries/" + this.attributes.analysisType;
        },

        buildParams : function(){
            return {
                api_key: this.client.readKey,
                event_collection: this.attributes.eventCollection,
                filters: this.attributes.filters,
                timeframe: this.attributes.timeframe,
                timezone: this.attributes.timezone,
                target_property: this.attributes.targetProperty,
                group_by: this.attributes.groupBy
            };
        }
    });

    /**
     * Add a filter to your ad hoc query.
     *
     * Pushes a new object with the proper attributes into the filters array in attributes
     *
     * @param property the name of the property on which you wish to filter
     * @param operator the operator used in the filter comparison (eg: "eq", "gt")
     * @param value the value you wish to compare the property to with the operator
     */
    Keen.AdHocQuery.prototype.addFilter = function(property, operator, value){
        this.attributes.filters.push({
            "property_name" : property,
            "operator" : operator,
            "property_value" : value
        });
        return this;
    };

    /**
     * Set the timeframe for your ad hoc query
     *
     * @param timeframe
     */
    Keen.AdHocQuery.prototype.timeframe = function(timeframe){
        this.attributes.timeframe = timeframe;
        return this;
    };

    /**
     * Set the timezone attribute for your Query
     * @param timezone string, ISO-8601 formatted timezone ("+08:00") or convenience string ("US/Pacific")
     */
    Keen.AdHocQuery.prototype.timezone = function(timezone){
        this.attributes.timezone = timezone;
        return this;
    };

    /**
     * Set the analysisType for your ad hoc query
     *
     * @param analysisType
     */
    Keen.AdHocQuery.prototype.analysisType = function(analysisType){
        this.attributes.analysisType = analysisType;
        return this;
    };

    /**
     * Set the targetProperty for your ad hoc query
     *
     * @param targetProperty
     */
    Keen.AdHocQuery.prototype.targetProperty = function(targetProperty){
        this.attributes.targetProperty = targetProperty;
        return this;
    };

    /**
     * Set the groupBy attribute for your ad hoc query
     *
     * @param groupBy
     */
    Keen.AdHocQuery.prototype.groupBy = function(groupBy){
        this.attributes.groupBy = groupBy;
        return this;
    };

    /**
     * Funnel - a class to represent a Funnel query
     */
    Keen.Funnel = Keen.BaseQuery.extend({
        constructor: function(steps, attributes, client){

            if(_.isUndefined(attributes)){
                attributes = {};
            }
            this.attributes = attributes;

            if(_.isUndefined(steps)){
                steps = [];
            }
            this.steps = steps;

            for(var i = 0; i < this.steps.length; i++){
                this.steps[i] = this.steps[i].buildParams();
            }

            if(_.isUndefined(this.attributes.timezone)){
                //Get the current client's timezone offset.
                this.attributes.timezone = getTimezoneOffset();
            }

            if(client) {
                this.client = client;
            }
            else {
                this.client = Keen.client;
            }
        },

        getPath: function(){
            return "/queries/funnel";
        },

        buildParams: function(){

            //Put the actor property from the funnel into the step if the step doesn't have one.
            if(!_.isUndefined(this.attributes.actorProperty)){
                for(var i = 0; i < this.steps.length; i++){
                    if(_.isUndefined(this.steps[i].actor_property)){
                        this.steps[i].actor_property = this.attributes.actorProperty;
                    }
                }
            }

            return {
                api_key : this.client.readKey,
                steps : this.steps,
                timeframe : this.attributes.timeframe,
                timezone : this.attributes.timezone,
                actor_property : this.attributes.actorProperty
            }
        },

        draw : function(element, options){
            var funnelChart = new Keen.FunnelChart(this, options);
            funnelChart.draw(element);
        }
    });

    /**
     * Set the timeframe for your funnel.
     *
     * This will set the timeframe for all steps that belong
     * to the funnel that don't already have one defined.
     *
     * @param timeframe
     */
    Keen.Funnel.prototype.timeframe = function(timeframe){
        this.attributes.timeframe = timeframe;
        return this;
    };

    /**
     * Set the actorProperty for a funnel.
     *
     * This will set the actorProperty for all steps that belong to
     * the funnel that don't already have one specified.
     *
     * @param actorProperty
     */
    Keen.Funnel.prototype.actorProperty = function(actorProperty){
        this.attributes.actorProperty = actorProperty;
        return this;
    };

    /**
     * Set the timezone for your funnel.
     *
     * This will set the timezone for all steps that belong
     * to the funnel that don't already have one defined
     *
     * @param timezone
     */
    Keen.Funnel.prototype.timezone = function(timezone){
        this.attributes.timezone = timezone;
        return this;
    };

    /**
     * Add a Step to your funnel.  Must be a Keen.Step object.
     *
     * @param step
     */
    Keen.Funnel.prototype.addStep = function(step){
        this.steps.push(step.buildParams());
        return this;
    };

    /**
     * Step - A class to represent a Step in a Funnel.
     */
    Keen.Step = Keen.AdHocQuery.extend({
        constructor: function(eventCollection, attributes){
            if(_.isUndefined(attributes)) {
                attributes = {};
            }
            this.attributes = _.defaults(attributes, {filters:[]});

            this.attributes.eventCollection = eventCollection;

            //Get the current client's timezone offset.
            if(_.isUndefined(this.attributes.timezone)){
                this.attributes.timezone = getTimezoneOffset();
            }
        },

        buildParams : function(){
            return {
                event_collection: this.attributes.eventCollection,
                actor_property: this.attributes.actorProperty,
                filters: this.attributes.filters,
                timeframe: this.attributes.timeframe,
                timezone: this.attributes.timezone,
                name: this.attributes.name
            };
        }
    });

    /**
     * Set the name of your Step.
     *
     * @param name
     */
    Keen.Step.prototype.name = function(name){
        this.attributes.name = name;
        return this;
    };

    /**
     * Set the actorProperty attribute for your Step
     *
     * @param actorProperty
     */
    Keen.Step.prototype.actorProperty = function(actorProperty){
        this.attributes.actorProperty = actorProperty;
        return this;
    };

    /**
     * Metric - A class to represent a Keen Metric
     */
    Keen.Metric = Keen.AdHocQuery.extend({});

    /**
     * Convenience method to draw a metric using a Number visualization
     *
     * @param element the html element in which to draw the visualization
     * @param options options to pass into the draw method to customize the visualization
     */
    Keen.Metric.prototype.draw = function(element, options){
        if(_.isUndefined(this.attributes.groupBy)){
            var number = new Keen.Number(this, options);
            number.draw(element);
        }
        else{
            var pieChart = new Keen.PieChart(this, options);
            pieChart.draw(element);
        }
    };

    /**
     * Series - A class to represent a Keen Series
     */
    Keen.Series = Keen.AdHocQuery.extend({

        buildParams : function(){
            var params = this.base();
            params.interval = this.attributes.interval;
            return params;
        },

        draw : function(element, options){
            if(_.isUndefined(this.attributes.groupBy)){
                var lineChart = new Keen.LineChart(this, options);
                lineChart.draw(element);
            }
            else{
                var multiLineChart = new Keen.MultiLineChart(this, options);
                multiLineChart.draw(element);
            }
        }
    });

    /**
     * Set the interval attribute for your Series
     *
     * @param interval
     */
    Keen.Series.prototype.interval = function(interval){
        this.attributes.interval = interval;
        return this;
    };
    
    Keen.showLoading = function(element) {
        var spinner = new Spinner().spin(element);
    };

    /**
     * The grossest thing used to turn a number into a 4 character string with 3 significant digits.
     *
     * @param input the number to find the representation of
     */
    Keen.prettyNumber = function(input) {

        // If it has 3 or fewer sig figs already, just return the number.
        var sciNo = input.toPrecision(3);
        if(Number(sciNo) == input && String(input).length <= 4) {
            return String(input);
        }

        if(input >= 1 || input <= -1) {

            var prefix = "";

            if(input < 0){
                //Pull off the negative side and stash that.
                input = -input;
                prefix = "-";
            }

            var suffixes = ["", "k", "M", "B", "T"];

            function recurse(input, iteration) {

                var input = String(input);
                var split = input.split(".");

                // If there's a dot
                if(split.length > 1) {

                    // Keep the left hand side only
                    input = split[0];
                    var rhs = split[1];

                    // If the left-hand side is too short, pad until it has 3 digits
                    if(input.length == 2 && rhs.length > 0) {

                        // Pad with right-hand side if possible
                        if(rhs.length > 0) {
                            input = input + "." + rhs.charAt(0);
                        }
                        // Pad with zeroes if you must
                        else {
                            input += "0";
                        }
                    }
                    else if(input.length == 1 && rhs.length > 0) {

                        input = input + "." + rhs.charAt(0);

                        // Pad with right-hand side if possible
                        if(rhs.length > 1) {
                            input += rhs.charAt(0);
                        }
                        // Pad with zeroes if you must
                        else {
                            input += "0";
                        }
                    }
                }

                var numNumerals = input.length;

                // if it has a period, then numNumerals is 1 smaller than the string length:
                if(input.split(".").length > 1) {
                    numNumerals--;
                }

                if(numNumerals <= 3) {
                    return String(input) + suffixes[iteration];
                }
                else {
                    return recurse(Number(input) / 1000, iteration + 1);
                }
            }

            return prefix + recurse(input, 0);
        }
        else{
            return input.toPrecision(3);
        }
    };

    /**
     * Creates the string used to label dates in LineCharts
     *
     * @param date a Javascript Date object
     * @param interval the interval of the Series (eg: "daily", "weekly", "hourly", "monthly")
     */
    function createDateString(date, interval, query, response) {

        var timezoneOffset = null;

        //If we used an awful string for a timezone, use an int based on the timeframe buckets returned.
        if(typeof query.attributes.timezone === 'string'){
            var dt = response.result[0].timeframe.start;
            var hours = parseInt(dt.slice(dt.length-6, dt.length).slice(1,3));
            var minutes = parseInt(dt.slice(dt.length-6, dt.length).slice(4,6));
            var sign = dt.slice(dt.length-6, dt.length).slice(0, 1);

            var totalMinutes = (hours * 60) + minutes;
            if(sign === "-"){
                totalMinutes = -totalMinutes
            }

            timezoneOffset = totalMinutes
        }
        else{
            totalMinutes = query.attributes.timezone/60;
        }

        var dateString = "";
        //We first need to make sure the date has the same timezone offset as the query.
        if(query != undefined && query.attributes != undefined && query.attributes.timezone != undefined){
            //Shift the date's timezone by the difference between the two.
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + (timezoneOffset));
        }

        if(interval == "daily" || interval == "weekly") {
            dateString += 1 + date.getMonth();
            dateString += "/";
            dateString += date.getDate();
        }
        else if (interval == "hourly"){
            dateString += date.getHours();
            dateString += ":";
            dateString += "00"
        }
        else if(interval == "monthly"){
            dateString += 1 + date.getMonth();
            dateString += "/";
            dateString += (date.getFullYear() + "").slice(-2);
        }
        else if(interval == "minutely"){
            dateString += date.getHours();
            dateString += ":";
            dateString += (("0" + date.getMinutes())).slice(-2);
        }
        else{
            console.log("Invalid interval: " + interval);
        }

        return dateString;
    }

    Date.prototype.stdTimezoneOffset = function() {
        var jan = new Date(this.getFullYear(), -1, 1);
        var jul = new Date(this.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    };

    Date.prototype.dst = function() {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    };

    /**
     * Parses an ISO-8601 date into a vanilla javascript Date object.
     * This is magic and is a modified version of this: https://github.com/csnover/js-iso8601/blob/master/iso8601.js
     *
     * @param date a string representation of a date in ISO-8601 format
     */
    function parseDate(date) {
        var numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
        var timestamp, struct, minutesOffset = 0;
        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
            for (var i = 0, k; (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;
            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = struct[10] * 60 + struct[11];
                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }
            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        }
        else {
            timestamp = Date.parse ? Date.parse(date) : NaN;
        }
        return new Date(timestamp);
    }
    /**
     * Gets the current client's timezone offset in seconds.
     */
    function getTimezoneOffset(){
        return new Date().getTimezoneOffset() * -60;
    }

    /**
     * Takes in a map of keys & values;  returns ampersand-delimited query string
     *
     * @param params map of key value pairs.
     */
    function makeQueryString(params) {

        _.each(params, function(value, key) {
            if(_.isUndefined(value)) {
                delete params[key];
            }
        });

        return _.map(params, function (value, key) {
            if(!_.isString(value)) {
                value = JSON.stringify(value);
            }

            value = encodeURIComponent(value);

            return key + '=' + value;
        }).join('&');
    }

    if (Keen.loadedCallback && typeof Keen.loadedCallback == "function") {
        Keen.loadedCallback();
    }

})();
