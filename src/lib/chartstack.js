/* jshint evil: true */
(function(root) {
  var previousChartstack = root.chartstack;
  var chartstack = root.chartstack = {};
  var adapters, charts, Chart, Events, transformers, isDomReady, readyCallbacks = [];

  // Placeholder for chartstack data adapters.
  chartstack.adapters = adapters = {};

  // Array of instantiated charts.
  chartstack.charts = charts = [];

  // Placeholder for transform data adapters.
  chartstack.transformers = transformers = {
    json : function(data){
      if (typeof data == 'string'){
        return JSON.parse(data);
      }else{
        return data;
      }
    }
  };

  // Defaults accessible from outside in case user wants to change them.
  // DOM properties override defaults.
  chartstack.defaults = extend({
    labels: true
  }, chartstack.defaults || {});


  // -----------------------------
  // Events class
  // -----------------------------
  // Extended by all classes that
  // require event listeners
  // -----------------------------

  Events = chartstack.Events = {

    on: function(name, callback) {
      this.listeners || (this.listeners = {});
      var events = this.listeners[name] || (this.listeners[name] = []);
      events.push({callback: callback});
      return this;
    },

    // once: function(name, callback) {},

    off: function(name, callback) {
      if (!name && !callback) {
        this.listeners = void 0;
        delete this.listeners;
        return this;
      }
      var events = this.listeners[name] || [];
      for (var i = events.length; i--;) {
        if (callback && callback == events[i].callback) {
          this.listeners[name].splice(i, 1);
        }
        if (!callback || events.length === 0) {
          this.listeners[name] = void 0;
          delete this.listeners[name];
        }
      }
      return this;
    },

    trigger: function(name) {
      if (!this.listeners) {
        return this;
      }
      var args = Array.prototype.slice.call(arguments, 1);
      var events = this.listeners[name] || [];
      for (var i = 0; i < events.length; i++) {
        events[i].callback.apply(this, args);
      }
      return this;
    }

  };
  extend(chartstack, Events);


  // -----------------------------
  // DataResource class
  // -----------------------------
  // This class is never directly
  // instantiated, but is managed
  // by the Dataset class
  // -----------------------------

  chartstack.DataResource = function(config){
    // Types: String (Data or URL), Object
    if (typeof config === "string") {
      if (config.match(/^({|\[)/)) {
        // Raw Data
        this.response = JSON.parse(config);
      } else {
        // URL + Params
        this.url = config;
      }
    } else {
      for (var option in config) {
        this[option] = config[option];
      }
    }
    this.state = 'initialized';
    this.configure();
  };

  chartstack.DataResource.prototype = {
    configure: function(){
      if (this.url !== void 0 && this.url.indexOf("?") !== -1 && this.params == void 0) {
        this.params = chartstack.parseParams(this.url);
        this.url = this.url.split("?")[0];
      }
      return this;
    },
    get: function(attribute){
      return this.params[attribute] || null;
    },
    set: function(attributes){
      for (var attribute in attributes) {
        this.params[attribute] = attributes[attribute];
      }
      return this;
    }
  };
  extend(chartstack.DataResource.prototype, Events);


  // -----------------------------
  // Dataset class
  // -----------------------------
  // This class instantiates and
  // manages instances of the
  // DataResource class
  // -----------------------------

  chartstack.Dataset = function(resource){
    var resources = [];
    if (resource instanceof Array) {
      each(resource, function(instance){
        resources.push(new chartstack.DataResource(instance));
      });
    } else {
      resources.push(new chartstack.DataResource(resource));
    }
    this.resources = resources;
    return;
  };

  chartstack.Dataset.prototype = {

    fetch: function(){
      var self = this, completions = 0;

      self.data = [];
      self.responses = [];

      var finish = function(response, index){
        self.resources[index].response = (is(response, 'string')) ? JSON.parse(response) : response;
        self.resources[index].state = 'synced';
        self.responses[index] = self.resources[index].response;
        completions++;
        if (completions == self.resources.length){
          self.transform();
        }
      };

      var error = function(){
        //console.log('error');
        return false;
      };

      each(self.resources, function(resource, index){

        if (resource.state == 'initialized' && resource.response !== void 0) {
          return finish(resource.response, index);

        } else if (resource.url) {
          var url = resource.url + buildQueryString(resource.params);
          var successSequencer = function(response){
            finish(response, index);
          };

          if (resource.state == 'initialized' && resource.response !== void 0) {
            //finish(resource.response, index);
          } else {
            chartstack.getAjax(url, successSequencer, error);
          }

          //chartstack.getAjax(url, successSequencer, error);
          //chartstack.getJSONP(url, successSequencer);

        } else {
          error();
        }
      });

      return self;
    },

    transform: function() {
      var self = this;
      each(self.resources, function(resource, index){
        var adapter = resource.adapter || 'default';
        var response = self.responses[index];
        if (adapter && chartstack.adapters[adapter]) {
          self.data[index] = chartstack.adapters[adapter].call(resource, response);
        } else {
          self.data[index] = response.data;
        }

      });
      self.trigger("complete", self.data[0]);
      return self;
    },

    at: function(index){
      //if (typeof index == "string") {
      //  return this.resources where
      //}
      return this.resources[index] || null;
    }

  };
  extend(chartstack.Dataset.prototype, Events);


  // -----------------------------
  // Visualization class
  // -----------------------------
  // This class is never directly
  // instantiated, but extended
  // by all library rendersets
  // -----------------------------

  chartstack.Visualization = function(config){
    var self = this;
    extend(self, config);

    self.chartOptions = self.chartOptions || {};
    self.height = self.height || chartstack.defaults.height;
    self.width = self.width || chartstack.defaults.width || self.el.offsetWidth;

    // Set default event handlers
    self.on("error", function(){
      visualErrorHandler.apply(this, arguments);
    });
    self.on("update", function(){
      self.update.apply(this, arguments);
    });


    // Let's kick it off!
    this.initialize();
  };

  chartstack.Visualization.prototype = {
    initialize: function(){
      // Sets listeners and prepares data
    },
    render: function(){
      // Builds artifacts
    },
    update: function(){
      // Optional: handles data updates
    },
    remove: function(){
      // Cleanup and DOM removal
    }
  };
  extend(chartstack.Visualization.prototype, Events);

  chartstack.libraries = {};

  chartstack.attributes = {
    data: ['adapter', 'dataset', 'dataformat', 'dateformat'],
    init: ['library'],
    masterVis: ['title', 'labels', 'height', 'width', 'colors'],
    customVis: []
  };

  chartstack.Visualization.register = function(name, methods, options){
    chartstack.libraries[name] = chartstack.libraries[name] || {};
    for (var method in methods) {
      chartstack.libraries[name][method] = methods[method];
    }
    if (options !== void 0 && options.attributes !== void 0) {
      each(options.attributes, function(attribute, index){
        if (chartstack.attributes.customVis.indexOf(attribute) == -1) {
          chartstack.attributes.customVis.push(options.attributes[index]);
        }
      });
    }
  };

  chartstack.Visualization.extend = function(protoProps, staticProps){
    var parent = this, Visualization;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Visualization = protoProps.constructor;
    } else {
      Visualization = function(){ return parent.apply(this, arguments); };
    }
    extend(Visualization, parent, staticProps);
    var Surrogate = function(){ this.constructor = Visualization; };
    Surrogate.prototype = parent.prototype;
    Visualization.prototype = new Surrogate();
    if (protoProps) {
      extend(Visualization.prototype, protoProps);
    }
    Visualization.__super__ = parent.prototype;
    return Visualization;
  };

  function visualErrorHandler(){
    console.log("Error!", arguments);
  }



  // -----------------------------
  // Chart class
  // -----------------------------
  // Primary class encompassing
  // every chartstack instance
  // -----------------------------

  chartstack.Chart = Chart = function(args) {
    var $chart = this,
    setupVis = { chartOptions: {} },
    setupData = {},
    options = args || {};

    // Add to internal array.
    chartstack.charts.push($chart);

    // Collects properties off DOM element and inspects data source.
    function setup(){
      var setupDom, setupJS, attrs = [];
      //var initAttributes, dataAttributes, visualAttributes;

      setupDom = function(){
        //$chart.el = args;
        setupVis.el = options;

        // Type of chart.
        options.chartType = setupVis.el.nodeName.toLocaleLowerCase();

        // Our made up HTML nodes are display: inline so we need to make
        // them block;
        setupVis.el.style.display = "block";
        setupVis.style = {
          display: "inline-block"
        };
      };

      setupJS = function(){
        //setupVis['el'] = options.el;
      };

      // Copy global defaults on to this chart.
      each(chartstack.defaults, function(k, v){
        setupVis[v] = k;
      });

      if ('nodeType' in options){
        setupDom();
      } else {
        setupJS();
      }

      // Find properties on dom element to override defaults.
      // Support arrays here so we can store the data under a different name.
      // TODO: These strings should be objects with support for defaults and other options.

      // Prev:
      // titleTextColor, legendColor, colors, pieSliceBorderColor,
      // pieSliceTextColor, backgroundColor, customOptions, formatRowLabel

      attrs = attrs.concat(chartstack.attributes.data);
      attrs = attrs.concat(chartstack.attributes.init);
      attrs = attrs.concat(chartstack.attributes.masterVis);
      attrs = attrs.concat(chartstack.attributes.customVis);

      each(attrs, function(attr){
        var test, newKey;

        if (is(attr, 'object')){
          newKey = attr[1];
          attr = attr[0];
        }
        test = options.nodeType ? options.getAttribute(attr) : options[attr];
        // If property exists, save it.
        if (test){
          // Support for real booleans.
          if (test == 'false' || test == '0' || test == 'off'){
            test = false;
          } else if (test == 'true' || test == '1' || test == "on"){
            test = true;
          }

          if (newKey){
            mapAttribute(newKey, test);
          } else {
            mapAttribute(attr, test);
          }
        }
      });

      function mapAttribute(key, val){
        var value = (typeof val === "string" && val.match(/^({|\[)/)) ? JSON.parse(val.replace(/'/g, "\"")) : val;
        if (chartstack.attributes.data.indexOf(key) !== -1) {
          setupData[key] = value;
        } else if (chartstack.attributes.init.indexOf(key) !== -1) {
          options[key] = value;
        } else if (chartstack.attributes.masterVis.indexOf(key) !== -1) {
          setupVis[key] = value;
        } else {
          setupVis.chartOptions[key] = value;
        }
      }

      // If we don't have a designated library...
      if (!options.library){
        if(options.chartType in chartstack.libraries[chartstack.library] || options.view instanceof chartstack.Visualization) {
          // Set global default if type matches
          options.library = chartstack.library;
        } else {
          // Select library with matching type
          each(chartstack.libraries, function(library, namespace){
            each(library, function(value, key){
              if (options.chartType == key) {
                options.library = namespace;
              }
            });
          });
        }
      }

      if (options.view instanceof chartstack.Visualization) {
        $chart.view = options.view;
      } else {
        $chart.view = new chartstack.libraries[options.library][options.chartType](setupVis);
      }


      // Check datasource starts with { or [ assume it's JSON or else
      // assume it's a URL to fetch.  We do not check for http anymore
      // as it can be a local/relative file.

      if (options.dataset instanceof chartstack.Dataset) {
        $chart.dataset = options.dataset;

      } else if (typeof options.dataset == 'string') {
        $chart.dataset = new chartstack.Dataset(options.dataset.replace(/(\r\n|\n|\r|\ )/g,""));
        $chart.dataset.resources[0].adapter = options.adapter || 'default';
        $chart.dataset.resources[0].dataformat = options.dataformat || 'json';
        $chart.dataset.resources[0].dateformat = options.dateformat || false;

      } else if (typeof setupData.dataset == 'string'){
        $chart.dataset = new chartstack.Dataset(setupData.dataset.replace(/(\r\n|\n|\r|\ )/g,""));
        $chart.dataset.resources[0].adapter = setupData.adapter || 'default';
        $chart.dataset.resources[0].dataformat = setupData.dataformat || 'json';
        $chart.dataset.resources[0].dateformat = setupData.dateformat || false;
      }

      $chart.dataset.on("complete", function(data){
        //console.log('data', this.data);
        $chart.view.data = this.data;
        $chart.view.trigger("update", data);
      });
      if (options.autoFetch || options.autoFetch == void 0) {
        $chart.dataset.fetch();
      }
      //
    }

    setup();

    $chart.on("download", function(){
      var c, svg = this.view.el.getElementsByTagName('svg');

      if (svg.length){
        svg = svg[0];
        c = new chartstack.Simg(svg);
        c.download();
      }
    });

    $chart.on("freeze", function(cb){
      var c, svg = this.view.el.getElementsByTagName('svg');
      cb = cb || function(){};

      if (svg.length){
        svg = svg[0];
        c = new chartstack.Simg(svg);
        c.replace(cb);
      }
    });

  };

  Chart.prototype = {
    show : function(){
      this.trigger('show');
      return this;
    },

    hide : function(){
      this.trigger('hide');
      return this;
    },

    draw: function(){
      this.trigger('draw');
      return this;
    },

    fetch : function(){
      this.dataset.fetch();
      //cb || (cb = function(){});
      //fetch(cb);
      return this;
    }

  };
  extend(Chart.prototype, Events);



  // -----------------------------
  // Private Methods
  // -----------------------------
  // Expose for plugin use
  // -----------------------------

  extend(chartstack, {
    is : is,
    each : each,
    extend : extend,
    bootstrap : bootstrap,
    loadScript : loadScript,
    noConflict : noConflict,
    ready: ready,
    get: get,
    addAdapter : addAdapter,
    parseDOM : parseDOM,
    parseParams: parseParams,
    buildQueryString: buildQueryString,
    getAjax : getAjax,
    getJSONP: getJSONP,
    registerLibrary: registerLibrary,
    // Attach event for every chart we have.
    on: function(){
      var args = arguments;
      each(this.charts, function(chart){
        chart.on.apply(chart, args);
      });
    },
    // Trigger event for every chart we have.
    trigger: function(){
      var args = arguments;
      each(this.charts, function(chart){
        chart.trigger.apply(chart, args);
      });
    }
  });


  // These three functions taken from:
  // https://github.com/spocke/punymce
  function is(o, t){
    o = typeof(o);
    if (!t){
      return o != 'undefined';
    }
    return o == t;
  }

  function each(o, cb, s){
    var n;
    if (!o){
      return 0;
    }
    s = !s ? o : s;
    if (is(o.length)){
      // Indexed arrays, needed for Safari
      for (n=0; n<o.length; n++) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    } else {
      // Hashtables
      for (n in o){
        if (o.hasOwnProperty(n)) {
          if (cb.call(s, o[n], n, o) === false){
            return 0;
          }
        }
      }
    }
    return 1;
  }

  // Extend object e on to o.
  function extend(o, e){
    each(e, function(v, n){
      o[n] = v;
    });
    return o;
  }

  function noConflict(){
    root.chartstack = previousChartstack;
    return this;
  }

  // DOM-ready queue method.
  function ready(cb){
    if (!isDomReady){
      readyCallbacks.push(cb);
    }else{
      cb();
    }
  }

/*
  function preBootstrap(){
    setTimeout(function(){
      //console.log('chartstack.libraries', chartstack.libraries);
    },0);
    // TODO: Hard-coded support for Google Analytics for now.
    // document.addEventListener("DOMContentLoaded", bootstrap);
  }
*/

  // Called when DOM and chart libs are loaded and ready.
  function bootstrap (){
    // If graph library isn't set in defaults, match provider to the first graph
    // lib found on the page that we have an adapter for.
    if (chartstack.defaults.library){
      chartstack.library = chartstack.defaults.library;
    } else {
      for (var namespace in chartstack.libraries) {
        if (namespace in window) {
          chartstack.library = namespace;
          break;
        }
      }
    }

    if (!chartstack.library){
      throw new Error('No charting library located.');
    }

    // Parse the dom.
    chartstack.parseDOM();
    isDomReady = true;

    // Bring moment.js into the mix
    chartstack.moment = root.moment || false;
    if (chartstack.moment) {
      chartstack.moment.suppressDeprecationWarnings = true;
    }

    each(readyCallbacks, function(cb){
      cb();
    });
  }

  // Returns a chartstack object by html element id or element comparison.
  function get(strOrEl){
    var el = strOrEl.nodeName ? strOrEl : document.querySelector(strOrEl);
    var matchedChart;

    if (el){
      each(chartstack.charts, function(chart){
        if (el == chart.view.el){
          matchedChart = chart;
          return false;
        }
      });
      return matchedChart;
    }
    throw("That element doesn't exist on the page.");
  }

  // Adapters that normalize 3rd party api to a standard format.
  function addAdapter(domain, configObj){
    if (chartstack.is(configObj, 'function')){
      //adapters.push({ name: domain, adapte: configObj }); // [domain] = configObj;
      adapters[domain] = configObj;
    }else{
      each(configObj, function(func, type){
        // If domain doesn't exist, create the namespace.
        if (!adapters[domain]){
          adapters[domain] = {};
        }
        adapters[domain][type] = func;

      });
    }
  }

  // Register library to viz and data components.
  function registerLibrary(obj){
    // Create new chart namespace.
    var namespace = chartstack[obj.name] = {};
    var vizCharts = {};

    // For each chart type add it to the namespace.
    each(obj.charts, function(chart){
      var chartLow = chart.type.toLowerCase();
      var obj = extend(chart.events,{
        type: chartLow
      });
      // Instantiate new visualization object per chart.
      namespace[chart.type] = chartstack.Visualization.extend(obj);
      // Queue chart types to create new Visualization.
      vizCharts[chartLow] = namespace[chart.type];
    });

    // Register Visualization.
    chartstack.Visualization.register(obj.namespace, vizCharts, {
      attributes: obj.attributes
    });

    // If loadLib method exists it is called to load the graphic library.
    // Must execute passed callback when the library is loaded.
    // If loadLib does not exist, we assume the user loaded the library before
    // chartstack.js already (most cases).
    if ('loadLib' in obj){
      namespace.loaded = false;
      obj.loadLib(function(){
        namespace.loaded = true;
        chartstack.bootstrap();
      });

    }else{
      namespace.loaded = true;
      console.log('namespace', namespace);
    }
  }

  function loadScript(url, cb) {
    var doc = document;
    var handler;
    var head = doc.head || doc.getElementsByTagName("head");

    // loading code borrowed directly from LABjs itself
    setTimeout(function () {
      // check if ref is still a live node list
      if ('item' in head) {
        // append_to node not yet ready
        if (!head[0]) {
          setTimeout(arguments.callee, 25);
          return;
        }
        // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
        head = head[0];
      }
      var script = doc.createElement("script"),
      scriptdone = false;
      script.onload = script.onreadystatechange = function () {
        if ((script.readyState && script.readyState !== "complete" && script.readyState !== "loaded") || scriptdone) {
          return false;
        }
        script.onload = script.onreadystatechange = null;
        scriptdone = true;
        cb();
      };
      script.src = url;
      head.insertBefore(script, head.firstChild);
    }, 0);

    // required: shim for FF <= 3.5 not having document.readyState
    if (doc.readyState === null && doc.addEventListener) {
      doc.readyState = "loading";
      doc.addEventListener("DOMContentLoaded", handler = function () {
        doc.removeEventListener("DOMContentLoaded", handler, false);
        doc.readyState = "complete";
      }, false);
    }
  }

  // Parse the DOM and search for valid charting elements to turn to classes.
  function parseDOM(){
    var registeredNodes = [], retrievedNodes;
    each(chartstack.libraries, function(library){
      for (var key in library){
        if (registeredNodes.indexOf(key) == -1) {
          registeredNodes.push(key);
        }
      }
    });
    retrievedNodes = document.querySelectorAll(registeredNodes.join(','));
    each(retrievedNodes, function(el){
      // Ensure data attribute exists.
      if (el.getAttribute('dataset')){
        new Chart(el);
      }
    });
  }

  function parseParams(str){
    // via http://stackoverflow.com/a/2880929/2511985
    var urlParams = {},
        match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = str.split("?")[1];

    while (!!(match=search.exec(query))) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  }

  function buildQueryString(params){
    var query = [];
    for (var key in params) {
      if (params[key]) {
        var value = params[key];
        if (Object.prototype.toString.call(value) !== '[object String]') {
          value = JSON.stringify(value);
        }
        value = encodeURIComponent(value);
        query.push(key + '=' + value);
      }
    }
    return "?" + query.join('&');
  }

  function getAjax(url, cb){
    var xhr;
    var createXHR = function(){
      var xhr;
      if (window.ActiveXObject){
        try{
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }catch(e){
          console.warn(e.message);
          xhr = null;
        }
      }else{
        xhr = new XMLHttpRequest();
      }
      return xhr;
    };

    xhr = createXHR();
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4){
        cb(xhr.responseText);
      }
    };
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
  }

  function getJSONP(url, success, error){
    var callbackName = "ChartstackJSONPCallback" + new Date().getTime();
    while (callbackName in window) {
      callbackName += "a";
    }
    var loaded = false;
    window[callbackName] = function (response) {
      loaded = true;
      if (success && response) {
        success(response);
      }
      // Remove this from the namespace
      window[callbackName] = undefined;
    };
    url = url + "&jsonp=" + callbackName;
    var script = document.createElement("script");
    script.id = "chartstack-jsonp";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
    // for early IE w/ no onerror event
    script.onreadystatechange = function() {
      if (loaded === false && this.readyState === "loaded") {
        loaded = true;
        if (error) {
          error();
        }
      }
    };
    // non-ie, etc
    script.onerror = function() {
      if (loaded === false) { // on IE9 both onerror and onreadystatechange are called
        loaded = true;
        if (error) {
          error();
        }
      }
    };
  }

  // preBootstrap();
})(this);

//! moment.js
//! version : 2.6.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.6.0",
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for language config files
        languages = {},

        // moment internal properties
        momentProperties = {
            _isAMomentObject: null,
            _i : null,
            _f : null,
            _l : null,
            _strict : null,
            _isUTC : null,
            _offset : null,  // optional. Combine with _isUTC
            _pf : null,
            _lang : null  // optional
        },

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        parseTokenOrdinal = /\d{1,2}/,

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        function printMsg() {
            if (moment.suppressDeprecationWarnings === false &&
                    typeof console !== 'undefined' && console.warn) {
                console.warn("Deprecation warning: " + msg);
            }
        }
        return extend(function () {
            if (firstTime) {
                printMsg();
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }

        if (b.hasOwnProperty("toString")) {
            a.toString = b.toString;
        }

        if (b.hasOwnProperty("valueOf")) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function cloneMoment(m) {
        var result = {}, i;
        for (i in m) {
            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                result[i] = m[i];
            }
        }

        return result;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return  Object.prototype.toString.call(input) === '[object Date]' ||
                input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (inputObject.hasOwnProperty(prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment.fn._lang[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
        Languages
    ************************************/


    extend(Language.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Remove a language from the `languages` cache. Mostly useful in tests.
    function unloadLang(key) {
        delete languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        var i = 0, j, lang, next, split,
            get = function (k) {
                if (!languages[k] && hasModule) {
                    try {
                        require('./lang/' + k);
                    } catch (e) { }
                }
                return languages[k];
            };

        if (!key) {
            return moment.fn._lang;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            lang = get(key);
            if (lang) {
                return lang;
            }
            key = [key];
        }

        //pick the language from the array
        //try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        //substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        while (i < key.length) {
            split = normalizeLanguage(key[i]).split('-');
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join('-'));
                if (lang) {
                    return lang;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {

        if (!m.isValid()) {
            return m.lang().invalidDate();
        }

        format = expandFormat(format, m.lang());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, lang) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) { return parseTokenOneDigit; }
            /* falls through */
        case 'SS':
            if (strict) { return parseTokenTwoDigits; }
            /* falls through */
        case 'SSS':
            if (strict) { return parseTokenThreeDigits; }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return getLangDefinition(config._l)._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return parseTokenOrdinal;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(input, 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gg':
        case 'gggg':
        case 'GG':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = input;
            }
            break;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate,
            yearToUse, fixYear, w, temp, lang, weekday, week;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            fixYear = function (val) {
                var intVal = parseInt(val, 10);
                return val ?
                  (val.length < 3 ? (intVal > 68 ? 1900 + intVal : 2000 + intVal) : intVal) :
                  (config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR]);
            };

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
            }
            else {
                lang = getLangDefinition(config._l);
                weekday = w.d != null ?  parseWeekday(w.d, lang) :
                  (w.e != null ?  parseInt(w.e, 10) + lang._week.dow : 0);

                week = parseInt(w.w, 10) || 1;

                //if we're parsing 'd', then the low day numbers may be next week
                if (w.d != null && weekday < lang._week.dow) {
                    week++;
                }

                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
            }

            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[HOUR] += toInt((config._tzm || 0) / 60);
        input[MINUTE] += toInt((config._tzm || 0) % 60);

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var lang = getLangDefinition(config._l),
            string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function makeDateFromString(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be "T" or undefined
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += "Z";
            }
            makeDateFromStringAndFormat(config);
        }
        else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, language) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = language.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = cloneMoment(input);

            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
            "moment construction falls back to js Date. This is " +
            "discouraged and will be removed in upcoming major " +
            "release. Please refer to " +
            "https://github.com/moment/moment/issues/1407 for more info.",
            function (config) {
        config._d = new Date(config._i);
    });

    // creating with utc
    moment.utc = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var r;
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(normalizeLanguage(key), values);
        } else if (values === null) {
            unloadLang(key);
            key = 'en';
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null &&  obj.hasOwnProperty('_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {

            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function () {
            return this.zone(0);
        },

        local : function () {
            this.zone(0);
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var sod = makeAs(moment(), this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.lang());
                return this.add({ d : input - day });
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf: function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add((units === 'isoWeek' ? 'week' : units), 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = units || 'ms';
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },

        min: function (other) {
            other = moment.apply(null, arguments);
            return other < this ? this : other;
        },

        max: function (other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },

        // keepTime = true means only change the timezone, without affecting
        // the local hour. So 5:31:26 +0300 --[zone(2, true)]--> 5:31:26 +0200
        // It is possible that 5:31:26 doesn't exist int zone +0200, so we
        // adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepTime) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    if (!keepTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? "UTC" : "";
        },

        zoneName : function () {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", (input - year));
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", (input - year));
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this._lang._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.lang().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate("dates accessor is deprecated. Use date instead.", makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate("years accessor is deprecated. Use year instead.", makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);
            data.days = days % 30;

            months += absRound(days / 30);
            data.months = months % 12;

            years = absRound(months / 12);
            data.years = years;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            units = normalizeUnits(units);
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
        },

        lang : moment.fn.lang,

        toIsoString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        }
    });

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function () {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LANGUAGES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    "Accessing Moment through the global scope is " +
                    "deprecated, and will be removed in an upcoming " +
                    "release.",
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === "function" && define.amd) {
        define("moment", function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

// Source: src/lib/_intro.js
!function (name, context, definition) {

  if (typeof module != 'undefined' && module.exports) {
    module.exports = definition();
  }
  else if (typeof define == 'function' && define.amd) {
    define(definition);
  }
  else {
    context[name] = definition();
  }

}('Dataform', chartstack, function() {
  'use strict';

// Source: src/dataform.js
  /*!
    * ----------------
    * Dataform.js
    * ----------------
    */

  function Dataform(raw, schema) {
    this.configure(raw, schema);
  }

  Dataform.prototype.configure = function(raw, schema){
    var self = this, options;

    self.raw = self.raw || raw,
    self.schema = self.schema || schema || {},
    self.table = [[]];

    if (self.schema.collection && is(self.schema.collection, 'string') == false) {
      throw new Error('schema.collection must be a string');
    }

    if (self.schema.unpack && self.schema.select) {
      throw new Error('schema.unpack and schema.select cannot be used together');
    }

    if (self.schema.unpack) {
      this.action = 'unpack';
      options = extend({
        collection: "",
        unpack: {
          index: false,
          value: false,
          label: false
        }
      }, self.schema);
      options = _optHash(options);
      _unpack.call(this, options);
    }

    if (self.schema.select) {
      this.action = 'select';
      options = extend({
        collection: "",
        select: true
      }, self.schema);
      options = _optHash(options);
      _select.call(this, options);
    }

    return this;
  };



  // Select
  // --------------------------------------

  function _select(options){
    //console.log('Selecting', options);

    var self = this,
        target_set = [],
        unique_keys = [];

    var root = (function(){
      var root, parsed;
      if (options.collection == "") {
        root = self.raw;
      } else {
        parsed = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
        root = parsed[0];
      }
      if (Object.prototype.toString.call(root) !== '[object Array]') {
        root = [root];
      }
      return root;
    })();

    each(options.select, function(property, i){
      target_set.push(property.path.split(" -> "));
    });

    // Retrieve keys found in asymmetrical collections
    if (target_set.length == 0) {
      each(root, function(record, interval){
        var flat = flatten(record);
        for (var key in flat) {
          if (flat.hasOwnProperty(key) && unique_keys.indexOf(key) == -1) {
            unique_keys.push(key);
            target_set.push([key]);
          }
        }
      });
    }

    // Parse each record
    each(root, function(record, interval){
      var flat = flatten(record);
      self.table.push([]);
      each(target_set, function(target, i){
        var flat_target = target.join(".");
        if (interval == 0) {
          self.table[0].push(flat_target);
        }
        self.table[interval+1].push(flat[flat_target] || null)
      });
    });

    self.format(options.select);
    self.sort(options.sort);
    return self;
  }



  // Unpack
  // --------------------------------------

  function _unpack(options){
    // console.log('Unpacking', options);
    var self = this;

    var value_set = (options.unpack.value) ? options.unpack.value.path.split(" -> ") : false,
        label_set = (options.unpack.label) ? options.unpack.label.path.split(" -> ") : false,
        index_set = (options.unpack.index) ? options.unpack.index.path.split(" -> ") : false;
    //console.log(index_set, label_set, value_set);

    var value_desc = (value_set[value_set.length-1] !== "") ? value_set[value_set.length-1] : "Value",
        label_desc = (label_set[label_set.length-1] !== "") ? label_set[label_set.length-1] : "Label",
        index_desc = (index_set[index_set.length-1] !== "") ? index_set[index_set.length-1] : "Index";

    var sort_index = (options.sort && options.sort.index) ? options.sort.index : false,
        sort_value = (options.sort && options.sort.value) ? options.sort.value : false;

    // Prepare root for parsing
    var root = (function(){
      var root;
      if (options.collection == "") {
        root = [self.raw];
      } else {
        root = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
      }
      return root[0];
    })();

    if (root instanceof Array == false) {
      root = [root];
    }

    // Inject data rows
    each(root, function(){
      //self.table.push([]);
    });

    // Parse each record
    each(root, function(record, interval){
      //console.log('record', record);

      var plucked_value = (value_set) ? parse.apply(self, [record].concat(value_set)) : false,
          plucked_label = (label_set) ? parse.apply(self, [record].concat(label_set)) : false,
          plucked_index = (index_set) ? parse.apply(self, [record].concat(index_set)) : false;
      //console.log(plucked_index, plucked_label, plucked_value);

      // Inject row for each index
      if (plucked_index) {
        each(plucked_index, function(){
          self.table.push([]);
        });
      } else {
        self.table.push([]);
      }

      // Build index column
      if (plucked_index) {

        // Build index/label on first interval
        if (interval == 0) {

          // Push last index property to 0,0
          self.table[0].push(index_desc);

          // Build subsequent series headers (1:N)
          if (plucked_label) {
            each(plucked_label, function(value, i){
              self.table[0].push(value);
            });

          } else {
            self.table[0].push(value_desc);
          }
        }

        // Correct for odd root cases
        if (root.length < self.table.length-1) {
          if (interval == 0) {
            each(self.table, function(row, i){
              if (i > 0) {
                self.table[i].push(plucked_index[i-1]);
              }
            });
          }
        } else {
          self.table[interval+1].push(plucked_index[0]);
        }
      }

      // Build label column
      if (!plucked_index && plucked_label) {
        if (interval == 0) {
          self.table[0].push(label_desc);
          self.table[0].push(value_desc);
        }
        self.table[interval+1].push(plucked_label[0]);
      }

      if (!plucked_index && !plucked_label) {
        // [REVISIT]
        self.table[0].push('');
      }

      // Append values
      if (plucked_value) {
        // Correct for odd root cases
        if (root.length < self.table.length-1) {
          if (interval == 0) {
            each(self.table, function(row, i){
              if (i > 0) {
                self.table[i].push(plucked_value[i-1]);
              }
            });
          }
        } else {
          each(plucked_value, function(value){
            self.table[interval+1].push(value);
          });
        }
      }

    });

    self.format(options.unpack);
    self.sort(options.sort);
    return this;
  }



  // String configs to hash paths
  // --------------------------------------

  function _optHash(options){
    each(options.unpack, function(value, key, object){
      if (value && is(value, 'string')) {
        options.unpack[key] = { path: options.unpack[key] };
      }
    });
    return options;
  }



  // ♫♩♬ Holy Diver! ♬♩♫
  // --------------------------------------

  function parse() {
    var result = [];
    var loop = function() {
      var root = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var target = args.pop();

      if (args.length === 0) {
        if (root instanceof Array) {
          args = root;
        } else if (typeof root === 'object') {
          args.push(root);
        }
      }

      each(args, function(el){

        // Grab the numbers and nulls
        if (target == "") {
          if (typeof el == "number" || el == null) {
            return result.push(el);
          }
        }

        if (el[target] || el[target] === 0 || el[target] !== void 0) {
          // Easy grab!
          if (el[target] === null) {
            return result.push('');
          } else {
            return result.push(el[target]);
          }

        } else if (root[el]){
          if (root[el] instanceof Array) {
            // dive through each array item

            each(root[el], function(n, i) {
              var splinter = [root[el]].concat(root[el][i]).concat(args.slice(1)).concat(target);
              return loop.apply(this, splinter);
            });

          } else {
            if (root[el][target]) {
              // grab it!
              return result.push(root[el][target]);

            } else {
              // dive down a level!
              return loop.apply(this, [root[el]].concat(args.splice(1)).concat(target));

            }
          }

        } else {
          // dive down a level!
          return loop.apply(this, [el].concat(args.splice(1)).concat(target));

        }

        return;

      });
      if (result.length > 0) {
        return result;
      }
    };
    return loop.apply(this, arguments);
  }

  // Utilities
  // --------------------------------------

  // Awesomeness in code form, by Will Rayner (penguinboy)
  // https://gist.github.com/penguinboy/762197
  function flatten(ob) {
    var toReturn = {};
    for (var i in ob) {
      if (!ob.hasOwnProperty(i)) continue;
      if ((typeof ob[i]) == 'object') {
        var flatObject = flatten(ob[i]);
        for (var x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          toReturn[i + '.' + x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }

  // via: https://github.com/spocke/punymce
  function is(o, t){
    o = typeof(o);
    if (!t){
      return o != 'undefined';
    }
    return o == t;
  }

  function each(o, cb, s){
    var n;
    if (!o){
      return 0;
    }
    s = !s ? o : s;
    if (is(o.length)){
      // Indexed arrays, needed for Safari
      for (n=0; n<o.length; n++) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    } else {
      // Hashtables
      for (n in o){
        if (o.hasOwnProperty(n)) {
          if (cb.call(s, o[n], n, o) === false){
            return 0;
          }
        }
      }
    }
    return 1;
  }

  // Adapted to exclude null values
  function extend(o, e){
    each(e, function(v, n){
      if (is(o[n], 'object') && is(v, 'object')){
        o[n] = extend(o[n], v);
      } else if (v !== null) {
        o[n] = v;
      }
    });
    return o;
  }

  extend(Dataform, {
    each: each,
    extend: extend,
    is: is,
    flatten: flatten
  });


  // Configure moment.js if present
  if (moment) {
    moment.suppressDeprecationWarnings = true;
  }

// Source: src/lib/format.js
Dataform.prototype.format = function(opts){
  var self = this, options;

    var defaults = {
      'number': {
        format: '0', // 1,000.00
        prefix: '',
        suffix: ''
        //modifier: '*1'
      },
      'date': {
        //format: 'MMM DD, YYYY'
      },
      'string': {
        //format: 'capitalize',
        prefix: '',
        suffix: ''
      }
    };

    if (self.action == 'select') {
      options = [];
      each(opts, function(option){
        var copy = {}, output;
        each(defaults, function(hash, key){
          copy[key] = extend({}, hash);
        });
        output = (copy[option.type]) ? extend(copy[option.type], option) : option;
        options.push(output);
      });

      each(self.table, function(row, i){

        // Replace labels
        if (i == 0) {
          each(row, function(cell, j){
            if (options[j] && options[j].label) {
              self.table[i][j] = options[j].label;
            }
          });

        } else {

          each(row, function(cell, j){
            self.table[i][j] = _applyFormat(self.table[i][j], options[j]);
          });
        }

      });

    }


  //////////////////////////////////


  if (self.action == 'unpack') {
    options = {};
    each(opts, function(option, key){
      var copy = {}, output;
      each(defaults, function(hash, key){
        copy[key] = extend({}, hash);
      });
      options[key] = (copy[key]) ? extend(copy[key], option) : option;
    });

    if (options.index) {
      each(self.table, function(row, i){
        if (i == 0) {
          if (options.index.label) {
            self.table[i][0] = options.index.label;
          }
        } else {
          self.table[i][0] = _applyFormat(self.table[i][0], options.index);
        }
      });
    }

    if (options.label) {
      if (options.index) {
        each(self.table, function(row, i){
          each(row, function(cell, j){
            if (i == 0 && j > 0) {
              self.table[i][j] = _applyFormat(self.table[i][j], options.label);
            }
          });
        });
      } else {
        each(self.table, function(row, i){
          if (i > 0) {
            self.table[i][0] = _applyFormat(self.table[i][0], options.label);
          }
        });
        //console.log('label, NO index');
      }
    }

    if (options.value) {
      if (options.index) {
        // start > 0
        each(self.table, function(row, i){
          each(row, function(cell, j){
            if (i > 0 && j > 0) {
              self.table[i][j] = _applyFormat(self.table[i][j], options.value);
            }
          });
        });
      } else {
        // start @ 0
        each(self.table, function(row, i){
          each(row, function(cell, j){
            if (i > 0) {
              self.table[i][j] = _applyFormat(self.table[i][j], options.value);
            }
          });
        });
      }
    }

  }

  //console.log(self.table);
  return self;
};

function _applyFormat(value, opts){
  var output = value,
      options = opts || {};

  if (options.method) {
    var copy = output;
    try {
      output = eval(options.method).apply(null, [output, options]);
    }
    catch (e) {
      output = copy;
    }
  }

  if (options.replace) {
    each(options.replace, function(value, key){
      if (output == key || String(output) == String(key) || parseFloat(output) == parseFloat(key)) {
        output = value;
      }
    });
  }

  if (options.type && options.type == 'date') {

    if (options.format && moment && moment(value).isValid()) {
      output = moment(value).format(options.format);
    } else {
      output = new Date(value); //.toISOString();
    }

  }

  if (options.type && options.type == 'string') {

    if (options.format) {
      switch (options.format) {
        case 'capitalize':
          // via: http://stackoverflow.com/a/15150510/2511985
          output = output.replace(/[^\s]+/g, function(word) {
            return word.replace(/^./, function(first) {
              return first.toUpperCase();
            });
          });
          break;
        case 'uppercase':
          output = output.toUpperCase();
          break;
        case 'lowercase':
          output = output.toLowerCase();
          break;
      }
    }

  }

  if (options.type && options.type == 'number') {

    if (options.format && !isNaN(parseFloat(output))) {

      output = parseFloat(output);

      // Set decimals
      if (options.format.indexOf('.') !== -1) {
        output = (function(num){
          var chop = options.format.split('.');
          var length = chop[chop.length-1].length;
          return num.toFixed(length);
        })(output);
      }

      // Set commas
      if (options.format.indexOf(',') !== -1) {
        output = (function(num){
          var split = String(num).split(".");
          while (/(\d+)(\d{3})/.test(split[0])){
            split[0] = split[0].replace(/(\d+)(\d{3})/, '$1'+','+'$2');
          }
          return split.join(".");
        })(output);
      }

    }
  }

  if (options.prefix) {
    output = String(options.prefix) + output;
  }

  if (options.suffix) {
    output = output + String(options.suffix);
  }

  return output;
}

// dataform.format(index, options);

// Source: src/lib/sort.js
Dataform.prototype.sort = function(opts){
  var self = this, options;

  if (self.action == 'unpack') {

    options = extend({
      index: false,
      value: false
    }, opts);

    // Sort records by index
    if (options.index) {
      !function(){
        var header = self.table[0],
            body = self.table.splice(1);

        body.sort(function(a, b) {
          if (options.index == 'asc') {
            if (a[0] > b[0]) {
              return 1;
            } else {
              return -1
            }
          } else if (options.index == 'desc') {
            if (a[0] > b[0]) {
              return -1;
            } else {
              return 1
            }
          }
          return false;
        });

        self.table = [header].concat(body);
      }();
    }

    // Sort columns (labels) by total values
    if (options.value && self.schema.unpack.label && self.table[0].length > 2) {
      !function(){
        var header = self.table[0],
            body = self.table.splice(1),
            series = [],
            table = [],
            index_cell = (self.schema.unpack.index) ? 0 : -1;

        each(header, function(cell, i){
          if (i > index_cell) {
            series.push({ label: cell, values: [], total: 0 });
          }
        });

        each(body, function(row, i){
          each(row, function(cell, j){
            if (j > index_cell) {
              if (is(cell, 'number')) {
                series[j-1].total += cell;
              }
              series[j-1].values.push(cell);
            }
          });
        });

        if (self.schema.unpack.label.type == 'number' || is(body[0][1], 'number')) {
          series.sort(function(a, b) {
            //console.log(options, self.schema, options.value, a.total, b.total);
            if (options.value == 'asc') {
              if (a.total > b.total) {
                return 1;
              } else {
                return -1
              }
            } else if (options.value == 'desc') {
              if (a.total > b.total) {
                return -1;
              } else {
                return 1
              }
            }
            return false;
          });
        }

        each(series, function(column, i){
          header[index_cell+1+i] = series[i].label;
          each(body, function(row, j){
            row[index_cell+1+i] = series[i].values[j];
          });
        });

        self.table = [header].concat(body);

      }();
    }
  }

  if (self.action == 'select') {

    options = extend({
      column: 0,
      order: false
    }, opts);

    !function(){
      var header = self.table[0],
          body = self.table.splice(1);

      body.sort(function(a, b){
        //console.log(a[options.column], b[options.column]);
        if (options.order == 'asc') {
          if (a[options.column] > b[options.column]) {
            return 1;
          } else {
            return -1
          }
        } else if (options.order == 'desc') {
          if (a[options.column] > b[options.column]) {
            return -1;
          } else {
            return 1
          }
        }
        return false;
      });

      self.table = [header].concat(body);

    }();
  }

  return self;
};

// Source: src/lib/_outro.js
  return Dataform;
});

/* global chartstack */
// Data normalizing adaper for keen.io API.
(function(cs){
  var each = cs.each;

  cs.addAdapter('keen-io', function(response){
    var self = this, data;
    var schema = self.schema || false;

    // Default Response Map
    if (!schema) {

      schema = {
        collection: "result",
        unpack: {}
      };

      if (response.result instanceof Array) {

        if (response.result.length > 0 && response.result[0]['value'] !== void 0){

          if (response.result[0]['value'] instanceof Array) {
            // Interval + Group_by

            // Get value (interval result)
            schema.unpack.value = "value -> result";

            // Get label (group_by field)
            for (var key in response.result[0]['value'][0]){
              if (key !== "result") {
                schema.unpack.label = "value -> " + key;
                break;
              }
            }

          } else {
            // Interval, no Group_by
            // Get value
            schema.unpack.value = "value";
          }
        }

        if (response.result.length > 0 && response.result[0]['timeframe']) {
          // Get index (start time)
          schema.unpack.index = {
            path: "timeframe -> start",
            type: "date",
            //format: "MMM DD"
            method: "moment"
          };
        }

        if (response.result.length > 0 && response.result[0]['result']) {
          // Get value (group_by)
          schema.unpack.value = "result";
          for (var key in response.result[0]){
            if (key !== "result") {
              schema.unpack.index = key;
              break;
            }
          }
        }

        if (response.result.length > 0 && typeof response.result[0] == "number") {
          schema.collection = "";
          schema.unpack.index = "steps -> event_collection";
          schema.unpack.value = "result -> ";
        }

        if (response.result.length == 0) {
          schema = false;
          //data
        }


      } else {
        // Metric: { result: 2450 } -> [['result'],[2450]]
        delete schema.unpack;
        schema = {
          collection: "",
          select: [
            {
              path: "result",
              type: "number",
              label: "Metric",
              format: "1,000"
            }
          ]
        }
      }

    }

    if (schema) {
      data = new cs.Dataform(response, schema);
    } else {
      data = { table: [] };
    }

    return data;
  });

})(chartstack);

/* global google, chartstack */
(function(cs){
  var each = cs.each;
  var extend = cs.extend;

  // -----------------------------
  // Library Namespace
  // -----------------------------

  cs.Keen = cs.Keen || {};

  // -----------------------------
  // Type: Number
  // -----------------------------

  cs.Keen.Metric = cs.Visualization.extend({
    initialize: function(){
      var css = document.createElement("style");
      css.type = "text/css";
      css.innerHTML = ".cs-widget { \
          background: #49c5b1; \
          border-radius: 4px; \
          color: #fff; \
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; \
          padding: 10px 0; \
          text-align: center; \
        } \
        .cs-widget-title { \
          display: block; \
          font-size: 84px; \
          font-weight: 700; \
          line-height: 84px; \
        } \
        .cs-widget-subtitle { \
          display: block; \
          font-size: 24px; \
          font-weight: 200; \
        }";
        // margin: 0 auto; \
      document.body.appendChild(css);

      this.render();
    },
    //render: function(){},
    update: function(){
      this.el.innerHTML = '' +
        '<div class="cs-widget cs-number" style="width:' + parseInt(this.width) + 'px;">' +
          '<span class="cs-widget-title">' + this.data[0].table[1] + '</span>' +
          '<span class="cs-widget-subtitle">' + (this.title || 'Result') + '</span>' +
        '</div>';
    }
  });


  // -----------------------------
  // Register Methods
  // -----------------------------

  cs.Visualization.register("keen-io", {
    "metric": cs.Keen.Metric
  });

})(chartstack);

/* global google, chartstack */
(function(cs){
  cs.registerLibrary({
    name: 'GoogleCharts',
    namespace: 'google',
    attributes: ['animation', 'backgroundColor', 'bar', 'chartArea', 'fontName', 'fontSize', 'isStacked', 'hAxis', 'legend', 'orientation', 'titleTextStyle', 'tooltip', 'vAxis'],
    // If loadLib exists it is called to load the graphic library.
    // Must execute passed callback when the library is loaded.
    // If loadLib does not exist, we assume the user loaded the library before
    // chartstack.js already (most cases).
    loadLib: function(cb){
      cs.googleLoaded = function(){
        cb();
        delete cs.googleLoaded;
      }
      document.write('\x3Cscript type="text/javascript" src="https://www.google.com/jsapi?autoload=' + encodeURIComponent('{"modules":[{"name":"visualization","version":"1","packages":["corechart","table"],callback: chartstack.googleLoaded}]}') + '">\x3C/script>');
    },
    charts: [{
      type : 'AreaChart',
      events: {
        initialize: function(){
          //this.trigger('error', 'testing pie errors');
          this.render();
        },
        render: function(){
          this._chart = this._chart || new google.visualization.AreaChart(this.el);
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data[0].table);
          var options = cs.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width)
          });
          this._chart.draw(data, options);
        }
      }
    }, {
      type : 'BarChart',
      events: {
        initialize: function(){
          //console.log('bar!', this);
          this.render();
        },
        render: function(){
          this._chart = this._chart || new google.visualization.BarChart(this.el);
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data[0].table);
          var options = cs.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width)
          });
          this._chart.draw(data, options);
        }
      }
    }, {
      type : 'ColumnChart',
      events: {
        initialize: function(){
          //console.log('bar!', this);
          this.render();
        },
        render: function(){
          this._chart = this._chart || new google.visualization.ColumnChart(this.el);
          //this.chart.draw(data, options);
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data[0].table);
          var options = cs.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width)
          });
          this._chart.draw(data, options);
        }
      }
    }, {
      type : 'LineChart',
      events: {
        initialize: function(){
          this.render();
        },
        render: function(){
          this._chart = this._chart || new google.visualization.LineChart(this.el);
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data[0].table);
          var options = cs.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width)
          });
          this._chart.draw(data, options);
        }
      }
    }, {
      type : 'PieChart',
      events: {
        initialize: function(){
          this.render();
        },
        render: function(){
          this._chart = this._chart || new google.visualization.PieChart(this.el);
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data[0].table);
          var options = cs.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width)
          });
          this._chart.draw(data, options);
        }
      }
    }, {
      type : 'DataTable',
      events: {
        initialize: function(){
          this.render();
        },
        render: function(){
          this._chart = this._chart || new google.visualization.Table(this.el);
          //this.chart.draw(data, options);
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data[0].table);
          var options = cs.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width)
          });
          this._chart.draw(data, options);
        }
      }
    }]
  });

})(chartstack);

