Keen.Dataset.prototype.deleteRow = function(q){
  var index = (!isNaN(parseInt(q))) ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {
    this.data.output.splice(index, 1);
  }
  return this;
};
