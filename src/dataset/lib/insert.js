Keen.Dataset.prototype.insertRow = function(index, row){
  // insert row of nulls if !row
  this.data.output.splice(index, 0, row);
  return this;
};

Keen.Dataset.prototype.insertColumn = function(index, col){
  var self = this;
  var column = (col instanceof Array ? col : []);
  each(self.data.output, function(row, i){
    var val = (typeof column[i] !== "undefined" ? column[i] : null);
    self.data.output[i].splice(index, 0, val);
  });
  return self;
};
