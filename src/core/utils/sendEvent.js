var JSON2 = require("JSON2");

var Keen = require("../index"),
    base64 = require("./base64"),
    each = require("./each"),
    getContext = require("../helpers/getContext"),
    getXHR = require("../helpers/getXhrObject"),
    getQueryString = require("../helpers/getQueryString");

module.exports = function(collection, payload, callback, async) {
  var urlBase = this.url("/events/" + collection),
      reqType = this.config.requestType,
      queryString = "",
      data = {},
      cb = callback,
      isAsync = async || true,
      sent = false;

  var error_msg;

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

  // Attach properties from client.globalProperties
  if (this.config.globalProperties) {
    data = this.config.globalProperties(collection);
  }
  // Attach properties from user-defined event
  each(payload, function(value, key){
    data[key] = value;
  });

  if ( getContext() === "browser") {
    if (reqType !== "xhr" || !getXHR()){
      try {
        sent = true;
        queryString = getQueryString({
          "api_key"  : this.writeKey(),
          "data"     : base64.encode(JSON2.stringify(data)),
          "modified" : new Date().getTime()
        });
        this.get(urlBase+queryString, null, null, cb);
      }
      catch(e) {
        sent = false;
      }
    }
    if ((reqType === "xhr" || !sent) && getXHR()) {
      this.post(urlBase, data, this.writeKey(), cb, isAsync);
      cb = null;
    }
    else{
      this.trigger("error", "Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
    }
  }
  else {
    this.post(urlBase, data, this.writeKey(), cb, isAsync);
    cb = null;
  }
  return;
};
