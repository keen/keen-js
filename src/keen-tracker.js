;(function (f) {
  // RequireJS
  if (typeof define === "function" && define.amd) {
    define("keen", [], function(){ return f(); });
  }
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  }
  // Global
  var g = null;
  if (typeof window !== "undefined") {
    g = window;
  } else if (typeof global !== "undefined") {
    g = global;
  } else if (typeof self !== "undefined") {
    g = self;
  }
  if (g) {
    g.Keen = f();
  }
})(function() {
  "use strict";

  var Keen = require("./core"),
      extend = require("./core/utils/extend");

  extend(Keen.prototype, {
    "addEvent"            : require("./core/lib/addEvent"),
    "addEvents"           : require("./core/lib/addEvents"),
    "setGlobalProperties" : require("./core/lib/setGlobalProperties"),
    "trackExternalLink"   : require("./core/lib/trackExternalLink")
  });

  Keen.Base64 = require("./core/utils/base64");
  Keen.utils = {
    "domready"     : require("domready"),
    "each"         : require("./core/utils/each"),
    "extend"       : extend,
    "parseParams"  : require("./core/utils/parseParams")
  };

  if (Keen.loaded) {
    setTimeout(function(){
      Keen.utils.domready(function(){
        Keen.emit("ready");
      });
    }, 0);
  }
  require("./core/async")();

  module.exports = Keen;
  return Keen;
});
