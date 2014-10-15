# Visualization

## How it works

Building charts from queries is easier than ever.

Clients have a #draw method with accepts a query, a DOM selector, and a configuration object as arguments. You can call this directly on the client, which will execute a request and visualize its response, like so:

```
client.draw(query, selector, config);
```

Charts can also be instantiated with the `Keen.Visualization` class. Just be sure to include the `library` (default is `google`) and `chartType` properties with the chart configuration.

```
client.run(query, function(response){
  var newData = response;
  response.result = response.result / 100;
  this.data = newData;

  // Pass in raw data, or reference to "this" (request instance)
  var myChart = new Keen.Visualization(this, document.getElementById(“chart-wrapper”), {
    library: "google",
    chartType: “columnchart”,
    title: “Custom chart title”
  });
});
```

## Example usage

```
var count = new Keen.Query(“count”, {
  eventCollection: “pageviews”,
  groupBy: “visitor.geo.country”
  interval: “daily”,
  timeframe: “this_21_days”
});
var chart = client.draw(count, document.getElementById(“chart-wrapper”), {
  title: “Custom chart title”,
  chartType: “columnchart”
});

// or

var chart;
var req = client.run(count, function(){
  if (chart) chart.remove();
  // Pass in raw data, or reference to "this" (request instance)
  chart = new Keen.Visualization(this, document.getElementById(“chart-wrapper”), {
    title: “Custom chart title”,
    chartType: “columnchart”
  });
});
```

## DOM Selector

The first argument for the `#draw` method is a reference to the DOM element where your chart will appear. This should be a block level element, like a `<div>` tag, referenced by its ID attribute:

`document.getElementById(“chart-wrapper”)`


## Configuration

Configuration options and their defaults:

```
{
  colors: [ "#ff0000", "#222", "lightblue" ], //
  title: "",		// string or null
  height: 400,		// integer
  width: 600,		// integer or "auto"
  labelMapping: {},	// read below
  colorMapping: {},	// read below
  chartOptions: {
  	// pass directly through to underying vizz library
  }
}
```


### Customized Labels

`labelMapping`: object or array that replaces incoming labels with desired values.

**Selective replacement:**

```
labelMapping: {
  "https://yourdomain.com/": "Home",
  "https://yourdomain.com/gallery.html": "Gallery"
}
```

**Total replacement:**

```
{
  labelMapping: [
    "Step 1",
    "Step 2 (75%)",
    "Step 3 (50%)",
    "Step 4 (12%)"
  ]
}
```

### Customized Colors

`colorMapping`: object that corresponds labels (key) with desired colors (value).

```
colorMapping: {
  "Home": "#ff0000",
  "Gallery": "purple"
}
```

### Customized Chart Instance

`chartOptions`: config object passed to the underlying visualization library (Google Charts).

```
chartOptions: {
  isStacked: true,
  legend: { position: "none" },
  bar: {
    groupWidth: "90%"
  }
}
```

### Selective Chart types

