Keen.Dataset.prototype.removeColumn = function(q){
  var self = this,
      index = (typeof q === "number") ? q : this.output()[0].indexOf(q);

  if (index > -1) {
    each(self.data.output, function(row, i){
      self.data.output[i].splice(index, 1);
    });
  }
  return self;
};
