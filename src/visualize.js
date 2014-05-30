  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  var DEFAULTS = {
    height: 400,
    width: 600,
    colors: [
      '#00afd7', // blue
      '#49c5b1', // green
      '#e6b449', // gold
      '#f35757'  // red
    ]
  };

  Keen.prototype.draw = function(query, selector, config) {

    // Find DOM element, set height, build spinner

    return new Keen.Request(this, [query], function(){
      this.draw(selector, config);
    });
  };


  // -------------------------------
  // Inject Request Draw Method
  // -------------------------------
  Keen.Request.prototype.draw = function(selector, config) {
    var self = this;
    if (!self.visual) {
      self.visual = new Keen.Visualization(self, selector, config);
    }
    return self;
  };


  // -------------------------------
  // Keen.Visualization
  // -------------------------------
  Keen.Visualization = function(req, selector, config){
    var self = this, options = (config || {});
    var library = Keen.Visualization.libraries[options.library] || 'google',
        recommended;

    var isMetric = false,
        isFunnel = false,
        isInterval = false,
        isGroupBy = false,
        is2xGroupBy = false,
        isExtraction = false;

    var datasetConfig = {};
    var viewConfig = {
      el: selector,
      chartOptions: {}
    };
    viewConfig.chartOptions.colors = viewConfig.chartOptions.colors || DEFAULTS.colors;

    if (req instanceof Keen.Request) {

      req.on("complete", function(){
        if (this.visual) {
          this.visual.dataset.responses[0] = (this.data instanceof Array) ? this.data[0] : this.data;
          this.visual.dataset.transform();
        }
      });

      isMetric = (typeof req.data.result == "number" || req.data.result == null) ? true : false,
      isFunnel = (req.queries[0].get('steps')) ? true : false,
      isInterval = (req.queries[0].get('interval')) ? true : false,
      isGroupBy = (req.queries[0].get('group_by')) ? true : false,
      is2xGroupBy = (req.queries[0].get('group_by') instanceof Array) ? true : false;
      isExtraction = (req.queries[0].analysis == 'extraction') ? true : false;

      if (req.instance.client) {
        datasetConfig = {
          dateformat: options.dateFormat || ""
        };
        //datasetConfig.params.api_key = req.instance.client.readKey;
      }

      if (req.data !== void 0) {
        datasetConfig.response = (req.data instanceof Array) ? req.data[0] : req.data;
      }

      viewConfig.title = (function(){
        var analysis = req.queries[0].analysis.replace("_", " "),
            collection = req.queries[0].get('event_collection'),
            output;

        output = analysis.replace( /\b./g, function(a){
          return a.toUpperCase();
        });

        if (collection) {
          output += ' - ' + collection;
        }
        return output;
      })();

    } else if (typeof req === "string") {
      // _request.jsonp()
      // _transform()

    } else {
      // _transform() and handle as usual
    }


    // -------------------------------
    // Select a default chart type
    // -------------------------------

    // Metric
    if (isMetric) {
      options.capable = ['metric'];
      recommended = 'metric';
    }

    // GroupBy
    if (!isInterval && isGroupBy) {
      options.capable = ['piechart', 'barchart', 'columnchart', 'datatable'];
      recommended = 'piechart';
    }

    // Single Interval
    if (isInterval) { // Series
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'datatable'];
      recommended = 'areachart';
      if (!isGroupBy && library == 'google') {
        viewConfig.chartOptions.legend = { position: 'none' };
      }
    }

    // GroupBy Interval
    if (isInterval && isGroupBy) {}

    // Custom Dataset schema for
    // complex query/response types
    // -------------------------------

    // ---------------------------------------------------------
    // Funnels
    // ---------------------------------------------------------
    if (isFunnel) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'datatable'];
      recommended = 'columnchart';
      if (library == 'google') {
        viewConfig.chartOptions.legend = { position: 'none' };
      }
    }

    // ---------------------------------------------------------
    // 2x GroupBy
    // ---------------------------------------------------------
    if (is2xGroupBy) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'datatable'];
      recommended = 'columnchart';
    }

    // Dataform schema
    if (is2xGroupBy) {
      datasetConfig.schema = {
        collection: 'result',
        sort: {
          index: 'asc',
          label: 'desc'
        }
      };
      if (isInterval) {
        datasetConfig.schema.unpack = {
          index: 'timeframe -> start',
          label: 'value -> ' + req.queries[0].params.group_by[0],
          value: 'value -> result'
        };
      } else {
        datasetConfig.schema.unpack = {
          index: req.queries[0].params.group_by[0],
          label: req.queries[0].params.group_by[1],
          value: 'result'
        };
      }
    }

    // ---------------------------------------------------------
    // Extractions
    // ---------------------------------------------------------
    if (isExtraction) {
      options.capable = ['datatable'];
      recommended = 'datatable';
    }

    // Dataform schema
    if (isExtraction) {
      datasetConfig.schema = {
        collection: "result",
        select: true
      };
      if (req.queries[0].get('property_names')) {
        datasetConfig.schema.select = [];
        for (var i = 0; i < req.queries[0].get('property_names').length; i++) {
          datasetConfig.schema.select.push({ path: req.queries[0].get('property_names')[i] });
        }
      }
    }


    // -------------------------------
    // Configure View
    // -------------------------------
    //viewConfig = Keen.extend(viewConfig, options);
    _extend(viewConfig.chartOptions, options.chartOptions);
    viewConfig.height = options.height || DEFAULTS.height;
    viewConfig.width = options.width || DEFAULTS.width;

    if (options.title !== void 0) {
      viewConfig.title = options.title;
    }

    options.chartType = options.chartType || recommended;
    if (options.chartType == 'metric') {
      library = 'keen-io';
    }

    // Put it all together
    // -------------------------------
    if (library) {
      if (Keen.Visualization.libraries[library][options.chartType]) {
        return new Keen.Visualization.libraries[library][options.chartType]({});
      } else {
        throw new Error('The visualization type you requested is not available for this library');
      }
    } else {
      throw new Error('The visualization library you requested is not present');
    }

    return this;
  };


  // Collect and manage libraries
  Keen.Visualization.libraries = {};
  Keen.Visualization.register = function(name, methods){
    Keen.Visualization.libraries[name] = Keen.Visualization.libraries[name] || {};
    for (var method in methods) {
      Keen.Visualization.libraries[name][method] = methods[method];
    }
  };


  var vizAdapter = function(config){
    var self = this;
    _extend(self, config);

    self.chartOptions = self.chartOptions || {};
    self.height = self.height || DEFAULTS.height;
    self.width = self.width || DEFAULTS.width; // || self.el.offsetWidth;

    // Set default event handlers
    self.on("error", function(){
      visualErrorHandler.apply(this, arguments);
    });
    self.on("update", function(){
      self.update.apply(this, arguments);
    });

    // Let's kick it off!
    this.initialize();
  };

  vizAdapter.prototype = {
    initialize: function(){
      // Sets listeners and prepares data
    },
    render: function(){
      // Builds artifacts
    },
    update: function(){
      // Optional: handles data updates
    },
    remove: function(){
      // Cleanup and DOM removal
    }
  };
  _extend(vizAdapter.prototype, Events);

  Keen.Visualization.extend = function(protoProps, staticProps){
    var parent = vizAdapter, Visualization;
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

  function visualErrorHandler(){
    console.log("Error!", arguments);
  }


  // -------------------------------
  // Dataform Configuration
  // -------------------------------
  function _transform(response){
    var self = this, data;
    var schema = self.schema || false;

    if (schema) {
      return new Keen.Dataform(response, schema);
    }

    // Metric
    // -------------------------------
    if (typeof response.result == "number"){
      //return new Keen.Dataform(response, {
      schema = {
        collection: "",
        select: [{
          path: "result",
          type: "number",
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
      if (response.result[0].timeframe && typeof response.result[0].value == "number") {
        //return new Keen.Dataform(response, {
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
          select: []
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
        /*return new Keen.Dataform(response, {
          collection: "result",
          select: true
        });*/
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
        //console.log("Grouped Interval", output);
        //console.log(new Keen.Dataform(response, output));
        //return new Keen.Dataform(response, output);
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

    if (!schema) {
      schema = {
        collection: "result",
        select: true
      }
    }

    return new Keen.Dataform(response, schema);
  }

  function _pretty_number(input) {
    // If it has 3 or fewer sig figs already, just return the number.
    var sciNo = input.toPrecision(3),
        prefix = "",
        suffixes = ["", "k", "M", "B", "T"],
        recurse;
    if (Number(sciNo) == input && String(input).length <= 4) {
      return String(input);
    }
    if(input >= 1 || input <= -1) {
      if(input < 0){
          //Pull off the negative side and stash that.
          input = -input;
          prefix = "-";
      }
      recurse = function(input, iteration) {
        var input = String(input);
        split = input.split(".");
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
      };
      return prefix + recurse(input, 0);
    } else {
      return input.toPrecision(3);
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


  // Expose utils
  _extend(Keen.utils, {
    prettyNumber: _pretty_number,
    loadScript: _load_script
  });

  Keen.loaded = false;
  // Set false to bypass trigger
  // in src/outro.js
