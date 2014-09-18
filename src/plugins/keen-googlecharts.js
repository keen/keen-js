  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {};

    var errors = {
      "google-visualization-errors-0": "No results to visualize"
    };

    function handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    var chartTypes = ['AreaChart', 'BarChart', 'ColumnChart', 'LineChart', 'PieChart', 'Table'];
    var charts = {};


    // Create chart types
    // -------------------------------
    _each(chartTypes, function (chart) {
      charts[chart.toLowerCase()] = Keen.Dataviz.extend({
        initialize: function(){
          this.render();
        },
        render: function(){
          var self = this;
          self._chart = self._chart || new google.visualization[chart](self.el);
          google.visualization.events.addListener(self._chart, 'error', function(stack){
            handleErrors.call(self, stack);
          });
          this.update();
        },
        update: function(){
          var data = google.visualization.arrayToDataTable(this.data.table);
          var options = Keen.utils.extend(this.chartOptions, {
            title: this.title || '',
            height: parseInt(this.height),
            width: parseInt(this.width),
            colors: this.colors
          });
          this._chart.draw(data, options);
        }
      });
    });


    // Register library + types
    // -------------------------------

    Keen.Dataviz.register('google', charts, {
      dependencies: [{
        type: 'script',
        url: 'https://www.google.com/jsapi',
        cb: function(done) {
          if(typeof google === 'undefined'){
            throw new Error("Problem loading Google Charts library. Please contact us!");
          } else {
            google.load('visualization', '1.1', {
                packages: ['corechart', 'table'],
                callback: function(){
                  done();
                }
            });
          }
        }
      }]
    });

  })(Keen);


/*

// Lib defaults should live here

Keen.Dataviz.prototype.setSpecificChartOptions = function() {
  // A few last details
  // -------------------------------

  if (this.config.chartType == 'metric') {
    this.config.library = 'keen-io';
  }

  if (this.config.chartOptions.lineWidth == void 0) {
    this.config.chartOptions.lineWidth = 2;
  }

  if (this.config.chartType == 'piechart') {
    if (this.config.chartOptions.sliceVisibilityThreshold == void 0) {
      this.config.chartOptions.sliceVisibilityThreshold = 0.01;
    }
  }

  if (this.config.chartType == 'columnchart' || this.config.chartType == 'areachart' || this.config.chartType == 'linechart') {

    if (this.config.chartOptions.hAxis == void 0) {
      this.config.chartOptions.hAxis = {
        baselineColor: 'transparent',
        gridlines: { color: 'transparent' }
      };
    }

    if (this.config.chartOptions.vAxis == void 0) {
      this.config.chartOptions.vAxis = {
        viewWindow: { min: 0 }
      };
    }
  }
};

*/
