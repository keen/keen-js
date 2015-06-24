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
    "get"                 : require("./core/lib/get"),
    "run"                 : require("./core/lib/run")
  });

  Keen.Query = require("./core/query");
  Keen.Request = require("./core/request");

  Keen.utils = {
    "each"         : require("./core/utils/each"),
    "extend"       : extend,
    "parseParams"  : require("./core/utils/parseParams"),
  };

  Keen.emit("ready");

  module.exports = Keen;
  return Keen;
});
