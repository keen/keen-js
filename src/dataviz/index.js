/*!
  * ----------------
  * Keen.Dataviz
  * ----------------
  */

_extend(Keen.utils, {
  prettyNumber: _prettyNumber,
  loadScript: _loadScript,
  loadStyle: _loadStyle
});

// Set flag for script loading
Keen.loaded = false;

// ------------------------------
// Dataviz constructor
// ------------------------------

Keen.Dataviz = function(){
  this.dataset = new Keen.Dataset();
  this.view = {
    _prepared: false,
    _initialized: false,
    _rendered: false,
    _artifacts: { /* state bin */ },
    adapter: {
      library: undefined,
      chartType: undefined,
      defaultChartType: undefined,
      dataType: undefined
    },
    attributes: JSON.parse(JSON.stringify(Keen.Dataviz.defaults)),
    defaults: JSON.parse(JSON.stringify(Keen.Dataviz.defaults)),
    el: undefined,
    loader: { library: "keen-io", chartType: "spinner" }
  };

  Keen.Dataviz.visuals.push(this);
};

_extend(Keen.Dataviz.prototype, Events);
_extend(Keen.Dataviz, {
  dataTypeMap: {
    "singular":          { library: "keen-io", chartType: "metric"      },
    "categorical":       { library: "google",  chartType: "piechart"    },
    "cat-interval":      { library: "google",  chartType: "columnchart" },
    "cat-ordinal":       { library: "google",  chartType: "barchart"    },
    "chronological":     { library: "google",  chartType: "areachart"   },
    "cat-chronological": { library: "google",  chartType: "linechart"   }
  },
  defaults: {
    colors: [
    /* teal      red        yellow     purple     orange     mint       blue       green      lavender */
      "#00bbde", "#fe6672", "#eeb058", "#8a8ad6", "#ff855c", "#00cfbb", "#5a9eed", "#73d483", "#c879bb",
      "#0099b6", "#d74d58", "#cb9141", "#6b6bb6", "#d86945", "#00aa99", "#4281c9", "#57b566", "#ac5c9e",
      "#27cceb", "#ff818b", "#f6bf71", "#9b9be1", "#ff9b79", "#26dfcd", "#73aff4", "#87e096", "#d88bcb"
    ],
    indexBy: "timeframe.start"
  },
  dependencies: {
    loading: 0,
    loaded: 0,
    urls: {}
  },
  libraries: {},
  visuals: []
});

// ------------------------------
// Utility methods
// ------------------------------

Keen.Dataviz.register = function(name, methods, config){
  var self = this;
  var loadHandler = function(st) {
    st.loaded++;
    if(st.loaded === st.loading) {
      Keen.loaded = true;
      Keen.trigger('ready');
    }
  };
  Keen.Dataviz.libraries[name] = Keen.Dataviz.libraries[name] || {};

  // Add method to library hash
  _each(methods, function(method, key){
    Keen.Dataviz.libraries[name][key] = method;
  });

  // Set default capabilities hash
  if (config && config.capabilities) {
    Keen.Dataviz.libraries[name]._defaults = Keen.Dataviz.libraries[name]._defaults || {};
    _each(config.capabilities, function(typeSet, key){
      // store somewhere in library
      Keen.Dataviz.libraries[name]._defaults[key] = typeSet;
    });
  }

  // For all dependencies
  if (config && config.dependencies) {
    _each(config.dependencies, function (dependency, index, collection) {
      var status = Keen.Dataviz.dependencies;
      // If it doesn't exist in the current dependencies being loaded
      if(!status.urls[dependency.url]) {
        status.urls[dependency.url] = true;
        status.loading++;
        var method = dependency.type === 'script' ? _loadScript : _loadStyle;

        method(dependency.url, function() {
          if(dependency.cb) {
            dependency.cb.call(self, function() {
              loadHandler(status);
            });
          } else {
            loadHandler(status);
          }
        });
      }
    }); // End each
  }
};

Keen.Dataviz.find = function(target){
  if (!arguments.length) return Keen.Dataviz.visuals;
  var el = target.nodeName ? target : document.querySelector(target),
      match;

  _each(Keen.Dataviz.visuals, function(visual){
    if (el == visual.el()){
      match = visual;
      return false;
    }
  });
  if (match) return match;
  //Keen.log("Visualization not found");
};
