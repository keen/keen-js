var extend = require('../../core/utils/extend');
module.exports = function(obj){
  if (!arguments.length) return this.view.adapter.chartOptions;
  if (typeof obj === 'object' && obj !== null) {
    extend(this.view.adapter.chartOptions, obj);
  }
  else {
    this.view.adapter.chartOptions = {};
  }
  return this;
};
