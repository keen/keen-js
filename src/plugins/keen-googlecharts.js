/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

!function(name, context){
  var Keen = context[name] || {},
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
      google.load('visualization', '1.0', {
          packages: ['corechart', 'table'],
          callback: function(){
            Keen.loaded = true;
            Keen.trigger('ready');
          }
      });
    }
  });

  function setColors(){
    var self = this;
    if (self.colorMapping) {
      if (self.data.table[0].length > 2) {
        // map to labels
        Keen.utils.each(self.data.table[0], function(cell, i){
          if (i > 0 && self.colorMapping[cell]) {
            self.colors.splice(i-1, 0, self.colorMapping[cell]);
          }
        });
      } else {
        // map to indices
        Keen.utils.each(self.data.table, function(row, i){
          if (i > 0 && self.colorMapping[row[0]]) {
            self.colors.splice(i-1, 0, self.colorMapping[row[0]]);
          }
        });
      }
    }
    return self.colors;
  }

  function handleErrors(stack){
    var message = errors[stack['id']] || stack['message'] || "An error occurred";
    this.trigger('error', message);
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
      var data = google.visualization.arrayToDataTable(this.data.table);
      var options = Keen.utils.extend(this.chartOptions, {
        title: this.title || '',
        height: parseInt(this.height),
        width: parseInt(this.width),
        colors: setColors.call(this)
      });
      this._chart.draw(data, options);
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
      var data = google.visualization.arrayToDataTable(this.data.table);
      var options = Keen.utils.extend(this.chartOptions, {
        title: this.title || '',
        height: parseInt(this.height),
        width: parseInt(this.width),
        colors: setColors.call(this)
      });
      this._chart.draw(data, options);
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
      var data = google.visualization.arrayToDataTable(this.data.table);
      var options = Keen.utils.extend(this.chartOptions, {
        title: this.title || '',
        height: parseInt(this.height),
        width: parseInt(this.width),
        colors: setColors.call(this)
      });
      this._chart.draw(data, options);
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
      var data = google.visualization.arrayToDataTable(this.data.table);
      var options = Keen.utils.extend(this.chartOptions, {
        title: this.title || '',
        height: parseInt(this.height),
        width: parseInt(this.width),
        colors: setColors.call(this)
      });
      this._chart.draw(data, options);
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
      var data = google.visualization.arrayToDataTable(this.data.table);
      var options = Keen.utils.extend(this.chartOptions, {
        title: this.title || '',
        height: parseInt(this.height),
        width: parseInt(this.width),
        colors: setColors.call(this)
      });
      this._chart.draw(data, options);
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
      var data = google.visualization.arrayToDataTable(this.data.table);
      var options = Keen.utils.extend(this.chartOptions, {
        title: this.title || '',
        height: parseInt(this.height),
        width: parseInt(this.width),
        colors: setColors.call(this)
      });
      this._chart.draw(data, options);
    }
  });


  // Register library + types
  // -------------------------------

  Keen.Visualization.register('google', {
    'areachart': AreaChart,
    'barchart': BarChart,
    'columnchart': ColumnChart,
    'linechart': LineChart,
    'piechart': PieChart,
    'datatable': Table
  });

}('Keen', this);
