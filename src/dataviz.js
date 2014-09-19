/* TODO:
   [x] set up dataType capability-mapping
   [ ] move google defaults into adapter
*/

_extend(Keen.utils, {
  prettyNumber: _prettyNumber,
  loadScript: _loadScript,
  loadStyle: _loadStyle
});

// Set flag for script loading
Keen.loaded = false;

Keen.Spinner.defaults = {
  lines: 10,                    // The number of lines to draw
  length: 8,                    // The length of each line
  width: 3,                     // The line thickness
  radius: 10,                   // The radius of the inner circle
  corners: 1,                   // Corner roundness (0..1)
  rotate: 0,                    // The rotation offset
  direction: 1,                 // 1: clockwise, -1: counterclockwise
  color: '#4d4d4d',             // #rgb or #rrggbb or array of colors
  speed: 1,                     // Rounds per second
  trail: 60,                    // Afterglow percentage
  shadow: false,                // Whether to render a shadow
  hwaccel: false,               // Whether to use hardware acceleration
  className: 'keen-spinner',    // The CSS class to assign to the spinner
  zIndex: 2e9,                  // The z-index (defaults to 2000000000)
  top: '50%',                   // Top position relative to parent
  left: '50%'                   // Left position relative to parent
};

Keen.Dataviz = function(){

  this.dataset = {
    parse: function(){ console.log("demo"); },
    table: [["date", "value"],[new Date().toISOString(), 54343]]
  }; // => new Keen.Dataset();

  this.view = {
    _initialized: false,
    _rendered: false,
    _artifacts: { /* state bin */ },

    adapter: {                  // => .adapter()
      library: undefined,       // => .library()
      chartType: undefined,     // => .chartType()
      defaultChartType: undefined, // => .defaultChartType()
      dataType: undefined       // => .dataType()
    },

    attributes: JSON.parse(JSON.stringify(Keen.Dataviz.defaults)),
    // attributes: _extend({}, Keen.Dataviz.defaults),

    defaults: JSON.parse(JSON.stringify(Keen.Dataviz.defaults)),
    //defaults: _extend({}, Keen.Dataviz.defaults),

    el: undefined             // => .el()
  };

  // Set default event handlers
  /*var self = this;
  self.on("error", function(){
    var errorConfig, error;
    errorConfig = _extend({error:{message: arguments[0]}}, self.attributes());
    error = new Keen.Dataviz.libraries['keen-io']['error'](errorConfig);
  });
  self.on("update", function(){
    self.update.apply(this, arguments);
  });
  self.on("remove", function(){
    self.remove.apply(this, arguments);
  });

  // Let's kick it off!
  self.initialize();*/
  Keen.Dataviz.visuals.push(this);
};

_extend(Keen.Dataviz.prototype, Events);
_extend(Keen.Dataviz, {
  defaults = {
    library: 'google',
    height: 400,
    colors: [
      "#00afd7", "#f35757", "#f0ad4e", "#8383c6", "#f9845b", "#49c5b1", "#2a99d1", "#aacc85", "#ba7fab"
      /* Todo: add light/dark derivatives */
    ],
    chartOptions: {}
  },
  libraries: {},
  dependencies = {
    loading: 0,
    loaded: 0,
    urls: {}
  },
  visuals: []
});


// ------------------------------
// Dataset convenience method
// ------------------------------

Keen.Dataviz.prototype.call = function(fn){
  fn.call(this);
  return this;
};

Keen.Dataviz.prototype.data = function(data){
  if (!arguments.length) return this.dataset.table;
  if (data instanceof Keen.Dataset) {
    this.dataset = data;
  } else if (data instanceof Keen.Request) {
    this.parseRequest(data);
  } else {
    this.parseRawData(data);
  }
  return this;
};

Keen.Dataviz.prototype.parseRawData = function(raw){
  this.dataset = _parseRawData.call(this, raw);
  return this;
};

Keen.Dataviz.prototype.parseRequest = function(req){
  this.dataset = _parseRequest.call(this, req);
  // Update the active title if not set
  if (!this.title()) this.title(_buildDefaultTitle.call(this));
  // Update the default title every time
  this.view.defaults.title = _buildDefaultTitle.call(this);
  return this;
};


