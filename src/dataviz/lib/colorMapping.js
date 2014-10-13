Keen.Dataviz.prototype.colorMapping = function(obj){
  if (!arguments.length) return this.view.attributes.colorMapping;
  this.view.attributes.colorMapping = (obj ? obj : null);
  _runColorMapping.call(this);
  return this;
};

function _runColorMapping(){
  var self = this,
      schema = this.dataset.schema,
      data = this.dataset.output(),
      colorSet = this.view.defaults.colors.slice(),
      colorMap = this.colorMapping(),
      dt = this.dataType() || "";

  if (colorMap) {
    if (dt.indexOf("chronological") > -1 || (schema.unpack && data[0].length > 2)) {
      _each(data[0].slice(1), function(label, i){
        var color = colorMap[label];
        if (color && colorSet[i] !== color) {
          colorSet.splice(i, 0, color);
        }
      });
    }
    else {
      _each(self.dataset.selectColumn(0).slice(1), function(label, i){
        var color = colorMap[label];
        if (color && colorSet[i] !== color) {
          colorSet.splice(i, 0, color);
        }
      });
    }
    self.view.attributes.colors = colorSet;
  }
}
