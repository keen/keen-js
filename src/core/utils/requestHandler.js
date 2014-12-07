var Keen = require("../index"),
    base64 = require("base-64"),
    extend = require("./extend"),
    getXHR = require("./getXhr"),
    JSON2 = require("JSON2"),
    sendXhr = require("./sendXhr"),
    sendJsonp = require("./sendJsonp"),
    sendBeacon = require("./sendBeacon"),
    getUrlMaxLength = require("./getUrlMaxLength");

module.exports = function(url, data, api_key, success, error, async){
  var reqType = this.config.requestType,
      queryString = "",
      successCallback = success,
      errorCallback = error,
      isAsync = async || true,
      stringMax;

  success = error = null;

  if (reqType === "jsonp" || reqType === "beacon") {
    queryString += "?api_key="  + encodeURIComponent( this.writeKey() );
    queryString += "&data="     + encodeURIComponent( base64.encode( JSON2.stringify(data) ) );
    queryString += "&modified=" + encodeURIComponent( new Date().getTime() );
    if ( String(url + queryString).length < getUrlMaxLength() ) {
      if (reqType === "jsonp") {
        sendJsonp(url + queryString, null, successCallback, errorCallback);
      }
      else {
        sendBeacon(url + queryString, null, successCallback, errorCallback);
      }
      return;
    }
  }
  if (getXHR()) {
    sendXhr("POST", url, {
        "Authorization": this.writeKey(),
        "Content-Type": "application/json"
      }, data, successCallback, errorCallback, async);
  }
  else {
    Keen.log("Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
  }
}
