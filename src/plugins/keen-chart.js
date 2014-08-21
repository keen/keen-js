  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  *
  *
  * Chart.js sample data structure
  * var data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
              label: "My Second dataset",
              fillColor: "rgba(151,187,205,0.2)",
              strokeColor: "rgba(151,187,205,1)",
              pointColor: "rgba(151,187,205,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(151,187,205,1)",
              data: [28, 48, 40, 19, 86, 27, 90]
          }
      ]
  };
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {};

    var errors = {
    };

    // TODO: Fix how dependnecies work
    /**
     * As of the moment, the library dependencies trigger a ready event, which is dangerous because
     * there may be multiple dependencies such as chart, google viz, nvd3, etc. which all currently trigger
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
    Keen.utils.loadScript("http://cdnjs.cloudflare.com/ajax/libs/Chart.js/0.2.0/Chart.min.js", function() {
      Keen.loaded = true;
      Keen.trigger('ready');
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
     * @return {[2D array]}       [the resulting array that is compatible with chart's column structure]
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
      var datasets = [];
      for(i = 1; i < plucked.length; i++) {
        datasets.push({
          label: plucked[i].shift(),
          data: plucked[i]
        });
      }

      return {
        labels: plucked.shift().slice(1),
        datasets: datasets
      };
    };

    var chartTypes = ['Spline', 'Pie', 'Donut', 'Area-Spline', 'Bar', 'Scatter'];
    var charts = {};

    // Create chart types
    // -------------------------------

    _each(chartTypes, function (chart) {
      charts[chart] = Keen.Visualization.extend({
        initialize: function(){
          this.data.chart = _unpack(this.data.table);
          this.render();
        },
        render: function(){
          var self = this;
          // Chart.js usage: new Chart(ctx).PolarArea(data);

          // Binding and defaulting
          var options = {
            data: {
              x: this.data.chart[0][0],
              columns: this.data.chart,
              type: chart.toLowerCase()
            },
          };

          _extend(options, this.chartOptions);

          // Make chart
          // self._chart = c3.generate(options);
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
    
    Keen.Visualization.register('chart', charts);

  })(Keen);
