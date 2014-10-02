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

  function _uploadEvent(eventCollection, payload, success, error) {
    var urlBase = _build_url.call(this, "/events/" + eventCollection),
        urlQueryString = "",
        reqType = this.client.requestType,
        data = {};

    // Add properties from client.globalProperties
    if (this.client.globalProperties) {
      data = this.client.globalProperties(eventCollection);
    }

    // Add properties from user-defined event
    _each(payload, function(value, key){
      data[key] = value;
    });

    if (reqType !== "xhr") {
      urlQueryString += "?api_key="  + encodeURIComponent( this.client.writeKey );
      urlQueryString += "&data="     + encodeURIComponent( Keen.Base64.encode( JSON.stringify(data) ) );
      urlQueryString += "&modified=" + encodeURIComponent( new Date().getTime() );

      if ( String(urlBase + urlQueryString).length < Keen.urlMaxLength ) {
        if (reqType === "jsonp") {
          _sendJsonp(urlBase + urlQueryString, null, success, error);
        } else {
          _sendBeacon(urlBase + urlQueryString, null, success, error);
        }
        return;
      }
    }
    if (Keen.canXHR) {
      _sendXhr("POST", urlBase, { "Authorization": this.client.writeKey, "Content-Type": "application/json" }, data, success, error);
    }
    return;
  };
