  /*!
  * -----------------
  * Keen IO Query JS
  * -----------------
  */


  // -------------------------------
  // Inject <client>.query Method
  // -------------------------------

  Keen.prototype.run = function(query, success, error) {
    var queries = [];
    if ( Object.prototype.toString.call(query) === '[object Array]' ) {
      queries = query;
    } else {
      queries.push(query);
    }
    return new Keen.Request(this, queries, success, error);
  };


  // -------------------------------
  // Keen.Request
  // -------------------------------

  Keen.Request = function(instance, queries, success, error){
    this.data = {};
    this.configure(instance, queries, success, error);
  };
  _extend(Keen.Request.prototype, Events);

  Keen.Request.prototype.configure = function(instance, queries, success, error){
    this.instance = instance;
    this.queries = queries;
    this.success = success;
    this.error = error;

    this.refresh();
    return this;
  };

  Keen.Request.prototype.refresh = function(){

    var self = this,
        completions = 0,
        response = [],
        meta = [];

    var handleSuccess = function(res, index){

      response[index] = res;
      //meta[index]['query'] = self.queries[index];

      // Attach response/meta data to each analysis
      self.queries[index].data = res;

      // Trigger completion event
      self.queries[index].trigger('complete', self.queries[index].data);

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
        self.trigger('complete', self.data);

        // Fire callback
        if (self.success) self.success(self.data);
      }

    };

    var handleFailure = function(res, req){
      var response = JSON.parse(res.responseText);
      Keen.log(res.statusText + ' (' + response.error_code + '): ' + response.message);
      if (self.error) self.error(res, req);
    };

    for (var i = 0; i < self.queries.length; i++) {
      (function(query, index){
        var url = null;
        var successSequencer = function(res){
          handleSuccess(res, index);
        };
        var failureSequencer = function(res){
          handleFailure(res, index);
        };

        if (query instanceof Keen.Query || query instanceof Keen.Query) {
          url = _build_url.call(self.instance, query.path);
          url += "?api_key=" + self.instance.client.readKey;
          url += _build_query_string.call(self.instance, query.params);

        } else if ( Object.prototype.toString.call(query) === '[object String]' ) {
          url = _build_url.call(self.instance, '/saved_queries/' + encodeURIComponent(query) + '/result');
          url += "?api_key=" + self.instance.client.readKey;

        } else {
          var res = {
            statusText: 'Bad Request',
            responseText: { message: 'Error: Query ' + (i+1) + ' of ' + self.queries.length + ' for project ' + self.instance.client.projectId + ' is not a valid request' }
          };
          Keen.log(res.responseText.message);
          Keen.log('Check out our JavaScript SDK Usage Guide for Data Analysis:');
          Keen.log('https://keen.io/docs/clients/javascript/usage-guide/#analyze-and-visualize');
          if (self.error) self.error(res.responseText.message);
        }
        if (url) _send_query.call(self.instance, url, i, successSequencer, failureSequencer);

      })(self.queries[i], i);
    }
    return this;
  };


  // -------------------------------
  // Keen.Query
  // -------------------------------

  Keen.Query = function(){
    this.data = {};
    this.configure.apply(this, arguments);
  };
  _extend(Keen.Query.prototype, Events);

  Keen.Query.prototype.configure = function(analysisType, params) {
    this.path = '/queries/' + analysisType;
    this.params = params || {};
    this.params.timezone = this.params.timezone || _build_timezone_offset();
    return this;
  };

  Keen.Query.prototype.addFilter = function(property, operator, value) {
    this.params.filters.push({
      "property_name": property,
      "operator": operator,
      "property_value": value
    });
    return this;
  };


  // Private
  // --------------------------------

  function _build_timezone_offset(){
    return new Date().getTimezoneOffset() * -60;
  };

  function _build_query_string(params){
    var query = [];
    for (var key in params) {
      if (params[key]) {
        var value = params[key];
        if (Object.prototype.toString.call(value) !== '[object String]') {
          value = JSON.stringify(value);
        }
        value = encodeURIComponent(value);
        query.push(key + '=' + value);
      }
    }
    return "&" + query.join('&');
  };

  function _send_query(url, sequence, success, error){
    switch(this.client.requestType){
      case 'xhr':
        _request.xhr.apply(this, ["GET", url, null, null, this.client.readKey, success, error, sequence]);
        break;
      case 'jsonp':
      case 'beacon':
        _request.jsonp.apply(this, [url, this.client.readKey, success, error, sequence])
        break;
    }
  };
