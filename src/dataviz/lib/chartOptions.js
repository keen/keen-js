var extend = require('../../core/utils/extend');
module.exports = function(obj){
  if (!arguments.length) return this.view.adapter.chartOptions;
  extend(this.view.adapter.chartOptions, obj);
  return this;
};
