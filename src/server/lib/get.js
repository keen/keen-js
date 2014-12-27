var request = require('superagent'),
    getQueryString = require('../../core/helpers/getQueryString'),
    handleResponse = require('../../core/helpers/superagent-handle-response');

module.exports = function(url, data, api_key, callback){
  request
    .get(url+getQueryString(data))
    .set('Authorization', api_key)
    .end(function(error, response){
      handleResponse(error, response, callback);
    });
};
