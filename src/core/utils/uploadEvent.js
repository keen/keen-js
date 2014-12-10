var Keen = require("../index"),
    each = require("./each"),
    getContext = require("./getContext"),
    getXHR = require("./getXhr");

function uploadEvent(eventCollection, payload, success, error, async) {
  var method = "post",
      data = {},
      urlBase;

  // Use GET if requested in browser configuration
  if ( getContext() === "browser" && this.config.requestType === "xhr" && getXHR() ) {
    method = "get";
  }

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

  this[method](urlBase, data, this.writeKey(), success, error, async);
  return;
};

module.exports = uploadEvent;
