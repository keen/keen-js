var extend = require("../utils/extend"),
    getQueryString = require("../helpers/getQueryString"),
    getUrlMaxLength = require("../helpers/getUrlMaxLength"),
    sendJsonp = require("../helpers/sendJsonpRequest"),
    sendBeacon = require("../helpers/sendBeaconRequest");

module.exports = function(url, data, api_key, callback, config){
  var reqType = this.config.requestType,
      cb = callback,
      queryString = "",
      body,
      queryString;

  if (data && api_key) {
    body = extend({ api_key: api_key }, data);
    queryString = getQueryString( body );
  }

  if ( String(url + queryString).length > getUrlMaxLength()) {
    throw "URL length exceeds current browser limit";
  }

  // Send beacon if requested
  if (reqType === "beacon" && !data && !api_key) {
    sendBeacon.call(this, url + queryString, null, cb);
  }
  else {
    sendJsonp.call(this, url + queryString, null, cb);
  }
  cb = callback = null;
};
