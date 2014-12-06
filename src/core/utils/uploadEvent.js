var Keen = require("../index"),
    each = require("./each");

module.exports = function(eventCollection, payload, success, error, async) {
  var urlBase, data = {};

  if (!Keen.enabled) {
    Keen.log("Event not recorded: Keen.enabled = false");
    return;
  }

  if (!this.projectId()) {
    Keen.log("Event not recorded: Missing projectId property");
    return;
  }

  if (!this.writeKey()) {
    Keen.log("Event not recorded: Missing writeKey property");
    return;
  }

  // Add properties from client.globalProperties
  if (this.config.globalProperties) {
    data = this.config.globalProperties(eventCollection);
  }
  // Add properties from user-defined event
  each(payload, function(value, key){
    data[key] = value;
  });

  urlBase = this.url("/projects/" + this.projectId() + "/events/" + eventCollection);
  Keen.requestHandler.call(this, urlBase, data, this.writeKey(), success, error, async);
  return;
};
