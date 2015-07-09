var clone = require("../../core/utils/clone"),
    extend = require("../../core/utils/extend"),
    Dataviz = require("../dataviz"),
    Request = require("../../core/request");

module.exports = function(query, el, cfg) {
  var DEFAULTS = clone(Dataviz.defaults),
      visual = new Dataviz(),
      request = new Request(this, [query]),
      config = cfg ? clone(cfg) : {};

  if (config.chartType) {
    visual.chartType(config.chartType);
    delete config.chartType;
  }

  if (config.library) {
    visual.library(config.library);
    delete config.library;
  }

  if (config.chartOptions) {
    visual.chartOptions(config.chartOptions);
    delete config.chartOptions;
  }

  visual
    .attributes(extend(DEFAULTS, config))
    .el(el)
    .prepare();

  request.refresh();
  request.on("complete", function(){
    visual
      .parseRequest(this)
      .call(function(){
        if (config.labels) {
          this.labels(config.labels);
        }
      })
      .render();
  });
  request.on("error", function(res){
    visual.error(res.message);
  });

  return visual;
};
