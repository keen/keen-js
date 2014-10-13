Keen.Dataviz.prototype.chartType = function(str){
  if (!arguments.length) return this.view.adapter.chartType;
  this.view.adapter.chartType = (str ? String(str) : null);
  return this;
};
