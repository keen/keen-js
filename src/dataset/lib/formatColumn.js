Keen.Dataset.prototype.formatColumn = function(q, input){
  var self = this, index;
  index = (!isNaN(parseInt(q))) ? q : this.output()[0].indexOf(q);
  if (index > -1) {

    each(self.output(), function(row, i){
      var cell;
      if (i > 0) {
        cell = input.call(self, row[index], i);
        if (typeof cell !== "undefined") {
          self.data.output[i][index] = cell;
        }
      }
    });

  }
  return self;
};
