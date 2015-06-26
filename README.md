# Keen IO JavaScript SDK (v3.2.5)

## What Is Keen IO?

The purpose of Keen IO is to help you store huge amounts of data you collect and to provide a tool (Application Programming Interface, or API) for you to analyze that data. Event data (contains an action, a timestamp, and a state) is the type of data that works best within the Keen API.

## What Is The Keen IO API?

The Keen IO Application Programming Interface (API) is an analytics tool, specifically designed for developers to track any event, ie. signups, upgrades, impressions, purchases, powerups, errors, shares, etc. This API requires the use of the JSON format to store the data you would like to analyze. This will enable automatic ingestion of any new events and custom properties you would like to run a query on. With the use of this API, you can build a completely custom analytics solution and embed the analytics on your site or provide insight into your company or projects to your customers.


## First Step: Determine If Keen IO Is For You


## Second Step: Begin Using the Keen IO Tools

**Copy the link from the Keen website**

## Third Step: Import Data into Keen IO


## Fourth Step: Run Querries

### Configure A Project



### Include The Library
#### What is the JS Library For?

### HTML and JavaScript Formatting

The HTML Layout describes the formatting of the data vizualization on the displayed dashboard, ie how many figures will be displayed. The Javascript runs the queries and draws the figures within the appropriate sections of the dashboard. Examples of the HTML and JavaScript formatting will be described in more detail below.

#### HTML Layout

**Will show an example of an empty dashboard and the HTML code provided**



##### More Advanced Dashboards

**Tabs and buttons**

#### JavaScript Layout

**Will show an example of Javascript: how to run a querry and how to draw a figure**

### Query Examples

**What queries can be created? What are the various components? Provide Examples of Filters, timestamp, analysis type, group_by, etc.**



#### Query Trouble Shooting

##### Ouput to Console
##### Inspect Network Requests





### Vizualization Types

**Describe the vizualzation types and then provide Code Samples**

#### Standard Vizualizations

There are some standard Vizualizations you can create on your Dashboard: Area Charts, Bar Charts, Column Charts, Line Charts, Metric Summary, Pie Charts, and Tables.

The first few charts will use the following querry example written in JavaScript:

	var total_pageviews = new Keen.Query("count", {
  		eventCollection: "pageviews",
  		groupBy: "channel",
  		timeframe: "this_3_days",
  		interval: "daily"
	});
The query above is to determine how many users view a specific page over the web versus over a mobile device.


##### Area Charts

Below is the sample of JavaScript code needed to create an Area Chart showing pageviews on the web versus on a mobile device over time.

	client.draw(total_pageviews, document.getElementById("total-daily-revenue-areachart"), {
  		chartType: "areachart",
  		title: "Daily revenue (7 days)",
  		chartOptions: {
   			isStacked: true
  		}
	});

 
![Resize icon][1] 

[1]: https://camo.githubusercontent.com/82bd177d318ab150db071297fac9862276382a64/687474703a2f2f6432366233393566777a7535667a2e636c6f756466726f6e742e6e65742f696d616765732f4b65656e2d64656d6f2d6172656163686172742e706e67

The html code will need to include the following line:

	<div id="total-daily-revenue-areachart"></div>

##### Bar Charts

Below is the sample of JavaScript code needed to create an Area Chart showing pageviews on the web versus on a mobile device over time.

	client.draw(total_pageviews, document.getElementById("total-daily-revenue-barchart"), {
  		chartType: "barchart",
  		title: "Daily revenue (7 days)",
  		chartOptions: {
    		isStacked: true
  		}
	});

![Resize icon][2] 

[2]: https://camo.githubusercontent.com/e84d9ed664f3cce116f6fbeea0cdf6164d54bd19/687474703a2f2f6432366233393566777a7535667a2e636c6f756466726f6e742e6e65742f696d616765732f4b65656e2d64656d6f2d62617263686172742e706e67

The html code will need to include the following line

	<div id="total-daily-revenue-barchart"></div>

#### Advanced Visualizations





## What is the JS library For??