`chartType`: string identifying the type of chart to render:

  * [areachart](#area-chart)
  * [barchart](#bar-chart)
  * [columnchart](#column-chart)
  * [linechart](#line-chart)
  * [metric](#metric)
  * [piechart](#pie-chart)
  * [table](#table)


## Chart Type Examples

Area, bar, column and line charts all operate on the same underlying query/response type: numeric values on an interval. So, the demos for these chart types will all utilize the following query, but will specify their own respective `chartType` property.

```
var total_pageviews = new Keen.Query("count", {
  eventCollection: "pageviews",
  groupBy: "channel",
  timeframe: "this_3_days",
  interval: "daily"
});
```

### Area Chart

![Area chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-areachart.png)

```
client.draw(total_pageviews, document.getElementById("total-daily-revenue-areachart"), {
  chartType: "areachart",
  title: "Daily revenue (7 days)",
  chartOptions: {
    isStacked: true
  }
});
```

```
<div id="total-daily-revenue-areachart"></div>
```
Find additional configuration options for area charts [here](https://developers.google.com/chart/interactive/docs/gallery/areachart#Configuration_Options).

### Bar Chart

![Bar chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-barchart.png)

```
client.draw(total_pageviews, document.getElementById("total-daily-revenue-barchart"), {
  chartType: "barchart",
  title: "Daily revenue (7 days)",
  chartOptions: {
    isStacked: true
  }
});
```

```
<div id="total-daily-revenue-barchart"></div>
```
Find additional configuration options for bar charts [here](https://developers.google.com/chart/interactive/docs/gallery/barchart#Configuration_Options).


### Column Chart

![Column chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-columnchart.png)

```
client.draw(total_pageviews, document.getElementById("total-daily-revenue-columnchart"), {
  chartType: "columnchart",
  title: "Daily revenue (7 days)",
  chartOptions: {
    isStacked: true
  }
});
```

```
<div id="total-daily-revenue-columnchart"></div>
```
Find additional configuration options for column charts [here](https://developers.google.com/chart/interactive/docs/gallery/columnchart#Configuration_Options).


### Line Chart

![Line chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-linechart.png)

```
client.draw(total_pageviews, document.getElementById("total-daily-revenue-linechart"), {
  chartType: "linechart",
  title: "Daily revenue (7 days)"
});
```

```
<div id="total-daily-revenue-linechart"></div>
```
Find additional configuration options for line charts [here](https://developers.google.com/chart/interactive/docs/gallery/linechart#Configuration_Options).


### Metric

![Metric](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-metric.png)

Visualize single numeric query responses, such as a count, sum, average, etc.

```
var count = new Keen.Query("count", {
  eventCollection: "pageviews"
});
client.draw(count, document.getElementById("count-pageviews-metric"), {
  chartType: "metric",
  title: "Page Views",
  colors: ["#49c5b1"]
});
```

```
<div id="count-pageviews-metric"></div>
```

**Additional options**

* `chartOptions.prefix`: string to prepend to the beginning of the result value
* `chartOptions.suffix`: string to append to the end of the result value


### Pie Chart

![Pie chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-piechart.png)

Pie charts can render `groupBy` queries that do not include an interval.

```
var visitor_origins = new Keen.Query("count", {
  eventCollection: "pageviews",
  groupBy: "referrer"
});
client.draw(visitor_origins, document.getElementById("count-pageviews-piechart"), {
  chartType: "piechart",
  title: "Visitor Referrers"
});
```
```
<div id="count-pageviews-piechart"></div>
```

### Table

Tables can render any query response, including extractions.

```
var all = new Keen.Query("extraction", {
  eventCollection: "pageviews",
  timeframe: "this_7_days"
});
client.draw(all, document.getElementById("extract-pageviews-table"), {
  chartType: "table",
  title: "All page view data"
});
```

```
<div id="extract-pageviews-table"></div>
```
Find additional configuration options for tables [here](https://developers.google.com/chart/interactive/docs/gallery/table#Configuration_Options).

### Funnels

Funnels can be rendered as column (default), bar, area, or line charts. Just specify the `chartType` property in the chart configuration.

#### Column chart

![Funnel as a column chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-funnel-columnchart.png)

#### Bar chart

![Funnel as a bar chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-funnel-barchart.png)

## Pass in your own data to charts

To display a modified query result or data from another source into a visualization, pass a result object and a div to Keen.Visualization. The [Keen IO API docs](https://keen.io/docs/data-analysis/) describe what the results look like for all the different query types (counts, series, funnels, etc).

Here's an example that takes a hard-coded value "1896" and draws it as a number.

```
  window.chart = new Keen.Visualization({result: 1896}, document.getElementById('my-div'), {
    chartType: 'metric',
    title: "Wow!",
    width: 400,
    colors: ['#6ab975']
 });
```

## Combine results of two queries

Here's an example that runs two queries, divides them, and then outputs the results:

```javascript

  var sessions_count = new Keen.Query("count_unique", {
    eventCollection: "screen_view", // Use this collection because there is at least 1 screenview per session
    targetProperty: "session.id",
    timeframe: last_7_days
  });

  var paid_sessions_count = new Keen.Query("count_unique", { // Find number of sessions with payments
    eventCollection: "payment",
    targetProperty: "session.id",
    timeframe: last_7_days
  });

  var mashup = client.run([sessions_count, paid_sessions_count], function(res){  // Send query to Keen IO
    // divide paid sessions by sessions to get conversion rate
    var conversion_rate = (this.data[1].result/this.data[0].result).toFixed(2)*100

    window.chart = new Keen.Visualization({result: conversion_rate}, document.getElementById('paid-session-conversion'), {
      chartType: 'metric',
      title: "Conversion %",
      width: 400,
      colors: ['#6ab975']
    });
  });

```

## Combine two line charts

Here's an example that takes the data from two different line charts and plots them both onto the same graph.

![combined line chart](http://d26b395fwzu5fz.cloudfront.net/images/Keen-demo-combine-queries.png)

```javascript
// use a variable to ensure timeframe & interval for both queries match
var interval = "daily"
var timeframe = "last_30_days"

var pageviews = new Keen.Query("count", { // first query
	eventCollection: "pageviews",
	interval: interval,
	timeframe: timeframe
});

var uniqueVisitors = new Keen.Query("count_unique", { // second query
	eventCollection: "pageviews",
	targetProperty: "uuid",
	interval: interval,
	timeframe: timeframe
});

client.run([pageviews, uniqueVisitors], function(response){ // run the queries

	var result1 = response[0].result  // data from first query
	var result2 = response[1].result  // data from second query
	var data = []  // place for combined results
	var i=0

	while (i < result1.length) {

		data[i]={ // format the data so it can be charted
			timeframe: result1[i]["timeframe"],
			value: [
				{ category: "Pageviews", result: result1[i]["value"] },
				{ category: "Visitors", result: result2[i]["value"] }
			]
		}
		if (i == result1.length-1) { // chart the data
			window.chart = new Keen.Visualization({result: data}, document.getElementById('pageviews'), {
				chartType: "linechart",
				title: " ",
				chartOptions: {
					hAxis: {
						format:'MMM d',
						gridlines:  {count: 12}
					}
				}
			});
		}
		i++;
	}
});
```

## Automatic updates

Visualizations are bound to their underlying queries. Modify and re-run a query request, and the visualization will automagically update when the new data arrives.

```
count.set({ interval: “weekly”, timeframe: “this_48_weeks” });
request.refresh();
```
