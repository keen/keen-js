Keen.Dataset.prototype.selectRow = function(q){
  var index = (!isNaN(parseInt(q))) ? q : this.selectColumn(0).indexOf(q);
  if (index > -1) {
    return this.data.output[index];
  }
};
