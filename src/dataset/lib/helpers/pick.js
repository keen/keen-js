Keen.Dataset.prototype.pick = function(arr, i){
  return arr[i];
};

Keen.Dataset.prototype.getColumnLabel = function(arr){
  return this.pick(arr, 0);
};
Keen.Dataset.prototype.getRowIndex = function(arr){
  return this.pick(arr, 0);
};
