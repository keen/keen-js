Keen.Dataviz.prototype.labelMapping = function(obj){
  if (!arguments.length) return this.view.attributes.labelMapping;
  this.view.attributes.labelMapping = (obj ? obj : null);
  _runLabelMapping.call(this);
  return this;
};

function _runLabelMapping(){
  var self = this,
      labelMap = this.labelMapping(),
      schema = this.dataset.schema() || {},
      dt = this.dataType() || "";

  if (labelMap) {
    if (dt.indexOf("chronological") > -1 || (schema.unpack && self.dataset.output()[0].length > 2)) {
      // loop over header cells
      each(self.dataset.output()[0], function(c, i){
        if (i > 0) {
          self.dataset.data.output[0][i] = labelMap[c] || c;
        }
      });
    }
    else if (schema.select && self.dataset.output()[0].length === 2) {
      // update column 0
      self.dataset.updateColumn(0, function(c, i){
        return labelMap[c[0]] || c[0];
      });
    }
  }
}
