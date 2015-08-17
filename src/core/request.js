var each = require("./utils/each"),
    extend = require("./utils/extend"),
    sendQuery = require("./utils/sendQuery");

var Keen = require("./");
var Emitter = require('./utils/emitter-shim');

function Request(client, queries, callback){
  var cb = callback;
  this.config = {
    timeout: 300 * 1000
  };
  this.configure(client, queries, cb);
  cb = callback = null;
};
Emitter(Request.prototype);

Request.prototype.configure = function(client, queries, callback){
  var cb = callback;
  extend(this, {
    "client"   : client,
    "queries"  : queries,
    "data"     : {},
    "callback" : cb
  });
  cb = callback = null;
  return this;
};

Request.prototype.timeout = function(ms){
  if (!arguments.length) return this.config.timeout;
  this.config.timeout = (!isNaN(parseInt(ms)) ? parseInt(ms) : null);
  return this;
};

Request.prototype.refresh = function(){
  var self = this,
      completions = 0,
      response = [],
      errored = false;

  var handleResponse = function(err, res, index){
    if (errored) {
      return;
    }
    if (err) {
      self.trigger("error", err);
      if (self.callback) {
        self.callback(err, null);
      }
      errored = true;
      return;
    }
    response[index] = res;
    completions++;
    if (completions == self.queries.length && !errored) {
      self.data = (self.queries.length == 1) ? response[0] : response;
      self.trigger("complete", null, self.data);
      if (self.callback) {
        self.callback(null, self.data);
      }
    }
  };

  each(self.queries, function(query, index){
    var path;
    var cbSequencer = function(err, res){
      handleResponse(err, res, index);
    };

    if (query instanceof Keen.Query) {
      path = "/queries/" + query.analysis;
      sendQuery.call(self, path, query.params, cbSequencer);
    }
    else if ( Object.prototype.toString.call(query) === "[object String]" ) {
      path = "/saved_queries/" + encodeURIComponent(query) + "/result";
      sendQuery.call(self, path, null, cbSequencer);
    }
    else {
      var res = {
        statusText: "Bad Request",
        responseText: { message: "Error: Query " + (+index+1) + " of " + self.queries.length + " for project " + self.client.projectId() + " is not a valid request" }
      };
      self.trigger("error", res.responseText.message);
      if (self.callback) {
        self.callback(res.responseText.message, null);
      }
    }
  });
  return this;
};

module.exports = Request;
