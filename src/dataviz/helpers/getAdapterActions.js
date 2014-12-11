var Dataviz = require("../dataviz"),
    extend = require("../../core/utils/extend")

module.exports = function(){
  var map = extend({}, Dataviz.dataTypeMap),
      dataType = this.dataType(),
      library = this.library(),
      chartType = this.chartType() || this.defaultChartType();

  // Use the default library as a backup
  if (!library && map[dataType]) {
    library = map[dataType].library;
  }

  // Use this library's default chartType for this dataType
  if (library && !chartType && dataType) {
    chartType = Dataviz.libraries[library]._defaults[dataType][0];
  }

  // Still no luck?
  if (library && !chartType && map[dataType]) {
    chartType = map[dataType].chartType;
  }

  // Return if found
  return (library && chartType) ? Dataviz.libraries[library][chartType] : {};
};
