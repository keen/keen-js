/*!
 * ----------------------
 * Keen IO Core
 * ----------------------
 */

function Keen(config) {
  this.configure(config || {});
}

Keen.version = "BUILD_VERSION"; // replaced

Keen.utils = {};

Keen.canXHR = false;
if (typeof XMLHttpRequest === "object" || typeof XMLHttpRequest === "function") {
  if ("withCredentials" in new XMLHttpRequest()) {
    Keen.canXHR = true;
  }
}

Keen.urlMaxLength = 16000;
if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
  Keen.urlMaxLength = 2000;
}

Keen.loaded = true;
Keen.ready = function(callback){
  if (Keen.loaded) {
    callback();
  } else {
    Keen.on('ready', callback);
  }
};

Keen.log = function(message) {
  if (typeof console == "object") {
    console.log('[Keen IO]', message);
  }
};
