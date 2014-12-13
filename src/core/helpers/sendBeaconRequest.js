function sendBeacon(url, params, callback){
  var self = this,
      cb = callback,
      loaded = false,
      img = document.createElement("img");

  var error_msg = "Beacon request failed";

  callback = null;
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
    if (cb) {
      cb(null, { created: true });
      cb = null;
    }
  };
  img.onerror = function() {
    loaded = true;
    self.trigger("error", error_msg);
    if (cb) {
      cb(error_msg, null);
      cb = null;
    }
  };
  img.src = url + "&c=clv1";
}

module.exports = sendBeacon;
