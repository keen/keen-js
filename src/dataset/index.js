/*!
  * ----------------
  * Keen.Dataset
  * ----------------
  */

/*
  TODO:

  [x] import Dataset project source
  [x] import Dataset project tests
  [x] update Dataset API with new sketch
  [x] fix Dataset sort method
  [x] fix Dataset handling of metrics
  [x] write tests for new sort methods

  [x] updateRow/updateColumn func iterates
  [x] move getRow* and getColumn* into /helpers

  [ ] #min, #max, #median, #average

  [ ] #getRowAverage
  [ ] #getRowMedian
  [ ] #getRowMinimum
  [ ] #getRowMaximum

  [ ] #getColumnAverage
  [ ] #getColumnMedian
  [ ] #getColumnMinimum
  [ ] #getColumnMaximum

*/

// extend(Keen.Dataset, {
//   each: each,
//   extend: extend,
//   is: is,
//   flatten: flatten
// });

Keen.Dataset = function() {
  this.data = {
    input: {},
    output: [[]]
  };
  this.meta = {
    schema: {},
    method: undefined
  };
  // temp fwd
  if (arguments.length > 0) {
    this.parse.apply(this, arguments);
  }
};

Keen.Dataset.defaults = {
  delimeter: " -> "
};

Keen.Dataset.prototype.input = function(obj){
  if (!arguments.length) return this.data.input;
  this.data.input = (obj ? JSON.parse(JSON.stringify(obj)) : null);
  return this;
};

Keen.Dataset.prototype.output = function(arr){
  if (!arguments.length) return this.data.output;
  this.data.output = (arr instanceof Array ? arr : null);
  return this;
}

Keen.Dataset.prototype.method = function(str){
  if (!arguments.length) return this.meta.method;
  this.meta.method = (str ? String(str) : null);
  return this;
};

Keen.Dataset.prototype.schema = function(obj){
  if (!arguments.length) return this.meta.schema;
  this.meta.schema = (obj ? obj : null);
  return this;
};