// ------------------------------
// View Attributes
// ------------------------------

Keen.Dataviz.prototype.attributes = function(_attributes){
  if (!arguments.length) return this.view.attributes;
  _each(_attributes, function(prop, key){
    this.view.attributes[key] = _prop;
  });
  return this;
};

Keen.Dataviz.prototype.colors = function(value){
  if (!arguments.length) return this.view.attributes.colors;
  if (value instanceof Array) {
    this.view.attributes.colors = value;
  }
  return this;
};

Keen.Dataviz.prototype.colorMapping = function(value){
  if (!arguments.length) return this.view.attributes.colorMapping;
  var self = this;
  self.view.attributes.colorMapping = null;
  _each(value, function(v,k){
    self.view.attributes.colorMapping[k] = v.trim();
  });
  _runColorMapping.call(self);
  return self;
};

Keen.Dataviz.prototype.labels = function(value){
  if (!arguments.length) return this.view.attributes.labels;
  if (value instanceof Array) {
    this.view.attributes.labels = value;
  }
  _runLabelReplacement.call(this);
  return this;
};

Keen.Dataviz.prototype.labelMapping = function(value){
  if (!arguments.length) return this.view.attributes.labelMapping;
  var self = this;
  self.view.attributes.labelMapping = null;
  _each(value, function(v,k){
    self.view.attributes.labelMapping[k] = v.trim();
  });
  _runLabelMapping.call(self);
  return self;
};

Keen.Dataviz.prototype.height = function(value){
  if (!arguments.length) return this.view.attributes.height;
  this.view.attributes['height'] = parseInt(value);
  return this;
};

Keen.Dataviz.prototype.title = function(value){
  if (!arguments.length) return this.view.attributes.title;
  this.view.attributes['title'] = String(value);
  return this;
};

Keen.Dataviz.prototype.width = function(value){
  if (!arguments.length) return this.view.attributes.width;
  this.view.attributes['width'] = parseInt(value);
  return this;
};


// ------------------------------
// View Adapter
// ------------------------------

Keen.Dataviz.prototype.adapter = function(_adapter){
  if (!arguments.length) return this.view.adapter;
  _each(_adapter, function(prop, key){
    this.view.adapter[key] = _prop;
  });
  return this;
};

Keen.Dataviz.prototype.library = function(_lib){
  if (!arguments.length) return this.view.adapter.library;
  this.view.adapter.library = String(_lib);
  return this;
};

Keen.Dataviz.prototype.chartType = function(_type){
  if (!arguments.length) return this.view.adapter.chartType;
  this.view.adapter.chartType = String(_type);
  return this;
};

Keen.Dataviz.prototype.defaultChartType = function(_type){
  if (!arguments.length) return this.view.adapter.defaultChartType;
  this.view.adapter.defaultChartType = String(_type);
  // Set chartType if a value is not set
  if (!this.chartType()) {
    this.chartType(String(_type))
  }
  return this;
};

Keen.Dataviz.prototype.dataType = function(_type){
  if (!arguments.length) return this.view.adapter.dataType;
  this.view.adapter.dataType = String(_type);
  /*
  get adapter.capabilities
  get adapter default for dataType
  set adapter.defaultChartType = deafult type
  */
  var defaultTypeSet = Keen.Dataviz.libraries[this.library()]._defaults[_type];
  if (defaultTypeSet) {
    this.defaultChartType(defaultTypeSet[0]);
  }
  return this;
};

Keen.Dataviz.prototype.el = function(_el){
  if (!arguments.length) return this.view.el;
  this.view.el = _el;
  return this;
};

Keen.Dataviz.prototype.prepare = function(_el){
  if (_el) this.view.el(_el);
  if (this.view._rendered) {
    Keen.Dataviz.libraries['keen-io']['spinner'].destroy.apply(this, arguments);
    this.view._initialized = false;
    this.view._rendered = false;
  }
  this.el().innerHTML = "";
  Keen.Dataviz.libraries['keen-io']['spinner'].render.apply(this, arguments);
  this.view._initialized = true;
  this.view._rendered = true;
  return this;
};

