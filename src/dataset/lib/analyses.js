var each = require("../../core/utils/each"),
    arr = ["average", "maximum", "minimum", "sum"],
    output = {};

output["average"] = function(arr, start, end){
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

output["maximum"] = function(arr, start, end){
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

output["minimum"] = function(arr, start, end){
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

output["sum"] = function(arr, start, end){
  // Copy set with given range
  var set = arr.slice(start||0, (end ? end+1 : arr.length)),
  sum = 0;

  // Add numeric values
  each(set, function(val, i){
    if (typeof val === "number" && !isNaN(parseFloat(val))) {
      sum += parseFloat(val);
    }
  });
  return sum;
};

// Convenience methods

each(arr, function(v,i){
  output["getColumn"+v.toUpperCase()] = output["getRow"+v.toUpperCase()] = function(arr){
    return this[arr[i]](arr, i);
  };
});

output["getColumnLabel"] = output["getRowIndex"] = function(arr){
  return arr[0];
};

module.exports = output;
