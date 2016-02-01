var Request = require("../request");
module.exports = function(query, callback) {
  var queries = [],
      cb = callback,
      request;

  if (!this.config.projectId || !this.config.projectId.length) {
    handleConfigError.call(this, 'Missing projectId property');
  }
  if (!this.config.readKey || !this.config.readKey.length) {
    handleConfigError.call(this, 'Missing readKey property');
  }
  function handleConfigError(msg){
    var err = 'Query not sent: ' + msg;
    this.trigger('error', err);
    if (cb) {
      cb.call(this, err, null);
      cb = callback = null;
    }
  }

  if (query instanceof Array) {
    queries = query;
  } else {
    queries.push(query);
  }
  request = new Request(this, queries, cb).refresh();
  cb = callback = null;
  return request;
};
