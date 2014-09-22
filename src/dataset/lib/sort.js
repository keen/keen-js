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
