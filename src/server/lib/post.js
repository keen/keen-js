var request = require("superagent"),
    handleHttpResponse = require("../utils/handleHttpResponse");

module.exports = function(url, data, api_key, callback){
  request
    .post(url)
    .set("Authorization", api_key)
    .set("Content-Type", "application/json")
    .send(data || {})
    .end(function(error, response) {
      handleHttpResponse(error, response, callback);
    });
};
