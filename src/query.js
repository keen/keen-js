  /*! 
  * -----------------
  * Keen IO Query JS
  * -----------------
  */

  Keen.Query = function(){};
  Keen.Query.prototype = {
    configure: function(eventCollection, options) {
      this.path = '/queries/' + options.analysisType;
      this.params = {
        event_collection: eventCollection,
        target_property: options.targetProperty,
        group_by: options.groupBy,
        filters: options.filters,
        timeframe: options.timeframe,
        interval: options.interval,
        timezone: (options.timezone || _build_timezone_offset()),
        latest: options.latest
      };
      return this;
    },
    addFilter: function(property, operator, value){
      this.params.filters.push({
        "property_name": property,
        "operator": operator,
        "property_value": value
      });
      return this;
    }
  };
  
  
  Keen.Sum = function(eventCollection, options){
    options.analysisType = 'sum';
    this.configure(eventCollection, options);
  };
  Keen.Sum.prototype = new Keen.Query();
  
  
  Keen.Count = function(eventCollection, options){
    options.analysisType = 'count';
    this.configure(eventCollection, options);
  };
  Keen.Count.prototype = new Keen.Query();
  
  
  Keen.CountUnique = function(eventCollection, options){
    options.analysisType = 'count_unique';
    this.configure(eventCollection, options);
  };
  Keen.CountUnique.prototype = new Keen.Query();
  
  
  Keen.Minimum = function(eventCollection, options){
    options.analysisType = 'minimum';
    this.configure(eventCollection, options);
  };
  Keen.Minimum.prototype = new Keen.Query();
  
  
  Keen.Maximum = function(eventCollection, options){
    options.analysisType = 'maximum';
    this.configure(eventCollection, options);
  };
  Keen.Maximum.prototype = new Keen.Query();
  
  
  Keen.Average = function(eventCollection, options){
    options.analysisType = 'average';
    this.configure(eventCollection, options);
  };
  Keen.Average.prototype = new Keen.Query();
  
  
  Keen.SelectUnique = function(eventCollection, options){
    options.analysisType = 'select_unique';
    this.configure(eventCollection, options);
  };
  Keen.SelectUnique.prototype = new Keen.Query();
  
  
  Keen.Extraction = function(eventCollection, options){
    options.analysisType = 'extraction';
    this.configure(eventCollection, options);
  };
  Keen.Extraction.prototype = new Keen.Query();
  
  

  // -------------------------------
  // Keen.query() Method
  // -------------------------------  

  Keen.prototype.query = function(query, success, error) {
    if ( query instanceof Keen.Query ) {
      _send_query.apply(this, [query, success, error]);
    
    } else if ( Object.prototype.toString.call(query) === '[object String]' ) {
      _send_saved_query.apply(this, [query, success, error]);
    
    } else if ( Object.prototype.toString.call(query) === '[object Array]' ) {
      
      var requests = 0;
      var response = [];
      
      var multiSuccess = function(res){
        response[res.sequence] = res;
        requests++;
        if (success && requests == query.length) success(response);
      };
      
      var multiFailure = function(){
        if (error) error();
      };
      
      for (var i = 0; i < query.length; i++) {
        if (query[i] instanceof Keen.Query) {
          _send_query.apply(this, [query[i], multiSuccess, multiFailure, i]);
        } else if ( Object.prototype.toString.call(query[i]) === '[object String]' ) {
          _send_saved_query.apply(this, [query[i], multiSuccess, multiFailure, i]);
        }
      }
    }
    return this;
  };


  // Private for Keen.Query Objects
  // --------------------------------

  function _build_timezone_offset(){
    return new Date().getTimezoneOffset() * -60;
  };
  
  function _build_query_string(params) {
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
  
  function _send_query(query, success, error, sequence) {
    var url = _build_url.apply(this, [query.path]);
    url += "?api_key=" + this.client.readKey;
    url += _build_query_string.apply(this, [query.params]);
    
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
  
  function _send_saved_query(query, success, error, sequence){
    var url = _build_url.apply(this, ['/saved_queries/' + encodeURIComponent(query) + '/result']);
    url += "?api_key=" + this.client.readKey;
    
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
