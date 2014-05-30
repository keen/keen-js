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

  AreaChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("AreaChart");
    }
  });

  BarChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("BarChart");
    }
  });

  ColumnChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("ColumnChart");
    }
  });

  LineChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("LineChart");
    }
  });

  PieChart = Keen.Visualization.extend({
    initialize: function(){
      console.log("PieChart");
    }
  });
  
  Table = Keen.Visualization.extend({
    initialize: function(){
      console.log("Table");
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
