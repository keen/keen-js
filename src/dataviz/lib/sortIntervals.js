Keen.Dataviz.prototype.sortIntervals = function(str){
  if (!arguments.length) return this.view.attributes.sortIntervals;
  this.view.attributes.sortIntervals = (str ? String(str) : null);
  _runSortIntervals.call(this);
  return this;
};

function _runSortIntervals(){
  if (!this.sortIntervals()) return;
  // Sort rows by index
  this.dataset.sortRows(this.sortIntervals());
  return;
}
