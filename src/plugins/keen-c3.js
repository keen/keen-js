/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

(function(lib){
  var Keen = lib || {};

  /**
   * Unpacks the data from dataform's table. Basically, it takes the table and rotates it
   * 90 degrees.
   * @param  {[2D array]} table [the dataform 2d array]
   * @return {[2D array]}       [the resulting array that is compatible with C3's column structure]
   */
  var _unpack = function(table, chartType) {
    var plucked = [];
    var isNonDate = chartType === 'pie' || chartType === 'donut';
    var numberOfColumns = table[0].length;
    var start = isNonDate ? 1 : 0;

    // Construct new table
    for(var x = 0; x < numberOfColumns; x++) {
      plucked.push([]);
    }

    // Build new table that is compatible with c3.
    // The first item in the table will be the names
    for(var i = 0; i < table.length; i++) {
      for(var j = start; j < numberOfColumns; j++) {
        plucked[j].push(table[i][j]);
      }
    }
    return plucked;
  };

  /**
   * Handler for determining what the x-axis will display
   * @return {object}/undefined
   */
  var handleTimeseries = function() {
    var candidates = this.data.c3;
    // if the first itemset is a date, then make it into a timeseries
    if(candidates[0][1] instanceof Date) {
      return {
        x: {
          type: 'timeseries',
          tick: {
            fit: true
          }
        }
      };
    }
  };

  var registerColors = function() {
    var colors = {};
    //TODO set colors as an alternative
    for(var i = 1; i < this.data.c3.length; i++) {
      var set = this.data.c3[i];
      colors[set[0]] = this.colors[i - 1];
    }
    return colors;
  };

  var chartTypes = [];
  var dataTypes = {
    // dataType            : // chartTypes
    "singular"             : ["gauge"],
    "categorical"          : ["donut", "pie"],
    "cat-interval"         : ["area-step", "step", "bar", "area", "area-spline", "spline", "line"],
    "cat-ordinal"          : ["bar", "area", "area-spline", "spline", "line", "step", "area-step"],
    "chronological"        : ["area", "area-spline", "spline", "line", "bar", "step", "area-step"],
    "cat-chronological"    : ["line", "spline", "area", "area-spline", "bar", "step", "area-step"]
    // "nominal"           : [],
    // "extraction"        : []
  };

  var charts = {};
  Keen.utils.each(["gauge", "donut", "pie", "bar", "area", "area-spline", "spline", "line", "step", "area-step"], function(type, index){
    charts[type] = {
      render: function(){
        var setup = getSetupTemplate.call(this);
        setup["data"]["type"] = type;
        if (type === "pie" || type === "donut") {
          setup[type] = { title: this.title() };
        }
        this.view._artifacts["c3"] = this.view._artifacts["c3"] || c3.generate(setup);
        this.update();
      },
      update: function(){
        var self = this, cols = [];
        if (type === "gauge") {
          self.view._artifacts["c3"].load({
            columns: [ [self.title(), self.data()[1][1]] ]
          })
        }
        else if (type === "pie" || type === "donut") {
          self.view._artifacts["c3"].load({
            columns: self.dataset.data.output.slice(1)
          });
        }
        else {
          Keen.utils.each(self.data()[0], function(c, i){
            if (i > 0) {
              cols.push(self.dataset.selectColumn(i));
            }
          });
          // if self.chartOptions().isStacked ?
          self.view._artifacts["c3"].groups([self.data()[0].slice(1)]);
          self.view._artifacts["c3"].load({
            columns: cols
          });
        }
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };
  });

  function getSetupTemplate(){

    // chartOptions:
    // -------------
    // axis: {}
    // color: {}    <-- be aware: we set values here
    // grid: {}
    // legend: {}
    // point: {}
    // regions: {}
    // size: {}     <-- be aware: we set values here
    // tooltip: {}
    // zoom: {}

    // line, pie, donut etc...

    return {
      bindto: this.el(),
      data: {
        columns: []
      },
      color: {
        pattern: this.colors()
      },
      size: {
        height: this.height(),
        width: this.width()
      }
    }
  }

  function _selfDestruct(){
    if (this.view._artifacts["c3"]) {
      this.view._artifacts["c3"].destroy();
      this.view._artifacts["c3"] = null;
    }
  }

  // Register library + add dependencies + types
  // -------------------------------
  Keen.Dataviz.register('c3', charts, { capabilities: dataTypes });

})(Keen);
