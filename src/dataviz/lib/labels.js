Keen.Dataviz.prototype.labels = function(arr){
  if (!arguments.length) return this.view.attributes.labels;
  this.view.attributes.labels = (arr instanceof Array ? arr : null);
  _runLabelReplacement.call(this);
  return this;
};

function _runLabelReplacement(){
  var labelSet = this.labels() || null,
      schema = this.dataset.schema() || {};
  if (labelSet) {
    if (schema.unpack && dataset.output()[0].length == 2) {
      _each(dataset.output(), function(row,i){
        if (i > 0 && labelSet[i-1]) {
          dataset.output()[i][0] = labelSet[i-1];
        }
      });
    }
    if (schema.unpack && dataset.output()[0].length > 2) {
      _each(dataset.output()[0], function(cell,i){
        if (i > 0 && labelSet[i-1]) {
          dataset.output()[0][i] = labelSet[i-1];
        }
      });
    }
  }
}
