var Request = require("../request");
module.exports = function(query, success, error) {
  var queries = [],
      successCallback = success,
      errorCallback = error,
      request;
  success = error = null;
  if (query instanceof Array) {
    queries = query;
  } else {
    queries.push(query);
  }
  request = new Request(this, queries, successCallback, errorCallback);
  successCallback = errorCallback = null;
  return request;
};
