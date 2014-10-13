Keen.Dataviz.prototype.sortGroups = function(str){
  if (!arguments.length) return this.view.attributes.sortGroups;
  this.view.attributes.sortGroups = (str ? String(str) : null);
  _runSortGroups.call(this);
  return this;
};

function _runSortGroups(){
  var dt = this.dataType();
  if (!this.sortGroups()) return;
  if ((dt && dt.indexOf("chronological") > -1) || this.data()[0].length > 2) {
    // Sort columns by Sum (n values)
    this.dataset.sortColumns(this.sortGroups(), this.dataset.getColumnSum);
  }
  else if (dt && (dt.indexOf("cat-") > -1 || dt.indexOf("categorical") > -1)) {
    // Sort rows by Sum (1 value)
    this.dataset.sortRows(this.sortGroups(), this.dataset.getRowSum);
  }
  return;
}
