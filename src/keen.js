;(function (f) {
  // RequireJS
  if (typeof define === "function" && define.amd) {
    // define([], f);
    define("keen", [], function(lib){ return f(); });
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

  var Keen = require("./core"),
      extend = require("./core/utils/extend");

  Keen.requestHandler = require("./core/utils/requestHandler");
  Keen.Spinner = require("spin.js");

  extend(Keen.prototype, {
    "addEvent"            : require("./core/lib/addEvent"),
    "setGlobalProperties" : require("./core/lib/setGlobalProperties"),
    "trackExternalLink"   : require("./core/lib/trackExternalLink")
  });

  extend(Keen.utils, {
    "parseParams" : require("./core/utils/parseParams"),
    "domready"    : require("domready")
  });

  return Keen;
});
