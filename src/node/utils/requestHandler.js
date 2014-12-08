var Keen = require("../index"),
    getQueryString = require("../../core/utils/getQueryString"),
    request = require("superagent");

var methods = {
  "GET"    : get,
  "POST"   : post,
  "PUT"    : post,
  "DELETE" : del
};

module.exports = function(url, data, api_key, success, error, async){
  // console.log("Handle request with superagent");
  methods["GET"].apply(this, arguments);
  return;
}

function get(url, data, api_key, callback) {
  request
  .get(url+getQueryString(data))
  .set("Authorization", api_key)
  .end(function(error, response){
    processResponse(error, response, callback);
  });
}

function post(url, data, api_key, callback) {
  request
  .post(url)
  .set("Authorization", api_key)
  .set("Content-Type", "application/json")
  .send(data || {})
  .end(function(error, response) {
    processResponse(error, response, callback);
  });
}

function del(url, data, api_key, callback) {
  request
  .del(url)
  .set("Authorization", api_key)
  .set("Content-Type", "application/json")
  .end(function(err, res) {
    processResponse(err, res, callback);
  });
}

function processResponse(err, res, callback) {
  var cb = callback || function() {};
  if (res && !res.ok && !err) {
    var is_err = res.body && res.body.error_code;
    err = new Error(is_err ? res.body.message : 'Unknown error occurred');
    err.code = is_err ? res.body.error_code : 'UnknownError';
  }
  if (err) return cb(err);
  return cb(null, res.body);
}
