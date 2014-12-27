var JSON2 = require('JSON2');
var request = require('superagent');

var Keen = require('../index');

var base64 = require('../utils/base64'),
    each = require('../utils/each'),
    getQueryString = require('../helpers/getQueryString'),
    getUrlMaxLength = require('../helpers/getUrlMaxLength'),
    getXHR = require('../helpers/getXhrObject'),
    requestTypes = require('../helpers/superagent-request-types'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(collection, payload, callback) {
  var self = this,
      urlBase = this.url('/events/' + collection),
      reqType = this.config.requestType,
      data = {},
      cb = callback,
      getUrl;

  if (!Keen.enabled) {
    handleValidationError.call(self, 'Keen.enabled = false');
    return;
  }

  if (!self.projectId()) {
    handleValidationError.call(self, 'Missing projectId property');
    return;
  }

  if (!self.writeKey()) {
    handleValidationError.call(self, 'Missing writeKey property');
    return;
  }

  if (!collection || typeof collection !== 'string') {
    handleValidationError.call(self, 'Collection name must be a string');
    return;
  }

  // Attach properties from client.globalProperties
  if (self.config.globalProperties) {
    data = self.config.globalProperties(collection);
  }
  // Attach properties from user-defined event
  each(payload, function(value, key){
    data[key] = value;
  });

  // Override reqType if XHR not supported
  if ( !getXHR() && 'xhr' === reqType ) {
    reqType = 'jsonp';
  }

  // Pre-flight for GET requests
  getUrl = 'xhr' !== reqType ? prepareGetRequest.call(self, urlBase, data) : false;

  if ( getUrl ) {
    request
      .get(getUrl)
      .use(requestTypes(reqType))
      .end(handleResponse);
  }
  else if (getXHR()) {
    request
      .post(urlBase)
      .set('Content-Type', 'application/json')
      .set('Authorization', self.writeKey())
      .send(data)
      .end(handleResponse);
  }
  else {
    self.trigger('error', 'Request not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.');
  }

  function handleResponse(err, res){
    responseHandler(err, res, cb);
    cb = callback = null;
  }

  function handleValidationError(msg){
    var err = 'Event not recorded: ' + msg;
    self.trigger('error', err);
    if (cb) {
      cb.call(self, err, null);
      cb = callback = null;
    }
  }

  return;
};

function prepareGetRequest(url, data){
  // Set API key
  url += getQueryString({
    api_key  : this.writeKey(),
    data     : base64.encode( JSON2.stringify(data) ),
    modified : new Date().getTime()
  });
  return ( url.length < getUrlMaxLength() ) ? url : false;
}
