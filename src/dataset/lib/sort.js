/*
  TODO:

  [x] import Dataset project source
  [x] import Dataset project tests
  [x] update Dataset API with new sketch
  [x] fix Dataset sort method
  [ ] write tests for new sort methods
  [ ] fix Dataset handling of metrics

  [ ] #getRowAverage
  [ ] #getRowMedian
  [ ] #getRowMinimum
  [ ] #getRowMaximum

  [ ] #getColumnAverage
  [ ] #getColumnMedian
  [ ] #getColumnMinimum
  [ ] #getColumnMaximum

*/

// ------------------------------
// Sort rows
// ------------------------------

/*

  EXAMPLE USAGE:

  // sort numerically, by row sum
  d.sortRows("asc", d.sumRowValue);
  d.sortRows("asc", d.sum, 1);
  d.sortRows("asc", function(row){
    return this.sum(row, 1); // array, range
  });

  // sort alphabetically, by index
  d.sortRows("asc", d.getRowIndex);
  d.sortRows("asc", function(row){
    return row[0];
  });

  // sort numerically, by single value
  d.sortRows("asc", d.sumRowValue);
  d.sortRows("asc", d.sum, 1);
  d.sortRows("asc", function(row){
    return row[1];
  });

*/

Keen.Dataset.prototype.sortRows = function(str, comp){
  var args = Array.prototype.slice.call(arguments, 2),
      self = this,
      head = this.output().slice(0,1),
      body = this.output().slice(1),
      fn = comp || this.getRowIndex;

  body.sort(function(a, b){
    // If fn(a) > fn(b)
    var op = fn.apply(self, [a].concat(args)) > fn.apply(self, [b].concat(args));
    if (op) {
      return (str === "asc" ? 1 : -1);
    } else if (!op) {
      return (str === "asc" ? -1 : 1);
    } else {
      return 0;
    }
  });
  self.output(head.concat(body));
  return self;
};

// ------------------------------
// Row sorting comparators
// ------------------------------

Keen.Dataset.prototype.getRowIndex = function(arr){
  return arr[0];
};
// Keen.Dataset.prototype.getRowValue = function(arr){
//   return arr.slice(1, row.length-1);
// };

Keen.Dataset.prototype.sumRowValue = function(arr){
  return this.sum(arr, 1);
};


// ------------------------------
// Sort columns
// ------------------------------

/*

  EXAMPLE USAGE:

  // sort numerically, by column sum
  d.sortColumns("asc", d.sumColumnValue);
  d.sortColumns("asc", d.sum, 1);
  d.sortColumns("asc", function(col){
    return this.sum(col,1); // array, range
  });

  // sort alphabetically, by label
  d.sortColumns("asc", d.getColumnLabel);
  d.sortColumns("asc", function(col){
    return col[0];
  });

  // sort numerically, by single value
  d.sortColumns("asc", d.sumColumnValue);
  d.sortColumns("asc", d.sum, 1);
  d.sortColumns("asc", function(row){
    return row[1];
  });

*/

Keen.Dataset.prototype.sortColumns = function(str, comp){
  var args = Array.prototype.slice.call(arguments, 2),
      self = this,
      head = this.output()[0].slice(1), // minus index
      cols = [],
      clone = [],
      fn = comp || this.getColumnLabel;

  // Isolate each column (except the index)
  each(head, function(cell, i){
    cols.push(self.selectColumn(i+1).slice(0));
  });
  cols.sort(function(a,b){
    // If fn(a) > fn(b)
    var op = fn.apply(self, [a].concat(args)) > fn.apply(self, [b].concat(args));
    if (op) {
      return (str === "asc" ? 1 : -1);
    } else if (!op) {
      return (str === "asc" ? -1 : 1);
    } else {
      return 0;
    }
  });
  each(cols, function(col, i){
    self.modifyColumn(i+1, col);
  });
  return self;
};

Keen.Dataset.prototype.getColumnLabel = function(arr){
  return arr[0];
};

Keen.Dataset.prototype.sumColumnValue = function(arr){
  return this.sum(arr, 1);
};

// -----------------------------
// Old sort method is donezo
// -----------------------------



Keen.Dataset.prototype.sort = function(opts){
  var self = this, options;

  if (this.method() === 'unpack') {

    options = extend({
      index: false,
      value: false
    }, opts);

    // Sort records by index
    if (options.index) {
      !function(){
        var header = self.data.output[0],
            body = self.data.output.splice(1);

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

        self.output([header].concat(body));
      }();
    }

    // Sort columns (labels) by total values
    if (options.value && self.meta.schema.unpack.label && self.data.output[0].length > 2) {
      !function(){
        var header = self.data.output[0],
            body = self.data.output.splice(1),
            series = [],
            table = [],
            index_cell = (self.meta.schema.unpack.index) ? 0 : -1;

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

        if (self.meta.schema.unpack.label.type == 'number' || is(body[0][1], 'number')) {
          series.sort(function(a, b) {
            //console.log(options, self.meta.schema, options.value, a.total, b.total);
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

        self.output([header].concat(body));

      }();
    }
  }

  if (this.method() === 'select') {

    options = extend({
      column: 0,
      order: false
    }, opts);

    if (options.order != false) {
      !function(){
        var header = self.data.output[0],
            body = self.data.output.splice(1);

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
        self.output([header].concat(body));
      }();
    }
  }

  return self;
};
