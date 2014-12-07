var each = require("./utils/each"),
    events = require("./events"),
    extend = require("./utils/extend"),
    parseParams = require("./utils/parseParams");

var addEvent = require("./lib/addEvent"),
    configure = require("./lib/configure"),
    masterKey = require("./lib/masterKey"),
    projectId = require("./lib/projectId"),
    readKey = require("./lib/readKey"),
    setGlobalProperties = require("./lib/setGlobalProperties"),
    url = require("./lib/url"),
    writeKey = require("./lib/writeKey");

function Keen(config) {
  this.configure(config || {});
  Keen.trigger("client", this);
}

extend(Keen, events);

extend(Keen.prototype, events);
extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "configure"           : configure,
  "masterKey"           : masterKey,
  "projectId"           : projectId,
  "readKey"             : readKey,
  "setGlobalProperties" : setGlobalProperties,
  "url"                 : url,
  "writeKey"            : writeKey
});

Keen.version = "BUILD_VERSION"; // Overwritten @ build
Keen.enabled = true;

Keen.utils = {
  "each"        : each,
  "extend"      : extend,
  "parseParams" : parseParams
};

Keen.loaded = true;
Keen.ready = function(fn){
  if (Keen.loaded) {
    fn();
  } else {
    Keen.on("ready", fn);
  }
};

Keen.debug = false;
Keen.log = function(message) {
  if (Keen.debug && typeof console == "object") {
    console.log("[Keen IO]", message);
  }
};

module.exports = Keen;
