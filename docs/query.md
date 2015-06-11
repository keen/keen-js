# Query Events

## How it works

Queries are first-class citizens, complete with parameter getters and setters. In order to run queries, you must be using the full Keen JS SDK (not the tracking only version) and if the library is loaded asynchronously, you need to wrap all querying in the `ready` function.

The `run` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

```javascript
var your_analysis = new Keen.Query(analysisType, params);
```

## Example Usage

```javascript
<script type="text/javascript">

  //Configure the client
  var client = new Keen({
      projectId: "your_project_id",
      readKey: "your_read_key"
  });

  Keen.ready(function(){
    // Count the number of times case study pages were viewed
    var count = new Keen.Query("count", {
      eventCollection: "pageviews",
      interval: "daily",
      timeframe: "this_7_days",
      maxAge: 300, // activate query caching by assigning maxAge (an integer representing seconds)
      filters: [
        {
          "property_name" : "domain",
          "operator" : "eq",
          "property_value" : "www.mysite.io" // look at one particular domain only
        },
        {
          "property_name":"url.full",
          "operator":"contains",
          "property_value":"casestudy"  // only count views with "casestudy" in the page URL
        }
     ]
    });

    // Send query
    client.run(count, function(err, response){
      // Print the query result to the console
      console.log(response);
    });
  });
</script>
```
## Query Analysis Types

### Metrics

The various types of queries and their required parameters can be found in the Keen IO [Data Analysis API docs](https://keen.io/docs/data-analysis/metrics/).

### Extractions

Extractions let you pull the raw data out of Keen IO.  Learn more about extractions in the [API reference](https://keen.io/docs/data-analysis/extractions)

```javascript
var extraction = new Keen.Query('extraction', {
  eventCollection: "pageviews",
  timeframe: "today"
});
```

**A note about extractions:** supply an optional `email` attribute to be notified when your extraction is ready for download. If email is not specified, your extraction will be processed synchronously and your data will be returned as JSON.

### Funnels

`Keen.Funnel` requires a `steps` attribute.  Learn more about funnels in the [API reference](https://keen.io/docs/data-analysis/funnels/#steps)

```javascript
var funnel = new Keen.Query('funnel', {
  steps: [
    {
  	  eventCollection: "view_landing_page",
  	  actorProperty: "user.id"
    },
    {
  	  eventCollection: "signed_up",
  	  actorProperty: "user.id"
    },
  ],
  timeframe: "this_6_months"
});
```

## Run multiple analyses at once

The `run` method accepts an individual analysis or array of analyses. In the latter scenario, the callback is fired once all requests have completed without error. Query results are then returned in a correctly sequenced array.

Query results are also attached to the query object itself, and can be referenced as `this.data`.

```javascript
var avg_revenue = new Keen.Query("average", {
  eventCollection: "purchase",
  targetProperty: "price",
  groupBy: "geo.country"
});
var max_revenue = new Keen.Query("maximum", {
  eventCollection: "purchase",
  targetProperty: "price",
  groupBy: "geo.country"
});

var mashup = client.run([avg_revenue, max_revenue], function(err, res){
  // res[0].result or this.data[0] (avg_revenue)
  // res[1].result or this.data[1] (max_revenue)
});  
```
## Get/Set Parameters and Refresh Queries

```javascript
// Based on previous example

// Update parameters
avg_revenue.set({ timeframe: "this_21_days" });
max_revenue.set({ timeframe: "this_21_days" });

// Re-run the query
mashup.refresh();
```
## Query Caching

Data sent to Keen is available for querying almost immediately. For use cases that don’t require up-to-the-second answers but require fast performance, query caching can be used to speed up a query. To include query caching as a feature, just add the `maxAge` query parameter to any other query parameters you’ve already specified. The first time your application makes a query specifying the max_age the answer will be calculated normally before it can be cached for future uses. 

```javascript
var count = new Keen.Query("count", {
    eventCollection: "pageviews",
    groupBy: "property",
    timeframe: "this_7_days",
    maxAge: 300 // include maxAge as a query parameter to activate Query Caching
});
```
`maxAge` is an integer which represents seconds. The maximum value for `maxAge` is 129600 seconds or 36 hours. Read more about Query Caching in the Keen IO [Data Analysis Docs](https://keen.io/docs/data-analysis/caching/).

**Tip:** If you want to speed up your queries but maintain freshness, you can cache a year-long query and combine the result with a normal query that calculates the most current day’s answer.
