Keen.Dataset.prototype.maximum = function(arr, start, end){
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
      nums = [];

  // Pull numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      nums.push(parseFloat(val));
    }
  });
  return Math.max.apply(Math, nums);
};

Keen.Dataset.prototype.getColumnMaximum = function(arr){
  return this.maximum(arr, 1);
};
Keen.Dataset.prototype.getRowMaximum = function(arr){
  return this.maximum(arr, 1);
};
