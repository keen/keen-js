var request = require('superagent');
var responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(path, params, callback){
  var key;
  if (this.client.readKey()) {
    key = this.client.readKey();
  }
  else if (this.client.masterKey()) {
    key = this.client.masterKey();
  }

  return request
    .get(this.client.url(path))
    .set('Content-Type', 'application/json')
    .set('Authorization', key)
    .timeout(this.timeout())
    .send()
    .end(function(err, res) {
      responseHandler(err, res, callback);
      callback = null;
    });
}
