function _sendJsonp(url, params, success, error){
  var timestamp = new Date().getTime(),
      successCallback = success,
      errorCallback = error,
      script = document.createElement("script"),
      parent = document.getElementsByTagName("head")[0],
      callbackName = "keenJSONPCallback",
      loaded = false;

  success = null;
  error = null;

  callbackName += timestamp;
  while (callbackName in window) {
    callbackName += "a";
  }
  window[callbackName] = function(response) {
    if (loaded === true) return;
    loaded = true;
    if (successCallback && response) {
      successCallback(response);
    };
    cleanup();
  };

  script.src = url + "&jsonp=" + callbackName;
  parent.appendChild(script);

  // for early IE w/ no onerror event
  script.onreadystatechange = function() {
    if (loaded === false && this.readyState === "loaded") {
      loaded = true;
      if (errorCallback) {
        errorCallback();
      }
    }
  };

  // non-ie, etc
  script.onerror = function() {
    // on IE9 both onerror and onreadystatechange are called
    if (loaded === false) {
      loaded = true;
      if (errorCallback) {
        errorCallback();
      }
      cleanup();
    }
  };

  function cleanup(){
    window[callbackName] = undefined;
    try{
      delete window[callbackName];
    }catch(e){}
    successCallback = errorCallback = null;
    parent.removeChild(script);
  }
}
