Keen.Dataset.prototype.filterRows = function(fn){
  var self = this,
      clone = [];
  each(self.data.output, function(row, i){
    if (i == 0 || fn.call(self, row, i)) {
      clone.push(row);
    }
  });
  self.output(clone);
  return self;
};
