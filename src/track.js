/*! 
* -------------------
* Keen IO Tracker JS
* -------------------
*/

Keen.prototype.addEvent = function(eventCollection, payload, success, error) {
  _uploadEvent.apply(this, arguments);
};

Keen.prototype.trackExternalLink = function(htmlElement, eventCollection, event, timeout, timeoutCallback) {
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
};

Keen.prototype.setGlobalProperties = function(newGlobalProperties) {
  //console.log('setGlobalProperties', arguments);
  if (!this.client) return Keen.log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
  if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
    this.client.globalProperties = newGlobalProperties;
  } else {
    throw new Error('Invalid value for global properties: ' + newGlobalProperties);
  }
};

// Private for Keen IO Tracker JS
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
      var jsonBody = JSON.stringify(newEvent);
      var base64Body = Keen.Base64.encode(jsonBody);
      url = url + "?api_key=" + encodeURIComponent(this.client.writeKey);
      url = url + "&data=" + encodeURIComponent(base64Body);
      url = url + "&modified=" + encodeURIComponent(new Date().getTime());
      url = url + "&c=clv1";
      _sendBeacon(url, null, success, error);
      break;
  }
  
};

function _sendXHR(method, url, headers, body, apiKey, success, error) {
  // Called by:
  // Keen.Client.prototype.uploadEvent
  // Keen.Client.prototype.getJSON
  
  if (!apiKey) return Keen.log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
  
  console.log(arguments);
  
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        var response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          Keen.log("Could not JSON parse HTTP response: " + xhr.responseText);
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
        Keen.log("HTTP request failed.");
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
  
  if (!apiKey) return Keen.log('Please provide a writeKey for https://keen.io/project/' + this.client.projectId);
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

function _sendBeacon(url, apiKey, success, error){
  // Called by:
  // Keen.Client.prototype.uploadEvent
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
    if (success) { success({created: true}); }
  };
  
  img.onerror = function() {
    loaded = true;
    if (error) {
      error();
    }
  };
  
  img.src = url;
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
    }
    
    // Global Properties (test!)
    if (client._gp) {
      client.setGlobalProperties(client._gp);
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
      }
    }
    
    // onChartsReady Callbacks (test!)
    var callback = client._ocrq;
    if (callback && callback.length > 0) {
      for (var i=0; i < callack.length; i++) {
        var handler = callback[i];
        Keen.onChartsReady(handler);
      }
    }
    
  }
}