Keen.Dataviz.prototype.colors = function(arr){
  if (!arguments.length) return this.view.attributes.colors;
  this.view.attributes.colors = (arr instanceof Array ? arr : null);
  return this;
};
