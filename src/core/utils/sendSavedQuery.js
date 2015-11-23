var request = require('superagent');
var responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(path, params, callback){
  request
    .get(this.client.url(path))
    .set('Content-Type', 'application/json')
    .set('Authorization', this.client.readKey())
    .timeout(this.timeout())
    .send()
    .end(function(err, res) {
      responseHandler(err, res, callback);
      callback = null;
    });

  return;
}
