var clone = require("../../core/utils/clone"),
    extend = require("../../core/utils/extend"),
    Dataviz = require("../dataviz"),
    Request = require("../../core/request");

module.exports = function(query, el, cfg) {
  var DEFAULTS = clone(Dataviz.defaults),
      visual = new Dataviz(),
      request = new Request(this, [query]),
      config = cfg || {};

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
