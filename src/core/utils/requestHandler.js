var Keen = require("../index"),
    base64 = require("base-64"),
    extend = require("./extend"),
    getXHR = require("./getXhr"),
    JSON2 = require("JSON2"),
    sendXhr = require("./sendXhr"),
    sendJsonp = require("./sendJsonp"),
    sendBeacon = require("./sendBeacon"),
    getUrlMaxLength = require("./getUrlMaxLength");

var methods = {
  "GET"    : get,  // xhr, jsonp, or beacon
  "POST"   : post, // xhr
  "PUT"    : post  // xhr
  // "DELETE" : del
};

module.exports = function(url, data, api_key, success, error, async){
  var method = ( this.config.requestType === "xhr" && getXHR() ) ? "POST" : "GET";
  methods[method].apply(this, arguments);
  return;
}

function get(url, data, api_key, success, error){
  var reqType = this.config.requestType,
      queryString = "",
      successCallback = success,
      errorCallback = error,
      stringMax;

  success = error = null;

  if ( (reqType === "jsonp" || reqType === "beacon") || !getXHR() ) {

    queryString += "?api_key="  + encodeURIComponent( this.writeKey() );
    queryString += "&data="     + encodeURIComponent( base64.encode( JSON2.stringify(data) ) );
    queryString += "&modified=" + encodeURIComponent( new Date().getTime() );

    if ( String(url + queryString).length < getUrlMaxLength() ) {
      if (reqType === "jsonp") {
        sendJsonp.call(this, url + queryString, null, successCallback, errorCallback);
      }
      else {
        sendBeacon.call(this, url + queryString, null, successCallback, errorCallback);
      }
      return;
    }

  }
  if ( getXHR() ) {
    post.apply(this, arguments);
  }
  else {
    this.trigger("error", "Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
  }
}

function post(url, data, api_key, success, error, async){
  var successCallback = success,
      errorCallback = error,
      isAsync = async || true;

  success = error = null;
  sendXhr.call(this, "POST", url, {
      "Authorization": api_key,
      "Content-Type": "application/json"
    }, data, successCallback, errorCallback, isAsync);
}
