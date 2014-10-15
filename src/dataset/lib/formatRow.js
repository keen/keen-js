Keen.Dataset.prototype.formatRow = function(q, input){
  var self = this, index;
  index = (!isNaN(parseInt(q))) ? q : this.selectColumn(0).indexOf(q);
  if (index > -1) {

    each(self.output()[index], function(c, i){
      var col = self.selectColumn(i),
          cell = input.call(self, col[index], i);
      if (typeof cell !== "undefined") {
        self.data.output[index][i] = cell;
      }
    });

  }
  return self;
};
