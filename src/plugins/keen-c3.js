  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {},
        AreaChart,
        BarChart,
        ColumnChart,
        LineChart,
        PieChart,
        Table;

    var errors = {
    };

    // TODO: Fix how dependnecies work
    /**
     * As of the moment, the library dependencies trigger a ready event, which is dangerous because
     * there may be multiple dependencies such as c3, google viz, nvd3, etc. which all currently trigger
     * a Keen ready event. This can lead to issues of triggering the callback when a library has not loaded
     * yet.
     *
     * We want to fix this by creating a better pattern for handling all of the dependencies.
     *
     * For instance, once a single dependency has been loaded, it will check that dependency as loaded.
     * Then, we can have a listener that listens to whether all the dependencies have been satisfied,
     * in which we can safely trigger the Keen ready event.
     *
     * We could probably put the checker in the plug (this file) and the handler in another place
     */
    Keen.utils.loadScript("http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js", function() {
      Keen.utils.loadScript("http://c3js.org/js/c3.min-05d32fdf.js", function() {
        Keen.loaded = true;
        Keen.trigger('ready');
        Keen.utils.loadStyle("http://c3js.org/css/c3-f750e4d4.css", function() {
        });
      });
    });

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

    var chartTypes = ['Spline', 'Pie', 'Donut', 'Area-Spline', 'Bar', 'Scatter'];
    var charts = {};

    // Create chart types
    // -------------------------------

    _each(chartTypes, function (chart) {
      charts[chart] = Keen.Visualization.extend({
        initialize: function(){
          this.data.c3 = _unpack(this.data.table);
          this.render();
        },
        render: function(){
          var self = this;

          // self._chart = self._chart || new google.visualization.AreaChart(self.el);
          self._chart = c3.generate({
            bindto: self.el,
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
              type: chart.toLowerCase()
            },
            axis: (function() {
              var candidates = self.data.c3;
              // If the first itemset is a date, then make it into a timeseries
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

            })()
          });
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

    // Register library + types
    // -------------------------------

    Keen.Visualization.register('c3', charts);

  })(Keen);
