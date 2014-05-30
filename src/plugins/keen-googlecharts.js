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
      console.log("AreaChart", this);
    }
  });

  BarChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("BarChart", this);
    }
  });

  ColumnChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("ColumnChart", this);
    }
  });

  LineChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("LineChart", this);
    }
  });

  PieChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("PieChart", this);
    }
  });

  Table = Keen.Visualization.extend({
    initialize: function(){
      console.log("Table", this);
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
