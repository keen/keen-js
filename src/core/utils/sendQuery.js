var getContext = require("../helpers/getContext"),
    getXHR = require("../helpers/getXhrObject");

module.exports = function(path, params, callback){
  var urlBase = this.url(path),
      reqType = this.config.requestType,
      cb = callback,
      sent = false;

  callback = null;

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
        this.get(urlBase, params, this.readKey(), cb);
      }
      catch(e){
        sent = false;
      }
    }
    if ((reqType === "xhr" || !sent) && getXHR()) {
      this.post(urlBase, params, this.readKey(), cb, true);
      cb = null;
    }
    else {
      this.trigger("error", "Query not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
    }
  }
  else {
    this.post(urlBase, params, this.readKey(), cb, true);
    cb = null;
  }
  return;
}
