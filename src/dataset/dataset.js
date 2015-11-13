var clone = require("../core/utils/clone"),
    each = require("../core/utils/each"),
    flatten = require("./utils/flatten"),
    parse = require("./utils/parse");

var Emitter = require('../core/utils/emitter-shim');

function Dataset(){
  this.data = {
    input: {},
    output: [['index']]
  };
  this.meta = {
    schema: {},
    method: undefined
  };
  // temp fwd
  if (arguments.length > 0) {
    this.parse.apply(this, arguments);
  }
}

Dataset.defaults = {
  delimeter: " -> "
};

Emitter(Dataset);
Emitter(Dataset.prototype);

Dataset.parser = require('./utils/parsers')(Dataset);

Dataset.prototype.input = function(obj){
  if (!arguments.length) return this["data"]["input"];
  this["data"]["input"] = (obj ? clone(obj) : null);
  return this;
};

Dataset.prototype.output = function(arr){
  if (!arguments.length) return this["data"].output;
  this["data"].output = (arr instanceof Array ? arr : null);
  return this;
}

Dataset.prototype.method = function(str){
  if (!arguments.length) return this.meta["method"];
  this.meta["method"] = (str ? String(str) : null);
  return this;
};

Dataset.prototype.schema = function(obj){
  if (!arguments.length) return this.meta.schema;
  this.meta.schema = (obj ? obj : null);
  return this;
};

Dataset.prototype.parse = function(raw, schema){
  var options;
  if (raw) this.input(raw);
  if (schema) this.schema(schema);

  // Reset output value
  this.output([[]]);

  if (this.meta.schema.select) {
    this.method("select");
    options = extend({
      records: "",
      select: true
    }, this.schema());
    _select.call(this, _optHash(options));
  }
  else if (this.meta.schema.unpack) {
    this.method("unpack");
    options = extend({
      records: "",
      unpack: {
        index: false,
        value: false,
        label: false
      }
    }, this.schema());
    _unpack.call(this, _optHash(options));
  }
  return this;
};


// Select
// --------------------------------------

function _select(cfg){

  var self = this,
      options = cfg || {},
      target_set = [],
      unique_keys = [];

  var root, records_target;
  if (options.records === "" || !options.records) {
    root = [self.input()];
  } else {
    records_target = options.records.split(Dataset.defaults.delimeter);
    root = parse.apply(self, [self.input()].concat(records_target))[0];
  }

  each(options.select, function(prop){
    target_set.push(prop.path.split(Dataset.defaults.delimeter));
  });

  // Retrieve keys found in asymmetrical collections
  if (target_set.length == 0) {
    each(root, function(record, interval){
      var flat = flatten(record);
      //console.log('flat', flat);
      for (var key in flat) {
        if (flat.hasOwnProperty(key) && unique_keys.indexOf(key) == -1) {
          unique_keys.push(key);
          target_set.push([key]);
        }
      }
    });
  }

  var test = [[]];

  // Append header row
  each(target_set, function(props, i){
    if (target_set.length == 1) {
      // Static header for single value
      test[0].push('label', 'value');
    } else {
      // Dynamic header for n-values
      test[0].push(props.join("."));
    }
  });

  // Append all rows
  each(root, function(record, i){
    var flat = flatten(record);
    if (target_set.length == 1) {
      // Static row for single value
      test.push([target_set.join("."), flat[target_set.join(".")]]);
    } else {
      // Dynamic row for n-values
      test.push([]);
      each(target_set, function(t, j){
        var target = t.join(".");
        test[i+1].push(flat[target]);
      });
    }
  });

  self.output(test);
  self.format(options.select);
  return self;
}


// Unpack
// --------------------------------------

