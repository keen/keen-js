Keen.Dataset.prototype.removeRow = function(index){
  this.data.output.splice(index, 1);
  return this;
};

Keen.Dataset.prototype.removeColumn = function(index){
  var self = this;
  each(self.data.output, function(row, i){
    self.data.output[i].splice(index, 1);
  });
  return self;
};
