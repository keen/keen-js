Keen.Dataviz.prototype.chartOptions = function(obj){
  if (!arguments.length) return this.view.adapter.chartOptions;
  var self = this;
  self.view.adapter.chartOptions = self.view.adapter.chartOptions || {};
  _each(obj, function(prop, key){
    self.view.adapter.chartOptions[key] = (prop ? prop : null);
  });
  return this;
};
