Keen.Dataset.prototype.insertRow = function(index, row){
  // insert row of nulls if !row
  this.data.output.splice(index, 0, row);
  return this;
};
