Keen.Dataset.prototype.minimum = function(arr, start, end){
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      nums = [];

  // Pull numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      nums.push(parseFloat(val));
    }
  });
  return Math.min.apply(Math, nums);
};

Keen.Dataset.prototype.getColumnMinimum = function(arr){
  return this.minimum(arr, 1);
};
Keen.Dataset.prototype.getRowMinimum = function(arr){
  return this.minimum(arr, 1);
};
