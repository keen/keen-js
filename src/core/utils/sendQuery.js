var getContext = require("../helpers/getContext"),
    getXHR = require("../helpers/getXhrObject");

module.exports = function(path, params, success, error){
  var urlBase = this.url("/projects/" + this.projectId() + path),
      reqType = this.config.requestType,
      successCallback = success,
      errorCallback = error,
      sent = false;

  success = error = null;

  if (!this.projectId()) {
    this.trigger("error", "Query not sent: Missing projectId property");
    return;
  }

  if (!this.readKey()) {
    this.trigger("error", "Query not sent: Missing readKey property");
    return;
  }

  if ( getContext() === "browser") {
    // Use GET when requests in browser (and for all extractions, which do not currently support JSONP)
    if ((reqType !== "xhr" || !getXHR()) && path.indexOf("extraction") < 0) {
      try {
        sent = true;
        this.get(urlBase, params, this.readKey(), successCallback, errorCallback);
      }
      catch(e){
        sent = false;
      }
    }
    if ((reqType === "xhr" || !sent) && getXHR()) {
      this.post(urlBase, params, this.readKey(), successCallback, errorCallback, true);
    }
    else {
      this.trigger("error", "Query not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
    }
  }
  else {
    this.post(urlBase, params, this.readKey(), successCallback, errorCallback, true);
  }
  successCallback = errorCallback = null;
  return;
}
