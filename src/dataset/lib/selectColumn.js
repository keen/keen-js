Keen.Dataset.prototype.selectColumn = function(q){
  var result = new Array(),
  index = (typeof q === "number") ? q : this.output()[0].indexOf(q);

  if (index > -1) {
    each(this.data.output, function(row, i){
      result.push(row[index]);
    });
  }
  return result;
};
