Keen.Dataset.prototype.appendColumn = function(col){
  var self = this;
  each(col, function(cell, i){
    self.data.output[i].push(cell);
  });
  return self;
};
