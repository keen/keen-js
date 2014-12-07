var Keen = require("../index"),
    each = require("./each");

function uploadEvent(eventCollection, payload, success, error, async) {
  var urlBase, data = {};

  if (!Keen.enabled) {
    this.trigger("error", "Event not recorded: Keen.enabled = false");
    return;
  }

  if (!this.projectId()) {
    this.trigger("error", "Event not recorded: Missing projectId property");
    return;
  }

  if (!this.writeKey()) {
    this.trigger("error", "Event not recorded: Missing writeKey property");
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

module.exports = uploadEvent;
