var each = require("../../core/utils/each");
var chartOptions = require("./chartOptions"),
    chartType = require("./chartType"),
    library = require("./library");

module.exports = function(obj){
  if (!arguments.length) return this.view["attributes"];
  var self = this;
  each(obj, function(prop, key){
    // Handle specified options differently
    if (key === "library") {
      library.call(self, prop);
    }
    else if (key === "chartType") {
      chartType.call(self, prop);
    }
    else if (key === "chartOptions") {
      chartOptions.call(self, prop);
    }
    else {
      self.view["attributes"][key] = prop;
    }
  });
  return this;
};
