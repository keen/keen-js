/*!
 * ----------------------
 * Chart.js Adapter
 * ----------------------
 */

var Dataviz = require("../dataviz"),
    each = require("../../core/utils/each"),
    extend = require("../../core/utils/extend");

module.exports = function(){

  if (typeof Chart !== "undefined") {
    Chart.defaults.global.responsive = true;
  }

  var dataTypes = {
    // dataType            : // chartTypes
    //"singular"             : [],
    "categorical"          : ["doughnut", "pie", "polar-area", "radar"],
    "cat-interval"         : ["bar", "line"],
    "cat-ordinal"          : ["bar", "line"],
    "chronological"        : ["line", "bar"],
    "cat-chronological"    : ["line", "bar"]
    // "nominal"           : [],
    // "extraction"        : []
  };

  var ChartNameMap = {
    "radar": "Radar",
    "polar-area": "PolarArea",
    "pie": "Pie",
    "doughnut": "Doughnut",
    "line": "Line",
    "bar": "Bar"
  };
  var dataTransformers = {
    'doughnut': getCategoricalData,
    'pie': getCategoricalData,
    'polar-area': getCategoricalData,
    'radar': getSeriesData,
    'line': getSeriesData,
    'bar': getSeriesData
  };

  function getCategoricalData(){
    var self = this, result = [];
    each(self.dataset.selectColumn(0).slice(1), function(label, i){
      result.push({
        value: self.dataset.selectColumn(1).slice(1)[i],
        color: self.colors()[+i],
        hightlight: self.colors()[+i+9],
        label: label
      });
    });
    return result;
  }

  function getSeriesData(){
    var self = this,
        labels,
        result = {
          labels: [],
          datasets: []
        };

    labels = this.dataset.selectColumn(0).slice(1);
    each(labels, function(l,i){
      if (l instanceof Date) {
        result.labels.push((l.getMonth()+1) + "-" + l.getDate() + "-" + l.getFullYear());
      } else {
        result.labels.push(l);
      }
    })

    each(self.dataset.selectRow(0).slice(1), function(label, i){
      var hex = {
        r: hexToR(self.colors()[i]),
        g: hexToG(self.colors()[i]),
        b: hexToB(self.colors()[i])
      };
      result.datasets.push({
        label: label,
        fillColor    : "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",0.2)",
        strokeColor  : "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",1)",
        pointColor   : "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(" + hex.r + "," + hex.g + "," + hex.b + ",1)",
        data: self.dataset.selectColumn(+i+1).slice(1)
      });
    });
    return result;
  }

  var charts = {};
  each(["doughnut", "pie", "polar-area", "radar", "bar", "line"], function(type, index){
    charts[type] = {
      initialize: function(){
        // Check and message for empty dataset
        if (this.data()[0].length === 1 || this.data().length === 1) {
          this.error('No data to display');
          return;
        }
        if (this.el().nodeName.toLowerCase() !== "canvas") {
          var canvas = document.createElement('canvas');
          this.el().innerHTML = "";
          this.el().appendChild(canvas);
          this.view._artifacts["ctx"] = canvas.getContext("2d");
        }
        else {
          this.view._artifacts["ctx"] = this.el().getContext("2d");
        }

        if (this.height()) {
          this.view._artifacts["ctx"].canvas.height = this.height();
          this.view._artifacts["ctx"].canvas.style.height = String(this.height() + "px");
        }

        if (this.width()) {
          this.view._artifacts["ctx"].canvas.width = this.width();
          this.view._artifacts["ctx"].canvas.style.width = String(this.width() + "px");
        }

        return this;
      },
      render: function(){
        if(_isEmptyOutput(this.dataset)) {
          this.error("No data to display");
          return;
        }
        var method = ChartNameMap[type],
            opts = extend({}, this.chartOptions()),
            data = dataTransformers[type].call(this);

        if (this.view._artifacts["chartjs"]) {
          this.view._artifacts["chartjs"].destroy();
        }
        this.view._artifacts["chartjs"] = new Chart(this.view._artifacts["ctx"])[method](data, opts);
        return this;
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };
  });

  function _selfDestruct(){
    if (this.view._artifacts["chartjs"]) {
      this.view._artifacts["chartjs"].destroy();
      this.view._artifacts["chartjs"] = null;
    }
  }

  function _isEmptyOutput(dataset) {
    var flattened = dataset.output().reduce(function(a, b) {
      return a.concat(b)
    });
    return flattened.length === 0
  }

  // Based on this awesome little demo:
  // http://www.javascripter.net/faq/hextorgb.htm
  function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
  function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
  function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
  function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

  // Register library + add dependencies + types
  // -------------------------------
  Dataviz.register("chartjs", charts, { capabilities: dataTypes });

};
