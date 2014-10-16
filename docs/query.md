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
    client.run(count, function(response){
      // Print the query result to the console
      console.log(response);
    });
  });
</script>
```
## Query Analysis Types

### Metrics

The various types of queries and their required parameters can be found in the [Data Analysis API docs](https://keen.io/docs/data-analysis/metrics/)Keen IO Data Analysis API docs.

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

var mashup = client.run([avg_revenue, max_revenue], function(res){
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
