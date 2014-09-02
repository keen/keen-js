  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {};

    var errors = {
    };

    function handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    function handleRemoval(){
      this._chart.clearChart();
    }

    /**
     * Unpacks the data from dataform's table. Basically, it takes the table and rotates it
     * 90 degrees.
     * @param  {[2D array]} table [the dataform 2d array]
     * @return {[2D array]}       [the resulting array that is compatible with C3's column structure]
     */
    var _unpack = function(table) {
      var plucked = [];
      var numberOfColumns = table[0].length;
      // Construct new table
      for(var x = 0; x < numberOfColumns; x++) {
        plucked.push([]);
      }
      // Build new table that is compatible with c3.
      // The first item in the table will be the names
      for(var i = 0; i < table.length; i++) {
        for(var j = 0; j < numberOfColumns; j++) {
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

    var chartTypes = ['spline', 'pie', 'donut', 'area-spline', 'bar', 'scatter'];
    // var conversions = {
    //   'areachart': 'Area-Spline',
    //   'barchart': 'Bar',
    //   'linechart': 'Spline',
    //   'piechart': 'Pie',
    //   'scatterchart': 'Scatter',
    //   'donutchart': 'Donut'
    // };
    var charts = {};

    // Create chart types
    // -------------------------------
    _each(chartTypes, function (chart) {
      // console.log(key, chart);
      charts[chart] = Keen.Visualization.extend({
        initialize: function(){
          this.data.c3 = _unpack(this.data.table);
          this.render();
        },
        render: function(){
          var self = this;

          // Binding and defaulting
          var options = {
            bindto: self.el,
            height: this.height,
            grid: {
              x: {
                show: true
              },
              y: {
                show: true
              }
            },
            data: {
              x: this.data.c3[0][0],
              columns: this.data.c3,
              colors: registerColors.call(this),
              type: chart
            },
            axis: handleTimeseries.apply(this)
          };

          _extend(options, this.chartOptions);

          // Make chart
          self._chart = c3.generate(options);
        },
        update: function(){
          var unpacked = _unpack(this.data.table);
          this._chart.load({
            columns: unpacked
          });
        },
        remove: function(){
          handleRemoval.call(this);
        }
      });

    });

    // Register library + add dependencies + types
    // -------------------------------
    Keen.Visualization.register('c3', charts, {
      dependencies: [
        {
          type: 'script',
          url: 'http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js'
        },
        {
          type: 'script',
          url: 'http://c3js.org/js/c3.min-05d32fdf.js'
        },
        {
          type: 'style',
          url: 'http://c3js.org/css/c3-f750e4d4.css'
        }
      ]
    });

  })(Keen);
