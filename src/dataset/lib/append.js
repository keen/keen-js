Keen.Dataset.prototype.appendRow = function(row){
  this.data.output.push(row);
  return this;
};

Keen.Dataset.prototype.appendColumn = function(col){
  var self = this;
  each(col, function(cell, i){
    self.data.output[i].push(cell);
  });
  return self;
};
