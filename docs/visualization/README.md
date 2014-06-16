# Data Visualization

So you're collecting a bunch of awesome data, and now you'd like to visualize it in the dashboard of your dreams.

We have a great set of tools to turn your data into charts that you can embed on your internal dashboard, customer-facing site, or anywhere else you want. In fact, when you build a query using the Keen IO workbench, it automatically generates JavaScript code snippets that you can copy and paste!

Check out our [Usage Guide](https://github.com/keenlabs/keen-js/blob/2.1.2/README.md) and [JS SDK Reference](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference) to learn more!


## Number

Check out the SDK reference for [Keen.Number](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference#keennumber)

![Keen.Number example](http://d26b395fwzu5fz.cloudfront.net/images/v2/metric_example.png)


## LineChart

Check out the SDK reference for [Keen.LineChart](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference#keenlinechart)

![Keen.LineChart example](http://d26b395fwzu5fz.cloudfront.net/images/v2/series_example.png)


## PieChart

Check out the SDK reference for [Keen.PieChart](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference#keenpiechart)

![Keen.PieChart example](http://d26b395fwzu5fz.cloudfront.net/images/v2/pie_example.png)


## Multi-Line Chart

Check out the SDK reference for [Keen.MultilineChart](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference#keenmultilinechart)

![Keen.MultilineChart example](http://d26b395fwzu5fz.cloudfront.net/images/v2/multiline_example.png)


## FunnelChart

Check out the SDK reference for [Keen.FunnelChart](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference#keenfunnelchart-query---options--)

![Keen.FunnelChart example](http://d26b395fwzu5fz.cloudfront.net/images/v2/funnel_example.png)


## Custom Visualizations

There are lots of other great data exploration tools out there. All of our query capabilities are exposed by API, so you can use Keen IO with any charting library to create custom visualizations.

It's also super easy to [extract your Keen IO data](https://keen.io/docs/data-analysis/extractions/#extraction-to-file), or a filtered set of data, into a CSV file that you can work with in Excel, Tableau, [Data Hero](https://datahero.com/blog/2013/10/24/analyzing-keen-io-events-in-datahero/), or any other tool of your choice.

Below are examples to help you create:

* [Combined multi-line chart](#combined-multiline-chart)
* [Line chart with cumulative data](#line-chart-with-cumulative-data)
* [Number with divided query results](#number-with-divided-query-results)

> **Note:** these are just a few examples. You can always contact us to get help creating other custom visualizations of your data.


### Combined Multi-Line Chart

This is an example for how you can get query results for two Keen IO series, in parallel, and then combine them into one multi-line chart.

```
Keen.configure({
  projectId: id,
  readKey: key
});

// Timeframe parameters for queries
var timeframe = "last_14_days"
var interval = "daily"

Keen.onChartsReady(function(){

  // ==================================================
  // Create Signups Over Time Combined Multi-Line Chart
  // ==================================================

  var newOrgsSeries = new Keen.Series("create_organization", {  // First line in the line chart
    analysisType: "count",
    interval: interval,
    timeframe: timeframe,
  });

  var newOrgsFromPartnersSeries = new Keen.Series("create_organization", {  // Second line in the line chart
    analysisType: "count",
    interval: interval,
    timeframe: timeframe,
    filters: [{"property_name":"partner","operator":"eq","Heroku"}]
  });

  makeTwoLineSeriesChart(newOrgsSeries, "Total", newOrgsFromPartnersSeries, "Heroku", interval, "newOrgs")
});

function makeTwoLineSeriesChart(series1, series1label, series2, series2label, interval, div){

    var combinedResultArray = []  // variable to store results from various queries
    var result1 = null  // Create variables for holding query results
    var result2 = null

    series1.getResponse(function(response) {  // Get the values for the first query
        result1 = response.result
        combineResults()
    });

    series2.getResponse(function(response){  // Get the values for the second Series query
        result2 = response.result
        combineResults()
    });

    function combineResults() {

        if ((result1 != null) && (result2 != null)) {
            i = 0
            while (i < result1.length)
                {
                    combinedResultArray[i]={
                        timeframe: result1[i]["timeframe"],
                        value: [{ category: series1label, result: result1[i]["value"] },
                                { category: series2label, result: result2[i]["value"] }]
                    }
                i++;
                }
            drawMyMultiLineChart(combinedResultArray, "category", interval, div)
        }
        else {
            // do nothing
        }
    }
}

function drawMyMultiLineChart(data, groupBy, interval, div) {
    // The final formatting required so that the result can be processed by the Keen.MultiLineChart draw method.
    var formattedResult = {
        result: data
    }

    // Create a Series object so that it can be referenced by the draw method.
    // This is kind of a hack since we are passing in our own result object and not really querying the collection specified here.
    // The "placeholder" is used instead of a collection name, since this is not used.
    var placeholderSeries = new Keen.Series("placeholder", {
        interval: interval,
        groupBy: groupBy
    })

    var myMultiLineChart = new Keen.MultiLineChart(placeholderSeries, {
        chartWidth = 700,
        xAxisLabelAngle = "45%",
        colors = ["#268bd2", "#dc322f"]
    })

    myMultiLineChart.draw(document.getElementById(div),formattedResult);
}
```


### Line Chart with Cumulative Data

This is an example for how you can create a line chart with data that is shown cumulatively.

```
Keen.onChartsReady(function(){
  var loginsPreviousWeek = new Keen.Series("logins", {
    analysisType: "count",
    timeframe: "previous_7_days",
    interval: "daily"
  });

  //Get the result of the query and add the results cumulatively.
  loginsPreviousWeek.getResponse(function(response){
    var result = response.result;
    var whichResult = 0;
    var cumulativeResult = 0;
    while (whichResult < result.length){
      cumulativeResult = cumulativeResult + result[whichResult].value;
      result[whichResult].value = cumulativeResult;
      whichResult++;
    };

    //Create a LineChart visualization for that Series.
    var myLineChart = new Keen.LineChart(loginsPreviousWeek, {
      height: "300",
      width: "600",
      label: "logins",
      title: "logins previous 7 days"
    });
    //Draw the visualization into a div
    myLineChart.draw(document.getElementById("myDiv"), response);
  });
});
```


### Number with Divided Query Results

This is an example of how you can create a number with the divided results of two queries.

```
Keen.onChartsReady(function(){

  //Create a Metric containing our total number of logins.
  var myMetric = new Keen.Metric("logins", {
    analysisType: "count"
  });

  //Create a Metric containing our total number of registers.
  var myMetric2 = new Keen.Metric("registers", {
    analysisType: "count"
  })

  myMetric.getResponse(function(response){
    firstValue = response.result;
    myMetric2.getResponse(function(nextResponse){
      secondValue = nextResponse.result;
      divided = firstValue/secondValue;
      console.log(divided);

      //Create a Number visualization for that metric.
      var myNumberVisualization = new Keen.Number(myMetric2, {
        height: "300",
        width: "600",
        label: "total logins"
      });
      //Draw the visualization in a div
      myNumberVisualization.draw(document.getElementById("myDiv"),
      {"result":divided});

    })
  })
});
```