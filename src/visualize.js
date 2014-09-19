  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  Keen.prototype.draw = function(query, el, config) {
    var visual = new Keen.Dataviz().prepare(el).attributes(config),
        request = new Keen.Request(this, [query]);

    request.on("complete", function(){
      visual.parseRequest(this).render();
    });
    request.on("error", function(response){
      visual.error({ error: response, el: el });
    });
    return visual;
  };

  // -------------------------------
  // Keen.Visualization
  // -------------------------------
  Keen.Visualization = function(dataset, el, config){
    return new Keen.Dataviz()
      .prepare(el)
      .data(dataset)
      .attributes(config)
      .render();
  };

  // *******************
  // START NEW CLEAN API
  // *******************

  /*Keen.Dataviz = function(chartType) {
    this.capabilities = []; // No capabilities by default;
    this.config = {};
    if (chartType) {
      this.config['chartType'] = chartType;
    }
    this.dataformSchema = {
      collection: 'result',
      select: true
    };
  };

  _extend(Keen.Dataviz.prototype, Events);*/

  /*Keen.Dataviz.prototype.setData = function(dataset) {
    if (!dataset) {
      throw new Error('You must pass data to the setData() function.');
    }
    this.dataset = dataset;

    if (this.dataset instanceof Keen.Request) {
      this.data = (this.dataset.data instanceof Array) ? this.dataset.data[0] : this.dataset.data;
    } else {
      // Handle raw data
      // _transform() and handle as usual
      this.data = (this.dataset instanceof Array) ? this.dataset[0] : this.dataset;
    }

    // Set the visualization types this reqest can do.
    this.setVizTypes();

    // Set the capable chart types and default type for this viz.
    this.setCapabilities();

    return this;
  };*/

  /*Keen.Dataviz.prototype.setConfig = function(config) {
    if (!this.dataset) {
      throw new Error('You must provide data to a Keen.Dataviz object using the setData() function before calling config() on it.');
    }

    // Backwoods cloning facility
    //x var defaults = JSON.parse(JSON.stringify(Keen.Visualization.defaults));
    //x this.config = _extend(defaults, config);

    // Build default title if necessary to do so.
    if (!this.config.title && this.dataset instanceof Keen.Request) {
      this.buildDefaultTitle();
    }

    //x this.setDataformSchema();

    this.setSpecificChartOptions();

    //x this.config['data'] = (this.data) ? _transform.call(this.config, this.data, this.dataformSchema) : [];

    //x this.applyColorMapping();

    return this;
  };*/

  /*Keen.Dataviz.prototype.prepare = function(el) {
    this.config.el = el;
    this.config.el.innerHTML = "";
    var placeholder = document.createElement("div");
    placeholder.className = "keen-loading";
    //placeholder.style.background = "#f2f2f2";
    placeholder.style.height = (this.config.height || Keen.Visualization.defaults.height) + "px";
    placeholder.style.position = "relative";
    placeholder.style.width = (this.config.width || Keen.Visualization.defaults.width) + "px";
    el.innerHTML = "";
    el.appendChild(placeholder);
    this.spinner = new Keen.Spinner(Keen.Spinner.defaults).spin(placeholder);
    return this;
  };*/

  /*Keen.Dataviz.prototype.buildDefaultTitle = function() {
    var self = this;
    this.config.title = (function(){
      var analysis = self.dataset.queries[0].analysis.replace("_", " "),
          collection = self.dataset.queries[0].get('event_collection'),
          output;

      output = analysis.replace( /\b./g, function(a){
        return a.toUpperCase();
      });

      if (collection) {
        output += ' - ' + collection;
      }
      return output;
    })();
  };*/

  /*Keen.Dataviz.prototype.setVizTypes = function() {
    if (this.dataset instanceof Keen.Request) {
      // Handle known scenarios
      this.isMetric = (typeof this.dataset.data.result === "number" || this.dataset.data.result === null) ? true : false,
      this.isFunnel = (this.dataset.queries[0].get('steps')) ? true : false,
      this.isInterval = (this.dataset.queries[0].get('interval')) ? true : false,
      this.isGroupBy = (this.dataset.queries[0].get('group_by')) ? true : false,
      this.is2xGroupBy = (this.dataset.queries[0].get('group_by') instanceof Array) ? true : false;
      this.isExtraction = (this.dataset.queries[0].analysis == 'extraction') ? true : false;
    } else {
      this.isMetric = (typeof this.dataset.result === "number" || this.dataset.result === null) ? true : false
    }
  };*/

  /*Keen.Dataviz.prototype.setCapabilities = function() {
    // Metric
    if (this.isMetric) {
      this.capabilities = ['metric'];
    }

    // GroupBy
    if (!this.isInterval && this.isGroupBy) {
      this.capabilities = ['piechart', 'barchart', 'columnchart', 'table'];
      if (this.config.chartType == 'barchart') {
        this.config.chartOptions.legend = { position: 'none' };
      }
    }

    // Single Interval
    if (this.isInterval && !this.isGroupBy) { // Series
      this.capabilities = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      if (this.config.library == 'google') {
        if (this.config.chartOptions.legend == void 0) {
          this.config.chartOptions.legend = { position: 'none' };
        }
      }

    }

    // GroupBy Interval
    if (this.isInterval && this.isGroupBy) {
      this.capabilities = ['linechart', 'areachart', 'barchart', 'columnchart', 'table'];
    }

    // Custom Dataset schema for
    // complex query/response types
    // -------------------------------

    // Funnels
    if (this.isFunnel) {
      this.capabilities = ['columnchart', 'areachart', 'barchart', 'linechart', 'table'];
      if (this.config.library == 'google') {
        this.config.chartOptions.legend = { position: 'none' };
      }
    }

    // 2x GroupBy
    if (this.is2xGroupBy) {
      this.capabilities = ['columnchart', 'areachart', 'barchart', 'linechart', 'table'];
    }

    // Extractions
    if (this.isExtraction) {
      this.capabilities = ['table'];
    }
  };*/

  /*Keen.Dataviz.prototype.setDataformSchema = function() {
    if (this.is2xGroupBy) {
      this.dataformSchema = {
        collection: 'result',
        sort: {
          index: 'asc',
          label: 'desc'
        }
      };
      if (this.isInterval) {
        this.dataformSchema.unpack = {
          index: 'timeframe -> start',
          label: 'value -> ' + this.dataset.queries[0].params.group_by[0],
          value: 'value -> result'
        };
      } else {
        this.dataformSchema.unpack = {
          index: this.dataset.queries[0].params.group_by[0],
          label: this.dataset.queries[0].params.group_by[1],
          value: 'result'
        };
      }
    }

    if (this.isExtraction) {
      this.dataformSchema = {
        collection: "result",
        select: true
      };
      if (this.dataset.queries[0].get('property_names')) {
        this.dataformSchema.select = [];
        for (var i = 0; i < this.dataset.queries[0].get('property_names').length; i++) {
          this.dataformSchema.select.push({ path: this.dataset.queries[0].get('property_names')[i] });
        }
      }
    }
  };

  /*Keen.Dataviz.prototype.applyColorMapping = function() {
    // Apply color-mapping options (post-process)
    // -------------------------------
    var self = this;

    if (this.config.colorMapping) {

      // Map to selected index
      if (this.config['data'].schema.select && this.config['data'].table[0].length == 2) {
        _each(this.config['data'].table, function(row, i){
          if (i > 0 && self.config.colorMapping[row[0]]) {
            self.config.colors.splice(i-1, 0, self.config.colorMapping[row[0]]);
          }
        });
      }

      // Map to unpacked labels
      if (this.config['data'].schema.unpack) { //  && this.config['data'].table[0].length > 2
        _each(this.config['data'].table[0], function(cell, i){
          if (i > 0 && self.config.colorMapping[cell]) {
            self.config.colors.splice(i-1, 0, self.config.colorMapping[cell]);
          }
        });
      }

    }
  };*/

  /*Keen.Dataviz.prototype.setSpecificChartOptions = function() {
    // A few last details
    // -------------------------------

    if (this.config.chartType == 'metric') {
      this.config.library = 'keen-io';
    }

    if (this.config.chartOptions.lineWidth == void 0) {
      this.config.chartOptions.lineWidth = 2;
    }

    if (this.config.chartType == 'piechart') {
      if (this.config.chartOptions.sliceVisibilityThreshold == void 0) {
        this.config.chartOptions.sliceVisibilityThreshold = 0.01;
      }
    }

    if (this.config.chartType == 'columnchart' || this.config.chartType == 'areachart' || this.config.chartType == 'linechart') {

      if (this.config.chartOptions.hAxis == void 0) {
        this.config.chartOptions.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
      }

      if (this.config.chartOptions.vAxis == void 0) {
        this.config.chartOptions.vAxis = {
          viewWindow: { min: 0 }
        };
      }
    }
  };

  Keen.Dataviz.prototype.render = function(el) {
    // Set chart type to default if one hasn't seen set,
    // which is just the first index in the array of chart types this viz is capable of.
    if (!this.config.chartType) {
      this.config.chartType = this.capabilities[0];
    }
    if (this.spinner) {
      this.spinner.stop();
    }
    this.config.el = el;

    if (this.config.library) {
      if (Keen.Visualization.libraries[this.config.library][this.config.chartType]) {
        this.chart = new Keen.Visualization.libraries[this.config.library][this.config.chartType](this.config);
      } else {
        throw new Error('The library you selected does not support this chartType');
      }
    } else {
      throw new Error('The library you selected is not present');
    }

    return this;
  };

  Keen.Dataviz.prototype.remove = function() {
    if (this.config.el) {
      this.config.el.innerHTML = "";
    }
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
    if (this.viz) {
      this.viz = null; // TODO: Destroy the actual chart object?
    }
  };*/

  // Visualization defaults
  /*Keen.Visualization.defaults = _extend({
    width: 600,
    chartOptions: {}
  }, Keen.Dataviz.defaults);

  // Collect and manage libraries
  Keen.Visualization.libraries = {};
  Keen.Visualization.dependencies = {
    loading: 0,
    loaded: 0,
    urls: {}
  };

  Keen.Visualization.register = function(name, methods, config){
    Keen.Visualization.libraries[name] = Keen.Visualization.libraries[name] || {};
    for (var method in methods) {
      Keen.Visualization.libraries[name][method] = methods[method];
    }
    var loadHandler = function(st) {
      st.loaded++;
      if(st.loaded === st.loading) {
        Keen.loaded = true;
        Keen.trigger('ready');
      }
    };

    var self = this;

    // For all dependencies
    if(config && config.dependencies) {
      _each(config.dependencies, function (dependency, index, collection) {
        var status = Keen.Visualization.dependencies;
        // If it doesn't exist in the current dependencies being loaded
        if(!status.urls[dependency.url]) {
          status.urls[dependency.url] = true;
          status.loading++;
          var method = dependency.type === 'script' ? _load_script : _load_style;

          method(dependency.url, function() {
            if(dependency.cb) {
              dependency.cb.call(self, function() {
                loadHandler(status);
              });
            } else {
              loadHandler(status);
            }
          });
        }
      }); // End each
    }
  };

  Keen.Visualization.visuals = [];
  var baseVisualization = function(config){
    var self = this;
    _extend(self, config);

    // Set default event handlers
    self.on("error", function(){
      var errorConfig, error;
      errorConfig = Keen.utils.extend({
        error: { message: arguments[0] }
      }, config);
      error = new Keen.Visualization.libraries['keen-io']['error'](errorConfig);
    });
    self.on("update", function(){
      self.update.apply(this, arguments);
    });
    self.on("remove", function(){
      self.remove.apply(this, arguments);
    });

    // Let's kick it off!
    self.initialize();
    Keen.Visualization.visuals.push(self);
  };

  baseVisualization.prototype = {
    initialize: function(){
      // Set listeners and prepare data
    },
    render: function(){
      // Build artifacts
    },
    update: function(){
      // Handle data updates
    },
    remove: function(){
      // Handle deletion
    }
  };
  _extend(baseVisualization.prototype, Events);

  Keen.Visualization.extend = function(protoProps, staticProps){
    var parent = baseVisualization, Visualization;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Visualization = protoProps.constructor;
    } else {
      Visualization = function(){ return parent.apply(this, arguments); };
    }
    _extend(Visualization, parent, staticProps);
    var Surrogate = function(){ this.constructor = Visualization; };
    Surrogate.prototype = parent.prototype;
    Visualization.prototype = new Surrogate();
    if (protoProps) {
      _extend(Visualization.prototype, protoProps);
    }
    Visualization.__super__ = parent.prototype;
    return Visualization;
  };

  var ErrorMessage = Keen.Visualization.extend({
    initialize: function(){
      var errorPlaceholder, errorMessage;

      errorPlaceholder = document.createElement("div");
      errorPlaceholder.className = "keen-error";
      errorPlaceholder.style.borderRadius = "8px";
      errorPlaceholder.style.height = this.height + "px";
      errorPlaceholder.style.width = this.width + "px";

      errorMessage = document.createElement("span");
      errorMessage.style.color = "#ccc";
      errorMessage.style.display = "block";
      errorMessage.style.paddingTop = (this.height / 2 - 15) + "px";
      errorMessage.style.fontFamily = "Helvetica Neue, Helvetica, Arial, sans-serif";
      errorMessage.style.fontSize = "21px";
      errorMessage.style.fontWeight = "light";
      errorMessage.style.textAlign = "center";

      errorMessage.innerHTML = this['error'].message;
      errorPlaceholder.appendChild(errorMessage);

      this.el.innerHTML = "";
      this.el.appendChild(errorPlaceholder);
    }
  });

  Keen.Visualization.register('keen-io', {
    'error': ErrorMessage
  });*/


  // -------------------------------
  // Dataform Configuration
  // -------------------------------
  // Handles arbitrary raw data for
  // scenarios where originating
  // queries are not known
  // -------------------------------
  /*function _transform(response, config){
    var self = this, schema = config || {}, dataform;

    // Metric
    // -------------------------------
    if (typeof response.result == "number"){
      //return new Keen.Dataform(response, {
      schema = {
        collection: "",
        select: [{
          path: "result",
          type: "string",
          label: "Metric",
          format: false,
          method: "Keen.utils.prettyNumber",
          replace: {
            null: 0
          }
        }]
      }
    }

    // Everything else
    // -------------------------------
    if (response.result instanceof Array && response.result.length > 0){

      // Interval w/ single value
      // -------------------------------
      if (response.result[0].timeframe && (typeof response.result[0].value == "number" || response.result[0].value == null)) {
        schema = {
          collection: "result",
          select: [
            {
              path: "timeframe -> start",
              type: "date"
            },
            {
              path: "value",
              type: "number",
              format: "10",
              replace: {
                null: 0
              }
            }
          ],
          sort: {
            column: 0,
            order: 'asc'
          }
        }
      }

      // Static GroupBy
      // -------------------------------
      if (typeof response.result[0].result == "number"){
        schema = {
          collection: "result",
          select: [],
          sort: {
            column: 1,
            order: "desc"
          }
        };
        for (var key in response.result[0]){
          if (response.result[0].hasOwnProperty(key) && key !== "result"){
            schema.select.push({
              path: key,
              type: "string"
            });
            break;
          }
        }
        schema.select.push({
          path: "result",
          type: "number"
        });
      }

      // Grouped Interval
      // -------------------------------
      if (response.result[0].value instanceof Array){
        schema = {
          collection: "result",
          unpack: {
            index: {
              path: "timeframe -> start",
              type: "date"
            },
            value: {
              path: "value -> result",
              type: "number",
              replace: {
                null: 0
              }
            }
          },
          sort: {
            value: "desc"
          }
        }
        for (var key in response.result[0].value[0]){
          if (response.result[0].value[0].hasOwnProperty(key) && key !== "result"){
            schema.unpack.label = {
              path: "value -> " + key,
              type: "string"
            }
            break;
          }
        }
      }

      // Funnel
      // -------------------------------
      if (typeof response.result[0] == "number"){
        schema = {
          collection: "",
          unpack: {
            index: {
              path: "steps -> event_collection",
              type: "string"
            },
            value: {
              path: "result -> ",
              type: "number"
            }
          }
        }
      }

    }

    // Trim colorMapping values
    // -------------------------------
    if (self.colorMapping) {
      _each(self.colorMapping, function(v,k){
        self.colorMapping[k] = v.trim();
      });
    }

    // Apply formatting options
    // -------------------------------

    // If key:value replacement map
    if (self.labelMapping && _type(self.labelMapping) == 'Object') {

      if (schema.unpack) {
        if (schema.unpack['index']) {
          schema.unpack['index'].replace = schema.unpack['index'].replace || self.labelMapping;
        }
        if (schema.unpack['label']) {
          schema.unpack['label'].replace = schema.unpack['label'].replace || self.labelMapping;
        }
      }

      if (schema.select) {
        _each(schema.select, function(v, i){
          schema.select[i].replace = self.labelMapping;
        });
      }

    }

    dataform = new Keen.Dataform(response, schema);

    // If full replacement (post-process)
    if (self.labelMapping && _type(self.labelMapping) == 'Array') {
      if (schema.unpack && dataform.table[0].length == 2) {
        _each(dataform.table, function(row,i){
          if (i > 0 && self.labelMapping[i-1]) {
            dataform.table[i][0] = self.labelMapping[i-1];
          }
        });
      }
      if (schema.unpack && dataform.table[0].length > 2) {
        _each(dataform.table[0], function(cell,i){
          if (i > 0 && self.labelMapping[i-1]) {
            dataform.table[0][i] = self.labelMapping[i-1];
          }
        });
      }
    }

    return dataform;
  }*/



  /*Keen.Visualization.find = function(target){
    var el, match;
    if (target) {
      el = target.nodeName ? target : document.querySelector(target);
      _each(Keen.Visualization.visuals, function(visual){
        if (el == visual.el){
          match = visual;
          return false;
        }
      });
      if (match) {
        return match;
      }
      throw("Visualization not found");
    } else {
      return Keen.Visualization.visuals;
    }
  };*/

  // Expose utils
  /*_extend(Keen.utils, {
    prettyNumber: _pretty_number,
    loadScript: _load_script,
    loadStyle: _load_style
  });*/

  // Set flag for script loading
  // Keen.loaded = false;
