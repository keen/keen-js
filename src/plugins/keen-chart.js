/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

(function(lib){
  var Keen = lib || {};

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
    "radar": "Radar"
  };

  Chart.defaults.global.responsive = true;

  var charts = {};
  Keen.utils.each(["doughnut", "pie", "polar-area", "radar", "bar", "line"], function(type, index){
    charts[type] = {
      initialize: function(){
        if (this.el().nodeName.toLowerCase() !== "canvas") {
          var canvas = document.createElement('canvas');
          this.el().innerHTML = "";
          this.el().appendChild(canvas);
          this.view._artifacts["ctx"] = canvas.getContext("2d");
        } else {
          this.view._artifacts["ctx"] = this.el().getContext("2d");
        }
        return this;
      },
      render: function(){
        var method = ChartNameMap[type],
            opts = _extend({}, this.chartOptions()),
            data = dataTransformers[type].call(this);

        if (this.view._artifacts["chartjs"]) this.view._artifacts["chartjs"].destroy();
        this.view._artifacts["chartjs"] = new Chart(this.view._artifacts["ctx"])[method](data, opts);
        return this;
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };
  });

  var dataTransformers = {

    'radar': function(){
      var self = this,
          result = {
            labels: this.dataset.selectColumn(0).slice(1),
            datasets: []
          };

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
          data: self.dataset.selectColumn(i+1).slice(1)
        });
      });
      return result;
    }

  };


  function getConfig(){
    // Chart.defaults.global

  }

  // function getSetupTemplate(){
  //
  //   // chartOptions:
  //   // -------------
  //
  //   return Keen.utils.extend({
  //     bindto: this.el(),
  //     data: {
  //       columns: []
  //     },
  //     color: {
  //       pattern: this.colors()
  //     },
  //     size: {
  //       height: this.height(),
  //       width: this.width()
  //     }
  //   }, this.chartOptions());
  // }

  function _selfDestruct(){
    if (this.view._artifacts["chartjs"]) {
      //this.view._artifacts["c3"].destroy();
      this.view._artifacts["chartjs"] = null;
    }
  }

  function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
  function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
  function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
  function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

  // Register library + add dependencies + types
  // -------------------------------
  Keen.Dataviz.register("chartjs", charts, { capabilities: dataTypes });

})(Keen);
