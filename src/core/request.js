var each = require("./utils/each"),
    sendQuery = require("./utils/sendQuery");

function Request(client, queries, success, error){
  var successCallback = success,
      errorCallback = error;
  success = error = null;
  this.configure(client, queries, successCallback, errorCallback);
  successCallback = errorCallback = null;
};

Request.prototype.configure = function(instance, queries, success, error){
  this.instance = instance;
  this.queries = queries;
  this.data;
  this.success = success;
  this.error = error;
  success = error = null;
  this.refresh();
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

    // Increment completion count
    completions++;
    if (completions == self.queries.length) {

      // Attach response/meta data to query
      if (self.queries.length == 1) {
        self.data = response[0];
      } else {
        self.data = response;
      }

      // Trigger completion event on query
      self.trigger("complete", self.data);

      // Fire callback
      if (self.success) {
        self.success(self.data);
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
    if (self.error) {
      self.error(response);
    }
    // Keen.log(status + " (" + response.error_code + "): " + response.message);
  };

  each(self.queries, function(query, index){
    var url;
    var successSequencer = function(res){
      handleSuccess(res, index);
    };
    var failureSequencer = function(res){
      handleFailure(res, index);
    };

    if (query instanceof Keen.Query) {
      // url = self.instance.url("/projects/" + self.instance.projectId() + query.path);
      sendQuery.call(self.instance, query.path, query.params, successSequencer, failureSequencer);
    }
    // else if ( Object.prototype.toString.call(query) === '[object String]' ) {
    //   url = self.instance.url("/projects/" + self.instance.projectId() + "/saved_queries/" + encodeURIComponent(query) + "/result");
    //   sendQuery.call(self.instance, url, null, successSequencer, failureSequencer);
    // }
    else {
      var res = {
        statusText: 'Bad Request',
        responseText: { message: 'Error: Query ' + (+index+1) + ' of ' + self.queries.length + ' for project ' + self.instance.projectId() + ' is not a valid request' }
      };
      // Keen.log(res.responseText.message);
      // Keen.log('Check out our JavaScript SDK Usage Guide for Data Analysis:');
      // Keen.log('https://keen.io/docs/clients/javascript/usage-guide/#analyze-and-visualize');
      if (self.error) {
        self.error(res.responseText.message);
      }
    }
  });
  return this;
};

module.exports = Request;
