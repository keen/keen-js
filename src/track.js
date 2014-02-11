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

  
  // Handle Queued Commands
  // -------------------------------

  /*
  Keen.sync = function(cache){
    for (var instance in cache) {
      console.log(instance);
    }
  }*/

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
