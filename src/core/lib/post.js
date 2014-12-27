var request = require('superagent'),
    handleResponse = require('../helpers/superagent-handle-response');

module.exports = function(url, data, api_key, callback){
  var cb = callback;
  request
    .post(url)
    .set('Content-Type', 'application/json')
    .set('Authorization', api_key)
    .send(data || {})
    .end(function(err, res) {
      handleResponse(err, res, cb);
      cb = callback = null;
    });
};
