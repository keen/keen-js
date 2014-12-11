var root = this;
var previous_Keen = root.Keen;

var events = require("./events"),
    extend = require("./utils/extend");

function Keen(config) {
  this.configure(config || {});
  Keen.trigger("client", this);
}

Keen.debug = false;
Keen.enabled = true;
Keen.loaded = true;
Keen.synced = false;
Keen.version = "BUILD_VERSION"; // Overwritten @ build

extend(Keen, events);
extend(Keen.prototype, events);

Keen.prototype.configure = function(cfg){
  var config = cfg || {};
  if (config["host"]) {
    config["host"].replace(/.*?:\/\//g, '');
  }
  if (config.protocol && config.protocol === "auto") {
    config["protocol"] = location.protocol.replace(/:/g, '');
  }
  this.config = {
    projectId   : config.projectId,
    writeKey    : config.writeKey,
    readKey     : config.readKey,
    masterKey   : config.masterKey,
    requestType : config.requestType || "jsonp",
    host        : config["host"]     || "api.keen.io/3.0",
    protocol    : config["protocol"] || "https",
    globalProperties: null
  };
  if (Keen.debug) {
    this.on("error", Keen.log);
  }
  this.trigger("ready");
};

Keen.prototype.projectId = function(str){
  if (!arguments.length) return this.config.projectId;
  this.config.projectId = (str ? String(str) : null);
  return this;
};

Keen.prototype.masterKey = function(str){
  if (!arguments.length) return this.config.masterKey;
  this.config.masterKey = (str ? String(str) : null);
  return this;
};

Keen.prototype.readKey = function(str){
  if (!arguments.length) return this.config.readKey;
  this.config.readKey = (str ? String(str) : null);
  return this;
};

Keen.prototype.writeKey = function(str){
  if (!arguments.length) return this.config.writeKey;
  this.config.writeKey = (str ? String(str) : null);
  return this;
};

Keen.prototype.url = function(path){
  return this.config.protocol + "://" + this.config.host + path;
};

Keen.log = function(message) {
  if (Keen.debug && typeof console == "object") {
    console.log("[Keen IO]", message);
  }
};

Keen.noConflict = function(){
  root.Keen = previous_Keen;
  return Keen;
};

Keen.ready = function(fn){
  if (Keen.loaded) {
    fn();
  } else {
    Keen.once("ready", fn);
  }
};

module.exports = Keen;
