var JSON2 = require("JSON2");

var Keen = require("../index");

var base64 = require("../utils/base64"),
    each = require("../utils/each"),
    getXHR = require("../helpers/getXhrObject");
    // getQueryString = require("../helpers/getQueryString");

module.exports = function(collection, payload, callback, async) {
  var urlBase = this.url("/events/" + collection),
      reqType = this.config.requestType,
      data = {},
      cb = callback,
      isAsync = async || true,
      sent = false,
      error_msg;

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

  if (reqType !== "xhr" || !getXHR()){
    try {
      sent = true;
      this.get(urlBase, {
        "data"     : base64.encode(JSON2.stringify(data)),
        "modified" : new Date().getTime()
      }, this.writeKey(), cb);
    }
    catch(e) {
      sent = false;
    }
  }
  if ((reqType === "xhr" || !sent) && getXHR()) {
    this.post(urlBase, data, this.writeKey(), cb, isAsync);
  }
  else{
    this.trigger("error", "Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
  }
  callback = cb = null;
  return;
};
