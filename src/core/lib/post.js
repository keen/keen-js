var sendXhr = require("../helpers/sendXMLHttpRequest");

module.exports = function(url, data, api_key, success, error, async){
  var successCallback = success,
      errorCallback = error,
      isAsync = async || true;

  success = error = null;
  sendXhr.call(this, "POST", url, {
    "Authorization": api_key,
    "Content-Type": "application/json"
  }, data, successCallback, errorCallback, isAsync);
}
