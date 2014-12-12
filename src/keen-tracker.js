"use strict";

var Keen = require("./core"),
    each = require("./core/utils/each"),
    extend = require("./core/utils/extend"),
    parseParams = require("./core/utils/parseParams");

var addEvent = require("./core/lib/addEvent"),
    setGlobalProperties = require("./core/lib/setGlobalProperties"),
    trackExternalLink = require("./core/lib/trackExternalLink");

var get = require("./core/lib/get"),
    post = require("./core/lib/post");

var domready = require("domready");

extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "setGlobalProperties" : setGlobalProperties,
  "trackExternalLink"   : trackExternalLink,
  "get"                 : get,
  "post"                : post,
  "put"                 : post
});

Keen.utils = {
  "each"         : each,
  "extend"       : extend,
  "parseParams"  : parseParams,
  "domready"     : domready
};

if (Keen.loaded) {
  setTimeout(function(){
    domready(function(){
      Keen.trigger("ready");
    })
  }, 0);
}
require("./core/async")();

module.exports = Keen;
