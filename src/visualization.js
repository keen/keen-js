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
      config = cfg || {};

  if (cfg.chartType) {
    visual.chartType(cfg.chartType);
    delete cfg.chartType;
  }
  if (cfg.library) {
    visual.library(cfg.library);
    delete cfg.library;
  }
  if (cfg.chartOptions) {
    visual.chartOptions(cfg.chartOptions);
    delete cfg.chartOptions;
  }
  visual
    .attributes(_extend(DEFAULTS, cfg))
    .prepare(el);

  request.on("complete", function(){
    visual.parseRequest(this).render();
  });
  request.on("error", function(response){
    visual.error({ error: response, el: el });
  });
  return visual;
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
      config = cfg || {};

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
