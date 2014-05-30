/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

!function(name, context){
  var Keen = context[name] || {},
      Metric;

  Metric = Keen.Visualization.extend({
    initialize: function(){
      console.log("Metric", this);
    }
  });

  Keen.Visualization.register('keen-io', {
    'metric': Metric
  });

}('Keen', this);
