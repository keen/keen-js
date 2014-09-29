Keen.Dataviz.prototype.labels = function(arr){
  if (!arguments.length) return this.view.attributes.labels;
  this.view.attributes.labels = (arr instanceof Array ? arr : null);
  _runLabelReplacement.call(this);
  return this;
};

function _runLabelReplacement(){
  var self = this,
      labelSet = this.labels() || null,
      schema = this.dataset.schema() || {},
      data = this.dataset.output(),
      dt = this.dataType() || "";

  if (labelSet) {
    if (dt.indexOf("chronological") > -1 || (schema.unpack && data[0].length > 2)) {
      _each(data[0], function(cell,i){
        if (i > 0 && labelSet[i-1]) {
          self.dataset.data.output[0][i] = labelSet[i-1];
        }
      });
    } else {
      _each(data, function(row,i){
        if (i > 0 && labelSet[i-1]) {
          self.dataset.data.output[i][0] = labelSet[i-1];
        }
      });
    }
  }
}
