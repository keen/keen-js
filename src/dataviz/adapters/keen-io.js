/*!
* ----------------------
* Keen IO Adapter
* ----------------------
*/

var Keen = require("../../core"),
    Dataviz = require("../dataviz");

var clone = require("../../core/utils/clone"),
    each = require("../../core/utils/each"),
    extend = require("../../core/utils/extend"),
    prettyNumber = require("../utils/prettyNumber");

module.exports = function(){
  // (function(lib){
  // var Keen = lib || {},
  var Metric, Error, Spinner;

  Keen.Error = {
    defaults: {
      backgroundColor : "",
      borderRadius    : "4px",
      color           : "#ccc",
      display         : "block",
      fontFamily      : "Helvetica Neue, Helvetica, Arial, sans-serif",
      fontSize        : "21px",
      fontWeight      : "light",
      textAlign       : "center"
    }
  };

  Keen.Spinner.defaults = {
    height: 138,                  // Used if no height is provided
    lines: 10,                    // The number of lines to draw
    length: 8,                    // The length of each line
    width: 3,                     // The line thickness
    radius: 10,                   // The radius of the inner circle
    corners: 1,                   // Corner roundness (0..1)
    rotate: 0,                    // The rotation offset
    direction: 1,                 // 1: clockwise, -1: counterclockwise
    color: '#4d4d4d',             // #rgb or #rrggbb or array of colors
    speed: 1.67,                  // Rounds per second
    trail: 60,                    // Afterglow percentage
    shadow: false,                // Whether to render a shadow
    hwaccel: false,               // Whether to use hardware acceleration
    className: 'keen-spinner',    // The CSS class to assign to the spinner
    zIndex: 2e9,                  // The z-index (defaults to 2000000000)
    top: '50%',                   // Top position relative to parent
    left: '50%'                   // Left position relative to parent
  };

  var dataTypes = {
    'singular': ['metric']
  };

  Metric = {
    initialize: function(){
      var css = document.createElement("style"),
          bgDefault = "#49c5b1";

      css.id = "keen-widgets";
      css.type = "text/css";
      css.innerHTML = "\
  .keen-metric { \n  background: " + bgDefault + "; \n  border-radius: 4px; \n  color: #fff; \n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; \n  padding: 10px 0; \n  text-align: center; \n} \
  .keen-metric-value { \n  display: block; \n  font-size: 84px; \n  font-weight: 700; \n  line-height: 84px; \n} \
  .keen-metric-title { \n  display: block; \n  font-size: 24px; \n  font-weight: 200; \n}";
      if (!document.getElementById(css.id)) {
        document.body.appendChild(css);
      }
    },

    render: function(){
      var bgColor = (this.colors().length == 1) ? this.colors()[0] : "#49c5b1",
          title = this.title() || "Result",
          value = this.data()[1][1] || 0,
          width = this.width(),
          opts = this.chartOptions() || {},
          prefix = "",
          suffix = "";

      var styles = {
        'width': (width) ? width + 'px' : 'auto'
      };

      var formattedNum = value;
      if ( typeof opts.prettyNumber === 'undefined' || opts.prettyNumber == true ) {
        if ( !isNaN(parseInt(value)) ) {
          formattedNum = prettyNumber(value);
        }
      }

      if (opts['prefix']) {
        prefix = '<span class="keen-metric-prefix">' + opts['prefix'] + '</span>';
      }
      if (opts['suffix']) {
        suffix = '<span class="keen-metric-suffix">' + opts['suffix'] + '</span>';
      }

      this.el().innerHTML = '' +
        '<div class="keen-widget keen-metric" style="background-color: ' + bgColor + '; width:' + styles.width + ';" title="' + value + '">' +
          '<span class="keen-metric-value">' + prefix + formattedNum + suffix + '</span>' +
          '<span class="keen-metric-title">' + title + '</span>' +
        '</div>';
    }
  };

  Error = {
    initialize: function(){},
    render: function(text, style){
      var err, msg;

      var defaultStyle = clone(Keen.Error.defaults);
      var currentStyle = extend(defaultStyle, style);

      err = document.createElement("div");
      err.className = "keen-error";
      each(currentStyle, function(value, key){
        err.style[key] = value;
      });
      err.style.height = String(this.height() + "px");
      err.style.paddingTop = (this.height() / 2 - 15) + "px";
      err.style.width = String(this.width() + "px");

      msg = document.createElement("span");
      msg.innerHTML = text || "Yikes! An error occurred!";

      err.appendChild(msg);

      this.el().innerHTML = "";
      this.el().appendChild(err);
    },
    destroy: function(){
      this.el().innerHTML = "";
    }
  };

  Spinner = {
    initialize: function(){},
    render: function(){
      var spinner = document.createElement("div");
      var height = this.height() || Keen.Spinner.defaults.height;
      spinner.className = "keen-loading";
      spinner.style.height = String(height + "px");
      spinner.style.position = "relative";
      spinner.style.width = String(this.width() + "px");

      this.el().innerHTML = "";
      this.el().appendChild(spinner);
      this.view._artifacts.spinner = new Keen.Spinner(Keen.Spinner.defaults).spin(spinner);
    },
    destroy: function(){
      this.view._artifacts.spinner.stop();
      this.view._artifacts.spinner = null;
    }
  };

  Keen.Dataviz.register('keen-io', {
    'metric': Metric,
    'error': Error,
    'spinner': Spinner
  }, {
    capabilities: dataTypes
  });

}; //)(Keen);
