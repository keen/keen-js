// ------------------------------
// Sort rows
// ------------------------------

/*

  EXAMPLE USAGE:

  // sort numerically, by row sum
  d.sortRows("asc", d.getRowSum);
  d.sortRows("asc", d.sum, 1);
  d.sortRows("asc", function(row){
    return this.sum(row, 1); // array, range
  });

  // sort alphabetically, by index
  d.sortRows("asc", d.getRowIndex);
  d.sortRows("asc", function(row){
    return row[0];
  });

  // sort numerically, by single value
  d.sortRows("asc", d.getRowSum);
  d.sortRows("asc", d.sum, 1);
  d.sortRows("asc", function(row){
    return row[1];
  });

*/

Keen.Dataset.prototype.sortRows = function(str, comp){
  var args = Array.prototype.slice.call(arguments, 2),
      self = this,
      head = this.output().slice(0,1),
      body = this.output().slice(1),
      fn = comp || this.getRowIndex;

  body.sort(function(a, b){
    // If fn(a) > fn(b)
    var op = fn.apply(self, [a].concat(args)) > fn.apply(self, [b].concat(args));
    if (op) {
      return (str === "asc" ? 1 : -1);
    } else if (!op) {
      return (str === "asc" ? -1 : 1);
    } else {
      return 0;
    }
  });
  self.output(head.concat(body));
  return self;
};

// ------------------------------
// Row sorting comparators
// ------------------------------

Keen.Dataset.prototype.getRowIndex = function(arr){
  return arr[0];
};
// Keen.Dataset.prototype.getRowValue = function(arr){
//   return arr.slice(1, row.length-1);
// };

Keen.Dataset.prototype.getRowSum = function(arr){
  return this.sum(arr, 1);
};
