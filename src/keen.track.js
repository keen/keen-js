!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Keen', this, function() {

  // -------------------------------
  // Keen Object (tracker)
  // -------------------------------
  
  function Keen(config) {
    return init.apply(this, arguments);
  };
  
  function init(config) {
    if (config === undefined) return _log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
    if (config.projectId === undefined) return _log('Please provide a projectId');
    this.configure(config);
  };
  
  Keen.prototype = {
    
    configure: function(config) {
      this.client = {
        projectId: config.projectId,
        writeKey: config.writeKey,
        readKey: config.readKey,
        globalProperties: null,
        keenUrl: (config.keenUrl) ? config.keenUrl : 'https://api.keen.io/3.0',
        requestType: _setRequestType(config.requestType || 'xhr')
      };
      return this;
    },
    
    addEvent: function(eventCollection, payload, success, error) {
      _uploadEvent.apply(this, arguments);
    },
    
    trackExternalLink: function(htmlElement, eventCollection, event, timeout, timeoutCallback) {
      //console.log('trackExternalLink', arguments);
      if (timeout === undefined){
        timeout = 500;
      }
      var triggered = false;
      var callback = function(){};
      if( htmlElement.nodeName === "A"){
        callback = function(){
          if(!triggered){
            triggered = true;
            window.location = htmlElement.href;
          }
        };
      }
      else if (htmlElement.nodeName === "FORM"){
        callback = function(){
          if(!triggered){
            triggered = true;
            htmlElement.submit();
          }
        }
      }
      if(timeoutCallback){
        callback = function(){
          if(!triggered){
            triggered = true;
            timeoutCallback();
          }
        }
      }
      
      _uploadEvent.apply(this, arguments);
      
      setTimeout(function() {
        callback();
      }, timeout);
      return false;
    },
    
    setGlobalProperties: function(newGlobalProperties) {
      //console.log('setGlobalProperties', arguments);
      if (!this.client) return _log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
      if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
        this.client.globalProperties = newGlobalProperties;
      } else {
        throw new Error('Invalid value for global properties: ' + newGlobalProperties);
      }
    }
    
  };

  
  // Private for Keen (tracker)
  // -------------------------------
  
  function _setRequestType(value) {
    // Test XMLHttpRequest = function(){};
    var configured = value; // null, 'xhr', 'jsonp', 'beacon'
    var capableXHR = typeof new XMLHttpRequest().responseType === 'string';
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
  
  function _buildURL(path) {
    return this.client.keenUrl + '/projects/' + this.client.projectId + path;
  };
  
  function _uploadEvent(eventCollection, payload, success, error) {
    var url = _buildURL.apply(this, ['/events/' + eventCollection]);
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
        _sendXHR.apply(this, ["POST", url, null, newEvent, this.client.writeKey, success, error]);
        break;
      
      case 'jsonp':
        var jsonBody = JSON.stringify(newEvent);
        var base64Body = Keen.Base64.encode(jsonBody);
        url = url + "?api_key=" + this.client.writeKey;
        url = url + "&data=" + base64Body;
        url = url + "&modified=" + new Date().getTime();
        _sendJSONP.apply(this, [url, this.client.writeKey, success, error]);
        break;
      
      case 'beacon':
        _log('Image beacons coming soon!');
        break;
      
    }
    
  };
  
  function _sendXHR(method, url, headers, body, apiKey, success, error) {
    // Called by:
    // Keen.Client.prototype.uploadEvent
    // Keen.Client.prototype.getJSON
    
    if (!apiKey) return _log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
    
    console.log(arguments);
    
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
  };
  
  function _sendJSONP(url, apiKey, success, error) {
    // Called by:
    // Keen.Client.prototype.uploadEvent
    // Keen.Client.prototype.getJSON
    
    if (!apiKey) return _log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
    console.log(arguments);
    
    // Fall back to JSONP for GET and sending data base64 encoded for POST
    
    // Add api_key if it's not there
    if (apiKey && url.indexOf("api_key") < 0) {
      var delimiterChar = url.indexOf("?") > 0 ? "&" : "?";
      url = url + delimiterChar + "api_key=" + apiKey;
    }

    // JSONP
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
    
  };
  
  
  
  // -------------------------------
  // Keen Base64 transcoding
  // -------------------------------
  
  Keen.Base64 = {
    
    // Public encoding
    encode: function(input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = _utf8_encode(input);
      
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
          _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
          _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        
      }
      return output;
    },
    
    // Public decoding
    decode: function(input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      
      while (i < input.length) {
        
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        
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
      output = _utf8_decode(output);
      return output;
    }
  
  }
  
  // Private for Keen.Base64
  // -------------------------------
  
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  
  function _utf8_encode(string) {
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
  };
  
  function _utf8_decode(utftext) {
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
  };
  
  
  // Handle Queued Commands
  // -------------------------------
  
  for (var instance in window._KeenCache) {
    if (window._KeenCache.hasOwnProperty(instance)) {
      // console.log(window._KeenCache[instance]);
      var client = window._KeenCache[instance];
      
      for (var method in Keen.prototype) {
        if (Keen.prototype.hasOwnProperty(method)) {
          window.Keen.prototype[method] = Keen.prototype[method];
        }
      }
      
      // Configuration
      if (client._cf) {
        client.configure(client._cf);
        delete client._cf;
      }
      
      // Global Properties (test!)
      if (client._gp) {
        client.setGlobalProperties(client._gp);
        delete client._gp;
      }
      
      // Queued Events
      var queue = client._eq;
      if (queue && queue.length > 0) {
        for (var i=0; i < queue.length; i++) {
          var eventCollection = queue[i].shift();
          var payload = queue[i].shift();
          var success = queue[i].shift();
          var error = queue[i].shift();
          client.addEvent(eventCollection, payload, success, error);
          delete queue[i];
        }
        delete queue;
        delete client._eq;
        // console.log(client, queue);
      }
      
      // onChartsReady Callbacks (test!)
      var callback = client._ocrq;
      if (callback && callback.length > 0) {
        for (var i=0; i < callack.length; i++) {
          var handler = callback[i];
          Keen.onChartsReady(handler);
        }
        delete client._ocrq
      }
      
    }
  }
  delete window._KeenCache;

  // -------------------------------
  // Private Utils
  // -------------------------------
  
  function _log(message) {
    console.log('[Keen IO]', message)
  };
  
  
  // -------------------------------
  // JSON2.js
  // -------------------------------
  
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


  return Keen;
});