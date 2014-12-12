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

var runQuery = require("./core/lib/run");
var drawQuery = require("./dataviz/extensions/draw");

var Spinner = require("spin.js"),
    domready = require("domready");

Keen.Query = require("./core/query");
Keen.Request = require("./core/request");

extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "setGlobalProperties" : setGlobalProperties,
  "trackExternalLink"   : trackExternalLink,
  "get"                 : get,
  "post"                : post,
  "put"                 : post,
  "run"                 : runQuery,
  "draw"                : drawQuery
});

Keen.utils = {
  "each"         : each,
  "extend"       : extend,
  "parseParams"  : parseParams,
  "domready"     : domready
};

Keen.Spinner = Spinner;
Keen.Dataset = require("./dataset");
Keen.Dataviz = require("./dataviz");
extend(Keen.utils, {
  "loadScript"   : require("./dataviz/utils/loadScript"),
  "loadStyle"    : require("./dataviz/utils/loadStyle"),
  "prettyNumber" : require("./dataviz/utils/prettyNumber")
});
require("./dataviz/adapters/keen-io")();
require("./dataviz/adapters/google")();
require("./dataviz/adapters/c3")();
// require("./dataviz/adapters/chartjs")();

if (Keen.loaded) {
  setTimeout(function(){
    domready(function(){
      Keen.trigger("ready");
    })
  }, 0);
}
require("./core/async")();

module.exports = Keen;
