function _applyPostProcessing(){
  this
    .call(_runLabelMapping)
    .call(_runLabelReplacement)
    .call(_runSortGroups)
    .call(_runSortIntervals)
    .call(_runColorMapping);
}
