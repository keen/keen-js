var extend = require("../utils/extend"),
    getQueryString = require("../helpers/getQueryString"),
    getUrlMaxLength = require("../helpers/getUrlMaxLength"),
    sendJsonp = require("../helpers/sendJsonpRequest"),
    sendBeacon = require("../helpers/sendBeaconRequest");

module.exports = function(url, payload, api_key, callback){
  var data = payload || {},
      queryString = "",
      reqType = this.config.requestType,
      cb = callback,
      queryString;

  if (api_key) {
    extend(data, { api_key: api_key });
  }
  queryString = getQueryString( data );

  if ( String(url + queryString).length > getUrlMaxLength()) {
    throw "URL length exceeds current browser limit";
  }

  // Send beacon if recording an event
  if (reqType === "beacon" && data["data"] && data["modified"]) {
    sendBeacon.call(this, url + queryString, null, cb);
  }
  else {
    sendJsonp.call(this, url + queryString, null, cb);
  }
  cb = callback = null;
};
