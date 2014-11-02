Keen.Dataviz.prototype.height = function(num){
  if (!arguments.length) return this.view.attributes['height'];
  this.view.attributes['height'] = (!isNaN(parseInt(num)) ? parseInt(num) : null);
  return this;
};
