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

Keen.Dataset.prototype.filterColumns = function(fn){
  var self = this, clone = new Array();
  each(self.data.output, function(row, i){
    clone.push([]);
  });
  each(self.data.output[0], function(col, i){
    var selectedColumn = self.selectColumn(i);
    if (i == 0 || fn.call(self, selectedColumn, i)) {
      each(selectedColumn, function(cell, ri){
        clone[ri].push(cell);
      });
    }
  });
  self.output(clone);
  return self;
};
