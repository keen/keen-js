var request = require("superagent"),
    handleHttpResponse = require("../utils/handleHttpResponse");

module.exports = function(url, data, api_key, callback){
  request
    .del(url)
    .set("Authorization", api_key)
    .set("Content-Type", "application/json")
    .end(function(err, res) {
      handleHttpResponse(err, res, callback);
    });
};
