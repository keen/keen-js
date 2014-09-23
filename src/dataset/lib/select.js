Keen.Dataset.prototype.selectRow = function(index){
  return this.data.output[index];
};

Keen.Dataset.prototype.selectColumn = function(index){
  var result = new Array();
  each(this.data.output, function(row, i){
    result.push(row[index]);
  });
  return result;
};