function _unpack(options){
  //console.log('Unpacking', options);
  var self = this, discovered_labels = [];

  var value_set = (options.unpack.value) ? options.unpack.value.path.split(Dataset.defaults.delimeter) : false,
      label_set = (options.unpack.label) ? options.unpack.label.path.split(Dataset.defaults.delimeter) : false,
      index_set = (options.unpack.index) ? options.unpack.index.path.split(Dataset.defaults.delimeter) : false;
  //console.log(index_set, label_set, value_set);

  var value_desc = (value_set[value_set.length-1] !== "") ? value_set[value_set.length-1] : "Value",
      label_desc = (label_set[label_set.length-1] !== "") ? label_set[label_set.length-1] : "Label",
      index_desc = (index_set[index_set.length-1] !== "") ? index_set[index_set.length-1] : "Index";

  // Prepare root for parsing
  var root = (function(){
    var root;
    if (options.records == "") {
      root = [self.input()];
    } else {
      root = parse.apply(self, [self.input()].concat(options.records.split(Dataset.defaults.delimeter)));
    }
    return root[0];
  })();

  if (root instanceof Array == false) {
    root = [root];
  }

  // Find labels
  each(root, function(record, interval){
    var labels = (label_set) ? parse.apply(self, [record].concat(label_set)) : [];
    if (labels) {
      discovered_labels = labels;
    }
  });

  // Parse each record
  each(root, function(record, interval){
    //console.log('record', record);

    var plucked_value = (value_set) ? parse.apply(self, [record].concat(value_set)) : false,
        //plucked_label = (label_set) ? parse.apply(self, [record].concat(label_set)) : false,
        plucked_index = (index_set) ? parse.apply(self, [record].concat(index_set)) : false;
    //console.log(plucked_index, plucked_label, plucked_value);

    // Inject row for each index
    if (plucked_index) {
      each(plucked_index, function(){
        self.data.output.push([]);
      });
    } else {
      self.data.output.push([]);
    }

    // Build index column
    if (plucked_index) {

      // Build index/label on first interval
      if (interval == 0) {

        // Push last index property to 0,0
        self.data.output[0].push(index_desc);

        // Build subsequent series headers (1:N)
        if (discovered_labels.length > 0) {
          each(discovered_labels, function(value, i){
            self.data.output[0].push(value);
          });

        } else {
          self.data.output[0].push(value_desc);
        }
      }

      // Correct for odd root cases
      if (root.length < self.data.output.length-1) {
        if (interval == 0) {
          each(self.data.output, function(row, i){
            if (i > 0) {
              self.data.output[i].push(plucked_index[i-1]);
            }
          });
        }
      } else {
        self.data.output[interval+1].push(plucked_index[0]);
      }
    }

    // Build label column
    if (!plucked_index && discovered_labels.length > 0) {
      if (interval == 0) {
        self.data.output[0].push(label_desc);
        self.data.output[0].push(value_desc);
      }
      self.data.output[interval+1].push(discovered_labels[0]);
    }

    if (!plucked_index && discovered_labels.length == 0) {
      // [REVISIT]
      self.data.output[0].push('');
    }

    // Append values
    if (plucked_value) {
      // Correct for odd root cases
      if (root.length < self.data.output.length-1) {
        if (interval == 0) {
          each(self.data.output, function(row, i){
            if (i > 0) {
              self.data.output[i].push(plucked_value[i-1]);
            }
          });
        }
      } else {
        each(plucked_value, function(value){
          self.data.output[interval+1].push(value);
        });
      }
    } else {
      // append null across this row
      each(self.data.output[0], function(cell, i){
        var offset = (plucked_index) ? 0 : -1;
        if (i > offset) {
          self.data.output[interval+1].push(null);
        }
      })
    }

  });

  self.format(options.unpack);
  //self.sort(options.sort);
  return this;
}



// String configs to hash paths
// --------------------------------------

function _optHash(options){
  each(options.unpack, function(value, key, object){
    if (value && is(value, 'string')) {
      options.unpack[key] = { path: options.unpack[key] };
    }
  });
  return options;
}


// via: https://github.com/spocke/punymce
function is(o, t){
  o = typeof(o);
  if (!t){
    return o != 'undefined';
  }
  return o == t;
}

// Adapted to exclude null values
function extend(o, e){
  each(e, function(v, n){
    if (is(o[n], 'object') && is(v, 'object')){
      o[n] = extend(o[n], v);
    } else if (v !== null) {
      o[n] = v;
    }
  });
  return o;
}

module.exports = Dataset;
