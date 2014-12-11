var JSON2 = require("JSON2");

var Keen = require("../index"),
    base64 = require("./base64"),
    each = require("./each"),
    getContext = require("../helpers/getContext"),
    getXHR = require("../helpers/getXhrObject"),
    getQueryString = require("../helpers/getQueryString");

module.exports = function(collection, payload, success, error, async) {
  var urlBase = this.url("/projects/" + this.projectId() + "/events/" + collection),
      reqType = this.config.requestType,
      queryString = "",
      data = {},
      successCallback = success,
      errorCallback = error,
      isAsync = async || true,
      sent = false;

  success = error = null;

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
        this.get(urlBase+queryString, null, null, successCallback, errorCallback);
      }
      catch(e) {
        sent = false;
      }
    }
    if ((reqType === "xhr" || !sent) && getXHR()) {
      this.post(urlBase, data, this.writeKey(), successCallback, errorCallback, isAsync);
    }
    else{
      this.trigger("error", "Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
    }
  }
  else {
    this.post(urlBase, data, this.writeKey(), successCallback, errorCallback, isAsync);
  }
  successCallback = errorCallback = null;
  return;
};
