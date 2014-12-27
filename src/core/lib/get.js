var request = require('superagent');

var extend = require('../utils/extend'),
    getQueryString = require('../helpers/getQueryString'),
    getUrlMaxLength = require('../helpers/getUrlMaxLength'),
    handleResponse = require('../helpers/superagent-handle-response'),
    requestTypes = require('../helpers/superagent-request-types');

module.exports = function(url, payload, api_key, callback){
  var data = payload || {},
      queryString = '',
      reqType = this.config.requestType,
      cb = callback;

  if (api_key) {
    extend(data, { api_key: api_key });
  }
  queryString = getQueryString( data );

  if ( String(url + queryString).length > getUrlMaxLength()) {
    throw 'URL length exceeds current browser limit';
  }

  // Send beacon only if recording an event
  if (reqType === 'beacon' && !data['data'] && !data['modified']) {
    reqType = 'jsonp';
  }

  request
    .get(url + queryString)
    .use(requestTypes(reqType))
    .end(function(err, res){
      handleResponse(err, res, cb);
      cb = callback = null;
    });
};