Keen.Dataviz.prototype.initialize = function(){
  var actions = _getActionSet.call(this);
  if (actions.initialize) actions.initialize.apply(this, arguments);
  this.view._initialized = true;
  return this;
};

Keen.Dataviz.prototype.render = function(_el){
  var actions = _getActionSet.call(this);
  if (_el) this.el(_el);
  if (!this.view._initialized) this.initialize();
  if (this.el() && actions.render) actions.render.apply(this, arguments);
  this.view._rendered = true;
  return this;
};

Keen.Dataviz.prototype.update = function(){
  var actions = _getActionSet.call(this);
  if (actions.update) actions.update.apply(this, arguments);
  return this;
};

Keen.Dataviz.prototype.destroy = function(){
  var actions = _getActionSet.call(this);
  if (actions.destroy) actions.destroy.apply(this, arguments);
  // clear rendered artifats, state bin
  this.el().innerHTML = "";
  this.view._initialized = false;
  this.view._rendered = false;
  return this;
};

Keen.Dataviz.prototype.error = function(){
  var actions = _getActionSet.call(this);
  if (actions['error']) actions['error'].apply(this, arguments);
  return this;
};

function _getRenderer(){
  return Keen.Dataviz.libraries[this.library()][this.chartType()];
}


// ------------------------------
// Utility methods
// ------------------------------

