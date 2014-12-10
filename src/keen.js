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
      each = require("./core/utils/each"),
      extend = require("./core/utils/extend"),
      parseParams = require("./core/utils/parseParams");

  var Spinner = require("spin.js"),
      domready = require("domready");

  var addEvent = require("./core/lib/addEvent"),
      setGlobalProperties = require("./core/lib/setGlobalProperties"),
      trackExternalLink = require("./core/lib/trackExternalLink"),
      get = require("./core/lib/get"),
      post = require("./core/lib/post");

  extend(Keen.prototype, {
    "addEvent"            : addEvent,
    "setGlobalProperties" : setGlobalProperties,
    "trackExternalLink"   : trackExternalLink,
    "get"                 : get,
    "post"                : post,
    "put"                 : post
  });

  Keen.utils = {
    "each"        : each,
    "extend"      : extend,
    "parseParams" : parseParams,
    "domready"    : domready
  };

  Keen.Spinner = Spinner;

  return Keen;
});
