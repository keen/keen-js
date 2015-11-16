var each = require('../../core/utils/each');

module.exports = function(arr){
  if (!arguments.length) {
    // If labels config is empty, return what's in the dataset
    if (!this.view['attributes'].labels || !this.view['attributes'].labels.length) {
      return getLabels.call(this);
    }
    else {
      return this.view['attributes'].labels;
    }
  }
  else {
    this.view['attributes'].labels = (arr instanceof Array ? arr : null);
    setLabels.call(this);
    return this;
  }
};

function setLabels(){
  var self = this,
      labelSet = this.labels() || null,
      data = this.dataset.output(),
      dt = this.dataType() || '';

  if (labelSet) {
    if (dt.indexOf('chronological') > -1 || (data[0].length > 2)) {
      each(data[0], function(cell,i){
        if (i > 0 && labelSet[i-1]) {
          self.dataset.data.output[0][i] = labelSet[i-1];
        }
      });
    }
    else {
      each(data, function(row,i){
        if (i > 0 && labelSet[i-1]) {
          self.dataset.data.output[i][0] = labelSet[i-1];
        }
      });
    }
  }
}

function getLabels(){
  var data = this.dataset.output(),
      dt = this.dataType() || '',
      labels;

  if (dt.indexOf('chron') > -1 || (data[0].length > 2)) {
    labels = this.dataset.selectRow(0).slice(1);
  }
  else {
    labels = this.dataset.selectColumn(0).slice(1);
  }
  return labels;
}
