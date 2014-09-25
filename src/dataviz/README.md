# Dataviz API

### Create a new Dataviz instance

```
var chart = new Keen.Dataviz();
```

## Example usage

```
chart
  .el(document.getElementById("myChart"))
  .title("New Customers per Week")
  .height(500)
  .colors(["red", "orange", "green"])
  .sortGroups("desc")
  .prepare();

client.run(query, function(){
  chart
    .parseRequest(this)
    .render();
});

```

## DOM Element

### .el(DOMElement)

Put this awesome chart somewhere!

```
chart.el(document.getElementById("myChart"));
```

### .prepare(DOMElement)

Optional method for setting `el` _and_ kicking off a loading indicator

```
chart
  .prepare(document.getElementById("myChart")); // loading indicator begins
```

If you have already set `el` you can omit this.

```
chart.prepare(); // spinning like crazy!
```


## Visual Attributes

### .attributes(object)

Set or get attributes with one fell swoop!

```
chart.attributes({ title: "My Title!", width: 600 });
chart.attributes(); // returns hash of attributes
```

### .colors(array)

```
chart.colors(["blue", "gree", "red"]);
chart.colors(); // returns array of colors
```

### .colorMapping(object)

```
chart.colorMapping({
  "Label A": "#ffff00",
  "Label B": "#d7d7d7",
  "Label C": "green"
});
chart.colorMapping(); // returns current color map
```

### .height(number)

```
chart.height(450);
chart.height(); // returns the height
```

### .labels(array)

_Avoid if possible, but can be useful for funnels._

```
chart.labels(["Step 1", "Step 2", "Step 3"]);
chart.labels(); // returns array of labels
```

### .labelMapping(object)

```
chart.labelMapping({
  "previous_label": "Better Label",
  "another_90980b": "Cleaned Up!"
});
chart.labelMapping(); // returns current label map
```

### .indexBy(string)

Control which part of timeframes are visualized

Options: "timeframe.start" (default) or "timeframe.end"

```
chart.indexBy("timeframe.end");
chart.indexBy(); // returns current setting
```

### .sortGroups(string)

Control how groupBy results are sorted

```
chart.sortGroups("asc");
chart.sortGroups(); // returns current setting
```

### .sortIntervals(string)

Control how interval results are sorted

```
chart.sortIntervals("desc");
chart.sortIntervals(); // returns current setting
```

### .title(string)

```
chart.title("Hi, I'm a chart!");
chart.title(); // returns the title
```

### .width(number)

```
chart.width(900);
chart.width(); // returns the width
```


## Adapter Actions

Adapters are small modules that we've designed to manage visualizations, sort of like a controller would manage views of a web app.

### .render()

Render the chosen visualization with available data.

```
chart
  .title("Daily Active Users")
  .height(240)
  .render();
```

### .error(string)

Display a given error message in place of the chart

```
chart.error("Sorry, something went wrong!");
```


### .destroy()

Remove this chart from the DOM, free up memory, etc.

```
chart.destroy();
```


## Data Handling

### .data(input)

This method is something of a Swiss Army knife, accepting several different types of input.

1. Keen.Request instance, from within a query response callback
2. Raw data, typically from modifying a query response manually
3. Keen.Dataset instance (new)

```
chart.data({ result: 0 });
chart.data(); // returns current Dataset instance
```

If you pass in a Keen.Request instance, this method will forward the call to `.parseRequest()`, which is explicitly intended for this type of work. Feel free to use that method when possible.

If you pas in raw data, this method will forward the call to `.parseRawData()`, which tries it's best to make sense of what you've given it. If you run into trouble here, just give us a shout.

Each of these scenarios results in a new Keen.Dataset instance. If you pass in a Keen.Dataset instance directly, it will be piped directly into to fierce beating heart of the Dataviz beast.


### .parseRequest(<Keen.Request>)

Evaluates both the API response and the Query that inspired it, to figure out exactly what type of data we're working with. This method sets a few defaults, like `title`, `dataType` and `defaultChartType`, which help the library kick out the right default visualizations.

```
var client = new Keen({ ... });
var query = new Keen.Query("count", {
  eventCollection: "pageviews"
});
client.run(query, function(){
  chart.parseRequest(this);
})
```

### .parseRawData(object)

Evaluates the API response structure to figure out what it might be, and helps the visualization get to know its true self.

```
var client = new Keen({ ... });
var query = new Keen.Query("count", {
  eventCollection: "pageviews"
});
client.run(query, function(res){
  res.result = 12321414;
  chart.parseRawData(res);
})
```

## Custom Internal Access

### .call(fn)

Call arbitrary functions within the chaining context.

```
chart
  .call(function(){
    var total = this.data().slice(1).length;
    this.title("Total Results: " + total);
  })
  .colors(["blue", "green", "aqua", "peach"])
  .render();
```


## Adapter Selection

#### .adapter(object)

Set or get adapter settings

```
chart.adapter({ library: "chartjs", chartType: "polar-area" });
chart.adapter(); // returns hash of adapter settings
```

#### .library(string)

```
chart.library("chartjs");
chart.library(); // returns current library selection
```

#### .chartType(string)

```
chart.chartType("bar");
chart.chartType(); // returns current chartType selection
```

#### .chartOptions(object)

Set configuration options intended for the underlying charting library adapter. Each adapter will document how this works for various libraries and chartTypes.

```
chart.chartOptions({
  isStacked: true,
  legend: {
    position: "none"
  }
});
chart.chartOptions(); // return current chartOptions
```

**_Available but only used internally:_**

```
.dataType(string)
.defaultChartType(string)
```
