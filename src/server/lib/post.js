var request = require('superagent'),
    handleResponse = require('../../core/helpers/superagent-handle-response');

module.exports = function(url, data, api_key, callback){
  request
    .post(url)
    .set('Authorization', api_key)
    .set('Content-Type', 'application/json')
    .send(data || {})
    .end(function(error, response) {
      handleResponse(error, response, callback);
    });
};
