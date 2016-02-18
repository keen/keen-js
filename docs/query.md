# Query Events

## How it works

Queries are first-class citizens, complete with parameter getters and setters. In order to run queries, you must be using the full Keen JS SDK (not the tracking only version) and if the library is loaded asynchronously, you need to wrap all querying in the `ready` function.

The `run` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

```javascript
var your_analysis = new Keen.Query(analysisType, {
  event_collection: 'YOUR_EVENT_COLLECTION', // (required)
  timeframe: "YOUR_TIMEFRAME" // (required)
  // ... additional parameters
});
```

## Example Usage

```javascript
//Configure the client
var client = new Keen({
  projectId: "your_project_id",
  readKey: "your_read_key"
});

Keen.ready(function(){
  // Count the number of times case study pages were viewed
  var count = new Keen.Query("count", {
    event_collection: "pageviews",
    timeframe: {
      "start":"2015-07-01T07:00:00.000Z",
      "end":"2015-08-01T07:00:00.000Z"
    },
    interval: "daily",
    max_age: 300, // activate query caching by assigning max_age (an integer representing seconds)
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
```
## Query Analysis Types

### Metrics

The various types of queries and their required parameters can be found in the Keen IO [Data Analysis API docs](https://keen.io/docs/data-analysis/metrics/).

### Extractions

Extractions let you pull the raw data out of Keen IO.  Learn more about extractions in the [API reference](https://keen.io/docs/data-analysis/extractions)

```javascript
var extraction = new Keen.Query('extraction', {
  event_collection: "pageviews",
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
  	  event_collection: "view_landing_page",
  	  actor_property: "user.id"
    },
    {
  	  event_collection: "signed_up",
  	  actor_property: "user.id"
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
  event_collection: "purchase",
  timeframe: "this_14_days",
  target_property: "price",
  group_by: "geo.country"
});
var max_revenue = new Keen.Query("maximum", {
  event_collection: "purchase",
  timeframe: "this_14_days",
  target_property: "price",
  group_by: "geo.country"
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

Data sent to Keen is available for querying almost immediately. For use cases that don’t require up-to-the-second answers but require fast performance, query caching can be used to speed up a query. To include query caching as a feature, just add the `max_age` query parameter to any other query parameters you’ve already specified. The first time your application makes a query specifying the max_age the answer will be calculated normally before it can be cached for future uses.

```javascript
var count = new Keen.Query("count", {
    event_collection: "pageviews",
    timeframe: "this_14_days",
    group_by: "property",
    max_age: 300 // include max_age as a query parameter to activate Query Caching
});
```
`max_age` is an integer which represents seconds. The maximum value for `max_age` is 129600 seconds or 36 hours. Read more about Query Caching in the Keen IO [Data Analysis Docs](https://keen.io/docs/data-analysis/caching/).

**Tip:** If you want to speed up your queries but maintain freshness, you can cache a year-long query and combine the result with a normal query that calculates the most current day’s answer.

## Timezones

The timezone parameter is available when running an analysis with a relative timeframes. We support a growing list of named timezones available as a convenience, such as "US/Mountain" and "Europe/London". It’s best to use these when you can because you no longer have to worry about Daylight Savings Time (DST).

It's also necessary to specify a string-value timezone ("US/Mountain") for queries with timeframes overlapping DST in any way. Using a string-value timezone shifts start/end times for each interval automagically, so intervals that exist inside or outside of DST will be set correctly. An integer-value timezone offset (-28800) applied to a timeframe overlapping with DST will be incorrect either during DST or during standard time.

Learn more about named timezones in the [API reference](https://keen.io/docs/api/#timezone).
