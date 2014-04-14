  /*!
  * ---------------------
  * Keen IO Visualize JS
  * ---------------------
  */


  // -------------------------------
  // Inject <query>.draw Method
  // -------------------------------

  Keen.Request.prototype.draw = function(selector, config) {
    if (_isUndefined(this.visual) || (config.library !== this.visual.library || config.type !== this.visual.type)) {
      this.visual = new Keen.Visualization(this, selector, config);
    }
    return this;
  };


  // -------------------------------
  // Keen.Visualization
  // -------------------------------

  Keen.Visualization = function(query, selector, config){
    var defaults = {
      library: 'google'
    };
    var options = (config) ? _extend(defaults, config) : defaults;
    //console.log(query.analyses);

    for (var i = 0; i < query.analyses.length; i++) {
      if (query.analyses[i].params.interval) { // Series
        options.capable = ['area', 'bar', 'column', 'line', 'table'];
        if (_isUndefined(options.type)) {
          options.type = 'line';
        }
      } else {
        if (query.analyses[i].params.group_by) { // Static
          options.capable = ['pie', 'table'];
          if (_isUndefined(options.type)) {
            options.type = 'pie';
          }
        } else { // Metric
          options.capable = ['text'];
          if (_isUndefined(options.type)) {
            options.type = 'text';
          }
        }
      }
    }

    // if (options.type && this.capable.indexOf(options.type)) -> request is going to work

    if (Keen.Visualization.Libraries[options.library]) {

      if (Keen.Visualization.Libraries[options.library][options.type]) {

        return new Keen.Visualization.Libraries[options.library][options.type](query, selector, options);

      } else {
        Keen.log('The visualization type you requested is not available for this library');
      }
    } else {
      Keen.log('The visualization library you requested is not present');
    }

    return this;
  };

  Keen.Visualization.Libraries = {};

  Keen.Visualization.register = function(name, methods) {
    Keen.Visualization.Libraries[name] = Keen.Visualization.Libraries[name] = {};
    for (var method in methods) {
      Keen.Visualization.Libraries[name][method] = methods[method];
    }
  };

  Keen.Visualization.extend = function(protoProps, staticProps){
    var parent = Keen.Adapter, Visualization;

    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Visualization = protoProps.constructor;
    } else {
      Visualization = function(){ return parent.apply(this, arguments); };
    }

    _extend(Visualization, parent, staticProps);

    var Surrogate = function(){ this.constructor = Visualization; };
    Surrogate.prototype = parent.prototype;
    Visualization.prototype = new Surrogate;

    if (protoProps) _extend(Visualization.prototype, protoProps);

    Visualization.__super__ = parent.prototype;

    return Visualization;
  };


  // -------------------------------
  // Keen.Adapter
  // -------------------------------

  Keen.Adapter = function(){
    this.configure.apply(this, arguments);
  };
  _extend(Keen.Adapter.prototype, Events);

  Keen.Adapter.prototype.configure = function(query, selector, config) {
    var self = this,
    defaults = {};

    Keen.ready(function(){

      self.query = query;

      // Upgrade to return DOM element for various selectors
      self.el = document.getElementById(selector.replace("#", ""));

      self.library = config.library;
      self.type = config.type;
      self.capable = config.capable;

      self.options = (config) ? _extend(defaults, config) : defaults;
      self.options.library = undefined;
      self.options.type = undefined;
      self.options.capable = undefined;

      self.options.width = (config.width) ? config.width : self.el.offsetWidth;

      self.initialize.apply(self);

      self.query.on("complete", function(){
        self.trigger("update");
      });

      self.query.on("remove", function(){
        self.trigger("remove");
      });

    });

    return self;
  };

  Keen.Adapter.prototype.initialize = function(query, selector, config) {
    console.log('chart:initialize', arguments);
  };

  Keen.Adapter.prototype.error = function(query, selector, config) {
    Keen.log('Error: The chart type you have selected does not support your query');
    Keen.log('Please try chart type(s): ' + this.config.capable.join(','));
  };

  Keen.Adapter.prototype.render = function() {
    console.log('chart:render');
  };

  Keen.Adapter.prototype.update = function() {
    console.log('chart:update');
  };

  Keen.Adapter.prototype.remove = function() {
    console.log('chart:remove');
  };
