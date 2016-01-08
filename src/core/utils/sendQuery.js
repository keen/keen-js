var request = require('superagent');

var getContext = require('../helpers/get-context'),
    getXHR = require('../helpers/get-xhr-object'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(path, params, callback){
  var url = this.client.url(path);

  if (!this.client.projectId()) {
    this.client.trigger('error', 'Query not sent: Missing projectId property');
    return;
  }

  if (!this.client.readKey()) {
    this.client.trigger('error', 'Query not sent: Missing readKey property');
    return;
  }

  if (getXHR() || getContext() === 'server' ) {
    return request
      .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', this.client.readKey())
        .timeout(this.timeout())
        .send(params || {})
        .end(function handleResponse(err, res){
          responseHandler(err, res, callback);
          callback = null;
        });
  }
}
