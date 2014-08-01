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
    if ( _type(query) === 'Array' ) {
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
    this.data;
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
        response = [];

    var handleSuccess = function(res, index){
      response[index] = res;
      self.queries[index].data = res;
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
      self.trigger('error', response);
      if (self.error) {
        self.error(res, req);
      }
      Keen.log(res.statusText + ' (' + response.error_code + '): ' + response.message);
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
        if (url) _send_query.call(self.instance, url, successSequencer, failureSequencer);

      })(self.queries[i], i);
    }
    return this;
  };


  // -------------------------------
  // Keen.Query
  // -------------------------------

  Keen.Query = function(){
    this.configure.apply(this, arguments);
  };
  _extend(Keen.Query.prototype, Events);

  Keen.Query.prototype.configure = function(analysisType, params) {
    this.analysis = analysisType;
    this.path = '/queries/' + analysisType;

    // Apply params w/ #set method
    this.params = this.params || {};
    this.set(params);

    // Localize timezone if none is set
    if (this.params.timezone === void 0) {
      this.params.timezone = _build_timezone_offset();
    }
    return this;
  };

  Keen.Query.prototype.get = function(attribute) {
    var key = attribute;
    if (key.match(new RegExp("[A-Z]"))) {
      key = key.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
    }
    if (this.params) {
      return this.params[key] || null;
    }
  };

  Keen.Query.prototype.set = function(attributes) {
    var self = this;
    _each(attributes, function(v, k){
      var key = k, value = v;
      if (k.match(new RegExp("[A-Z]"))) {
        key = k.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
      }
      self.params[key] = value;
      if (_type(value)==="Array") {
        _each(value, function(dv, index){
          if (_type(dv)==="Object") {
            _each(dv, function(deepValue, deepKey){
              if (deepKey.match(new RegExp("[A-Z]"))) {
                var _deepKey = deepKey.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
                delete self.params[key][index][deepKey];
                self.params[key][index][_deepKey] = deepValue;
              }
            });
          }
        });
      }
    });
    return self;
  };

  Keen.Query.prototype.addFilter = function(property, operator, value) {
    this.params.filters = this.params.filters || [];
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

  function _send_query(url, success, error){
    if ((_type(XMLHttpRequest)==='Object'||_type(XMLHttpRequest)==='Function') && 'withCredentials' in new XMLHttpRequest()) {
      _request.xhr.call(this, "GET", url, null, null, this.client.readKey, success, error);
    } else {
      _request.jsonp.call(this, url, this.client.readKey, success, error);
    }
  };
