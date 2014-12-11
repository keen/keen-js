module.exports = function(){
  this
    .labelMapping(this.labelMapping())
    .labels(this.labels())
    .sortGroups(this.sortGroups())
    .sortIntervals(this.sortIntervals());

  // this
  // .call(_runLabelMapping)
  // .call(_runLabelReplacement)
  // .call(_runSortGroups)
  // .call(_runSortIntervals)
  // .call(_runColorMapping);
};
