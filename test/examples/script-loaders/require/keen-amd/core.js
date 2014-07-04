  // Source: src/_intro.js
!function(name, context, definition){

  if (typeof define == 'function' && define.amd) {
    define([
      './lib/dataform',
      './lib/domready',
      './lib/spinner'
    ], function(Dataform, domready, Spinner){

      var Keen = definition();
      Keen.Dataform = Dataform;
      Keen.utils.domready = domready;
      Keen.Spinner = Spinner;
      return Keen;
    });
  }
  /*else if (typeof module != 'undefined' && module.exports) {
    module.exports = definition();
  }*/
  else {
    context[name] = definition();
  }
}('Keen', this, function(){
  'use strict';
  // Source: src/core.js
  /*!
  * ----------------
  * Keen IO Core JS
  * ----------------
  */

  function Keen(config) {
    return _init.apply(this, arguments);
  }

  function _init(config) {
    if (_isUndefined(config)) {
      throw new Error("Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/");
    }
    if (_isUndefined(config.projectId) || _type(config.projectId) !== 'String' || config.projectId.length < 1) {
      throw new Error("Please provide a projectId");
    }

    this.configure(config);
  }

  Keen.prototype.configure = function(config){

    config['host'] = (_isUndefined(config['host'])) ? 'api.keen.io/3.0' : config['host'].replace(/.*?:\/\//g, '');
    config['protocol'] = _set_protocol(config['protocol']);
    config['requestType'] = _set_request_type(config['requestType']);

    this.client = {
      projectId: config.projectId,
      writeKey: config.writeKey,
      readKey: config.readKey,
      globalProperties: null,

      endpoint: config['protocol'] + "://" + config['host'],
      requestType: config['requestType']
    };

    Keen.trigger('client', this, config);
    this.trigger('ready');

    return this;
  };


  // Private
  // --------------------------------

  function _extend(target){
    for (var i = 1; i < arguments.length; i++) {
      for (var prop in arguments[i]){
        // if ((target[prop] && _type(target[prop]) == 'Object') && (arguments[i][prop] && _type(arguments[i][prop]) == 'Object')){
        target[prop] = arguments[i][prop];
      }
    }
    return target;
  }

  function _isUndefined(obj) {
    return obj === void 0;
  }

  function _type(obj){
    var text, parsed;
    text = (obj && obj.constructor) ? obj.constructor.toString() : void 0;
    if (text) {
      parsed = text.split("(")[0].split(/function\s*/);
      if (parsed.length > 0) {
        return parsed[1];
      }
    }
    return "Null";
	  //return (text) ? text.match(/function (.*)\(/)[1] : "Null";
  }

  function _each(o, cb, s){
    var n;
    if (!o){
      return 0;
    }
    s = !s ? o : s;
    if (_type(o)==='array'){ // is(o.length)
      // Indexed arrays, needed for Safari
      for (n=0; n<o.length; n++) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    } else {
      // Hashtables
      for (n in o){
        if (o.hasOwnProperty(n)) {
          if (cb.call(s, o[n], n, o) === false){
            return 0;
          }
        }
      }
    }
    return 1;
  }

  function _parse_params(str){
    // via http://stackoverflow.com/a/2880929/2511985
    var urlParams = {},
        match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = str.split("?")[1];

    while (!!(match=search.exec(query))) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  }

  function _set_protocol(value) {
    switch(value) {
      case 'http':
        return 'http';
        break;
      case 'auto':
        return location.protocol.replace(/:/g, '');
        break;
      case 'https':
      case undefined:
      default:
        return 'https';
        break;
    }
  }

  function _set_request_type(value) {
    var configured = value || 'jsonp';
    var capableXHR = false;
    //if ((typeof XMLHttpRequest === 'object' || typeof XMLHttpRequest === 'function') && 'withCredentials' in new XMLHttpRequest()) {
    if ((_type(XMLHttpRequest)==='Object'||_type(XMLHttpRequest)==='Function') && 'withCredentials' in new XMLHttpRequest()) {
      capableXHR = true;
    }
    //var capableXHR = (void 0 !== XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

    if (configured == null || configured == 'xhr') {
      if (capableXHR) {
        return 'xhr';
      } else {
        return 'jsonp';
      }
    } else {
      return configured;
    }
  }

  function _build_url(path) {
    return this.client.endpoint + '/projects/' + this.client.projectId + path;
  }


  var _request = {

    xhr: function(method, url, headers, body, apiKey, success, error){
      if (!apiKey) return Keen.log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            var response;
            try {
              response = JSON.parse(xhr.responseText);
            } catch (e) {
              Keen.log("Could not JSON parse HTTP response: " + xhr.responseText);
              if (error) error(xhr, e);
            }
            if (success && response) success(response);
          } else {
            Keen.log("HTTP request failed.");
            if (error) error(xhr, null);
          }
        }
      };
      xhr.open(method, url, true);
      if (apiKey) xhr.setRequestHeader("Authorization", apiKey);
      if (body) xhr.setRequestHeader("Content-Type", "application/json");
      if (headers) {
        for (var headerName in headers) {
          if (headers.hasOwnProperty(headerName)) xhr.setRequestHeader(headerName, headers[headerName]);
        }
      }
      var toSend = body ? JSON.stringify(body) : null;
      xhr.send(toSend);
    },

    jsonp: function(url, apiKey, success, error){
      if (!apiKey) return Keen.log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
      if (apiKey && url.indexOf("api_key") < 0) {
        var delimiterChar = url.indexOf("?") > 0 ? "&" : "?";
        url = url + delimiterChar + "api_key=" + apiKey;
      }

      var callbackName = "keenJSONPCallback" + new Date().getTime();
      while (callbackName in window) {
        callbackName += "a";
      }
      var loaded = false;
      window[callbackName] = function (response) {
        loaded = true;
        if (success && response) {
          success(response);
        };
        // Remove this from the namespace
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
          if (error) error();
        }
      }
      // non-ie, etc
      script.onerror = function() {
        if (loaded === false) { // on IE9 both onerror and onreadystatechange are called
          loaded = true;
          if (error) error();
        }
      }
    },

    beacon: function(url, apiKey, success, error){
      if (apiKey && url.indexOf("api_key") < 0) {
        var delimiterChar = url.indexOf("?") > 0 ? "&" : "?";
        url = url + delimiterChar + "api_key=" + apiKey;
      }
      var loaded = false, img = document.createElement("img");
      img.onload = function() {
        loaded = true;
        if ('naturalHeight' in this) {
          if (this.naturalHeight + this.naturalWidth === 0) {
            this.onerror(); return;
          }
        } else if (this.width + this.height === 0) {
          this.onerror(); return;
        }
        if (success) success({created: true});
      };
      img.onerror = function() {
        loaded = true;
        if (error) error();
      };
      img.src = url;
    }
  };


  // -------------------------------
  // Keen.Events
  // -------------------------------

  var Events = Keen.Events = {
    on: function(name, callback) {
      this.listeners || (this.listeners = {});
      var events = this.listeners[name] || (this.listeners[name] = []);
      events.push({callback: callback});
      return this;
    },
    off: function(name, callback) {
      if (!name && !callback) {
        this.listeners = void 0;
        delete this.listeners;
        return this;
      }
      var events = this.listeners[name] || [];
      for (var i = events.length; i--;) {
        if (callback && callback == events[i]['callback']) this.listeners[name].splice(i, 1);
        if (!callback || events.length == 0) {
          this.listeners[name] = void 0;
          delete this.listeners[name];
        }
      }
      return this;
    },
    trigger: function(name) {
      if (!this.listeners) return this;
      var args = Array.prototype.slice.call(arguments, 1);
      var events = this.listeners[name] || [];
      for (var i = 0; i < events.length; i++) {
        events[i]['callback'].apply(this, args);
      }
      return this;
    }
  };
  _extend(Keen.prototype, Events);
  _extend(Keen, Events);

  Keen.loaded = true;

  // Expose utils
  Keen.utils = {
    each: _each,
    extend: _extend,
    parseParams: _parse_params
  };

  Keen.ready = function(callback){
    if (Keen.loaded) {
      callback();
    } else {
      Keen.on('ready', callback);
    }
  };

  Keen.log = function(message) {
    if (typeof console == "object") {
      console.log('[Keen IO]', message);
    }
  };

  // -------------------------------
  // Keen.Plugins
  // -------------------------------

  var Plugins = Keen.Plugins = {};

  // Source: src/track.js
  /*!
  * -------------------
  * Keen IO Tracker JS
  * -------------------
  */

  Keen.prototype.addEvent = function(eventCollection, payload, success, error) {
    _uploadEvent.apply(this, arguments);
  };

  Keen.prototype.trackExternalLink = function(jsEvent, eventCollection, payload, timeout, timeoutCallback){

    var evt = jsEvent,
        target = evt.currentTarget || evt.srcElement || evt.target,
        timer = timeout || 500,
        triggered = false,
        targetAttr,
        callback,
        win;

    targetAttr = target.getAttribute("target") || target.target || "";

    if (targetAttr == "_blank" && !evt.metaKey) {
      win = window.open("about:blank");
      win.document.location = target.href;
    }

    if (target.nodeName === "A") {
      callback = function(){
        if(!triggered && !evt.metaKey && targetAttr !== "_blank"){
          triggered = true;
          window.location = target.href;
        }
      };
    } else if (target.nodeName === "FORM") {
      callback = function(){
        if(!triggered){
          triggered = true;
          target.submit();
        }
      };
    }

    if (timeoutCallback) {
      callback = function(){
        if(!triggered){
          triggered = true;
          timeoutCallback();
        }
      };
    }
    _uploadEvent.call(this, eventCollection, payload, callback, callback);

    setTimeout(callback, timer);

    if (!evt.metaKey) {
      return false;
    }
  };

  Keen.prototype.setGlobalProperties = function(newGlobalProperties) {
    if (!this.client) return Keen.log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
    if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
      this.client.globalProperties = newGlobalProperties;
    } else {
      throw new Error('Invalid value for global properties: ' + newGlobalProperties);
    }
  };

  // Private for Keen IO Tracker JS
  // -------------------------------

  function _uploadEvent(eventCollection, payload, success, error) {
    var url = _build_url.apply(this, ['/events/' + eventCollection]);
    var newEvent = {};

    // Add properties from client.globalProperties
    if (this.client.globalProperties) {
      newEvent = this.client.globalProperties(eventCollection);
    }

    // Add properties from user-defined event
    for (var property in payload) {
      if (payload.hasOwnProperty(property)) {
        newEvent[property] = payload[property];
      }
    }

    // Send data
    switch(this.client.requestType){

      case 'xhr':
        _request.xhr.apply(this, ["POST", url, null, newEvent, this.client.writeKey, success, error]);
        break;

      case 'jsonp':
        var jsonBody = JSON.stringify(newEvent);
        var base64Body = Keen.Base64.encode(jsonBody);
        url = url + "?api_key=" + this.client.writeKey;
        url = url + "&data=" + base64Body;
        url = url + "&modified=" + new Date().getTime();
        _request.jsonp.apply(this, [url, this.client.writeKey, success, error])
        break;

      case 'beacon':
        var jsonBody = JSON.stringify(newEvent);
        var base64Body = Keen.Base64.encode(jsonBody);
        url = url + "?api_key=" + encodeURIComponent(this.client.writeKey);
        url = url + "&data=" + encodeURIComponent(base64Body);
        url = url + "&modified=" + encodeURIComponent(new Date().getTime());
        url = url + "&c=clv1";
        _request.beacon.apply(this, [url, null, success, error]);
        break;

    }
  };

  // Source: src/query.js
  /*!
  * -----------------
  * Keen IO Query JS
  * -----------------
  */


  // -------------------------------
  // Inject <client>.query Method
  // -------------------------------

  Keen.prototype.run = function(query, success, error) {
    var queries = [];
    if ( _type(query) === 'Array' ) {
      queries = query;
    } else {
      queries.push(query);
    }
    return new Keen.Request(this, queries, success, error);
  };


  // -------------------------------
  // Keen.Request
  // -------------------------------

  Keen.Request = function(instance, queries, success, error){
    this.data;
    this.configure(instance, queries, success, error);
  };
  _extend(Keen.Request.prototype, Events);

  Keen.Request.prototype.configure = function(instance, queries, success, error){
    this.instance = instance;
    this.queries = queries;
    this.success = success;
    this.error = error;

    this.refresh();
    return this;
  };

  Keen.Request.prototype.refresh = function(){

    var self = this,
        completions = 0,
        response = [];

    var handleSuccess = function(res, index){
      response[index] = res;
      self.queries[index].data = res;
      self.queries[index].trigger('complete', self.queries[index].data);

      // Increment completion count
      completions++;
      if (completions == self.queries.length) {

        // Attach response/meta data to query
        if (self.queries.length == 1) {
          self.data = response[0];
        } else {
          self.data = response;
        }

        // Trigger completion event on query
        self.trigger('complete', self.data);

        // Fire callback
        if (self.success) self.success(self.data);
      }

    };

    var handleFailure = function(res, req){
      var response = JSON.parse(res.responseText);
      self.trigger('error', response);
      if (self.error) {
        self.error(res, req);
      }
      Keen.log(res.statusText + ' (' + response.error_code + '): ' + response.message);
    };

    for (var i = 0; i < self.queries.length; i++) {
      (function(query, index){
        var url = null;
        var successSequencer = function(res){
          handleSuccess(res, index);
        };
        var failureSequencer = function(res){
          handleFailure(res, index);
        };

        if (query instanceof Keen.Query || query instanceof Keen.Query) {
          url = _build_url.call(self.instance, query.path);
          url += "?api_key=" + self.instance.client.readKey;
          url += _build_query_string.call(self.instance, query.params);

        } else if ( Object.prototype.toString.call(query) === '[object String]' ) {
          url = _build_url.call(self.instance, '/saved_queries/' + encodeURIComponent(query) + '/result');
          url += "?api_key=" + self.instance.client.readKey;

        } else {
          var res = {
            statusText: 'Bad Request',
            responseText: { message: 'Error: Query ' + (i+1) + ' of ' + self.queries.length + ' for project ' + self.instance.client.projectId + ' is not a valid request' }
          };
          Keen.log(res.responseText.message);
          Keen.log('Check out our JavaScript SDK Usage Guide for Data Analysis:');
          Keen.log('https://keen.io/docs/clients/javascript/usage-guide/#analyze-and-visualize');
          if (self.error) self.error(res.responseText.message);
        }
        if (url) _send_query.call(self.instance, url, successSequencer, failureSequencer);

      })(self.queries[i], i);
    }
    return this;
  };


  // -------------------------------
  // Keen.Query
  // -------------------------------

  Keen.Query = function(){
    this.configure.apply(this, arguments);
  };
  _extend(Keen.Query.prototype, Events);

  Keen.Query.prototype.configure = function(analysisType, params) {
    this.analysis = analysisType;
    this.path = '/queries/' + analysisType;
    this.params = this.params || {};
    this.set(params);
    this.params.timezone = this.params.timezone || _build_timezone_offset();
    return this;
  };

  Keen.Query.prototype.get = function(attribute) {
    var key = attribute;
    if (key.match(new RegExp("[A-Z]"))) {
      key = key.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
    }
    if (this.params) {
      return this.params[key] || null;
    }
  };

  Keen.Query.prototype.set = function(attributes) {
    var self = this;
    _each(attributes, function(v, k){
      var key = k, value = v;
      if (k.match(new RegExp("[A-Z]"))) {
        key = k.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
      }
      self.params[key] = value;
      if (_type(value)==="Array") {
        _each(value, function(dv, index){
          if (_type(dv)==="Object") {
            _each(dv, function(deepValue, deepKey){
              if (deepKey.match(new RegExp("[A-Z]"))) {
                var _deepKey = deepKey.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
                delete self.params[key][index][deepKey];
                self.params[key][index][_deepKey] = deepValue;
              }
            });
          }
        });
      }
    });
    return self;
  };

  Keen.Query.prototype.addFilter = function(property, operator, value) {
    this.params.filters = this.params.filters || [];
    this.params.filters.push({
      "property_name": property,
      "operator": operator,
      "property_value": value
    });
    return this;
  };


  // Private
  // --------------------------------

  function _build_timezone_offset(){
    return new Date().getTimezoneOffset() * -60;
  };

  function _build_query_string(params){
    var query = [];
    for (var key in params) {
      if (params[key]) {
        var value = params[key];
        if (Object.prototype.toString.call(value) !== '[object String]') {
          value = JSON.stringify(value);
        }
        value = encodeURIComponent(value);
        query.push(key + '=' + value);
      }
    }
    return "&" + query.join('&');
  };

  function _send_query(url, success, error){
    if ((_type(XMLHttpRequest)==='Object'||_type(XMLHttpRequest)==='Function') && 'withCredentials' in new XMLHttpRequest()) {
      _request.xhr.call(this, "GET", url, null, null, this.client.readKey, success, error);
    } else {
      _request.jsonp.call(this, url, this.client.readKey, success, error);
    }
  };

  // Source: src/lib/base64.js
  /*!
  * ----------------------------------------
  * Keen IO Base64 Transcoding
  * ----------------------------------------
  */

  Keen.Base64 = {
    map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (n) {
      "use strict";
      var o = "", i = 0, m = this.map, i1, i2, i3, e1, e2, e3, e4;
      n = this.utf8.encode(n);
      while (i < n.length) {
        i1 = n.charCodeAt(i++); i2 = n.charCodeAt(i++); i3 = n.charCodeAt(i++);
        e1 = (i1 >> 2); e2 = (((i1 & 3) << 4) | (i2 >> 4)); e3 = (isNaN(i2) ? 64 : ((i2 & 15) << 2) | (i3 >> 6));
        e4 = (isNaN(i2) || isNaN(i3)) ? 64 : i3 & 63;
        o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4);
      } return o;
    },
    decode: function (n) {
      "use strict";
      var o = "", i = 0, m = this.map, cc = String.fromCharCode, e1, e2, e3, e4, c1, c2, c3;
      n = n.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < n.length) {
        e1 = m.indexOf(n.charAt(i++)); e2 = m.indexOf(n.charAt(i++));
        e3 = m.indexOf(n.charAt(i++)); e4 = m.indexOf(n.charAt(i++));
        c1 = (e1 << 2) | (e2 >> 4); c2 = ((e2 & 15) << 4) | (e3 >> 2);
        c3 = ((e3 & 3) << 6) | e4;
        o = o + (cc(c1) + ((e3 != 64) ? cc(c2) : "")) + (((e4 != 64) ? cc(c3) : ""));
      } return this.utf8.decode(o);
    },
    utf8: {
      encode: function (n) {
        "use strict";
        var o = "", i = 0, cc = String.fromCharCode, c;
        while (i < n.length) {
          c = n.charCodeAt(i++); o = o + ((c < 128) ? cc(c) : ((c > 127) && (c < 2048)) ?
          (cc((c >> 6) | 192) + cc((c & 63) | 128)) : (cc((c >> 12) | 224) + cc(((c >> 6) & 63) | 128) + cc((c & 63) | 128)));
          } return o;
      },
      decode: function (n) {
        "use strict";
        var o = "", i = 0, cc = String.fromCharCode, c2, c;
        while (i < n.length) {
          c = n.charCodeAt(i);
          o = o + ((c < 128) ? [cc(c), i++][0] : ((c > 191) && (c < 224)) ?
          [cc(((c & 31) << 6) | ((c2 = n.charCodeAt(i + 1)) & 63)), (i += 2)][0] :
          [cc(((c & 15) << 12) | (((c2 = n.charCodeAt(i + 1)) & 63) << 6) | ((c3 = n.charCodeAt(i + 2)) & 63)), (i += 3)][0]);
        } return o;
      }
    }
  };

  // Source: src/lib/json2.js
  /*!
  * --------------------------------------------
  * JSON2.js
  * https://github.com/douglascrockford/JSON-js
  * --------------------------------------------
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
    };

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
      String.prototype.toJSON =
        Number.prototype.toJSON =
          Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
          };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {  // table of character substitutions
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
    };

    function str(key, holder) {
      // Produce a string from holder[key].
      var i, // The loop counter.
          k, // The member key.
          v, // The member value.
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
        // If the type is 'object', we might be dealing with an object or an array or null.
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
            // Join all of the elements together, separated with commas, and wrap them in brackets.
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
          if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
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
              return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
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

  // Source: src/visualize.js
  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  Keen.prototype.draw = function(query, selector, config) {
    // Find DOM element, set height, build spinner
    var config = config || {};
    var id = selector.getAttribute("id");
    var el = document.getElementById(id);

    var placeholder = document.createElement("div");
    placeholder.className = "keen-loading";
    //placeholder.style.background = "#f2f2f2";
    placeholder.style.height = (config.height || Keen.Visualization.defaults.height) + "px";
    placeholder.style.position = "relative";
    placeholder.style.width = (config.width || Keen.Visualization.defaults.width) + "px";
    el.appendChild(placeholder);

    var spinner = new Keen.Spinner({
      lines: 10, // The number of lines to draw
      length: 8, // The length of each line
      width: 3, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#4d4d4d', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'keen-spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    }).spin(placeholder);

    var request = new Keen.Request(this, [query]);
    request.on("complete", function(){
      spinner.stop();
      el.removeChild(placeholder);
      this.draw(selector, config);
    });
    request.on("error", function(response){
      var errorConfig, error;
      spinner.stop();
      el.removeChild(placeholder);

      errorConfig = Keen.utils.extend({
        error: response,
        el: el
      }, Keen.Visualization.defaults);
      error = new Keen.Visualization.libraries['keen-io']['error'](errorConfig);
    });

    return request;
  };


  // -------------------------------
  // Inject Request Draw Method
  // -------------------------------
  Keen.Request.prototype.draw = function(selector, config) {
    _build_visual.call(this, selector, config);
    this.on('complete', function(){
      _build_visual.call(this, selector, config);
    });
    return this;
  };

  function _build_visual(selector, config){
    this.visual = new Keen.Visualization(this, selector, config);
  }


  // -------------------------------
  // Keen.Visualization
  // -------------------------------
  Keen.Visualization = function(req, selector, config){
    var self = this, data, defaults, options, library, defaultType, dataformSchema;

    // Backwoods cloning facility
    defaults = JSON.parse(JSON.stringify(Keen.Visualization.defaults));

    options = _extend(defaults, config || {});
    library = Keen.Visualization.libraries[options.library];

    options.el = selector;

    dataformSchema = {
      collection: 'result',
      select: true
    };

    // Build default title if necessary to do so
    if (!options.title && req instanceof Keen.Request) {
      options.title = (function(){
        var analysis = req.queries[0].analysis.replace("_", " "),
            collection = req.queries[0].get('event_collection'),
            output;

        output = analysis.replace( /\b./g, function(a){
          return a.toUpperCase();
        });

        if (collection) {
          output += ' - ' + collection;
        }
        return output;
      })();
    }

    var isMetric = false,
        isFunnel = false,
        isInterval = false,
        isGroupBy = false,
        is2xGroupBy = false,
        isExtraction = false;

    if (req instanceof Keen.Request) {
      // Handle known scenarios
      isMetric = (typeof req.data.result === "number" || req.data.result === null) ? true : false,
      isFunnel = (req.queries[0].get('steps')) ? true : false,
      isInterval = (req.queries[0].get('interval')) ? true : false,
      isGroupBy = (req.queries[0].get('group_by')) ? true : false,
      is2xGroupBy = (req.queries[0].get('group_by') instanceof Array) ? true : false;
      isExtraction = (req.queries[0].analysis == 'extraction') ? true : false;

      data = (req.data instanceof Array) ? req.data[0] : req.data;

    } else if (typeof req === "string") {
      // Fetch a new resource
      // _request.jsonp()
      // _transform()

    } else {
      // Handle raw data
      // _transform() and handle as usual
      data = (req instanceof Array) ? req[0] : req;
      isMetric = (typeof data.result === "number" || data.result === null) ? true : false
    }


    // -------------------------------
    // Select a default chart type
    // -------------------------------

    // Metric
    if (isMetric) {
      options.capable = ['metric'];
      defaultType = 'metric';
    }

    // GroupBy
    if (!isInterval && isGroupBy) {
      options.capable = ['piechart', 'barchart', 'columnchart', 'table'];
      defaultType = 'piechart';
      if (options.chartType == 'barchart') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // Single Interval
    if (isInterval && !isGroupBy) { // Series
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'areachart';
      if (options.library == 'google') {
        if (options.chartOptions.legend == void 0) {
          options.chartOptions.legend = { position: 'none' };
        }
      }

    }

    // GroupBy Interval
    if (isInterval && isGroupBy) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'linechart';
    }

    // Custom Dataset schema for
    // complex query/response types
    // -------------------------------

    // Funnels
    if (isFunnel) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'columnchart';
      if (options.library == 'google') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // 2x GroupBy
    if (is2xGroupBy) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'columnchart';
    }


    // Dataform schema
    // ---------------------------------------------------------
    if (is2xGroupBy) {
      dataformSchema = {
        collection: 'result',
        sort: {
          index: 'asc',
          label: 'desc'
        }
      };
      if (isInterval) {
        dataformSchema.unpack = {
          index: 'timeframe -> start',
          label: 'value -> ' + req.queries[0].params.group_by[0],
          value: 'value -> result'
        };
      } else {
        dataformSchema.unpack = {
          index: req.queries[0].params.group_by[0],
          label: req.queries[0].params.group_by[1],
          value: 'result'
        };
      }
    }

    // Extractions
    if (isExtraction) {
      options.capable = ['table'];
      defaultType = 'table';
    }

    // Dataform schema
    // ---------------------------------------------------------
    if (isExtraction) {
      dataformSchema = {
        collection: "result",
        select: true
      };
      if (req.queries[0].get('property_names')) {
        dataformSchema.select = [];
        for (var i = 0; i < req.queries[0].get('property_names').length; i++) {
          dataformSchema.select.push({ path: req.queries[0].get('property_names')[i] });
        }
      }
    }


    // A few last details
    // -------------------------------
    if (!options.chartType) {
      options.chartType = defaultType;
    }

    if (options.chartType == 'metric') {
      options.library = 'keen-io';
    }

    if (options.chartOptions.lineWidth == void 0) {
      options.chartOptions.lineWidth = 2;
    }

    if (options.chartType == 'piechart') {
      if (options.chartOptions.sliceVisibilityThreshold == void 0) {
        options.chartOptions.sliceVisibilityThreshold = 0.01;
      }
    }

    if (options.chartType == 'columnchart' || options.chartType == 'areachart' || options.chartType == 'linechart') {

      if (options.chartOptions.hAxis == void 0) {
        options.chartOptions.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
      }

      if (options.chartOptions.vAxis == void 0) {
        options.chartOptions.vAxis = {
          viewWindow: { min: 0 }
        };
      }
    }

    //_extend(self, options);
    options['data'] = (data) ? _transform.call(options, data, dataformSchema) : [];

    // Put it all together
    // -------------------------------
    if (options.library) {
      if (Keen.Visualization.libraries[options.library][options.chartType]) {
        return new Keen.Visualization.libraries[options.library][options.chartType](options);
      } else {
        throw new Error('The library you selected does not support this chartType');
      }
    } else {
      throw new Error('The library you selected is not present');
    }

    return this;
  };

  // Visual defaults
  Keen.Visualization.defaults = {
    library: 'google',
    height: 400,
    width: 600,
    colors: [
      "#00afd7",
      "#f35757",
      "#f0ad4e",
      "#8383c6",
      "#f9845b",
      "#49c5b1",
      "#2a99d1",
      "#aacc85",
      "#ba7fab"
    ],
    chartOptions: {}
  };

  // Collect and manage libraries
  Keen.Visualization.libraries = {};
  Keen.Visualization.register = function(name, methods){
    Keen.Visualization.libraries[name] = Keen.Visualization.libraries[name] || {};
    for (var method in methods) {
      Keen.Visualization.libraries[name][method] = methods[method];
    }
  };

  Keen.Visualization.visuals = [];
  var baseVisualization = function(config){
    var self = this;
    _extend(self, config);

    // Set default event handlers
    self.on("error", function(){
      var errorConfig, error;
      errorConfig = Keen.utils.extend({
        error: { message: arguments[0] }
      }, config);
      error = new Keen.Visualization.libraries['keen-io']['error'](errorConfig);
    });
    self.on("update", function(){
      self.update.apply(this, arguments);
    });

    // Let's kick it off!
    self.initialize();
    Keen.Visualization.visuals.push(self);
  };

  baseVisualization.prototype = {
    initialize: function(){
      // Set listeners and prepare data
    },
    render: function(){
      // Build artifacts
    },
    update: function(){
      // Handle data updates
    }
  };
  _extend(baseVisualization.prototype, Events);

  Keen.Visualization.extend = function(protoProps, staticProps){
    var parent = baseVisualization, Visualization;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Visualization = protoProps.constructor;
    } else {
      Visualization = function(){ return parent.apply(this, arguments); };
    }
    _extend(Visualization, parent, staticProps);
    var Surrogate = function(){ this.constructor = Visualization; };
    Surrogate.prototype = parent.prototype;
    Visualization.prototype = new Surrogate();
    if (protoProps) {
      _extend(Visualization.prototype, protoProps);
    }
    Visualization.__super__ = parent.prototype;
    return Visualization;
  };

  var ErrorMessage = Keen.Visualization.extend({
    initialize: function(){
      var errorPlaceholder, errorMessage;

      errorPlaceholder = document.createElement("div");
      errorPlaceholder.className = "keen-error";
      errorPlaceholder.style.borderRadius = "8px";
      errorPlaceholder.style.height = this.height + "px";
      errorPlaceholder.style.width = this.width + "px";

      errorMessage = document.createElement("span");
      errorMessage.style.color = "#ccc";
      errorMessage.style.display = "block";
      errorMessage.style.paddingTop = (this.height / 2 - 15) + "px";
      errorMessage.style.fontFamily = "Helvetica Neue, Helvetica, Arial, sans-serif";
      errorMessage.style.fontSize = "21px";
      errorMessage.style.fontWeight = "light";
      errorMessage.style.textAlign = "center";

      errorMessage.innerHTML = this['error'].message;
      errorPlaceholder.appendChild(errorMessage);

      this.el.innerHTML = "";
      this.el.appendChild(errorPlaceholder);
    }
  });

  Keen.Visualization.register('keen-io', {
    'error': ErrorMessage
  });


  // -------------------------------
  // Dataform Configuration
  // -------------------------------
  // Handles arbitrary raw data for
  // scenarios where originating
  // queries are not known
  // -------------------------------
  function _transform(response, config){
    var self = this, schema = config || {};

    // Metric
    // -------------------------------
    if (typeof response.result == "number"){
      //return new Keen.Dataform(response, {
      schema = {
        collection: "",
        select: [{
          path: "result",
          type: "string",
          label: "Metric",
          format: false,
          method: "Keen.utils.prettyNumber",
          replace: {
            null: 0
          }
        }]
      }
    }

    // Everything else
    // -------------------------------
    if (response.result instanceof Array && response.result.length > 0){

      // Interval w/ single value
      // -------------------------------
      if (response.result[0].timeframe && (typeof response.result[0].value == "number" || response.result[0].value == null)) {
        schema = {
          collection: "result",
          select: [
            {
              path: "timeframe -> start",
              type: "date"
            },
            {
              path: "value",
              type: "number",
              format: "10",
              replace: {
                null: 0
              }
            }
          ],
          sort: {
            column: 0,
            order: 'asc'
          }
        }
      }

      // Static GroupBy
      // -------------------------------
      if (typeof response.result[0].result == "number"){
        schema = {
          collection: "result",
          select: [],
          sort: {
            column: 1,
            order: "desc"
          }
        };
        for (var key in response.result[0]){
          if (response.result[0].hasOwnProperty(key) && key !== "result"){
            schema.select.push({
              path: key,
              type: "string"
            });
            break;
          }
        }
        schema.select.push({
          path: "result",
          type: "number"
        });
      }

      // Grouped Interval
      // -------------------------------
      if (response.result[0].value instanceof Array){
        schema = {
          collection: "result",
          unpack: {
            index: {
              path: "timeframe -> start",
              type: "date"
            },
            value: {
              path: "value -> result",
              type: "number",
              replace: {
                null: 0
              }
            }
          },
          sort: {
            value: "desc"
          }
        }
        for (var key in response.result[0].value[0]){
          if (response.result[0].value[0].hasOwnProperty(key) && key !== "result"){
            schema.unpack.label = {
              path: "value -> " + key,
              type: "string"
            }
            break;
          }
        }
      }

      // Funnel
      // -------------------------------
      if (typeof response.result[0] == "number"){
        schema = {
          collection: "",
          unpack: {
            index: {
              path: "steps -> event_collection",
              type: "string"
            },
            value: {
              path: "result -> ",
              type: "number"
            }
          }
        }
      }

    }


    // Apply formatting options
    // -------------------------------
    if (self.labelMapping && schema.unpack) {
      if (schema.unpack['index']) {
        schema.unpack['index'].replace = schema.unpack['index'].replace || self.labelMapping;
      }
      if (schema.unpack['label']) {
        schema.unpack['label'].replace = schema.unpack['label'].replace || self.labelMapping;
      }
    }

    if (self.labelMapping && schema.select) {
      _each(schema.select, function(v, i){
        schema.select[i].replace = self.labelMapping;
      });
    }

    return new Keen.Dataform(response, schema);
  }

  function _pretty_number(_input) {
    // If it has 3 or fewer sig figs already, just return the number.
    var input = Number(_input),
        sciNo = input.toPrecision(3),
        prefix = "",
        suffixes = ["", "k", "M", "B", "T"];

    if (Number(sciNo) == input && String(input).length <= 4) {
      return String(input);
    }

    if(input >= 1 || input <= -1) {
      if(input < 0){
        //Pull off the negative side and stash that.
        input = -input;
        prefix = "-";
      }
      return prefix + recurse(input, 0);
    } else {
      return input.toPrecision(3);
    }

    function recurse(input, iteration) {
      var input = String(input);
      var split = input.split(".");
      // If there's a dot
      if(split.length > 1) {
        // Keep the left hand side only
        input = split[0];
        var rhs = split[1];
        // If the left-hand side is too short, pad until it has 3 digits
        if (input.length == 2 && rhs.length > 0) {
          // Pad with right-hand side if possible
          if (rhs.length > 0) {
            input = input + "." + rhs.charAt(0);
          }
          // Pad with zeroes if you must
          else {
            input += "0";
          }
        }
        else if (input.length == 1 && rhs.length > 0) {
          input = input + "." + rhs.charAt(0);
          // Pad with right-hand side if possible
          if(rhs.length > 1) {
            input += rhs.charAt(1);
          }
          // Pad with zeroes if you must
          else {
            input += "0";
          }
        }
      }
      var numNumerals = input.length;
      // if it has a period, then numNumerals is 1 smaller than the string length:
      if (input.split(".").length > 1) {
        numNumerals--;
      }
      if(numNumerals <= 3) {
        return String(input) + suffixes[iteration];
      }
      else {
        return recurse(Number(input) / 1000, iteration + 1);
      }
    }
  }

  function _load_script(url, cb) {
    var doc = document;
    var handler;
    var head = doc.head || doc.getElementsByTagName("head");

    // loading code borrowed directly from LABjs itself
    setTimeout(function () {
      // check if ref is still a live node list
      if ('item' in head) {
        // append_to node not yet ready
        if (!head[0]) {
          setTimeout(arguments.callee, 25);
          return;
        }
        // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
        head = head[0];
      }
      var script = doc.createElement("script"),
      scriptdone = false;
      script.onload = script.onreadystatechange = function () {
        if ((script.readyState && script.readyState !== "complete" && script.readyState !== "loaded") || scriptdone) {
          return false;
        }
        script.onload = script.onreadystatechange = null;
        scriptdone = true;
        cb();
      };
      script.src = url;
      head.insertBefore(script, head.firstChild);
    }, 0);

    // required: shim for FF <= 3.5 not having document.readyState
    if (doc.readyState === null && doc.addEventListener) {
      doc.readyState = "loading";
      doc.addEventListener("DOMContentLoaded", handler = function () {
        doc.removeEventListener("DOMContentLoaded", handler, false);
        doc.readyState = "complete";
      }, false);
    }
  }


  Keen.Visualization.find = function(target){
    var el, match;
    if (target) {
      el = target.nodeName ? target : document.querySelector(target);
      _each(Keen.Visualization.visuals, function(visual){
        if (el == visual.el){
          match = visual;
          return false;
        }
      });
      if (match) {
        return match;
      }
      throw("Visualization not found");
    } else {
      return Keen.Visualization.visuals;
    }
  };

  // Expose utils
  _extend(Keen.utils, {
    prettyNumber: _pretty_number,
    loadScript: _load_script
  });

  // Set flag for script loading
  Keen.loaded = false;

  // Source: src/async.js
  /*!
  * ----------------------
  * Keen IO Plugin
  * Async Loader
  * ----------------------
  */

  var loaded = window['Keen'],
      cached = window['_' + 'Keen'] || {},
      clients,
      ready;

  if (loaded && cached) {
    clients = cached['clients'] || {},
    ready = cached['ready'] || [];

    for (var instance in clients) {
      if (clients.hasOwnProperty(instance)) {
        var client = clients[instance];

        // Map methods to existing instances
        for (var method in Keen.prototype) {
          if (Keen.prototype.hasOwnProperty(method)) {
            loaded.prototype[method] = Keen.prototype[method];
          }
        }

        // Map additional methods as necessary
        loaded.Query = (Keen.Query) ? Keen.Query : function(){};
        loaded.Visualization = (Keen.Visualization) ? Keen.Visualization : function(){};

        // Run Configuration
        if (client._config) {
          client.configure.call(client, client._config);
          delete client._config;
        }

        // Add Global Properties
        if (client._setGlobalProperties) {
          var globals = client._setGlobalProperties;
          for (var i = 0; i < globals.length; i++) {
            client.setGlobalProperties.apply(client, globals[i]);
          }
          delete client._setGlobalProperties;
        }

        // Send Queued Events
        if (client._addEvent) {
          var queue = client._addEvent || [];
          for (var i = 0; i < queue.length; i++) {
            client.addEvent.apply(client, queue[i]);
          }
          delete client._addEvent;
        }

        // Create "on" Events
        var callback = client._on || [];
        if (client._on) {
          for (var i = 0; i < callback.length; i++) {
            client.on.apply(client, callback[i]);
          }
          client.trigger('ready');
          delete client._on;
        }

      }
    }

    for (var i = 0; i < ready.length; i++) {
      var callback = ready[i];
      Keen.on('ready', function(){
        callback();
      });
    };
  }

  // Source: src/_outro.js

  // ----------------------
  // Utility Methods
  // ----------------------

  if (Keen.loaded) {
    setTimeout(function(){
      Keen.utils.domready(function(){
        Keen.trigger('ready');
      });
    }, 0);
  }

  return Keen;
});
