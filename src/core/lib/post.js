var sendXhr = require("../helpers/sendXMLHttpRequest");

module.exports = function(url, data, api_key, callback, async){
  var cb = callback,
      isAsync = async || true;

  sendXhr.call(this, "POST", url, {
    "Authorization": api_key,
    "Content-Type": "application/json"
  }, data, cb, isAsync);
  cb = callback = null;
}
