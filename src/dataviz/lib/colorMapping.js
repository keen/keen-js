Keen.Dataviz.prototype.colorMapping = function(obj){
  if (!arguments.length) return this.view.attributes.colorMapping;
  var self = this;
  self.view.attributes.colorMapping = {};
  _each(obj, function(prop, key){
    self.view.attributes.colorMapping[key] = (prop? prop.trim() : null);
  });
  _runColorMapping.call(self);
  return self;
};

function _runColorMapping(){
  var self = this,
      schema = this.dataset.schema,
      data = this.dataset.output(),
      colorSet = this.colors(),
      colorMap = this.colorMapping();

  if (colorMap) {
    // Map to selected index
    if (schema.select && data[0].length == 2) {
      _each(data, function(row, i){
        if (i > 0 && colorMap[String(row[0])]) {
          colorSet.splice(i-1, 0, colorMap[row[0]]);
        }
      });
    }
    // Map to unpacked labels
    if (schema.unpack) {
      _each(data[0], function(cell, i){
        if (i > 0 && colorMap[String(cell)]) {
          colorSet.splice(i-1, 0, colorMap[cell]);
        }
      });
    }
    self.colors(colorSet);
  }
}
