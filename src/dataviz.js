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

  [x] set up sortGroups and sortInterval
  [x] set up orderBy
  [x] write tests for sort/order methods

  [x] _runLabelMapping re-runs parse(), overwrite modifications
  [ ] _runOrderBy re-runs parse(), overwrite modifications

  [x] update color palette
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
    /* teal      red        yellow     purple     orange     mint       blue       green      lavender */
    // norm
      "#00bbde", "#fe6672", "#eeb058", "#8a8ad6", "#ff855c", "#00cfbb", "#5a9eed", "#73d483", "#c879bb",
    // dark
      "#00a1bf", "#df545f", "#d29847", "#7373bc", "#e0704b", "#00b2a1", "#4988d0", "5ebb6d", "#b163a4",
    // light
      "#24c9e8", "#ff7e88", "#f4bd70", "#9a9adf", "#ff9876", "#24dcca", "71aef3", "#86de95", "#d68ac9"
    ],
    orderBy: "timeframe.start"
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

Keen.Dataviz.prototype.orderBy = function(str){
  if (!arguments.length) return this.view.attributes.orderBy;
  this.view.attributes.orderBy = (str ? String(str) : Keen.Dataviz.defaults.orderBy);
  _runOrderBy.call(this);
  return this;
};

Keen.Dataviz.prototype.sortGroups = function(str){
  if (!arguments.length) return this.view.attributes.sortGroups;
  this.view.attributes.sortGroups = (str ? String(str) : null);
  _runSortGroups.call(this);
  return this;
};
Keen.Dataviz.prototype.sortIntervals = function(str){
  if (!arguments.length) return this.view.attributes.sortIntervals;
  this.view.attributes.sortIntervals = (str ? String(str) : null);
  _runSortIntervals.call(this);
  return this;
};


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
  this.view.attributes.labelMapping = (obj ? obj : null);
  _runLabelMapping.call(this);
  return this;
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
  _applyPostProcessing.call(this);
  if (el) this.el(el);
  if (!this.view._initialized) this.initialize();
  if (this.el() && actions.render) actions.render.apply(this, arguments);
  this.view._rendered = true;
  return this;
};

Keen.Dataviz.prototype.update = function(){
  var actions = _getAdapterActions.call(this);
  _applyPostProcessing.call(this);
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
      library = this.library(),
      chartType = this.chartType() || this.defaultChartType();

  // Backups
  if (!library && map[dataType]) {
    library = map[dataType].library;
  }
  if (!chartType && map[dataType]) {
    chartType = map[dataType].chartType;
  }

  // Return if found
  return (library && chartType) ? Keen.Dataviz.libraries[library][chartType] : {};
}

function _applyPostProcessing(){
  this
    //.call(_runOrderBy)
    .call(_runLabelMapping)
    .call(_runLabelReplacement)
    .call(_runColorMapping)
    .call(_runSortGroups)
    .call(_runSortIntervals);
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
  var self = this,
      labelMap = this.labelMapping(),
      schema = this.dataset.schema() || {},
      dt = this.dataType() || "";

  if (labelMap) {
    if (dt.indexOf("chronological") > -1 || (schema.unpack && self.dataset.output()[0].length > 2)) {
      // loop over header cells
      each(self.dataset.output()[0], function(c, i){
        if (i > 0) {
          //console.log('Mod header cell', labelMap[c] || c, i);
          self.dataset.data.output[0][i] = labelMap[c] || c;
        }
      });
    }
    else if (schema.select && self.dataset.output()[0].length === 2) {
      // modify column 0
      self.dataset.modifyColumn(0, function(c, i){
        //console.log('Mod column', labelMap[c] || c);
        return labelMap[c] || c;
      });
    }
  }
}

function _runLabelReplacement(){
  var labelSet = this.labels() || null,
      schema = this.dataset.schema() || {};
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
          dataset.output()[0][i] = labelSet[i-1];
        }
      });
    }
  }
}

function _runOrderBy(){
  var self = this,
      root = this.dataset.meta.schema || this.dataset.meta.unpack,
      newOrder = this.orderBy().split(".").join(Keen.Dataset.defaults.delimeter);
  // Replace in schema and re-run dataset.parse()
  each(root, function(def, i){
    // update 'select' configs
    if (i === "select" && def instanceof Array) {
      each(def, function(c, j){
        if (c.path.indexOf("timeframe -> ") > -1) {
          self.dataset.meta.schema[i][j].path = newOrder;
        }
      });
    }
    // update 'unpack' configs
    else if (i === "unpack" && typeof def === "object") {
      self.dataset.meta.schema[i]['index'].path = newOrder;
    }
  });
  this.dataset.parse();
}

function _runSortGroups(){
  var dt = this.dataType();
  if (!this.sortGroups()) return;
  if ((dt && dt.indexOf("chronological") > -1) || this.data()[0].length > 2) {
    // Sort columns by Sum (n values)
    this.dataset.sortColumns(this.sortGroups(), this.dataset.getColumnSum);
  }
  else if (dt && (dt.indexOf("cat-") > -1 || dt.indexOf("categorical") > -1)) {
    // Sort rows by Sum (1 value)
    this.dataset.sortRows(this.sortGroups(), this.dataset.getRowSum);
  }
  return;
}

function _runSortIntervals(){
  if (!this.sortIntervals()) return;
  // Sort rows by index
  this.dataset.sortRows(this.sortIntervals());
  return;
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
      orderBy,
      delimeter,
      indexTarget,
      labelSet,
      labelMap,
      dataType,
      dataset;

  orderBy = self.orderBy() ? self.orderBy() : Keen.Dataviz.defaults.orderBy;
  delimeter = Keen.Dataset.defaults.delimeter;
  indexTarget = orderBy.split(".").join(delimeter);

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
            path: indexTarget,
            type: "date"
          },
          {
            path: "value",
            type: "number",
            format: "10"
            // ,
            // replace: {
            //   null: 0
            // }
          }
        ]
      }
    }

    // Static GroupBy
    // -------------------------------
    if (typeof response.result[0].result == "number"){
      dataType = "categorical";
      schema = {
        records: "result",
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
      dataType = "cat-chronological";
      schema = {
        records: "result",
        unpack: {
          index: {
            path: indexTarget,
            type: "date"
          },
          value: {
            path: "value -> result",
            type: "number"
            // ,
            // replace: {
            //   null: 0
            // }
          }
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
  // if (labelMap) {
  //   if (schema.unpack) {
  //     if (schema.unpack['index']) {
  //       schema.unpack['index'].replace = labelMap;
  //     }
  //     if (schema.unpack['label']) {
  //       schema.unpack['label'].replace = labelMap;
  //     }
  //   }
  //   if (schema.select) {
  //     _each(schema.select, function(v, i){
  //       schema.select[i].replace = labelMap;
  //     });
  //   }
  // }

  dataset = new Keen.Dataset(response, schema);

  // Post-process label replacement
  _runLabelReplacement.call(this);

  this.dataType(dataType);
  return dataset;
}
