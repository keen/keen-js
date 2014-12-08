var base64 = require("base-64"),
    JSON2 = require("JSON2"),
    getUrlMaxLength = require("../utils/getUrlMaxLength"),
    getXHR = require("../utils/getXhr"),
    sendJsonp = require("../utils/sendJsonp"),
    sendBeacon = require("../utils/sendBeacon");

module.exports = function(url, data, api_key, success, error){
  var reqType = this.config.requestType,
      queryString = "",
      successCallback = success,
      errorCallback = error,
      stringMax;

  success = error = null;

  if ( (reqType === "jsonp" || reqType === "beacon") || !getXHR() ) {

    queryString += "?api_key="  + encodeURIComponent( api_key );
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
    this.post(url, data, api_key, successCallback, errorCallback);
  }
  else {
    this.trigger("error", "Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
  }
};
