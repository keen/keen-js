Keen.Dataset.prototype.modifyColumn = function(q, mod){
  var self = this,
      index = (!isNaN(parseInt(q))) ? q : this.output()[0].indexOf(q);

  if (index > -1) {
    if (mod instanceof Array) {
      each(self.data.output, function(row, i){
        var val = (typeof mod[i] !== "undefined" ? mod[i] : null);
        self.data.output[i][index] = val;
      });
    } else if (typeof mod === "function") {
      each(self.data.output, function(row, i){
        self.data.output[i][index] = mod.call(self, self.data.output[i][index], i, self.data.output[i]);
      });
    }
  }
  return self;
};
