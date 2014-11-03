Keen.Dataset.prototype.average = function(arr, start, end){
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      sum = 0,
      avg = null;

  // Add numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      sum += parseFloat(val);
    }
  });
  return sum / set.length;
};

Keen.Dataset.prototype.getColumnAverage = function(arr){
  return this.average(arr, 1);
};
Keen.Dataset.prototype.getRowAverage = function(arr){
  return this.average(arr, 1);
};
