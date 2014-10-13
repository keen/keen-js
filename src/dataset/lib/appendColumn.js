Keen.Dataset.prototype.appendColumn = function(str, input){
  var self = this,
      args = Array.prototype.slice.call(arguments, 2),
      label = (str !== undefined) ? str : null;

  if (typeof input === "function") {
    self.data.output[0].push(label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.apply(self, [row].concat(args));
        self.data.output[i].push(cell);
      }
    });
  }

  else if (!input || input instanceof Array) {
    self.data.output[0].push(label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = (input && input[i-1] !== undefined) ? input[i-1] : null;
        self.data.output[i].push(cell);
      }
    });

  }

  return self;
};

// ds.appendColumn("Total", ds.getRowSum);
// ds.appendColumn("Median", ds.getRowMedian);
