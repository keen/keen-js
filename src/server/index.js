var Keen = require("../core"),
    each = require("../core/utils/each"),
    extend = require("../core/utils/extend");

var addEvent = require("../core/lib/addEvent"),
    setGlobalProperties = require("../core/lib/setGlobalProperties"),
    get = require("./lib/get"),
    post = require("./lib/post"),
    del = require("./lib/del");

Keen.Query = require("../core/query");

extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "setGlobalProperties" : setGlobalProperties,
  "get"                 : get,
  "post"                : post,
  "put"                 : post,
  "del"                 : del
});

Keen.utils = {
  "each"   : each,
  "extend" : extend
};

module.exports = Keen;
