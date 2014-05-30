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

  AreaChart = Keen.Visualization.extend({
    initialize: function(){
      //console.log("AreaChart", this);
      this.render();
    },
    render: function(){
      this._chart = this._chart || new google.visualization.AreaChart(this.el);
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

  BarChart = Keen.Visualization.extend({
    initialize: function(){
      //console.log("AreaChart", this);
      this.render();
    },
    render: function(){
      this._chart = this._chart || new google.visualization.BarChart(this.el);
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

  ColumnChart = Keen.Visualization.extend({
    initialize: function(){
      //console.log("AreaChart", this);
      this.render();
    },
    render: function(){
      this._chart = this._chart || new google.visualization.ColumnChart(this.el);
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

  LineChart = Keen.Visualization.extend({
    initialize: function(){
      //console.log("AreaChart", this);
      this.render();
    },
    render: function(){
      this._chart = this._chart || new google.visualization.LineChart(this.el);
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

  PieChart = Keen.Visualization.extend({
    initialize: function(){
      //console.log("AreaChart", this);
      this.render();
    },
    render: function(){
      this._chart = this._chart || new google.visualization.PieChart(this.el);
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

  Table = Keen.Visualization.extend({
    initialize: function(){
      //console.log("AreaChart", this);
      this.render();
    },
    render: function(){
      this._chart = this._chart || new google.visualization.Table(this.el);
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

  Keen.Visualization.register('google', {
    'areachart': AreaChart,
    'barchart': BarChart,
    'columnchart': ColumnChart,
    'linechart': LineChart,
    'piechart': PieChart,
    'datatable': Table
  });

}('Keen', this);
