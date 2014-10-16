Keen.Dataset.prototype.insertColumn = function(index, str, input){
  var self = this, label;

  label = (str !== undefined) ? str : null;

  if (typeof input === "function") {

    self.data.output[0].splice(index, 0, label);
    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.call(self, row, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
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
