Keen.Dataviz.prototype.adapter = function(obj){
  if (!arguments.length) return this.view.adapter;
  var self = this;
  _each(obj, function(prop, key){
    self.view.adapter[key] = (prop ? prop : null);
  });
  return this;
};
