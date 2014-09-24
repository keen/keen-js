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
          //console.log('Mod header cell', labelMap[c] || c, i);
          self.dataset.data.output[0][i] = labelMap[c] || c;
        }
      });
    }
    else if (schema.select && self.dataset.output()[0].length === 2) {
      // modify column 0
      self.dataset.modifyColumn(0, function(c, i){
        //console.log('Mod column', labelMap[c] || c);
        return labelMap[c] || c;
      });
    }
  }
}
