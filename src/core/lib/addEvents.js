var Keen = require('../index');
var request = require('superagent');

var each = require('../utils/each'),
    getXHR = require('../helpers/getXhrObject'),
    requestTypes = require('../helpers/superagent-request-types'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(payload, callback) {
  var self = this,
      urlBase = this.url('/events'),
      data = {},
      cb = callback;

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

  if (arguments.length > 2) {
    handleValidationError.call(self, 'Incorrect arguments provided to #addEvents method');
    return;
  }

  if (typeof payload !== 'object' || payload instanceof Array) {
    handleValidationError.call(self, 'Request payload must be an object');
    return;
  }

  // Attach properties from client.globalProperties
  if (self.config.globalProperties) {
    // Loop over each set of events
    each(payload, function(events, collection){
      // Loop over each individual event
      each(events, function(body, index){
        // Start with global properties for this collection
        var base = self.config.globalProperties(collection);
        // Apply provided properties for this event body
        each(body, function(value, key){
          base[key] = value;
        });
        // Create a new payload
        data[collection].push(base);
      });
    });
  }
  else {
    // Use existing payload
    data = payload;
  }

  if (getXHR()) {
    request
      .post(urlBase)
      .set('Content-Type', 'application/json')
      .set('Authorization', self.writeKey())
      .send(data)
      .end(function(err, res){
        responseHandler(err, res, cb);
        cb = callback = null;
      });
  }
  else {
    // TODO: queue and fire in small, asynchronous batches
    self.trigger('error', 'Events not recorded: XHR support is required for batch upload');
  }

  function handleValidationError(msg){
    var err = 'Events not recorded: ' + msg;
    self.trigger('error', err);
    if (cb) {
      cb.call(self, err, null);
      cb = callback = null;
    }
  }

  return;
};
