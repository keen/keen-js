Keen.Dataviz.prototype.height = function(int){
  if (!arguments.length) return this.view.attributes.height;
  this.view.attributes['height'] = (!isNaN(parseInt(int)) ? parseInt(int) : null);
  return this;
};
