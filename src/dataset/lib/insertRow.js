Keen.Dataset.prototype.insertRow = function(index, str, input){
  var self = this,
      args = Array.prototype.slice.call(arguments, 2),
      label = (str !== undefined) ? str : null,
      newRow = [];

  newRow.push(label);

  if (typeof input === "function") {
    each(self.output()[0], function(label, i){
      var col, cell;
      if (i > 0) {
        col = self.selectColumn(i);
        cell = input.apply(self, [col].concat(args));
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

// ds.insertRow(0, "Total", ds.getColumnSum);
// ds.insertRow(0, "Given", [1,2,3,4,5]);


// Keen.Dataset.prototype.insertRow = function(index, row){
//   // insert row of nulls if !row
//   this.data.output.splice(index, 0, row);
//   return this;
// };