**Important:** v3.2.0 introduced several breaking changes from previous versions. Check out the [Changelog](./CHANGELOG.md#3.2.0) before upgrading.

**Charts issue:** A recent update to the Google Visualization API is causing charts to fail in earlier versions of this library. To resolve the issue, simply update from v3.0.x to [v3.1.0](https://d26b395fwzu5fz.cloudfront.net/3.1.0/keen.js). This is a safe upgrade with no breaking changes from earlier affected versions. Read about this release [here](https://github.com/keen/keen-js/releases/tag/v3.1.0).
<!--
[![Build Status](https://api.travis-ci.org/keen/keen-js.png?branch=master)](https://travis-ci.org/keen/keen-js) [![Selenium Test Status](https://saucelabs.com/buildstatus/keenlabs-js)](https://saucelabs.com/u/keenlabs-js)
-->

## Documentation

Docs have been moved into the master branch, so they stay in sync with each release. Check out the latest [here](./docs).

v3.1.0 docs are [here](https://github.com/keen/keen-js/tree/v3.1.0/docs), and v2 docs are [way back here](https://github.com/keen/keen-js/tree/v2).


## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/login?s=gh_js). The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.


## Install the library

```ssh
# via npm
$ npm install keen-js

# or bower
$ bower install keen-js
```

To start recording events from your website or blog, copy/paste this snippet of JavaScript above the `</head>` tag of your page:

```html
<script type="text/javascript">
  !function(a,b){a("Keen","https://d26b395fwzu5fz.cloudfront.net/3.2.5/keen.min.js",b)}(function(a,b,c){var d,e,f;c["_"+a]={},c[a]=function(b){c["_"+a].clients=c["_"+a].clients||{},c["_"+a].clients[b.projectId]=this,this._config=b},c[a].ready=function(b){c["_"+a].ready=c["_"+a].ready||[],c["_"+a].ready.push(b)},d=["addEvent","setGlobalProperties","trackExternalLink","on"];for(var g=0;g<d.length;g++){var h=d[g],i=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};c[a].prototype[h]=i(h)}e=document.createElement("script"),e.async=!0,e.src=b,f=document.getElementsByTagName("script")[0],f.parentNode.insertBefore(e,f)},this);
</script>
```

Or load the library synchronously from our CDN:

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/3.2.5/keen.min.js" type="text/javascript"></script>
```
or

```html
<script src="//cdn.jsdelivr.net/keen.js/3.2.5/keen.min.js" type="text/javascript"></script>
```

Read our [Installation guide](./docs/installation.md) to learn about all the ways this library can fit into your workflow.


## Configure a new Keen JS client

When instantiating a new Keen JS client, there are a number of possible configuration options. A `projectId` is required at all times, and `writeKey` and `readKey` are required for sending or querying data, respectively.

```html
<script type="text/javascript">
  var client = new Keen({
    projectId: "YOUR_PROJECT_ID", // String (required always)
    writeKey: "YOUR_WRITE_KEY",   // String (required for sending data)
    readKey: "YOUR_READ_KEY"      // String (required for querying data)

    // protocol: "https",         // String (optional: https | http | auto)
    // host: "api.keen.io/3.0",   // String (optional)
    // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
  });
</script>
```

You can configure new instances for as many projects as necessary.

## Record a single event

Here is an example for recording a "purchases" event. Note that dollar amounts are tracked in cents:

```javascript
// Configure an instance for your project
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  writeKey: "YOUR_WRITE_KEY"
});

// Create a data object with the properties you want to send
var purchaseEvent = {
  item: "golden gadget",  
  price: 2550, // track dollars as cents
  referrer: document.referrer,
  keen: {
    timestamp: new Date().toISOString()
  }
};

// Send it to the "purchases" collection
client.addEvent("purchases", purchaseEvent, function(err, res){
  if (err) {
    // there was an error!
  }
  else {
    // see sample response below
  }
});
```

### API response for recording a single event

```json
{
  "created": true
}
```

Send as many events as you like. Each event will be fired off to the Keen IO servers asynchronously.

## Record multiple events

Here is an example for how to record multiple events with a single API call. Note that dollar amounts are tracked in cents:

```javascript
// Configure an instance for your project
var client = new Keen({...});

var multipleEvents = {
  "purchases": [
    { item: "golden gadget", price: 2550, transaction_id: "f029342" },
    { item: "a different gadget", price: 1775, transaction_id: "f029342" }
  ],
  "transactions": [
    {
      id: "f029342",
      items: 2,
      total: 4325
    }
  ]
};

// Send multiple events to several collections
client.addEvents(multipleEvents, function(err, res){
  if (err) {
    // there was an error!
  }
  else {
    // see sample response below
  }
});
```

### API response for recording multiple events

```json
{
  "purchases": [
    {
      "success": true
    },
    {
      "success": true
    }
  ],
  "transactions": [
    {
      "success": true
    }
  ]
}
```

Read more about all the ways you can record events in our [tracking guide](./docs/track.md).

Wondering what else you should record? Browse our [data modeling guide](https://github.com/keen/data-modeling-guide), and send us recommendations or pull requests if you don't find what you're looking for.


## Querying events

The `<Client>.run` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

```javascript
var your_analysis = new Keen.Query(analysisType, params);
```

### Example Usage

```javascript
// Create a client instance
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  readKey: "YOUR_READ_KEY"
});

Keen.ready(function(){

  // Create a query instance
  var count = new Keen.Query("count", {
    eventCollection: "pageviews",
    groupBy: "property",
    timeframe: "this_7_days"
  });

  // Send query
  client.run(count, function(err, res){
    if (err) {
      // there was an error!
    }
    else {
      // do something with res.result
    }
  });

});
```

Read more about advanced queries in our [query guide](./docs/query.md).


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


## Visualization

Building charts from queries is easier than ever.

Clients have a #draw method with accepts a query, a DOM selector, and a configuration object as arguments. You can call this directly on the client, which will execute a request and visualize its response, like so:

```javascript
client.draw(query, node, config);
```

A future release will add the ability to plot multiple query responses on a single chart, but for the time being only the first query response will be visualized.

### Example usage

```javascript
// Create a client instance
var client = new Keen({ /* your config */ });

Keen.ready(function(){

  // Create a query instance
  var count = new Keen.Query("count", {
    eventCollection: "pageviews",
    groupBy: "visitor.geo.country",
    interval: "daily",
    timeframe: "this_21_days"
  });

  // Basic charting w/ `client.draw`:
  client.draw(count, document.getElementById("chart-wrapper"), {
    chartType: "columnchart",
    title: "Custom chart title"
  });

  // Advanced charting with `Keen.Dataviz`:
  var chart = new Keen.Dataviz()
    .el(document.getElementById("chart-wrapper"))
    .chartType("columnchart")
    .prepare(); // starts spinner

  var req = client.run(query, function(err, res){
    if (err) {
      // Display the API error
      chart.error(err.message);
    }
    else {
      // Handle the response
      chart
        .parseRequest(this)
        .title("Custom chart title")
        .render();
    }
  });

  // How about a chart that updates itself every 15 minutes?
  setInterval(req.refresh, 1000 * 60 * 15);
});
```

Read more about building charts from query responses in our [visualization guide](./docs/visualization.md).

## Contributing

This is an open source project and we love involvement from the community! Hit us up with pull requests and issues.

The aim is to build up this module to completely represent the API provided by Keen IO, which is quite extensive. The more contributions the better!

## Resources

[Data Modeling Guide](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkRhdGEgTW9kZWxpbmcgR3VpZGUiLCJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=https://github.com/keen/data-modeling-guide/)

[API Technical Reference](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBUZWNobmljYWwgUmVmZXJlbmNlIiwicmVmZXJyZXIiOiAiUkVBRE1FLm1kIn0=&redirect=https://keen.io/docs/api/reference/?s=gh_js)

[API Status](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBTdGF0dXMiLCJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=http://status.keen.io/?s=gh_js)

## Support

Need a hand with something? Shoot us an email at [contact@keen.io](mailto:contact@keen.io)
