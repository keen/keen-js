  /*!
  * -------------------
  * Keen IO Tracker JS
  * -------------------
  */

  Keen.prototype.addEvent = function(eventCollection, payload, success, error) {
    _uploadEvent.apply(this, arguments);
  };

  Keen.prototype.addEvents = function() {
    var isSingular = typeof arguments[0] === 'string';
    if(isSingular) {
      _addSingular.apply(this, arguments);
    } else {
      _addMultiple.apply(this, arguments);
    }
  };

  Keen.prototype.queueEvent = function(eventCollection, payload, timeout, success, error) { 
    timeout = timeout || 3000;
    setTimeout(function() {
      this.addEvent(eventCollection, payload, success, error);
    }.bind(this), timeout);
  };

  Keen.prototype.queueEvents = function(payloads, timeout, success, error) {
    //keen.queueEvents([{ collectionOne: [{ a : 1 }], collectionTwo: [{ a : 2 ] }], 60000, success, error)
    timeout = timeout ? timeout : 3000;

    setTimeout(function() {
      _addMultiple.call(this, payloads, success, error);
    }.bind(this), timeout);

  };

  Keen.prototype.trackExternalLink = function(jsEvent, eventCollection, payload, timeout, timeoutCallback){

    var evt = jsEvent,
        target = (evt.currentTarget) ? evt.currentTarget : (evt.srcElement || evt.target),
        timer = timeout || 500,
        triggered = false,
        targetAttr = "",
        callback,
        win;

    if (target.getAttribute !== void 0) {
      targetAttr = target.getAttribute("target");
    } else if (target.target) {
      targetAttr = target.target;
    }

    if ((targetAttr == "_blank" || targetAttr == "blank") && !evt.metaKey) {
      win = window.open("about:blank");
      win.document.location = target.href;
    }

    if (target.nodeName === "A") {
      callback = function(){
        if(!triggered && !evt.metaKey && (targetAttr !== "_blank" && targetAttr !== "blank")){
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
    } else {
      Keen.log("#trackExternalLink method not attached to an <a> or <form> DOM element");
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

  /**
   * Adds multiple events to one collection
   * @param {[string]} eventCollection [description]
   * @param {[array]} payloadArray    [description]
   * @param {[function]} success         [description]
   * @param {[function]} error           [description]
   */
  function _addSingular (eventCollection, payloadArray, success, error) {
    _each(payloadArray, function (payload) {
      _uploadEvent.apply(this, [eventCollection, payload, success, error]);
    }.bind(this));
  }

  /**
   * Add multiple events to multiple collections
   * Example usage: https://github.com/keenlabs/keen-js/issues/108#issuecomment-48946445
   * 
   */
  function _addMultiple (payloadArray, success, error) {
    self     = this;
    _each(payloadArray, function(payloads) {
      _each(payloads, function(payload, eventCollection) {
        _uploadEvent.apply(self, [eventCollection, payload, success, error]);
      });
    });
  }

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

    // Switch the request
    if(this.client.requestType === 'jsonp' && newEvent.length > 2083) {
      this.client.requestType = 'xhr';
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
        url = url + "&data=" + encodeURIComponent(base64Body);
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