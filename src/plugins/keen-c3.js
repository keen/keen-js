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
    }

    Keen.utils.loadScript("http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js", function() {
      Keen.utils.loadScript("http://cdnjs.cloudflare.com/ajax/libs/c3/0.1.29/c3.min.js", function() {
        Keen.loaded = true;
        Keen.trigger('ready');
      });
    });

    function handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    function handleRemoval(){
      var self = this;
      // google.visualization.events.removeAllListeners(self._chart);
      self._chart.clearChart();
    }


    // Create chart types
    // -------------------------------

    LineChart = Keen.Visualization.extend({
      initialize: function(){
        debugger;
        this.render();
      },
      render: function(){
        var self = this;
        debugger;

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
            x: 'x',
            columns: [
              ['x'].concat(dates),
              [this.model.get('name')].concat(weights)
            ]
          }
        });
        // google.visualization.events.addListener(self._chart, 'error', function(stack){
        //   handleErrors.call(self, stack);
        // });
        this.update();
      },
      update: function(){
        // this.remove();
        // var data = google.visualization.arrayToDataTable(this.data.table);
        // var options = Keen.utils.extend(this.chartOptions, {
        //   title: this.title || '',
        //   height: parseInt(this.height),
        //   width: parseInt(this.width),
        //   colors: this.colors
        // });
        // this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });


    // Register library + types
    // -------------------------------

    Keen.Visualization.register('c3', {
      'linechart'   : LineChart
    });

  })(Keen);
