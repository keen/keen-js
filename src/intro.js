!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Keen', this, function() {
  'use strict';

  /*! 
  * ----------------
  * Keen IO Core JS
  * ----------------
  */

  function Keen(config) {
    return _init.apply(this, arguments);
  };

  function _init(config) {
    if (config === undefined) return Keen.log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
    if (config.projectId === undefined) return Keen.log('Please provide a projectId');
    this.configure(config);
  };

  Keen.prototype.configure = function(config){
    this.client = {
      projectId: config.projectId,
      writeKey: config.writeKey,
      readKey: config.readKey,
      globalProperties: null,
      keenUrl: (config.keenUrl) ? config.keenUrl : 'https://api.keen.io/3.0',
      requestType: _set_request_type(config.requestType || 'xhr')
    };
    return this;
  };
  
  function _set_request_type(value) {
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
  
  function _build_url(path) {
    return this.client.keenUrl + '/projects/' + this.client.projectId + path;
  };
  
  // Keen.prototype.request
  // keen.request('get', url, params, success, error);
  
  // keen.get('/events/' + eventCollection, params, function(response){ });
  // keen.post()
  // request.get(this, ['GET', '/events/' + eventCollection])
  
  var _request = {
    
    xhr: function(method, url, headers, body, apiKey, success, error, sequence){
      if (!apiKey) return Keen.log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            var response;
            try {
              response = JSON.parse(xhr.responseText);
              if (typeof sequence == 'number') {
                response.sequence = sequence;
              }
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
    
    jsonp: function(url, apiKey, success, error, sequence){
      if (!apiKey) return Keen.log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
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
          if (typeof sequence == 'number') {
            response.sequence = sequence;
          }
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
  }
  