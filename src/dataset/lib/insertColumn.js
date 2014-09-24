Keen.Dataset.prototype.insertColumn = function(index, str, input){
  var self = this,
      args = Array.prototype.slice.call(arguments, 3),
      label = (str !== undefined) ? str : null;

  if (typeof input === "function") {
    self.data.output[0].splice(index, 0, label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.apply(self, [row].concat(args));
        self.data.output[i].splice(index, 0, cell);
      }
    });
  }

  else if (!input || input instanceof Array) {
    self.data.output[0].splice(index, 0, label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = (input && input[i-1] !== "undefined") ? input[i-1] : null;
        self.data.output[i].splice(index, 0, cell);
      }
    });
  }
  return self;
};

// ds.insertColumn(2, "Label", [1, 2, 3]);
// ds.insertColumn(2, "New Label", function(row, index){});
// ds.insertColumn(2, "Total", ds.getRowSum);
// ds.insertColumn(2, "Median", ds.getRowMedian);
