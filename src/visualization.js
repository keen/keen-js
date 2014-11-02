/*!
* ----------------------
* Keen IO Visualization
* ----------------------
*/

// ------------------------------
// <Client>.draw method
// ------------------------------
// Shorthand interface, returns
// a configured Dataviz instance
// ------------------------------

Keen.prototype.draw = function(query, el, cfg) {
  var DEFAULTS = JSON.parse(JSON.stringify(Keen.Visualization.defaults)),
      visual = new Keen.Dataviz(),
      request = new Keen.Request(this, [query]),
      config = cfg ? _clone(cfg) : {};

  if (config.chartType) {
    visual.chartType(config.chartType);
    delete cfg.chartType;
  }
  if (config.library) {
    visual.library(config.library);
    delete cfg.library;
  }
  if (config.chartOptions) {
    visual.chartOptions(config.chartOptions);
    delete cfg.chartOptions;
  }
  visual
    .attributes(_extend(DEFAULTS, config))
    .el(el)
    .prepare();

  request.on("complete", function(){
    visual
      .parseRequest(this)
      .render();
  });
  request.on("error", function(res){
    visual.error(res.message);
  });
  return visual;
};


// ------------------------------
// <Keen.Request>.draw method
// ------------------------------
// DEPRECATED: DO NOT USE :x
// ------------------------------

Keen.Request.prototype.draw = function(el, cfg) {
  //Keen.log("DEPRECATED: \"<Keen.Request>.draw()\" will be removed in a future release.");
  return new Keen.Visualization(this, el, cfg);
};


// ------------------------------
// Visualization constructor
// ------------------------------
// Legacy interface, returns a
// configured Dataviz instance
// ------------------------------

Keen.Visualization = function(dataset, el, cfg){
  var DEFAULTS = JSON.parse(JSON.stringify(Keen.Visualization.defaults)),
      visual = new Keen.Dataviz().data(dataset).el(el),
      config = cfg ? _clone(cfg) : {};

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
    .attributes(_extend(DEFAULTS, config))
    .render();

  return visual;
};

Keen.Visualization.defaults = _extend({
  height: 400
  //width: 600
}, JSON.parse(JSON.stringify(Keen.Dataviz.defaults)));
