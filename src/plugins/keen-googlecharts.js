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
      "google-visualization-errors-0": "No results to visualize"
    }

    Keen.utils.loadScript("https://www.google.com/jsapi", function() {
      if(typeof google === 'undefined'){
        throw new Error("Problem loading Google Charts library. Please contact us!");
      } else {
        google.load('visualization', '1.1', {
            packages: ['corechart', 'table'],
            callback: function(){
              Keen.loaded = true;
              Keen.trigger('ready');
            }
        });
      }
    });

    function handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    function handleRemoval(){
      var self = this;
      google.visualization.events.removeAllListeners(self._chart);
      self._chart.clearChart();
    }


    // Create chart types
    // -------------------------------

    AreaChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.AreaChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        this.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    BarChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.BarChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    ColumnChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.ColumnChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    LineChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.LineChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    PieChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.PieChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    Table = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.Table(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });


    // Register library + types
    // -------------------------------

    Keen.Visualization.register('google', {
      'areachart'   : AreaChart,
      'barchart'    : BarChart,
      'columnchart' : ColumnChart,
      'linechart'   : LineChart,
      'piechart'    : PieChart,
      'table'       : Table
    });

  })(Keen);
