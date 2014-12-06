var Keen = require("../index"),
    request = require("superagent");

module.exports = function(url, data, api_key, success, error, async){
  console.log("Handle request with superagent");
  return;

  // var reqType = this.config.requestType,
  //     handler = Keen.requestHandlers[reqType],
  //     queryString = "",
  //     successCallback = success,
  //     errorCallback = error,
  //     isAsync = async || true;
  //
  // success = error = null;
  //
  // if (reqType === "jsonp" || reqType === "beacon") {
  //   queryString += "?api_key="  + encodeURIComponent( this.writeKey() );
  //   queryString += "&data="     + encodeURIComponent( base64.encode( JSON2.stringify(data) ) );
  //   queryString += "&modified=" + encodeURIComponent( new Date().getTime() );
  //   if ( String(url + queryString).length < Keen.urlMaxLength ) {
  //     if (reqType === "jsonp") {
  //       sendJsonp(url + queryString, null, successCallback, errorCallback);
  //     }
  //     else {
  //       sendBeacon(url + queryString, null, successCallback, errorCallback);
  //     }
  //     return;
  //   }
  // }
  // if (getXHR()) {
  //   sendXhr("POST", url, {
  //       "Authorization": this.writeKey(),
  //       "Content-Type": "application/json"
  //     }, data, successCallback, errorCallback, async);
  // }
  // else {
  //   Keen.log("Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
  // }
}
