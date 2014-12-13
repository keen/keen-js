var Keen = require("../../core/index"),
    each = require("../../core/utils/each");

module.exports = function(collection, payload, callback) {
  var url = this.url("/events/" + collection),
      data = {},
      cb = callback,
      error_msg;

  callback = null;

  if (!Keen.enabled) {
    error_msg = "Event not recorded: Keen.enabled = false";
    this.trigger("error", error_msg);
    if (cb) {
      cb.call(this, error_msg, null);
    }
    return;
  }

  if (!this.projectId()) {
    error_msg = "Event not recorded: Missing projectId property";
    this.trigger("error", error_msg);
    if (cb) {
      cb.call(this, error_msg, null);
    }
    return;
  }

  if (!this.writeKey()) {
    error_msg = "Event not recorded: Missing writeKey property";
    this.trigger("error", error_msg);
    if (cb) {
      cb.call(this, error_msg, null);
    }
    return;
  }

  if (!collection || typeof collection !== "string") {
    error_msg = "Event not recorded: Collection name must be a string";
    this.trigger("error", error_msg);
    if (cb) {
      cb.call(this, error_msg, null);
    }
    return;
  }

  // Attach properties from client.globalProperties
  if (this.config.globalProperties) {
    data = this.config.globalProperties(collection);
  }
  // Attach properties from user-defined event
  each(payload, function(value, key){
    data[key] = value;
  });

  this.post(url, data, this.writeKey(), cb);
  cb = null;
};
