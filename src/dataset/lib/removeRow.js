Keen.Dataset.prototype.removeRow = function(index){
  this.data.output.splice(index, 1);
  return this;
};
