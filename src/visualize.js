  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  Keen.prototype.draw = function(query, selector, config) {
    // Find DOM element, set height, build spinner
    var config = config || {};
    var id = selector.getAttribute("id");
    var el = document.getElementById(id);

    var placeholder = document.createElement("div");
    //placeholder.style.background = "#f2f2f2";
    placeholder.style.height = (config.height || Keen.Visualization.defaults.height) + "px";
    placeholder.style.position = "relative";
    placeholder.style.width = (config.width || Keen.Visualization.defaults.width) + "px";
    el.appendChild(placeholder);

    var spinner = new Keen.Spinner({
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
    }).spin(placeholder);

    return new Keen.Request(this, [query], function(){
      spinner.stop();
      el.removeChild(placeholder);
      this.draw(selector, config);
    });
  };


  // -------------------------------
  // Inject Request Draw Method
  // -------------------------------
  Keen.Request.prototype.draw = function(selector, config) {
    if (!this.visual) {
      this.visual = new Keen.Visualization(this, selector, config);
    }
    return this;
  };


  // -------------------------------
  // Keen.Visualization
  // -------------------------------
  Keen.Visualization = function(req, selector, config){
    var self = this, data, defaults, options, library, defaultType, dataformSchema;

    // Backwoods cloning facility
    defaults = JSON.parse(JSON.stringify(Keen.Visualization.defaults));

    options = _extend(defaults, config || {});
    library = Keen.Visualization.libraries[options.library];

    options.el = selector;

    dataformSchema = {
      collection: 'result',
      select: true
    };

    // Build default title if necessary to do so
    if (!options.title && req instanceof Keen.Request) {
      options.title = (function(){
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
    }

    var isMetric = false,
        isFunnel = false,
        isInterval = false,
        isGroupBy = false,
        is2xGroupBy = false,
        isExtraction = false;

    if (req instanceof Keen.Request) {
      //console.log("req", req.data);
      // Handle known scenarios
      isMetric = (typeof req.data.result == "number" || req.data.result == null) ? true : false,
      isFunnel = (req.queries[0].get('steps')) ? true : false,
      isInterval = (req.queries[0].get('interval')) ? true : false,
      isGroupBy = (req.queries[0].get('group_by')) ? true : false,
      is2xGroupBy = (req.queries[0].get('group_by') instanceof Array) ? true : false;
      isExtraction = (req.queries[0].analysis == 'extraction') ? true : false;

      data = (req.data instanceof Array) ? req.data[0] : req.data;

    } else if (typeof req === "string") {
      // Fetch a new resource
      // _request.jsonp()
      // _transform()

    } else {
      // Handle raw data
      // _transform() and handle as usual
      data = (req instanceof Array) ? req[0] : req;
    }


    // -------------------------------
    // Select a default chart type
    // -------------------------------

    // Metric
    if (isMetric) {
      options.capable = ['metric'];
      defaultType = 'metric';
    }

    // GroupBy
    if (!isInterval && isGroupBy) {
      options.capable = ['piechart', 'barchart', 'columnchart', 'datatable'];
      defaultType = 'piechart';
      if (options.chartType == 'barchart') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // Single Interval
    if (isInterval) { // Series
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'datatable'];
      defaultType = 'areachart';
      if (!isGroupBy && options.library == 'google') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // GroupBy Interval
    if (isInterval && isGroupBy) {}

    // Custom Dataset schema for
    // complex query/response types
    // -------------------------------

    // Funnels
    if (isFunnel) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'datatable'];
      defaultType = 'columnchart';
      if (options.library == 'google') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // 2x GroupBy
    if (is2xGroupBy) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'datatable'];
      defaultType = 'columnchart';
    }


    // Dataform schema
    // ---------------------------------------------------------
    if (is2xGroupBy) {
      dataformSchema = {
        collection: 'result',
        sort: {
          index: 'asc',
          label: 'desc'
        }
      };
      if (isInterval) {
        dataformSchema.unpack = {
          index: 'timeframe -> start',
          label: 'value -> ' + req.queries[0].params.group_by[0],
          value: 'value -> result'
        };
      } else {
        dataformSchema.unpack = {
          index: req.queries[0].params.group_by[0],
          label: req.queries[0].params.group_by[1],
          value: 'result'
        };
      }
    }

    // Extractions
    if (isExtraction) {
      options.capable = ['datatable'];
      defaultType = 'datatable';
    }

    // Dataform schema
    // ---------------------------------------------------------
    if (isExtraction) {
      dataformSchema = {
        collection: "result",
        select: true
      };
      if (req.queries[0].get('property_names')) {
        dataformSchema.select = [];
        for (var i = 0; i < req.queries[0].get('property_names').length; i++) {
          dataformSchema.select.push({ path: req.queries[0].get('property_names')[i] });
        }
      }
    }


    // A few last details
    // -------------------------------
    if (!options.chartType) {
      options.chartType = defaultType;
    }

    if (options.chartType == 'metric') {
      options.library = 'keen-io';
    }

    // Re-apply our defaults
    options.chartOptions.lineWidth = options.chartOptions.lineWidth || 4;

    //_extend(self, options);
    options['data'] = (data) ? _transform.call(options, data, dataformSchema) : [];

    // Put it all together
    // -------------------------------
    if (options.library) {
      if (Keen.Visualization.libraries[options.library][options.chartType]) {
        return new Keen.Visualization.libraries[options.library][options.chartType](options);
      } else {
        throw new Error('The library you selected does not support this chartType');
      }
    } else {
      throw new Error('The library you selected is not present');
    }

    return this;
  };

  // Visual defaults
  Keen.Visualization.defaults = {
    library: 'google',
    height: 400,
    width: 600,
    colors: [
      '#00afd7', // blue
      '#49c5b1', // green
      '#e6b449', // gold
      '#f35757'  // red
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


  var baseVisualization = function(config){
    var self = this;
    _extend(self, config);

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

  function visualErrorHandler(msg){
    //console.log("Error!", message, this);

    var errorPlaceholder = document.createElement("div");
    //errorPlaceholder.style.background = "#f7f7f7";
    errorPlaceholder.style.borderRadius = "8px";
    errorPlaceholder.style.height = this.height + "px";
    errorPlaceholder.style.width = this.width + "px";

    var errorMessage = document.createElement("span");
    errorMessage.style.color = "#ccc";
    errorMessage.style.display = "block";
    errorMessage.style.paddingTop = (this.height / 2 - 15) + "px";
    errorMessage.style.fontFamily = "Helvetica Neue, Helvetica, Arial, sans-serif";
    errorMessage.style.fontSize = "21px";
    errorMessage.style.fontWeight = "light";
    errorMessage.style.textAlign = "center";

    errorMessage.innerHTML = msg;
    errorPlaceholder.appendChild(errorMessage);

    this.el.innerHTML = "";
    this.el.appendChild(errorPlaceholder);
  }


  // -------------------------------
  // Dataform Configuration
  // -------------------------------
  // Handles arbitrary raw data for
  // scenarios where originating
  // queries are not known
  // -------------------------------
  function _transform(response, config){
    var self = this, schema = config || {};

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


    // Apply formatting options
    // -------------------------------
    if (self.labelMapping && schema.unpack) {
      if (schema.unpack['index']) {
        schema.unpack['index'].replace = schema.unpack['index'].replace || self.labelMapping;
      }
      if (schema.unpack['label']) {
        schema.unpack['label'].replace = schema.unpack['label'].replace || self.labelMapping;
      }
    }

    if (self.labelMapping && schema.select) {
      _each(schema.select, function(v, i){
        schema.select[i].replace = self.labelMapping;
      });
    }

    return new Keen.Dataform(response, schema);
  }

  function _pretty_number(input) {
    // If it has 3 or fewer sig figs already, just return the number.
    var input = Number(input),
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


  // Expose utils
  _extend(Keen.utils, {
    prettyNumber: _pretty_number,
    loadScript: _load_script
  });

  // Set flag for script loading
  Keen.loaded = false;
