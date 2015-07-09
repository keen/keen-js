var Keen = require("../core"),
    extend = require("../core/utils/extend");

extend(Keen.prototype, {
  "addEvent"            : require("../core/lib/addEvent"),
  "addEvents"           : require("../core/lib/addEvents"),
  "setGlobalProperties" : require("../core/lib/setGlobalProperties"),
  "get"                 : require("./lib/get"),
  "post"                : require("../core/lib/post"),
  "put"                 : require("../core/lib/post"),
  "del"                 : require("./lib/del"),
  "run"                 : require("../core/lib/run")
});

Keen.Query = require("../core/query");
Keen.Request = require("../core/request");
Keen.Dataset = require("../dataset");

Keen.utils = {
  "each"            : require("../core/utils/each"),
  "extend"          : extend,
  "encryptScopedKey": require("./utils/encryptScopedKey"),
  "decryptScopedKey": require("./utils/decryptScopedKey")
};

Keen.version = require('../../package.json').version;

module.exports = Keen;
