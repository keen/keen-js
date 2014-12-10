function sendBeacon(url, params, success, error){
  var successCallback = success,
      errorCallback = error,
      loaded = false,
      img = document.createElement("img");

  success = null;
  error = null;

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
    if (successCallback) {
      successCallback({created: true});
      successCallback = errorCallback = null;
    }
  };
  img.onerror = function() {
    loaded = true;
    if (errorCallback) {
      errorCallback();
      successCallback = errorCallback = null;
    }
  };
  img.src = url + "&c=clv1";
}

module.exports = sendBeacon;
