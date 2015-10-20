var request = require('superagent');
var responseHandler = require('./helpers/superagent-handle-response');

function savedQueries() {
  var _this = this;
  this.all = function(callback) {
    var url = _this.url('/queries/saved');

    request
      .get(url)
      .set('Content-Type', 'application/json')
      .set('Authorization', _this.masterKey())
      .end(handleResponse);

    function handleResponse(err, res){
      responseHandler(err, res, callback);
      callback = null;
    }
  };

  this.get = function(queryName, callback) {
    var url = _this.url('/queries/saved/' + queryName);

    request
      .get(url)
      .set('Content-Type', 'application/json')
      .set('Authorization', _this.masterKey())
      .end(handleResponse);

    function handleResponse(err, res){
      responseHandler(err, res, callback);
      callback = null;
    }
  };

  this.update = function(queryName, body, callback) {
    var url = _this.url('/queries/saved/' + queryName);

    request
      .put(url)
      .set('Content-Type', 'application/json')
      .set('Authorization', _this.masterKey())
      .send(body || {})
      .end(handleResponse);

    function handleResponse(err, res){
      responseHandler(err, res, callback);
      callback = null;
    }
  };

  this.create = this.update;

  this.destroy = function(queryName, callback) {
    var url = _this.url('/queries/saved/' + queryName);

    request
      .del(url)
      .set('Content-Type', 'application/json')
      .set('Authorization', _this.masterKey())
      .end(handleResponse);

    function handleResponse(err, res){
      responseHandler(err, res, callback);
      callback = null;
    }
  };

  return this;
}

module.exports = savedQueries;
