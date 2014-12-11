var Keen = require("../core"),
    each = require("../core/utils/each"),
    extend = require("../core/utils/extend");

var addEvent = require("../core/lib/addEvent"),
    setGlobalProperties = require("../core/lib/setGlobalProperties");

var get = require("./lib/get"),
    post = require("./lib/post"),
    del = require("./lib/del");

var runQuery = require("../core/lib/run");

// Keen.Events = require("../core/events");
Keen.Query = require("../core/query");
Keen.Request = require("../core/request");
Keen.Dataset = require("../dataset")

extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "setGlobalProperties" : setGlobalProperties,
  "get"                 : get,
  "post"                : post,
  "put"                 : post,
  "del"                 : del,
  "run"                 : runQuery
});

Keen.utils = {
  "each"   : each,
  "extend" : extend
};

module.exports = Keen;
