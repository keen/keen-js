Keen.Dataviz.prototype.el = function(el){
  if (!arguments.length) return this.view.el;
  this.view.el = el;
  return this;
};
