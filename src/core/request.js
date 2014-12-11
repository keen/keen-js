var each = require("./utils/each"),
    events = require("./events"),
    extend = require("./utils/extend"),
    sendQuery = require("./utils/sendQuery");

function Request(client, queries, callback){
  var cb = callback;
  this.configure(client, queries, cb);
  cb = callback = null;
};
extend(Request.prototype, events);

Request.prototype.configure = function(instance, queries, callback){
  var cb = callback;
  extend(this, {
    "instance" : instance,
    "queries"  : queries,
    "data"     : {},
    "callback" : cb
  });
  this.refresh();
  cb = callback = null;
  return this;
};

Request.prototype.refresh = function(){
  var self = this,
      completions = 0,
      response = [];

  var handleSuccess = function(res, index){
    response[index] = res;
    self.queries[index].data = res;
    self.queries[index].trigger("complete", self.queries[index].data);
    completions++;
    if (completions == self.queries.length) {
      // Attach response/meta data to query
      if (self.queries.length == 1) {
        self.data = response[0];
      } else {
        self.data = response;
      }
      self.trigger("complete", self.data);
      if (self.callback) {
        self.callback(null, self.data);
      }
    }

  };

  var handleFailure = function(res, req){
    var response, status;
    if (res) {
      response = JSON.parse(res.responseText);
      status = res.status + " " + res.statusText;
    } else {
      response = {
        message: "Your query could not be completed, and the exact error message could not be captured (limitation of JSONP requests)",
        error_code: "JS SDK"
      };
      status = "Error";
    }
    self.trigger("error", response);
    if (self.callback) {
      self.callback(response, null);
    }
  };

  each(self.queries, function(query, index){
    var path;
    var cbSequencer = function(err, res){
      if (err) {
        handleFailure(res, index);
      }
      else {
        handleSuccess(res, index);
      }
    };

    if (query instanceof Keen.Query) {
      path = "/queries/" + query.analysis;
      sendQuery.call(self.instance, path, query.params, cbSequencer);
    }
    else if ( Object.prototype.toString.call(query) === '[object String]' ) {
      path = "/saved_queries/" + encodeURIComponent(query) + "/result";
      sendQuery.call(self.instance, path, null, cbSequencer);
    }
    else {
      var res = {
        statusText: 'Bad Request',
        responseText: { message: 'Error: Query ' + (+index+1) + ' of ' + self.queries.length + ' for project ' + self.instance.projectId() + ' is not a valid request' }
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
