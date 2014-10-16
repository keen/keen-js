Keen.Dataset.prototype.appendColumn = function(str, input){
  var self = this,
      args = Array.prototype.slice.call(arguments, 2),
      label = (str !== undefined) ? str : null;

  if (typeof input === "function") {
    self.data.output[0].push(label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.call(self, row, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
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
