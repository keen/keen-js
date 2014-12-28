"use strict";

var Keen = require("./core"),
    extend = require("./core/utils/extend");

extend(Keen.prototype, {
  "addEvent"            : require("./core/lib/addEvent"),
  "addEvents"           : require("./core/lib/addEvents"),
  "setGlobalProperties" : require("./core/lib/setGlobalProperties"),
  "trackExternalLink"   : require("./core/lib/trackExternalLink"),
  "get"                 : require("./core/lib/get"),
  "post"                : require("./core/lib/post"),
  "put"                 : require("./core/lib/post")
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
