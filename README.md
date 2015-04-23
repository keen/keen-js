# Keen IO JavaScript SDK (v3.2.4)

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

For quick browser use, copy/paste this snippet of JavaScript above the `</head>` tag of your page:

```html
<script type="text/javascript">
  !function(a,b){a("Keen","https://d26b395fwzu5fz.cloudfront.net/3.2.4/keen.min.js",b)}(function(a,b,c){var d,e,f;c["_"+a]={},c[a]=function(b){c["_"+a].clients=c["_"+a].clients||{},c["_"+a].clients[b.projectId]=this,this._config=b},c[a].ready=function(b){c["_"+a].ready=c["_"+a].ready||[],c["_"+a].ready.push(b)},d=["addEvent","setGlobalProperties","trackExternalLink","on"];for(var g=0;g<d.length;g++){var h=d[g],i=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};c[a].prototype[h]=i(h)}e=document.createElement("script"),e.async=!0,e.src=b,f=document.getElementsByTagName("script")[0],f.parentNode.insertBefore(e,f)},this);
</script>
```

Or load the library synchronously from our CDN:

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/3.2.4/keen.min.js" type="text/javascript"></script>
```
or

```html
<script src="//cdn.jsdelivr.net/keen.js/3.2.3/keen.min.js" type="text/javascript"></script>
```

Read our [Installation guide](./docs/installation.md) to learn about all the ways this library can fit into your workflow.


## Configure a new Keen JS client

When instantiating a new Keen JS client, there are a number of possible configuration options. A `projectId` is required at all times, and `writeKey` and `readKey` are required for sending or querying data, respectively.

```html
<script type="text/javascript">
  var client = new Keen({
    projectId: "YOUR_PROJECT_ID",   // String (required always)
    writeKey: "YOUR_WRITE_KEY",     // String (required for sending data)
    readKey: "YOUR_READ_KEY",       // String (required for querying data)
    protocol: "https",              // String (optional: https | http | auto)
    host: "api.keen.io/3.0",        // String (optional)
    requestType: "jsonp"            // String (optional: jsonp, xhr, beacon)
  });
</script>
```

You can configure new instances for as many projects as necessary.

## Record a single event

Here is a basic example for tracking "purchases" in your app:

```javascript
// Configure an instance for your project
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  writeKey: "YOUR_WRITE_KEY"
});

// Create a data object with the properties you want to send
var purchaseEvent = {
  item: "golden gadget",  
  price: 25.50,
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

```javascript
// Configure an instance for your project
var client = new Keen({...});

var multipleEvents = {
  "purchases": [
    { item: "golden gadget", price: 25.50, transaction_id: "f029342" },
    { item: "a different gadget", price: 17.75, transaction_id: "f029342" }
  ],
  "transactions": [
    {
      id: "f029342",
      items: 2,
      total: 43.25
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

Read more about all the ways you can track events in our [tracking guide](./docs/track.md).

Wondering what else you should track? Browse our [data modeling guide](https://github.com/keen/data-modeling-guide), and send us recommendations or pull requests if you don't find what you're looking for.


## Querying events

The `<Client>.run` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

```javascript
var your_analysis = new Keen.Query(analysisType, params);
```

### Example Usage

```javascript
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  readKey: "YOUR_READ_KEY"
});

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
```

Read more about advanced queries in our [query guide](./docs/query.md).

## Visualization

Building charts from queries is easier than ever.

Clients have a #draw method with accepts a query, a DOM selector, and a configuration object as arguments. You can call this directly on the client, which will execute a request and visualize its response, like so:

```javascript
client.draw(query, selector, config);
```

A future release will add the ability to plot multiple query responses on a single chart, but for the time being only the first query response will be visualized.

### Example usage

```javascript
// Create a client and a query
var client = new Keen({ /* your config */ });
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
