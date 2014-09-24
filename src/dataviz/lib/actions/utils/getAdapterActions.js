function _getAdapterActions(){
  var map = _extend({}, Keen.Dataviz.dataTypeMap),
      dataType = this.dataType(),
      library = this.library(),
      chartType = this.chartType() || this.defaultChartType();

  // Backups
  if (!library && map[dataType]) {
    library = map[dataType].library;
  }
  if (!chartType && map[dataType]) {
    chartType = map[dataType].chartType;
  }

  // Return if found
  return (library && chartType) ? Keen.Dataviz.libraries[library][chartType] : {};
}
