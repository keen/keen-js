Keen.Dataset.prototype.removeRow = function(q){
  var index = (typeof q === "number") ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {
    this.data.output.splice(index, 1);
  }
  return this;
};
