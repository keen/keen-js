Keen.Dataviz.prototype.width = function(int){
  if (!arguments.length) return this.view.attributes.width;
  this.view.attributes['width'] = (!isNaN(parseInt(int)) ? parseInt(int) : null);
  return this;
};
