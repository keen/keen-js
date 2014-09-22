/*!
  * ----------------
  * Keen.Dataset
  * ----------------
  */

// extend(Keen.Dataset, {
//   each: each,
//   extend: extend,
//   is: is,
//   flatten: flatten
// });


Keen.Dataset = function(raw, schema) {
  //this.schema = {};
  this.configure.apply(this, arguments);
};

// Keen.Dataset.prototype.parse = function(raw, schema){};

Keen.Dataset.prototype.configure = function(raw, schema){
  var self = this, options;

  self.raw = self.raw || raw,
  self.schema = self.schema || schema || {},
  self.table = [[]];

  if (self.schema.collection && is(self.schema.collection, 'string') == false) {
    throw new Error('schema.collection must be a string');
  }

  if (self.schema.unpack && self.schema.select) {
    throw new Error('schema.unpack and schema.select cannot be used together');
  }

  if (self.schema.unpack) {
    this.action = 'unpack';
    options = extend({
      collection: "",
      unpack: {
        index: false,
        value: false,
        label: false
      }
    }, self.schema);
    options = _optHash(options);
    _unpack.call(this, options);
  }

  if (self.schema.select) {
    this.action = 'select';
    options = extend({
      collection: "",
      select: true
    }, self.schema);
    options = _optHash(options);
    _select.call(this, options);
  }

  return this;
};



// Select
// --------------------------------------

function _select(options){
  //console.log('Selecting', options);

  var self = this,
      target_set = [],
      unique_keys = [];

  var root = (function(){
    var root, parsed;
    if (options.collection == "") {
      root = self.raw;
    } else {
      parsed = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
      root = parsed[0];
    }
    if (Object.prototype.toString.call(root) !== '[object Array]') {
      root = [root];
    }
    return root;
  })();

  each(options.select, function(property, i){
    target_set.push(property.path.split(" -> "));
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

  // Parse each record
  each(root, function(record, interval){
    var flat = flatten(record);
    self.table.push([]);
    each(target_set, function(target, i){
      var flat_target = target.join(".");
      if (interval == 0) {
        self.table[0].push(flat_target);
      }
      if (flat[flat_target] !== void 0 || typeof flat[flat_target] == 'boolean') {
        self.table[interval+1].push(flat[flat_target]);
      } else {
        self.table[interval+1].push(null);
      }

    });
  });

  self.format(options.select);
  self.sort(options.sort);
  return self;
}



// Unpack
// --------------------------------------

function _unpack(options){
  // console.log('Unpacking', options);
  var self = this, discovered_labels = [];

  var value_set = (options.unpack.value) ? options.unpack.value.path.split(" -> ") : false,
      label_set = (options.unpack.label) ? options.unpack.label.path.split(" -> ") : false,
      index_set = (options.unpack.index) ? options.unpack.index.path.split(" -> ") : false;
  //console.log(index_set, label_set, value_set);

  var value_desc = (value_set[value_set.length-1] !== "") ? value_set[value_set.length-1] : "Value",
      label_desc = (label_set[label_set.length-1] !== "") ? label_set[label_set.length-1] : "Label",
      index_desc = (index_set[index_set.length-1] !== "") ? index_set[index_set.length-1] : "Index";

  var sort_index = (options.sort && options.sort.index) ? options.sort.index : false,
      sort_value = (options.sort && options.sort.value) ? options.sort.value : false;

  // Prepare root for parsing
  var root = (function(){
    var root;
    if (options.collection == "") {
      root = [self.raw];
    } else {
      root = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
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
        self.table.push([]);
      });
    } else {
      self.table.push([]);
    }

    // Build index column
    if (plucked_index) {

      // Build index/label on first interval
      if (interval == 0) {

        // Push last index property to 0,0
        self.table[0].push(index_desc);

        // Build subsequent series headers (1:N)
        if (discovered_labels.length > 0) {
          each(discovered_labels, function(value, i){
            self.table[0].push(value);
          });

        } else {
          self.table[0].push(value_desc);
        }
      }

      // Correct for odd root cases
      if (root.length < self.table.length-1) {
        if (interval == 0) {
          each(self.table, function(row, i){
            if (i > 0) {
              self.table[i].push(plucked_index[i-1]);
            }
          });
        }
      } else {
        self.table[interval+1].push(plucked_index[0]);
      }
    }

    // Build label column
    if (!plucked_index && discovered_labels.length > 0) {
      if (interval == 0) {
        self.table[0].push(label_desc);
        self.table[0].push(value_desc);
      }
      self.table[interval+1].push(discovered_labels[0]);
    }

    if (!plucked_index && discovered_labels.length == 0) {
      // [REVISIT]
      self.table[0].push('');
    }

    // Append values
    if (plucked_value) {
      // Correct for odd root cases
      if (root.length < self.table.length-1) {
        if (interval == 0) {
          each(self.table, function(row, i){
            if (i > 0) {
              self.table[i].push(plucked_value[i-1]);
            }
          });
        }
      } else {
        each(plucked_value, function(value){
          self.table[interval+1].push(value);
        });
      }
    } else {
      // append null across this row
      each(self.table[0], function(cell, i){
        var offset = (plucked_index) ? 0 : -1;
        if (i > offset) {
          self.table[interval+1].push(null);
        }
      })
    }

  });

  self.format(options.unpack);
  self.sort(options.sort);
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

// Configure moment.js if present
if (window.moment) {
  moment.suppressDeprecationWarnings = true;
}
