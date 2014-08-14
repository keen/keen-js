  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  Keen.prototype.draw = function(query, el, config) {
    // Find DOM element, set height, build spinner
    var config = config || {};
    var el = el;
    var spinner = this.showSpinner(el);

    var request = new Keen.Request(this, [query]);

    request.on("complete", function(){
      if (spinner) {
        spinner.stop();
      }
      this.draw(el, config);
    });

    request.on("error", function(response){
      spinner.stop();

      var errorConfig = Keen.utils.extend({
        error: response,
        el: el
      }, Keen.Visualization.defaults);
      new Keen.Visualization.libraries['keen-io']['error'](errorConfig);
    });

    return request;
  };

  Keen.prototype.showSpinner = function(el) {
    return new Keen.Spinner({
      lines: 10, // The number of lines to draw
      length: 8, // The length of each line
      width: 3, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#4d4d4d', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'keen-spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    }).spin(el);
  };


  // -------------------------------
  // Inject Request Draw Method
  // -------------------------------
  // Keen.Request.prototype.draw = function(selector, config) {
  //   _build_visual.call(this, selector, config);
  //   this.on('complete', function(){
  //     _build_visual.call(this, selector, config);
  //   });
  //   return this;
  // };

  // function _build_visual(selector, config){
  //   this.visual = new Keen.Visualization(this, selector, config);
  // }


  // -------------------------------
  // Keen.Visualization
  // -------------------------------
  Keen.Visualization = function(req, el, config){
    var dataviz = new Keen.Dataviz(req, el, config);
    dataviz.prepare();
    dataviz.render();
  };

  Keen.Dataviz = function(req, el, config) {
    var self = this;
    this.req = req;
    this.dataformSchema = {
      collection: 'result',
      select: true
    };

    // Backwoods cloning facility
    var defaults = JSON.parse(JSON.stringify(Keen.Visualization.defaults));

    this.options = _extend(defaults, config || {});
    this.options.el = el;

    // Build default title if necessary to do so.
    if (!this.options.title && this.req instanceof Keen.Request) {
      this.buildDefaultTitle();
    }

    // Set the visualization types this reqest can do.
    this.setVizTypes();

    // Set the capable chart types and default type for this viz.
    this.setCapableAndDefaultType();

    this.setDataformSchema();

    // Set chart type to default
    if (!this.options.chartType) {
      this.options.chartType = this.defaultType;
    }

    this.setSpecificChartOptions();

    this.options['data'] = (this.data) ? _transform.call(this.options, this.data, this.dataformSchema) : [];

    this.applyColorMapping();
  };

  Keen.Dataviz.prototype.prepare = function() {
    this.el.innerHTML = "";
    this.spinner = Keen.showSpinner(this.el);
    return this;
  };

  Keen.Dataviz.prototype.buildDefaultTitle = function() {
    this.options.title = (function(){
      var analysis = this.req.queries[0].analysis.replace("_", " "),
          collection = this.req.queries[0].get('event_collection'),
          output;

      output = analysis.replace( /\b./g, function(a){
        return a.toUpperCase();
      });

      if (collection) {
        output += ' - ' + collection;
      }
      return output;
    })();
  };

  Keen.Dataviz.prototype.setVizTypes = function() {
    this.isMetric = false;
    this.isFunnel = false;
    this.isInterval = false;
    this.isGroupBy = false;
    this.is2xGroupBy = false;
    this.isExtraction = false;

    if (this.req instanceof Keen.Request) {
      // Handle known scenarios
      this.isMetric = (typeof this.req.data.result === "number" || this.req.data.result === null) ? true : false,
      this.isFunnel = (this.req.queries[0].get('steps')) ? true : false,
      this.isInterval = (this.req.queries[0].get('interval')) ? true : false,
      this.isGroupBy = (this.req.queries[0].get('group_by')) ? true : false,
      this.is2xGroupBy = (this.req.queries[0].get('group_by') instanceof Array) ? true : false;
      this.isExtraction = (this.req.queries[0].analysis == 'extraction') ? true : false;

      this.data = (this.req.data instanceof Array) ? this.req.data[0] : this.req.data;

    } else {
      // Handle raw data
      // _transform() and handle as usual
      this.data = (this.req instanceof Array) ? this.req[0] : this.req;
      this.isMetric = (typeof data.result === "number" || data.result === null) ? true : false
    }
  };

  Keen.Dataviz.prototype.setCapableAndDefaultType = function() {
    // Metric
    if (this.isMetric) {
      this.options.capable = ['metric'];
      this.defaultType ='metric';
    }

    // GroupBy
    if (!this.isInterval && this.isGroupBy) {
      this.options.capable = ['piechart', 'barchart', 'columnchart', 'table'];
      this.defaultType ='piechart';
      if (this.options.chartType == 'barchart') {
        this.options.chartOptions.legend = { position: 'none' };
      }
    }

    // Single Interval
    if (this.isInterval && !this.isGroupBy) { // Series
      this.options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      this.defaultType ='areachart';
      if (this.options.library == 'google') {
        if (this.options.chartOptions.legend == void 0) {
          this.options.chartOptions.legend = { position: 'none' };
        }
      }

    }

    // GroupBy Interval
    if (this.isInterval && this.isGroupBy) {
      this.options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      this.defaultType ='linechart';
    }

    // Custom Dataset schema for
    // complex query/response types
    // -------------------------------

    // Funnels
    if (this.isFunnel) {
      this.options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      this.defaultType ='columnchart';
      if (this.options.library == 'google') {
        this.options.chartOptions.legend = { position: 'none' };
      }
    }

    // 2x GroupBy
    if (this.is2xGroupBy) {
      this.options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      this.defaultType ='columnchart';
    }

    // Extractions
    if (this.isExtraction) {
      this.options.capable = ['table'];
      this.defaultType ='table';
    }
  };

  Keen.Dataviz.prototype.setDataformSchema = function() {
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
          label: 'value -> ' + this.req.queries[0].params.group_by[0],
          value: 'value -> result'
        };
      } else {
        this.dataformSchema.unpack = {
          index: this.req.queries[0].params.group_by[0],
          label: this.req.queries[0].params.group_by[1],
          value: 'result'
        };
      }
    }

    if (this.isExtraction) {
      this.dataformSchema = {
        collection: "result",
        select: true
      };
      if (this.req.queries[0].get('property_names')) {
        this.dataformSchema.select = [];
        for (var i = 0; i < this.req.queries[0].get('property_names').length; i++) {
          this.dataformSchema.select.push({ path: this.req.queries[0].get('property_names')[i] });
        }
      }
    }
  };

  Keen.Dataviz.prototype.applyColorMapping = function() {
    // Apply color-mapping options (post-process)
    // -------------------------------

    if (this.options.colorMapping) {

      // Map to selected index
      if (this.options['data'].schema.select && this.options['data'].table[0].length == 2) {
        _each(this.options['data'].table, function(row, i){
          if (i > 0 && this.options.colorMapping[row[0]]) {
            this.options.colors.splice(i-1, 0, this.options.colorMapping[row[0]]);
          }
        });
      }

      // Map to unpacked labels
      if (this.options['data'].schema.unpack) { //  && this.options['data'].table[0].length > 2
        _each(this.options['data'].table[0], function(cell, i){
          if (i > 0 && this.options.colorMapping[cell]) {
            this.options.colors.splice(i-1, 0, this.options.colorMapping[cell]);
          }
        });
      }

    }
  };

  Keen.Dataviz.prototype.setSpecificChartOptions = function() {
    // A few last details
    // -------------------------------

    if (this.options.chartType == 'metric') {
      this.options.library = 'keen-io';
    }

    if (this.options.chartOptions.lineWidth == void 0) {
      this.options.chartOptions.lineWidth = 2;
    }

    if (this.options.chartType == 'piechart') {
      if (this.options.chartOptions.sliceVisibilityThreshold == void 0) {
        this.options.chartOptions.sliceVisibilityThreshold = 0.01;
      }
    }

    if (this.options.chartType == 'columnchart' || this.options.chartType == 'areachart' || this.options.chartType == 'linechart') {

      if (this.options.chartOptions.hAxis == void 0) {
        this.options.chartOptions.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
      }

      if (this.options.chartOptions.vAxis == void 0) {
        this.options.chartOptions.vAxis = {
          viewWindow: { min: 0 }
        };
      }
    }
  };

  Keen.Dataviz.prototype.render = function() {
    this.spinner.stop();

    if (this.options.library) {
      if (Keen.Visualization.libraries[this.options.library][this.options.chartType]) {
        this.viz = new Keen.Visualization.libraries[this.options.library][this.options.chartType](this.options);
      } else {
        throw new Error('The library you selected does not support this chartType');
      }
    } else {
      throw new Error('The library you selected is not present');
    }

    return this;
  };

  Keen.Dataviz.prototype.destroy = function() {
    this.el.innerHTML = "";
    this.spinner.stop();
    this.spinner = null;
    this.viz = null; // TODO: Destroy the actual chart object?
  };

  // Visual defaults
  Keen.Visualization.defaults = {
    library: 'google',
    height: 400,
    width: 600,
    colors: [
      "#00afd7",
      "#f35757",
      "#f0ad4e",
      "#8383c6",
      "#f9845b",
      "#49c5b1",
      "#2a99d1",
      "#aacc85",
      "#ba7fab"
    ],
    chartOptions: {}
  };

  // Collect and manage libraries
  Keen.Visualization.libraries = {};
  Keen.Visualization.register = function(name, methods){
    Keen.Visualization.libraries[name] = Keen.Visualization.libraries[name] || {};
    for (var method in methods) {
      Keen.Visualization.libraries[name][method] = methods[method];
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
  });


  // -------------------------------
  // Dataform Configuration
  // -------------------------------
  // Handles arbitrary raw data for
  // scenarios where originating
  // queries are not known
  // -------------------------------
  function _transform(response, config){
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
  }

  function _pretty_number(_input) {
    // If it has 3 or fewer sig figs already, just return the number.
    var input = Number(_input),
        sciNo = input.toPrecision(3),
        prefix = "",
        suffixes = ["", "k", "M", "B", "T"];

    if (Number(sciNo) == input && String(input).length <= 4) {
      return String(input);
    }

    if(input >= 1 || input <= -1) {
      if(input < 0){
        //Pull off the negative side and stash that.
        input = -input;
        prefix = "-";
      }
      return prefix + recurse(input, 0);
    } else {
      return input.toPrecision(3);
    }

    function recurse(input, iteration) {
      var input = String(input);
      var split = input.split(".");
      // If there's a dot
      if(split.length > 1) {
        // Keep the left hand side only
        input = split[0];
        var rhs = split[1];
        // If the left-hand side is too short, pad until it has 3 digits
        if (input.length == 2 && rhs.length > 0) {
          // Pad with right-hand side if possible
          if (rhs.length > 0) {
            input = input + "." + rhs.charAt(0);
          }
          // Pad with zeroes if you must
          else {
            input += "0";
          }
        }
        else if (input.length == 1 && rhs.length > 0) {
          input = input + "." + rhs.charAt(0);
          // Pad with right-hand side if possible
          if(rhs.length > 1) {
            input += rhs.charAt(1);
          }
          // Pad with zeroes if you must
          else {
            input += "0";
          }
        }
      }
      var numNumerals = input.length;
      // if it has a period, then numNumerals is 1 smaller than the string length:
      if (input.split(".").length > 1) {
        numNumerals--;
      }
      if(numNumerals <= 3) {
        return String(input) + suffixes[iteration];
      }
      else {
        return recurse(Number(input) / 1000, iteration + 1);
      }
    }
  }

  function _load_script(url, cb) {
    var doc = document;
    var handler;
    var head = doc.head || doc.getElementsByTagName("head");

    // loading code borrowed directly from LABjs itself
    setTimeout(function () {
      // check if ref is still a live node list
      if ('item' in head) {
        // append_to node not yet ready
        if (!head[0]) {
          setTimeout(arguments.callee, 25);
          return;
        }
        // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
        head = head[0];
      }
      var script = doc.createElement("script"),
      scriptdone = false;
      script.onload = script.onreadystatechange = function () {
        if ((script.readyState && script.readyState !== "complete" && script.readyState !== "loaded") || scriptdone) {
          return false;
        }
        script.onload = script.onreadystatechange = null;
        scriptdone = true;
        cb();
      };
      script.src = url;
      head.insertBefore(script, head.firstChild);
    }, 0);

    // required: shim for FF <= 3.5 not having document.readyState
    if (doc.readyState === null && doc.addEventListener) {
      doc.readyState = "loading";
      doc.addEventListener("DOMContentLoaded", handler = function () {
        doc.removeEventListener("DOMContentLoaded", handler, false);
        doc.readyState = "complete";
      }, false);
    }
  }

  Keen.Visualization.find = function(target){
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
  };

  // Expose utils
  _extend(Keen.utils, {
    prettyNumber: _pretty_number,
    loadScript: _load_script
  });

  // Set flag for script loading
  Keen.loaded = false;
