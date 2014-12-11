var Request = require("../request");
module.exports = function(query, callback) {
  var queries = [],
      cb = callback,
      request;

  if (query instanceof Array) {
    queries = query;
  } else {
    queries.push(query);
  }
  request = new Request(this, queries, cb);
  cb = callback = null;
  return request;
};
