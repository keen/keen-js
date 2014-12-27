var request = require('superagent');
var getQueryString = require('../helpers/get-query-string'),
    handleResponse = require('../helpers/superagent-handle-response'),
    requestTypes = require('../helpers/superagent-request-types');

module.exports = function(url, data, api_key, callback){
  var reqType = this.config.requestType;
  if (reqType === 'beacon') {
    reqType = 'jsonp';
  }

  // Ensure api_key is present for GET requests
  data['api_key'] = data['api_key'] || api_key;

  request
    .get(url+getQueryString(data))
    .use(requestTypes(reqType))
    .end(function(err, res){
      handleResponse(err, res, callback);
      callback = null;
    });
};
