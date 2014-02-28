  /*! 
  * -----------------
  * Keen IO Query JS
  * -----------------
  */


  Keen.Query = function(){};
  Keen.Query.prototype = {
    configure: function(eventCollection, options) {
      this.listeners = [];
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
    addFilter: function(property, operator, value) {
      this.params.filters.push({
        "property_name": property,
        "operator": operator,
        "property_value": value
      });
      return this;
    },
    on: function(eventName, callback) {
      this.listeners.push({ eventName: eventName, callback: callback });
      return this;
    },
    off: function(eventName, callback) {
      //removeEvent(eventName);
      return this;
    },
    trigger: function(eventName, data) {
      if (this.listeners.length < 1) return;
      for (var i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i]['eventName'] == eventName) {
          this.listeners[i]['callback'](data);
        }
      }
      return this;
    }
  };
  
  
  Keen.Sum = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'sum';
    if (options.targetProperty === undefined) return options;
    if (!eventCollection || !options.targetProperty) return options;
    this.configure(eventCollection, options);
  };
  Keen.Sum.prototype = new Keen.Query();
  
  
  Keen.Count = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'count';
    if (!eventCollection) return options;
    this.configure(eventCollection, options);
  };
  Keen.Count.prototype = new Keen.Query();
  
  
  Keen.CountUnique = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'count_unique';
    if (!eventCollection || !options.targetProperty) return options;
    this.configure(eventCollection, options);
  };
  Keen.CountUnique.prototype = new Keen.Query();
  
  
  Keen.Minimum = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'minimum';
    if (!eventCollection || !options.targetProperty) return options;
    this.configure(eventCollection, options);
  };
  Keen.Minimum.prototype = new Keen.Query();
  
  
  Keen.Maximum = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'maximum';
    if (!eventCollection || !options.targetProperty) return options;
    this.configure(eventCollection, options);
  };
  Keen.Maximum.prototype = new Keen.Query();
  
  
  Keen.Average = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'average';
    if (!eventCollection || !options.targetProperty) return options;
    this.configure(eventCollection, options);
  };
  Keen.Average.prototype = new Keen.Query();
  
  
  Keen.SelectUnique = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'select_unique';
    if (!eventCollection || !options.targetProperty) return options;
    this.configure(eventCollection, options);
  };
  Keen.SelectUnique.prototype = new Keen.Query();
  
  
  Keen.Extraction = function(eventCollection, config){
    var options = (config || {});
    options.analysisType = 'extraction';
    if (!eventCollection) return options;
    this.configure(eventCollection, options);
  };
  Keen.Extraction.prototype = new Keen.Query();
  
  
  
  Keen.Funnel = function(config){
    var options = (config || {});
    options.analysisType = 'funnel';
    if (!options.steps) throw Error('Please configure an array of steps for this funnel');
    this.configure(options);
  };
  Keen.Funnel.prototype = new Keen.Query();
  
  Keen.Funnel.prototype.configure = function(options){
    this.listeners = [];
    this.path = '/queries/' + options.analysisType;
    this.params = {
      steps: [],
      timeframe: options.timeframe,
      timezone: (options.timezone || _build_timezone_offset())
    };
    
    for (var i = 0; i < options.steps.length; i++){
      var step = {};
      if (!options.steps[i].eventCollection) throw Error('Please provide an eventCollection value for step #' + (i+1));
      step.event_collection = options.steps[i].eventCollection;
      
      if (!options.steps[i].actorProperty) throw Error('Please provide an actorProperty value for step #' + (i+1));
      step.actor_property = options.steps[i].actorProperty;
      
      if (options.steps[i].filters) step.filters = options.steps[i].filters;
      if (options.steps[i].timeframe) step.timeframe = options.steps[i].timeframe;
      if (options.steps[i].timezone) step.timezone = options.steps[i].timezone;
      
      this.params.steps.push(step);
    }
    return this;
  };


  // -------------------------------
  // Keen.query() Method
  // -------------------------------  

  Keen.prototype.query = function(query, success, error) {
    
    var queries = [],
        requests = 0,
        response = [],
        meta = [];
    
    var handleSuccess = function(res, req){
      response[req.sequence] = res;
      meta[req.sequence] = req;
      meta[req.sequence]['query'] = queries[req.sequence];
      requests++;
      
      // Trigger 'done' events when each is completed
      // console.log('Listeners', req.query.listeners);
      var listeners = req.query.listeners;
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i]['eventName'] == 'done') {
          listeners[i]['callback'](response[req.sequence], meta[req.sequence]);
        }
      }
      
      // Fire callbacks when all are completed
      if (success && requests == queries.length){
        if (queries.length == 1) {
          success(response[0], meta[0]);
        } else {
          success(response, meta);
        }
      } 
    };
    
    var handleFailure = function(res, req){
      var response = JSON.parse(res.responseText);
      Keen.log(res.statusText + ' (' + response.error_code + '): ' + response.message);
      if (error) error(res, req);
    };
    
    if ( Object.prototype.toString.call(query) === '[object Array]' ) {
      queries = query;
    } else {
      queries.push(query);
    }

    for (var i = 0; i < queries.length; i++) {
      var url = null;
      if (queries[i] instanceof Keen.Query || queries[i] instanceof Keen.Funnel) {
        url = _build_url.apply(this, [queries[i].path]);
        url += "?api_key=" + this.client.readKey;
        url += _build_query_string.apply(this, [queries[i].params]);
        
      } else if ( Object.prototype.toString.call(queries[i]) === '[object String]' ) {
        url = _build_url.apply(this, ['/saved_queries/' + encodeURIComponent(queries[i]) + '/result']);
        url += "?api_key=" + this.client.readKey;
        
      } else {
        var res = {
          statusText: 'Bad Request',
          responseText: { message: 'Error: Query ' + (i+1) + ' of ' + queries.length + ' for project ' + this.client.projectId + ' is not a valid request' }
        };
        Keen.log(res.responseText.message);
        Keen.log('Check out our JavaScript SDK Usage Guide for Data Analysis:');
        Keen.log('https://keen.io/docs/clients/javascript/usage-guide/#analyze-and-visualize');
        if (error) error(res.responseText.message);
      }
      if (url) _send_query.apply(this, [url, i, handleSuccess, handleFailure]);
    }
    
    return this;
  };


  // Private for Keen.Query Objects
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
  