Keen.Dataset.prototype.insertRow = function(index, str, input){
  var self = this, label, newRow = [];

  label = (str !== undefined) ? str : null;
  newRow.push(label);

  if (typeof input === "function") {
    each(self.output()[0], function(label, i){
      var col, cell;
      if (i > 0) {
        col = self.selectColumn(i);
        cell = input.call(self, col, i);
        if (typeof cell === "undefined") {
          cell = null;
        }
        newRow.push(cell);
      }
    });
    self.data.output.splice(index, 0, newRow);
  }

  else if (!input || input instanceof Array) {
    each(self.output()[0], function(label, i){
      var cell;
      if (i > 0) {
        cell = (input && input[i-1] !== undefined) ? input[i-1] : null;
        newRow.push(cell);
      }
    });
    this.data.output.splice(index, 0, newRow);
  }

  return this;
};
