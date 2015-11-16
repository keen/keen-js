var each = require("../../core/utils/each");

module.exports = function(obj){
  if (!arguments.length) return this.view["attributes"].labelMapping;
  this.view["attributes"].labelMapping = (obj ? obj : null);
  applyLabelMapping.call(this);
  return this;
};

function applyLabelMapping(){
  var self = this,
  labelMap = this.labelMapping(),
  dt = this.dataType() || "";

  if (labelMap) {
    if (dt.indexOf("chronological") > -1 || (self.dataset.output()[0].length > 2)) {
      // loop over header cells
      each(self.dataset.output()[0], function(c, i){
        if (i > 0) {
          self.dataset.data.output[0][i] = labelMap[c] || c;
        }
      });
    }
    else if (self.dataset.output()[0].length === 2) {
      // update column 0
      self.dataset.updateColumn(0, function(c, i){
        return labelMap[c] || c;
      });
    }
  }
}
