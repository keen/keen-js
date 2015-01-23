var each = require("../../core/utils/each");
var chartOptions = require("./chartOptions");

module.exports = function(obj){
  if (!arguments.length) return this.view["attributes"];
  var self = this;
  each(obj, function(prop, key){
    if (key === "chartOptions") {
      chartOptions.call(self, prop);
      // self.chartOptions(prop);
    } else {
      self.view["attributes"][key] = prop;
    }
  });
  return this;
};
