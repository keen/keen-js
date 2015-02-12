var clone = require('../core/utils/clone'),
    each = require('../core/utils/each'),
    extend = require('../core/utils/extend'),
    loadScript = require('./utils/loadScript'),
    loadStyle = require('./utils/loadStyle');

var Keen = require('../core');
var Emitter = require('../core/helpers/emitter-shim');

var Dataset = require('../dataset');

function Dataviz(){
  this.dataset = new Dataset();
  this.view = {
    _prepared: false,
    _initialized: false,
    _rendered: false,
    _artifacts: { /* state bin */ },
    adapter: {
      library: undefined,
      chartOptions: {},
      chartType: undefined,
      defaultChartType: undefined,
      dataType: undefined
    },
    attributes: clone(Dataviz.defaults),
    defaults: clone(Dataviz.defaults),
    el: undefined,
    loader: { library: 'keen-io', chartType: 'spinner' }
  };
  Dataviz.visuals.push(this);
};

extend(Dataviz, {
  dataTypeMap: {
    'singular':          { library: 'keen-io', chartType: 'metric'      },
    'categorical':       { library: 'google',  chartType: 'piechart'    },
    'cat-interval':      { library: 'google',  chartType: 'columnchart' },
    'cat-ordinal':       { library: 'google',  chartType: 'barchart'    },
    'chronological':     { library: 'google',  chartType: 'areachart'   },
    'cat-chronological': { library: 'google',  chartType: 'linechart'   },
    'extraction':        { library: 'google',  chartType: 'table'       },
    'nominal':           { library: 'google',  chartType: 'table'       }
  },
  defaults: {
    colors: [
    /* teal      red        yellow     purple     orange     mint       blue       green      lavender */
    '#00bbde', '#fe6672', '#eeb058', '#8a8ad6', '#ff855c', '#00cfbb', '#5a9eed', '#73d483', '#c879bb',
    '#0099b6', '#d74d58', '#cb9141', '#6b6bb6', '#d86945', '#00aa99', '#4281c9', '#57b566', '#ac5c9e',
    '#27cceb', '#ff818b', '#f6bf71', '#9b9be1', '#ff9b79', '#26dfcd', '#73aff4', '#87e096', '#d88bcb'
    ],
    indexBy: 'timeframe.start',
    stacked: false
  },
  dependencies: {
    loading: 0,
    loaded: 0,
    urls: {}
  },
  libraries: {},
  visuals: []
});

Emitter(Dataviz);
Emitter(Dataviz.prototype);

Dataviz.register = function(name, methods, config){
  var self = this;
  var loadHandler = function(st) {
    st.loaded++;
    if(st.loaded === st.loading) {
      Keen.loaded = true;
      Keen.trigger('ready');
    }
  };

  Dataviz.libraries[name] = Dataviz.libraries[name] || {};

  // Add method to library hash
  each(methods, function(method, key){
    Dataviz.libraries[name][key] = method;
  });

  // Set default capabilities hash
  if (config && config.capabilities) {
    Dataviz.libraries[name]._defaults = Dataviz.libraries[name]._defaults || {};
    each(config.capabilities, function(typeSet, key){
      // store somewhere in library
      Dataviz.libraries[name]._defaults[key] = typeSet;
    });
  }

  // For all dependencies
  if (config && config.dependencies) {
    each(config.dependencies, function (dependency, index, collection) {
      var status = Dataviz.dependencies;
      // If it doesn't exist in the current dependencies being loaded
      if(!status.urls[dependency.url]) {
        status.urls[dependency.url] = true;
        status.loading++;
        var method = dependency.type === 'script' ? loadScript : loadStyle;

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
    });
  }
};

Dataviz.find = function(target){
  if (!arguments.length) return Dataviz.visuals;
  var el = target.nodeName ? target : document.querySelector(target),
      match;

  each(Dataviz.visuals, function(visual){
    if (el == visual.el()){
      match = visual;
      return false;
    }
  });
  if (match) return match;
};

module.exports = Dataviz;
