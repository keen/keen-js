/*!
  * ----------------
  * Keen.Dataviz
  * ----------------
  */

/*
  TODO:

  [x] set up dataType capability-mapping
  [x] move google defaults into adapter
  [x] set default lib+chart combos for types

  [ ] update c3.js and chart.js adapters
  [ ] build example pages for adapters

*/

_extend(Keen.utils, {
  prettyNumber: _prettyNumber,
  loadScript: _loadScript,
  loadStyle: _loadStyle
});

// Set flag for script loading
Keen.loaded = false;

// ------------------------------
// Dataviz constructor
// ------------------------------

Keen.Dataviz = function(){

  this.dataset = new Keen.Dataset();

  this.view = {
    _prepared: false,
    _initialized: false,
    _rendered: false,
    _artifacts: { /* state bin */ },

    adapter: {
      library: undefined,
      chartType: undefined,
      defaultChartType: undefined,
      dataType: undefined
    },
    attributes: JSON.parse(JSON.stringify(Keen.Dataviz.defaults)),
    defaults: JSON.parse(JSON.stringify(Keen.Dataviz.defaults)),
    el: undefined,
    loader: { library: "keen-io", chartType: "spinner" }
  };

  Keen.Dataviz.visuals.push(this);
};

_extend(Keen.Dataviz.prototype, Events);
_extend(Keen.Dataviz, {
  dataTypeMap: {
    "singular":          { library: "keen-io", chartType: "metric"      },
    "categorical":       { library: "google",  chartType: "piechart"    },
    "cat-interval":      { library: "google",  chartType: "columnchart" },
    "cat-ordinal":       { library: "google",  chartType: "barchart"    },
    "chronological":     { library: "google",  chartType: "areachart"   },
    "cat-chronological": { library: "google",  chartType: "linechart"   }
  },
  defaults: {
    colors: [
    "#00afd7", "#f35757", "#f0ad4e", "#8383c6", "#f9845b", "#49c5b1", "#2a99d1", "#aacc85", "#ba7fab"
    /* Todo: add light/dark derivatives */
    ]
  },
  dependencies: {
    loading: 0,
    loaded: 0,
    urls: {}
  },
  libraries: {},
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
  if (!arguments.length) return this.dataset.output();
  if (data instanceof Keen.Dataset) {
    this.dataset = data;
  } else if (data instanceof Keen.Request) {
    this.parseRequest(data);
  } else {
    this.parseRawData(data);
  }
  this
    .call(_runColorMapping)
    .call(_runLabelMapping)
    .call(_runLabelReplacement);
  return this;
};

Keen.Dataviz.prototype.parseRawData = function(raw){
  this.dataset = _parseRawData.call(this, raw);
  return this;
};

Keen.Dataviz.prototype.parseRequest = function(req){
  this.dataset = _parseRequest.call(this, req);
  // Update the default title every time
  this.view.defaults.title = _getDefaultTitle.call(this, req);
  // Update the active title if not set
  if (!this.title()) this.title(this.view.defaults.title);
  return this;
};

Keen.Dataviz.prototype.sort = function(str){
  if (!arguments.length) return this.view.attributes.sort;
  this.view.attributes.sort = (str ? String(str) : null);
  _sortDataset.call(this, this.view.attributes.sort);
  return this;
};
// Keen.Dataviz.prototype.sortIndex("desc");
// Keen.Dataviz.prototype.sortValues("asc");

function _sortDataset(str){
  console.log(this.dataset.schema);
  // if dataset[0].length > 2 ==> cat-chronological ?
  // this.dataset.sortColumnsBySum("asc");
  // this.dataset.sortRowsByColumn("asc", 0);
  return;
}

// Keen.Dataviz.prototype.intervalIndex = function(str){
//   if (!arguments.length) return this.view.attributes.intervalIndex;
//   this.view.attributes.intervalIndex = (str ? String(str) : null);
//   return this;
// };


// ------------------------------
// View Attributes
// ------------------------------

Keen.Dataviz.prototype.attributes = function(obj){
  if (!arguments.length) return this.view.attributes;
  var self = this;
  _each(obj, function(prop, key){
    if (key === "chartOptions") {
      self.chartOptions(prop);
    } else {
      self.view.attributes[key] = (prop ? prop : null);
    }
  });
  return this;
};

Keen.Dataviz.prototype.colors = function(arr){
  if (!arguments.length) return this.view.attributes.colors;
  this.view.attributes.colors = (arr instanceof Array ? arr : null);
  return this;
};

Keen.Dataviz.prototype.colorMapping = function(obj){
  if (!arguments.length) return this.view.attributes.colorMapping;
  var self = this;
  self.view.attributes.colorMapping = {};
  _each(obj, function(prop, key){
    self.view.attributes.colorMapping[key] = (prop? prop.trim() : null);
  });
  _runColorMapping.call(self);
  return self;
};

Keen.Dataviz.prototype.labels = function(arr){
  if (!arguments.length) return this.view.attributes.labels;
  this.view.attributes.labels = (arr instanceof Array ? arr : null);
  _runLabelReplacement.call(this);
  return this;
};

Keen.Dataviz.prototype.labelMapping = function(obj){
  if (!arguments.length) return this.view.attributes.labelMapping;
  var self = this;
  self.view.attributes.labelMapping = {};
  _each(obj, function(prop, key){
    self.view.attributes.labelMapping[key] = (prop? prop.trim() : null);
  });
  _runLabelMapping.call(self);
  return self;
};

Keen.Dataviz.prototype.height = function(int){
  if (!arguments.length) return this.view.attributes.height;
  this.view.attributes['height'] = (!isNaN(parseInt(int)) ? parseInt(int) : null);
  return this;
};

Keen.Dataviz.prototype.title = function(str){
  if (!arguments.length) return this.view.attributes.title;
  this.view.attributes['title'] = (str ? String(str) : null);
  return this;
};

Keen.Dataviz.prototype.width = function(int){
  if (!arguments.length) return this.view.attributes.width;
  this.view.attributes['width'] = (!isNaN(parseInt(int)) ? parseInt(int) : null);
  return this;
};




// ------------------------------
// View Adapter
// ------------------------------

Keen.Dataviz.prototype.adapter = function(obj){
  if (!arguments.length) return this.view.adapter;
  var self = this;
  _each(obj, function(prop, key){
    self.view.adapter[key] = (prop ? prop : null);
  });
  return this;
};

Keen.Dataviz.prototype.library = function(str){
  if (!arguments.length) return this.view.adapter.library;
  this.view.adapter.library = (str ? String(str) : null);
  return this;
};

Keen.Dataviz.prototype.chartOptions = function(obj){
  if (!arguments.length) return this.view.adapter.chartOptions;
  var self = this;
  self.view.adapter.chartOptions = self.view.adapter.chartOptions || {};
  _each(obj, function(prop, key){
    self.view.adapter.chartOptions[key] = (prop ? prop : null);
  });
  return this;
};

Keen.Dataviz.prototype.chartType = function(str){
  if (!arguments.length) return this.view.adapter.chartType;
  this.view.adapter.chartType = (str ? String(str) : null);
  return this;
};

Keen.Dataviz.prototype.defaultChartType = function(str){
  if (!arguments.length) return this.view.adapter.defaultChartType;
  this.view.adapter.defaultChartType = (str ? String(str) : null);
  return this;
};

Keen.Dataviz.prototype.dataType = function(str){
  if (!arguments.length) return this.view.adapter.dataType;
  this.view.adapter.dataType = (str ? String(str) : null);
  return this;
};

Keen.Dataviz.prototype.el = function(el){
  if (!arguments.length) return this.view.el;
  this.view.el = el;
  return this;
};

Keen.Dataviz.prototype.prepare = function(el){
  if (el) this.el(el);
  if (this.view._rendered) {
    // Keen.Dataviz.libraries['keen-io']['spinner'].destroy.apply(this, arguments);
    // this.view._initialized = false;
    // this.view._rendered = false;
    this.destroy();
  }
  this.el().innerHTML = "";
  var loader = Keen.Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
  if (loader.initialize) loader.initialize.apply(this, arguments);
  if (loader.render) loader.render.apply(this, arguments);
  this.view._prepared = true;
  return this;
};

Keen.Dataviz.prototype.initialize = function(){
  var actions = _getAdapterActions.call(this);
  var loader = Keen.Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
  if (this.view._prepared) {
    if (loader.destroy) loader.destroy.apply(this, arguments);
  } else {
    if (this.el()) this.el().innerHTML = "";
  }
  if (actions.initialize) actions.initialize.apply(this, arguments);
  this.view._initialized = true;
  return this;
};

Keen.Dataviz.prototype.render = function(el){
  var actions = _getAdapterActions.call(this);
  if (el) this.el(el);
  if (!this.view._initialized) this.initialize();
  if (this.el() && actions.render) actions.render.apply(this, arguments);
  this.view._rendered = true;
  return this;
};

Keen.Dataviz.prototype.update = function(){
  var actions = _getAdapterActions.call(this);
  if (actions.update) {
    actions.update.apply(this, arguments);
  } else if (actions.render) {
    this.render();
  }
  return this;
};

Keen.Dataviz.prototype.destroy = function(){
  var actions = _getAdapterActions.call(this);
  if (actions.destroy) actions.destroy.apply(this, arguments);
  // clear rendered artifats, state bin
  if (this.el()) this.el().innerHTML = "";
  this.view._prepared = false;
  this.view._initialized = false;
  this.view._rendered = false;
  this.view._artifacts = {};
  return this;
};

Keen.Dataviz.prototype.error = function(){
  var actions = _getAdapterActions.call(this);
  if (actions['error']) actions['error'].apply(this, arguments);
  return this;
};

function _getAdapterActions(){
  var map = _extend({}, Keen.Dataviz.dataTypeMap),
      dataType = this.dataType(),
      library,
      chartType;

  library = this.library() || map[dataType].library,
  chartType = this.chartType() || this.defaultChartType() || map[dataType].chartType;
  return Keen.Dataviz.libraries[library][chartType];
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
        var method = dependency.type === 'script' ? _loadScript : _loadStyle;

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
      data = this.dataset.output(),
      colorSet = this.colors(),
      colorMap = this.colorMapping();

  if (colorMap) {
    // Map to selected index
    if (schema.select && data[0].length == 2) {
      _each(data, function(row, i){
        if (i > 0 && colorMap[String(row[0])]) {
          colorSet.splice(i-1, 0, colorMap[row[0]]);
        }
      });
    }
    // Map to unpacked labels
    if (schema.unpack) {
      _each(data[0], function(cell, i){
        if (i > 0 && colorMap[String(cell)]) {
          colorSet.splice(i-1, 0, colorMap[cell]);
        }
      });
    }
    self.colors(colorSet);
  }
}

function _runLabelMapping(){
  var self = this;
  var labelMap = this.labelMapping() || null,
      schema = this.dataset.schema() || {};

  if (labelMap) {
    if (schema.unpack) {
      if (schema.unpack['index']) {
        self.dataset.meta.schema.unpack['index'].replace = labelMap;
      }
      if (schema.unpack['label']) {
        self.dataset.meta.schema.unpack['label'].replace = labelMap;
      }
    }
    if (schema.select) {
      _each(schema.select, function(v, i){
        self.dataset.meta.schema.select[i].replace = labelMap;
      });
    }
  }
  self.dataset.parse(self.dataset.input(), self.dataset.schema());
}

function _runLabelReplacement(){
  var labelSet = this.labels() || null,
      schema = this.dataset.schema || {};
  if (labelSet) {
    if (schema.unpack && dataset.output()[0].length == 2) {
      _each(dataset.output(), function(row,i){
        if (i > 0 && labelSet[i-1]) {
          dataset.output()[i][0] = labelSet[i-1];
        }
      });
    }
    if (schema.unpack && dataset.output()[0].length > 2) {
      _each(dataset.output()[0], function(cell,i){
        if (i > 0 && labelSet[i-1]) {
          dataset.output()[0][i] = labelSetg[i-1];
        }
      });
    }
  }
}

function _getDefaultTitle(req){
  var analysis = req.queries[0].analysis.replace("_", " "),
      collection = req.queries[0].get('event_collection'),
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
    dataset = _parseRawData.call(this, (req.data instanceof Array ? req.data[0] : req.data));
  } else {
    // Requires manual parser
    dataset = _parseExtraction.call(this, req);
  }
  return dataset;
}

function _parseExtraction(req){
  var names = req.queries[0].get('property_names'),
      schema = { records: "result", select: true };

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
      records: "",
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
        records: "result",
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
        records: "result",
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
        records: "result",
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
      dataType = "cat-ordinal";
      schema = {
      records: "",
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
  // _runLabelMapping.call(this);
  if (labelMap) {
    if (schema.unpack) {
      if (schema.unpack['index']) {
        schema.unpack['index'].replace = labelMap;
      }
      if (schema.unpack['label']) {
        schema.unpack['label'].replace = labelMap;
      }
    }
    if (schema.select) {
      _each(schema.select, function(v, i){
        schema.select[i].replace = labelMap;
      });
    }
  }

  dataset = new Keen.Dataset(response, schema);

  // Post-process label replacement
  _runLabelReplacement.call(this);

  this.dataType(dataType);
  return dataset;
}
