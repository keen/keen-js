Keen.Dataviz.prototype.attributes = function(obj){
  if (!arguments.length) return this.view.attributes;
  var self = this;
  _each(obj, function(prop, key){
    if (key === "chartOptions") {
      self.chartOptions(prop);
    } else {
      self.view.attributes[key] = (prop ? prop : null);
    }
  });
  return this;
};
