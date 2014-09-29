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
      colorMap = this.colorMapping(),
      dt = this.dataType() || "";

  if (colorMap) {

    if (dt.indexOf("chronological") > -1 || (schema.unpack && data[0].length > 2)) {
      _each(data[0], function(cell, i){
        if (i > 0 && colorMap[String(cell)] && colorSet[i-1] !== colorMap[String(cell)]) {
          colorSet.splice(i-1, 0, colorMap[String(cell)]);
        }
      });
    }
    //else if (schema.select && data[0].length === 2) {
    else {
      _each(data, function(row, i){
        if (i > 0 && colorMap[String(row[0])] && colorSet[i-1] !== colorMap[row[0]]) {
          colorSet.splice(i-1, 0, colorMap[row[0]]);
        }
      });
    }
    self.colors(colorSet);
  }
}
