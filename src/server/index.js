var Keen = require("../core"),
    extend = require("../core/utils/extend");

var addEvent = require("../core/lib/addEvent"),
    setGlobalProperties = require("../core/lib/setGlobalProperties"),
    get = require("./lib/get"),
    post = require("./lib/post"),
    del = require("./lib/del");

extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "setGlobalProperties" : setGlobalProperties,
  "get": get,
  "post": post,
  "put": post,
  "del": del
});

module.exports = Keen;