Keen.Dataviz.register = function(name, methods, config){
  var self = this;
  var loadHandler = function(st) {
    st.loaded++;
    if(st.loaded === st.loading) {
      Keen.loaded = true;
      Keen.trigger('ready');
    }
  };
  Keen.Dataviz.libraries[name] = Keen.Dataviz.libraries[name] || {};

  // Add method to library hash
  _each(methods, function(method, key){
    Keen.Dataviz.libraries[name][key] = method;
  });

  // Set default capabilities hash
  if (config && config.capabilities) {
    Keen.Dataviz.libraries[name]._defaults = Keen.Dataviz.libraries[name]._defaults || {};
    _each(config.capabilities, function(typeSet, key){
      // store somewhere in library
      Keen.Dataviz.libraries[name]._defaults[key] = typeSet;
    });
  }

  // For all dependencies
  if (config && config.dependencies) {
    _each(config.dependencies, function (dependency, index, collection) {
      var status = Keen.Dataviz.dependencies;
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

Keen.Dataviz.find = function(target){
  if (!arguments.length) return Keen.Dataviz.visuals;
  var el = target.nodeName ? target : document.querySelector(target),
      match;

  _each(Keen.Dataviz.visuals, function(visual){
    if (el == visual.el()){
      match = visual;
      return false;
    }
  });
  if (match) return match;
  //Keen.log("Visualization not found");
};


function _prettyNumber(_input) {
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

function _loadScript(url, cb) {
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

function _loadStyle(url, cb) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.type = 'text/css';
  link.href = url;
  cb();
  document.head.appendChild(link);
}

function _runColorMapping(){
  var self = this,
      schema = this.dataset.schema,
      data = this.dataset.table,
      colorSet = this.colors(),
      colorMap = this.colorMapping();

  // Map to selected index
  if (schema.select && data[0].length == 2) {
    _each(data, function(row, i){
      if (i > 0 && colorMap[row[0]]) {
        colorSet.splice(i-1, 0, map[row[0]]);
      }
    });
  }
  // Map to unpacked labels
  if (schema.unpack) {
    _each(data[0], function(cell, i){
      if (i > 0 && map[cell]) {
        colorSet.splice(i-1, 0, map[cell]);
      }
    });
  }
  self.colors(colorSet);
}

function _runLabelMapping(){
  var labelMap = this.labelMapping() || null,
      schema = this.dataset.schema || {};

  if (labelMap) {
    if (schema.unpack) {
      if (schema.unpack['index']) {
        schema.unpack['index'].replace = schema.unpack['index'].replace || labelMap;
      }
      if (schema.unpack['label']) {
        schema.unpack['label'].replace = schema.unpack['label'].replace || labelMap;
      }
    }
    if (schema.select) {
      _each(schema.select, function(v, i){
        schema.select[i].replace = labelMap;
      });
    }
  }
}

function _runLabelReplacement(){
  var labelSet = this.labels() || null,
      schema = this.dataset.schema || {};

  if (labelSet) {
    if (schema.unpack && dataset.table[0].length == 2) {
      _each(dataset.table, function(row,i){
        if (i > 0 && labelSet[i-1]) {
          dataset.table[i][0] = labelSet[i-1];
        }
      });
    }
    if (schema.unpack && dataset.table[0].length > 2) {
      _each(dataset.table[0], function(cell,i){
        if (i > 0 && labelSet[i-1]) {
          dataset.table[0][i] = labelSetg[i-1];
        }
      });
    }
  }
}

function _buildDefaultTitle(query){
  var analysis = query.analysis.replace("_", " "),
      collection = query.get('event_collection'),
      output;
  output = analysis.replace( /\b./g, function(a){
    return a.toUpperCase();
  });
  if (collection) { output += ' - ' + collection; }
  return output;
}


function _parseRequest(req){
  var dataset;
  /*
    TODO: Handle multiple queries
  */
  // First-pass at dataType detection
  this.dataType(_getQueryDataType.call(this, req.queries[0]));
  if (this.dataType() !== "extraction") {
    // Run data thru raw parser
    dataset = _parseRawData.call(this, req.data[0]);
  } else {
    // Requires manual parser
    dataset = _parseExtraction.call(this, req);
  }
  return dataset;
}

function _parseExtraction(req){
  var names = req.queries[0].get('property_names'),
      schema = { collection: "result", select: true };

  if (names) {
    schema.select = [];
    _each(names, function(p){
      schema.select.push({
        path: p
      })
    });
  }
  return new Keen.Dataset(req.data[0], schema);
}

// function _parse2xGroupBy(req){}

// function _parseQueryData(query){}

function _getQueryDataType(query){
  var isInterval = typeof query.params.interval === "string",
      isGroupBy = typeof query.params.group_by === "string",
      is2xGroupBy = query.params.group_by instanceof Array,
      dataType;

  // metric
  if (!isGroupBy && !isInterval) {
    dataType = 'singular';
  }

  // group_by, no interval
  if (isGroupBy && !isInterval) {
    dataType = 'categorical';
  }

  // interval, no group_by
  if (isInterval && !isGroupBy) {
    dataType = 'chronological';
  }

  // interval, group_by
  if (isInterval && isGroupBy) {
    dataType = 'cat-chronological';
  }

  // 2x group_by
  // TODO: research possible dataType options
  if (!isInterval && is2xGroupBy) {
    dataType = 'categorical';
  }

  // interval, 2x group_by
  // TODO: research possible dataType options
  if (isInterval && is2xGroupBy) {
    dataType = 'cat-chronological';
  }

  if (query.analysis === "funnel") {
    dataType = 'cat-ordinal';
  }

  if (query.analysis === "extraction") {
    dataType = 'extraction';
  }
  if (query.analysis === "select_unique") {
    dataType = 'nominal';
  }

  return dataType;
}

function _parseRawData(response){
  var self = this,
      schema = {},
      labelSet,
      labelMap,
      dataType,
      dataset;

  labelSet = self.labels() || null;
  labelMap = self.labelMapping() || null;

  // Metric
  // -------------------------------
  if (typeof response.result == "number"){
    //return new Keen.Dataset(response, {
    dataType = "singular";
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
      dataType = "chronological";
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
      dataType = "categorical";
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
      dataType = "cat-chronological";
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
    dataType = "cat-ordinal";
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

  // Key-value label mapping
  _runLabelMapping.call(this);

  dataset = new Keen.Dataset(response, schema);

  // Post-process label replacement
  _runLabelReplacement.call(this);

  this.dataType(dataType);
  return dataset;
}