Keen.Dataset.prototype.parse = function(raw, schema){
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


// ------------------------------
// Manage row/column methods
// ------------------------------

/*
var d = new Keen.Dataset();
d.output([["index", "A", "B", "C"]]);
d.appendRow([0, 10, 10, 10]);
d.appendRow([1, 5, 5, 5]);
d.appendRow([2, 1, 1, 1]);
d.appendRow([3, 0, 0, 0]);


var d = new Keen.Dataset();
d.modifyRow(0, ['Time', 'A', 'B', 'C']);
d.appendRow([new Date().toISOString(), 234, 432, 12]);
d.appendRow([new Date().toISOString(), 23, null, 3]);
d.appendRow([new Date().toISOString(), 43, 2, 0]);
d.appendRow([new Date().toISOString(), 33, 12, 445]);

d.filterColumns(function(col, index){
  var total = this.sumColumnValue(col);
  console.log(total);
  return true;
})
.output();

d.filterRows(function(row, index){
  console.log(this, row, index);
  var total = this.sumRowValue(row);
  console.log(total);
  return true;
})
.output();


d.filterColumns(function(col, index){
  console.log(this, col, index);
});

d.insertColumn(1, ["a", 15]);
d.modifyColumn(1, ["AA", 22222]);

d.appendColumn(["Total", 0]);
d.modifyColumn(3, function(value, index, row){
  if (index < 1) return "Summary";
  var total = 0;
  for (var i=0; i < row.length; i++){
    if (i !== 0 && i !== 3) total += row[i];
  }
  return total;
});

d.selectColumn(3);

*/



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
    records_target = options.records.split(Keen.Dataset.defaults.delimeter);
    root = parse.apply(self, [self.input()].concat(records_target))[0];
  }

  each(options.select, function(prop){
    target_set.push(prop.path.split(Keen.Dataset.defaults.delimeter));
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

  var value_set = (options.unpack.value) ? options.unpack.value.path.split(Keen.Dataset.defaults.delimeter) : false,
      label_set = (options.unpack.label) ? options.unpack.label.path.split(Keen.Dataset.defaults.delimeter) : false,
      index_set = (options.unpack.index) ? options.unpack.index.path.split(Keen.Dataset.defaults.delimeter) : false;
  //console.log(index_set, label_set, value_set);

  var value_desc = (value_set[value_set.length-1] !== "") ? value_set[value_set.length-1] : "Value",
      label_desc = (label_set[label_set.length-1] !== "") ? label_set[label_set.length-1] : "Label",
      index_desc = (index_set[index_set.length-1] !== "") ? index_set[index_set.length-1] : "Index";

  // removed //
  // var sort_index = (options.sort && options.sort.index) ? options.sort.index : false,
  //     sort_value = (options.sort && options.sort.value) ? options.sort.value : false;

  // Prepare root for parsing
  var root = (function(){
    var root;
    if (options.records == "") {
      root = [self.input()];
    } else {
      root = parse.apply(self, [self.input()].concat(options.records.split(Keen.Dataset.defaults.delimeter)));
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



// ♫♩♬ Holy Diver! ♬♩♫
// --------------------------------------

function parse() {
  var result = [];
  var loop = function() {
    var root = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    var target = args.pop();

    if (args.length === 0) {
      if (root instanceof Array) {
        args = root;
      } else if (typeof root === 'object') {
        args.push(root);
      }
    }

    each(args, function(el){

      // Grab the numbers and nulls
      if (target == "") {
        if (typeof el == "number" || el == null) {
          return result.push(el);
        }
      }

      if (el[target] || el[target] === 0 || el[target] !== void 0) {
        // Easy grab!
        if (el[target] === null) {
          return result.push(null);
        } else {
          return result.push(el[target]);
        }

      } else if (root[el]){
        if (root[el] instanceof Array) {
          // dive through each array item

          each(root[el], function(n, i) {
            var splinter = [root[el]].concat(root[el][i]).concat(args.slice(1)).concat(target);
            return loop.apply(this, splinter);
          });

        } else {
          if (root[el][target]) {
            // grab it!
            return result.push(root[el][target]);

          } else {
            // dive down a level!
            return loop.apply(this, [root[el]].concat(args.splice(1)).concat(target));

          }
        }

      } else if (typeof root === 'object' && root instanceof Array === false && !root[target]) {
        throw new Error("Target property does not exist", target);

      } else {
        // dive down a level!
        return loop.apply(this, [el].concat(args.splice(1)).concat(target));
      }

      return;

    });
    if (result.length > 0) {
      return result;
    }
  };
  return loop.apply(this, arguments);
}

// Utilities
// --------------------------------------

// Pure awesomeness by Will Rayner (penguinboy)
// https://gist.github.com/penguinboy/762197
function flatten(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      var flatObject = flatten(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
  /*each(ob, function(value, i){
    if (typeof value == 'object' && value !== null) {
      var flatObject = flatten(ob[i]);
      each(flatObject, function(v2, i2){
        toReturn[i + '.' + i2] = v2;
      });
    } else {
      toReturn[i] = value;
    }
  });*/
}

// via: https://github.com/spocke/punymce
function is(o, t){
  o = typeof(o);
  if (!t){
    return o != 'undefined';
  }
  return o == t;
}

function each(o, cb, s){
  var n;
  if (!o){
    return 0;
  }
  s = !s ? o : s;
  if (is(o.length)){
    // Indexed arrays, needed for Safari
    for (n=0; n<o.length; n++) {
      if (cb.call(s, o[n], n, o) === false){
        return 0;
      }
    }
  } else {
    // Hashtables
    for (n in o){
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    }
  }
  return 1;
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

// Silence moment.js if present
// if (window.moment) {
//   moment.suppressDeprecationWarnings = true;
// }
