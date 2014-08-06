// Source: src/lib/_intro.js

(function(root, factory) {
  root.Dataform = factory();
}
(Keen, function() {
    'use strict';

    // Source: src/dataform.js
    /*!
      * ----------------
      * Dataform.js
      * ----------------
      */

    function Dataform(raw, schema) {
      this.configure(raw, schema);
    }

    Dataform.prototype.configure = function(raw, schema){
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

    extend(Dataform, {
      each: each,
      extend: extend,
      is: is,
      flatten: flatten
    });


    // Configure moment.js if present
    if (window.moment) {
      moment.suppressDeprecationWarnings = true;
    }

  // Source: src/lib/format.js
  Dataform.prototype.format = function(opts){
    var self = this, options;

      var defaults = {
        'number': {
          //format: '0', // 1,000.00
          //prefix: '',
          //suffix: ''
          //modifier: '*1'
        },
        'date': {
          //format: 'MMM DD, YYYY'
        },
        'string': {
          //format: 'capitalize',
          prefix: '',
          suffix: ''
        }
      };

      if (self.action == 'select') {
        options = [];
        each(opts, function(option){
          var copy = {}, output;
          each(defaults, function(hash, key){
            copy[key] = extend({}, hash);
          });
          output = (copy[option.type]) ? extend(copy[option.type], option) : option;
          options.push(output);
        });

        each(self.table, function(row, i){

          // Replace labels
          if (i == 0) {
            each(row, function(cell, j){
              if (options[j] && options[j].label) {
                self.table[i][j] = options[j].label;
              }
            });

          } else {

            each(row, function(cell, j){
              self.table[i][j] = _applyFormat(self.table[i][j], options[j]);
            });
          }

        });

      }


    //////////////////////////////////


    if (self.action == 'unpack') {
      options = {};
      each(opts, function(option, key){
        var copy = {}, output;
        each(defaults, function(hash, key){
          copy[key] = extend({}, hash);
        });
        options[key] = (copy[key]) ? extend(copy[key], option) : option;
      });

      if (options.index) {
        each(self.table, function(row, i){
          if (i == 0) {
            if (options.index.label) {
              self.table[i][0] = options.index.label;
            }
          } else {
            self.table[i][0] = _applyFormat(self.table[i][0], options.index);
          }
        });
      }

      if (options.label) {
        if (options.index) {
          each(self.table, function(row, i){
            each(row, function(cell, j){
              if (i == 0 && j > 0) {
                self.table[i][j] = _applyFormat(self.table[i][j], options.label);
              }
            });
          });
        } else {
          each(self.table, function(row, i){
            if (i > 0) {
              self.table[i][0] = _applyFormat(self.table[i][0], options.label);
            }
          });
          //console.log('label, NO index');
        }
      }

      if (options.value) {
        if (options.index) {
          // start > 0
          each(self.table, function(row, i){
            each(row, function(cell, j){
              if (i > 0 && j > 0) {
                self.table[i][j] = _applyFormat(self.table[i][j], options.value);
              }
            });
          });
        } else {
          // start @ 0
          each(self.table, function(row, i){
            each(row, function(cell, j){
              if (i > 0) {
                self.table[i][j] = _applyFormat(self.table[i][j], options.value);
              }
            });
          });
        }
      }

    }

    //console.log(self.table);
    return self;
  };

  function _applyFormat(value, opts){
    var output = value,
        options = opts || {};

    if (options.method) {
      var copy = output, method = window;
      each(options.method.split("."), function(str, i){
        if (method[str]){
          method = method[str];
        }
      });
      if (typeof method === 'function') {
        try {
          output = method.apply(null, [output, options]);
        }
        catch (e) {
          output = copy;
        }
      }
    }

    if (options.replace) {
      each(options.replace, function(val, key){
        if (output == key || String(output) == String(key) || parseFloat(output) == parseFloat(key)) {
          output = val;
        }
      });
    }

    if (options.type && options.type == 'date') {

      if (options.format && moment && moment(value).isValid()) {
        output = moment(output).format(options.format);
      } else {
        output = new Date(output);
      }
    }

    if (options.type && options.type == 'string') {

      output = String(output);

      if (options.format) {
        switch (options.format) {
          case 'capitalize':
            // via: http://stackoverflow.com/a/15150510/2511985
            output = output.replace(/[^\s]+/g, function(word) {
              return word.replace(/^./, function(first) {
                return first.toUpperCase();
              });
            });
            break;
          case 'uppercase':
            output = output.toUpperCase();
            break;
          case 'lowercase':
            output = output.toLowerCase();
            break;
        }
      }

    }

    if (options.type && options.type == 'number' && !isNaN(parseFloat(output))) {

      output = parseFloat(output);

      if (options.format) {

        // Set decimals
        if (options.format.indexOf('.') !== -1) {
          output = (function(num){
            var chop = options.format.split('.');
            var length = chop[chop.length-1].length;
            return num.toFixed(length);
          })(output);
        }

        // Set commas
        if (options.format.indexOf(',') !== -1) {
          output = (function(num){
            var split = String(num).split(".");
            while (/(\d+)(\d{3})/.test(split[0])){
              split[0] = split[0].replace(/(\d+)(\d{3})/, '$1'+','+'$2');
            }
            return split.join(".");
          })(output);
        }

      }
    }

    if (options.prefix) {
      output = String(options.prefix) + output;
    }

    if (options.suffix) {
      output = output + String(options.suffix);
    }

    return output;
  }

  // Source: src/lib/sort.js
  Dataform.prototype.sort = function(opts){
    var self = this, options;

    if (self.action == 'unpack') {

      options = extend({
        index: false,
        value: false
      }, opts);

      // Sort records by index
      if (options.index) {
        !function(){
          var header = self.table[0],
              body = self.table.splice(1);

          body.sort(function(a, b) {
            if (options.index == 'asc') {
              if (a[0] > b[0]) {
                return 1;
              } else {
                return -1
              }
            } else if (options.index == 'desc') {
              if (a[0] > b[0]) {
                return -1;
              } else {
                return 1
              }
            }
            return false;
          });

          self.table = [header].concat(body);
        }();
      }

      // Sort columns (labels) by total values
      if (options.value && self.schema.unpack.label && self.table[0].length > 2) {
        !function(){
          var header = self.table[0],
              body = self.table.splice(1),
              series = [],
              table = [],
              index_cell = (self.schema.unpack.index) ? 0 : -1;

          each(header, function(cell, i){
            if (i > index_cell) {
              series.push({ label: cell, values: [], total: 0 });
            }
          });

          each(body, function(row, i){
            each(row, function(cell, j){
              if (j > index_cell) {
                if (is(cell, 'number')) {
                  series[j-1].total += cell;
                }
                series[j-1].values.push(cell);
              }
            });
          });

          if (self.schema.unpack.label.type == 'number' || is(body[0][1], 'number')) {
            series.sort(function(a, b) {
              //console.log(options, self.schema, options.value, a.total, b.total);
              if (options.value == 'asc') {
                if (a.total > b.total) {
                  return 1;
                } else {
                  return -1
                }
              } else if (options.value == 'desc') {
                if (a.total > b.total) {
                  return -1;
                } else {
                  return 1
                }
              }
              return false;
            });
          }

          each(series, function(column, i){
            header[index_cell+1+i] = series[i].label;
            each(body, function(row, j){
              row[index_cell+1+i] = series[i].values[j];
            });
          });

          self.table = [header].concat(body);

        }();
      }
    }

    if (self.action == 'select') {

      options = extend({
        column: 0,
        order: false
      }, opts);

      if (options.order != false) {
        !function(){
          var header = self.table[0],
              body = self.table.splice(1);

          body.sort(function(a, b){
            var _a = (a[options.column] === null || a[options.column] === void 0) ? "" : a[options.column],
                _b = (b[options.column] === null || b[options.column] === void 0) ? "" : b[options.column];
            if (options.order == 'asc') {
              if (_a > _b) {
                return 1;
              } else {
                return -1
              }
            } else if (options.order == 'desc') {
              if (_a > _b) {
                return -1;
              } else {
                return 1
              }
            }
            return 0;
          });
          self.table = [header].concat(body);
        }();
      }
    }

    return self;
  };

    // Source: src/lib/_outro.js
    return Dataform;
}));
