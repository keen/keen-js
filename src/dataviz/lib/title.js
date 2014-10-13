Keen.Dataviz.prototype.title = function(str){
  if (!arguments.length) return this.view.attributes.title;
  this.view.attributes['title'] = (str ? String(str) : null);
  return this;
};
