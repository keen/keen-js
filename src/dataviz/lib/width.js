module.exports = function(num){
  if (!arguments.length) return this.view["attributes"]["width"];
  this.view["attributes"]["width"] = (!isNaN(parseInt(num)) ? parseInt(num) : null);
  return this;
};
