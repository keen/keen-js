var superagent = require('superagent');
var each = require('../utils/each'),
    getXHR = require('./get-xhr-object');

module.exports = function(type, opts){
  return function(request) {
    var __super__ = request.constructor.prototype.end;
    if ( typeof window === 'undefined' ) return;
    request.requestType = request.requestType || {};
    request.requestType['type'] = type;
    request.requestType['options'] = request.requestType['options'] || {
      // TODO: find acceptable default values
      async: true,
      success: {
        responseText: '{ "created": true }',
        status: 201
      },
      error: {
        responseText: '{ "error_code": "ERROR", "message": "Request failed" }',
        status: 404
      }
    };

    // Apply options
    if (opts) {
      if ( typeof opts.async === 'boolean' ) {
        request.requestType['options'].async = opts.async;
      }
      if ( opts.success ) {
        extend(request.requestType['options'].success, opts.success);
      }
      if ( opts.error ) {
        extend(request.requestType['options'].error, opts.error);
      }
    }

    request.end = function(fn){
      var self = this,
          reqType = (this.requestType) ? this.requestType['type'] : 'xhr',
          query,
          timeout;

      if ( ('GET' !== self['method'] ||  reqType === 'xhr' ) && self.requestType['options'].async ) {
        __super__.call(self, fn);
        return;
      }

      query = self._query.join('&');
      timeout = self._timeout;
      // store callback
      self._callback = fn || noop;
      // timeout
      if (timeout && !self._timer) {
        self._timer = setTimeout(function(){
          abortRequest.call(self);
        }, timeout);
      }
      if (query) {
        query = superagent.serializeObject(query);
        self.url += ~self.url.indexOf('?') ? '&' + query : '?' + query;
      }
      // send stuff
      self.emit('request', self);

      if ( !self.requestType['options'].async ) {
        sendXhrSync.call(self);
      }
      else if ( reqType === 'jsonp' ) {
        sendJsonp.call(self);
      }
      else if ( reqType === 'beacon' ) {
        sendBeacon.call(self);
      }
      return self;
    };
    return request;
  };
};

function sendXhrSync(){
  var xhr = getXHR();
  if (xhr) {
    xhr.open('GET', this.url, false);
    xhr.send(null);
  }
  return this;
}

function sendJsonp(){
  var self = this,
      timestamp = new Date().getTime(),
      script = document.createElement('script'),
      parent = document.getElementsByTagName('head')[0],
      callbackName = 'keenJSONPCallback',
      loaded = false;
  callbackName += timestamp;
  while (callbackName in window) {
    callbackName += 'a';
  }
  window[callbackName] = function(response) {
    if (loaded === true) return;
    loaded = true;
    handleSuccess.call(self, response);
    cleanup();
  };
  script.src = self.url + '&jsonp=' + callbackName;
  parent.appendChild(script);
  // for early IE w/ no onerror event
  script.onreadystatechange = function() {
    if (loaded === false && self.readyState === 'loaded') {
      loaded = true;
      handleError.call(self);
      cleanup();
    }
  };
  // non-ie, etc
  script.onerror = function() {
    // on IE9 both onerror and onreadystatechange are called
    if (loaded === false) {
      loaded = true;
      handleError.call(self);
      cleanup();
    }
  };
  function cleanup(){
    window[callbackName] = undefined;
    try {
      delete window[callbackName];
    } catch(e){}
    parent.removeChild(script);
  }
}

function sendBeacon(){
  var self = this,
      img = document.createElement('img'),
      loaded = false;
  img.onload = function() {
    loaded = true;
    if ('naturalHeight' in this) {
      if (this.naturalHeight + this.naturalWidth === 0) {
        this.onerror();
        return;
      }
    } else if (this.width + this.height === 0) {
      this.onerror();
      return;
    }
    handleSuccess.call(self);
  };
  img.onerror = function() {
    loaded = true;
    handleError.call(self);
  };
  img.src = self.url + '&c=clv1';
}

function handleSuccess(res){
  var opts = this.requestType['options']['success'],
      response = '';
  xhrShim.call(this, opts);
  if (res) {
    try {
      response = JSON.stringify(res);
    } catch(e) {}
  }
  else {
    response = opts['responseText'];
  }
  this.xhr.responseText = response;
  this.xhr.status = opts['status'];
  this.emit('end');
}

function handleError(){
  var opts = this.requestType['options']['error'];
  xhrShim.call(this, opts);
  this.xhr.responseText = opts['responseText'];
  this.xhr.status = opts['status'];
  this.emit('end');
}

// custom spin on self.abort();
function abortRequest(){
  this.aborted = true;
  this.clearTimeout();
  this.emit('abort');
}

// hackety hack hack :) keep moving
function xhrShim(opts){
  this.xhr = {
    getAllResponseHeaders: function(){ return ''; },
    getResponseHeader: function(){ return 'application/json'; },
    responseText: opts['responseText'],
    status: opts['status']
  };
  return this;
}
