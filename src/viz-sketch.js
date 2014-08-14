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

// Keen.Visualization.prototype.data()
  // Keen.Visualization.prototype.prepare() - ???
  // Keen.Visualization.prototype.render()
  // Keen.Visualization.prototype.destroy()
  // listen for re-run requests
  // handle errors
  // * read data structure
  // *

  //------------//
var client = new Keen(config);
var query = new Keen.Query("count", params);
var el = document.getElementById("chart-wrapper");


// useragent
// emmiter

// datastore

var myDataviz = new Keen.Dataviz("column-chart");

myDataviz.configure({
  title: "tada!",
  height: 350,
  width: 500
});

myDataviz.prepare(el); // throw a spinner in there
myDataviz.render(el); // remove spinner and render chart

var myDataset = new Keen.Dataset(response [, schema]); // optional schema for overrides and complex queries
myDataset.configure({ sort: "asc" });

var secondDataset = new Keen.Dataset(res2);
secondDataset.configure({ sort: "asc" });

myDataset.combine(secondDataset, {
  match: function(a, b){
    // ensure correct records correspond
    return a[0] === b[0];
  }
});

myDataset.sort({ column: 0, order: "asc" });

myDataviz.data(); // gets current data
myDataviz.data(myDataset); // sets new data, triggering an "update" event

myDataviz.getChartOptions(); // { "google": [""] }

myDataset.removeColumn(); // removes all data
myDataset.removeColumn(2); // removes column 2 (combined data from above)
myDataset.removeColumn([1,2]); // removes columns 1 and 2

myDataset.removeRow(function(row, index){
  return row[0] < 25; // return rows where first cell value passes
});