(function(root){
  var previousSimg = root.Simg;
  var Simg = root.Simg = function(svg){
    this.svg = svg;
  };

  Simg.noConflict = function(){
    root.Simg = previousSimg;
    return this;
  };

  Simg.getBase64Image = function(img) {
    // From: http://stackoverflow.com/questions/934012/get-image-data-in-javascript
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  };

  Simg.prototype = {
    // Return SVG text.
    toString: function(svg){
      if (!svg){
        throw new Error('.toString: No SVG found.');
      }

      [
        ['version', 1.1],
        ['xmlns', "http://www.w3.org/2000/svg"],
      ].forEach(function(item){
        svg.setAttribute(item[0], item[1]);
      });
      return svg.parentNode.innerHTML;
    },

    // Return canvas with this SVG drawn inside.
    toCanvas: function(cb){
      this.toSvgImage(function(img){
        var canvas = document.createElement('canvas');
        var context = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);
        cb(canvas);
      });
    },

    toSvgImage: function(cb){
      var str = this.toString(this.svg);
      var img = document.createElement('img');

      if (cb){
        img.onload = function(){
          cb(img);
        };
      }

      // Make the new img's source an SVG image.
      img.setAttribute('src', 'data:image/svg+xml;base64,'+ btoa(str));
    },

    // Returns callback to new img from SVG.
    // Call with no arguments to return svg image element.
    // Call with callback to return png image element.
    toImg: function(cb){
      this.toCanvas(function(canvas){
        var canvasData = canvas.toDataURL("image/png");
        var img = document.createElement('img');

        img.onload = function(){
          cb(img);
        };

        // Make pngImg's source the canvas data.
        img.setAttribute('src', canvasData);
      });
    },

    // Replace SVG with PNG img.
    replace: function(cb){
      var self = this;
      this.toImg(function(img){
        var parentNode = self.svg.parentNode;
        parentNode.replaceChild(img, self.svg);
        if (cb){
          cb();
        }
      });
    },

    // Converts canvas to binary blob.
    toBinaryBlob: function(cb){
      this.toCanvas(function(canvas){
        var dataUrl = canvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, "");
        var byteString = atob(dataUrl);
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        var dataView = new DataView(ab);
        var blob = new Blob([dataView], {type: "image/png"});
        cb(blob);
      });
    },

    // Trigger download of image.
    download: function(){
      this.toImg(function(img){
        var a = document.createElement("a");
        a.download = "chart.png";
        a.href = img.getAttribute('src');
        a.click();
      });
    }
  };
})(this);

chartstack.Simg = Simg.noConflict();
