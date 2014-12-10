var request = require("superagent"),
    getQueryString = require("../../core/helpers/getQueryString"),
    handleHttpResponse = require("../utils/handleHttpResponse");

module.exports = function(url, data, api_key, callback){
  request
    .get(url+getQueryString(data))
    .set("Authorization", api_key)
    .end(function(error, response){
      handleHttpResponse(error, response, callback);
    });
};
