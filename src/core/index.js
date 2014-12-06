var each = require("./utils/each"),
    events = require("./events"),
    extend = require("./utils/extend"),
    parseParams = require("./utils/parseParams");

function Keen(config) {
  this.configure(config || {});
  // this.on("error", function(msg){
  //   Keen.log(msg);
  // });
  Keen.trigger("client", this);
}

extend(Keen, events);

Keen.version = "BUILD_VERSION"; // Overwritten @ build
Keen.enabled = true;

Keen.utils = {
  "each": each,
  "extend": extend,
  "parseParams": parseParams
};

Keen.loaded = true;
Keen.ready = function(callback){
  if (Keen.loaded) {
    callback();
  } else {
    Keen.on('ready', callback);
  }
};

Keen.debug = false;
Keen.log = function(message) {
  if (Keen.debug && typeof console == "object") {
    console.log('[Keen IO]', message);
  }
};

Keen.urlMaxLength = 16000;
var root = "undefined" == typeof window ? this : window;
if (typeof root == "window") {
  if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
    Keen.urlMaxLength = 2000;
  }
}

extend(Keen.prototype, events);
extend(Keen.prototype, {
  "configure"           : require("./lib/configure"),
  "masterKey"           : require("./lib/masterKey"),
  "projectId"           : require("./lib/projectId"),
  "readKey"             : require("./lib/readKey"),
  "setGlobalProperties" : require("./lib/setGlobalProperties"),
  "url"                 : require("./lib/url"),
  "writeKey"            : require("./lib/writeKey")
});

// from superagent.js
// var context = (typeof root == 'window') ? "browser" : "server";

module.exports = Keen;
