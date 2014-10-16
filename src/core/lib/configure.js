Keen.prototype.configure = function(config){
  if (!config) {
    Keen.log("Check out our JavaScript SDK Usage Guide: https://github.com/keenlabs/keen-js/tree/master/docs");
  }

  if (!config.projectId) {
    Keen.log("Please provide a projectId");
  }

  if (!Keen.canXHR && config.requestType === "xhr") {
    config.requestType = "jsonp";
  }

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

  this.trigger('ready');
  Keen.trigger('client', this, config);
};
