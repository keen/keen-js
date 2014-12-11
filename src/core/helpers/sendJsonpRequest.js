function sendJsonp(url, params, callback){
  var self = this,
      timestamp = new Date().getTime(),
      cb = callback,
      script = document.createElement("script"),
      parent = document.getElementsByTagName("head")[0],
      callbackName = "keenJSONPCallback",
      loaded = false;

  var error_msg = "Event not recorded: JSONP could not be sent";

  callback = null;

  callbackName += timestamp;
  while (callbackName in window) {
    callbackName += "a";
  }
  window[callbackName] = function(response) {
    if (loaded === true) return;
    loaded = true;
    if (cb && response) {
      cb(null, response);
    };
    cleanup();
  };

  script.src = url + "&jsonp=" + callbackName;
  parent.appendChild(script);

  // for early IE w/ no onerror event
  script.onreadystatechange = function() {
    if (loaded === false && this.readyState === "loaded") {
      loaded = true;
      self.trigger("error", error_msg);
      if (cb) {
        cb(error_msg, null);
      }
    }
  };

  // non-ie, etc
  script.onerror = function() {
    // on IE9 both onerror and onreadystatechange are called
    if (loaded === false) {
      loaded = true;
      self.trigger("error", error_msg);
      if (cb) {
        cb(error_msg, null);
      }
      cleanup();
    }
  };

  function cleanup(){
    window[callbackName] = undefined;
    try{
      delete window[callbackName];
    }catch(e){}
    cb = null;
    parent.removeChild(script);
  }
}

module.exports = sendJsonp;
