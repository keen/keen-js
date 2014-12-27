var request = require('superagent'),
    handleResponse = require('../../core/helpers/superagent-handle-response');

module.exports = function(url, data, api_key, callback){
  request
    .del(url)
    .set('Authorization', api_key)
    .set('Content-Type', 'application/json')
    .end(function(err, res) {
      handleResponse(err, res, callback);
    });
};
