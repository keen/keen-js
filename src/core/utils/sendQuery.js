var getContext = require("../helpers/getContext"),
    getXHR = require("../helpers/getXhrObject");

module.exports = function(path, params, success, error){
  var method = "post",
      successCallback = success,
      errorCallback = error,
      urlBase;

  success = error = null;

  if (!this.projectId()) {
    this.trigger("error", "Query not sent: Missing projectId property");
    return;
  }

  if (!this.readKey()) {
    this.trigger("error", "Query not sent: Missing readKey property");
    return;
  }

  // Use GET if requested in browser configuration
  if ( getContext() === "browser" && this.config.requestType === "xhr" && getXHR() ) {
    method = "get";
  }

  // Extractions do not currently support JSONP
  if (path.indexOf("extraction") > -1) {
    method = "post";
  }

  urlBase = this.url("/projects/" + this.projectId() + path);

  this[method](urlBase, params, this.readKey(), success, error, async);

  successCallback = errorCallback = null;
  return;
}
