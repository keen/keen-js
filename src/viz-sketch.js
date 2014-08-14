var client = new Keen({ .. });
var query = new Keen.Query("count", { ... });
var el = document.getElementById("chart-wrapper");

client.draw(query, el, {});

var chart = new Keen.Visualization([req||raw],el,{
  chartType: "piechart",
  library: "google",
  labelMapping: {
    "localhost:32080/my/test-sithe.s.l;jsfd;jfa;lsdjf;lsdajfl;asd": "Home"
  },
  colorMapping: {
    "Home": "blue"
  }
});

client.run(query, function(res){
	//this.draw(el, {});
});

var s = new Keen.Visualization ->
  // figure out schema
  var d = new Dataset(response);
  var opts = extend(user_config, Keen.Visualization.defaults);
  
  return new Dataviz("column-chart")
    .data(d)
    //.json(raw)
    .configure(opts)
    .render(el);

var b = new Keen.Dataviz();




Keen.Spinner (spin.js)

Keen.Request.draw

Keen.Visualization
  // sets up config options, based on defaults
  
  // builds default title
  
  // determines the type of query
    // set viz defaults
    // determines chartType options
      // sets default chartType
  
  // sets dataform schema config, based on query type
  
  // sets a few more viz defaults
  
  // runs generic _transform method
    // reads response structure (backup)
    // returns new Keen.Dataform
  
  // applies colorMapping to sort colors set
  
  // returns new Keen.Visualization.libraries[lib][chartType](config)
  
  