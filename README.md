# Keen IO JavaScript SDK (v3.0.9)

**Important:** v3 is now the current version. v2 source and docs are located [here](https://github.com/keenlabs/keen-js/tree/v2).

[![Build Status](https://api.travis-ci.org/keenlabs/keen-js.png?branch=master)](https://travis-ci.org/keenlabs/keen-js)
[![Selenium Test Status](https://saucelabs.com/buildstatus/keenlabs-js)](https://saucelabs.com/u/keenlabs-js)

_Tracking is manually tested and validated on Internet Explorer 6, 7, and 8._


## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project). The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.


## Install the library

Load this library asynchronously from our CDN by copy/pasting this snippet of JavaScript above the `</head>` tag of your page.

```html
<script type="text/javascript">
  !function(a,b){a("Keen","https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js",b)}(function(a,b,c){var d,e,f;c["_"+a]={},c[a]=function(b){c["_"+a].clients=c["_"+a].clients||{},c["_"+a].clients[b.projectId]=this,this._config=b},c[a].ready=function(b){c["_"+a].ready=c["_"+a].ready||[],c["_"+a].ready.push(b)},d=["addEvent","setGlobalProperties","trackExternalLink","on"];for(var g=0;g<d.length;g++){var h=d[g],i=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};c[a].prototype[h]=i(h)}e=document.createElement("script"),e.async=!0,e.src=b,f=document.getElementsByTagName("script")[0],f.parentNode.insertBefore(e,f)},this);
</script>
```

Alternatively, you can load the library synchronously from our CDN:

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js" type="text/javascript"></script>
```

Read our [Installation guide](./docs/installation.md) to learn about all the ways this library can fit into your workflow.


## Configure a new Keen JS client

When instantiating a new Keen JS client, there are a number of possible configuration options. A `projectId` is required at all times, and `writeKey` and `readKey` are required for sending or querying data, respectively.

```html
<script type="text/javascript">
  var client = new Keen({
    projectId: "your_project_id",       // String (required)
    writeKey: "your_project_write_key", // String (required for sending data)
    readKey: "your_project_read_key",   // String (required for querying data)
    protocol: "https",                  // String (optional: https | http | auto)
    host: "api.keen.io/3.0",            // String (optional)
    requestType: "jsonp"                // String (optional: jsonp, xhr, beacon)
  });
</script>
```

You can configure new instances for as many projects as necessary.

## Tracking Events

Let's record some data! Here is a basic example for tracking events in your app:

``` javascript
// Configure an instance for your project
var client = new Keen({...});

// Create a data object with the properties you want to send
var purchase = {
  item: "golden gadget",  
  price: 25.50,
  referrer: document.referrer,
  keen: {
    timestamp: new Date().toISOString()
  }
};

// Send it to the "purchases" collection
client.addEvent("purchases", purchase);
```

Send as many events as you like. Each event will be fired off to the Keen IO servers asynchronously.

Read more about all the ways you can track events in our [tracking guide](./docs/track.md).

Wondering what else you should track? Browse our [data modeling guide](https://github.com/keenlabs/data-modeling-guide), and send us recommendations or pull requests if you don't find what you're looking for.


## Querying events

Queries are first-class citizens, complete with parameter getters and setters.

The `<Client>.run` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

```javascript
var your_analysis = new Keen.Query(analysisType, params);
```

### Example Usage

```javascript
var client = new Keen({
  projectId: "your_project_id",
  readKey: "your_read_key"
});

var count = new Keen.Query("count", {
  eventCollection: "pageviews",
  groupBy: "property",
  timeframe: "this_7_days"
});

// Send query
client.run(count, function(response){
  // response.result
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
var count = new Keen.Query("count", {
  eventCollection: "pageviews",
  groupBy: "visitor.geo.country",
  interval: "daily",
  timeframe: "this_21_days"
});
client.draw(count, document.getElementById("chart-wrapper"), {
  chartType: "columnchart",
  title: "Custom chart title"
});
```

Read more about building charts from query responses in our [visualization guide](./docs/visualization.md).

## Resources

[Data Modeling Guide](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkRhdGEgTW9kZWxpbmcgR3VpZGUiLCJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=https://github.com/keenlabs/data-modeling-guide/)

[API Technical Reference](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBUZWNobmljYWwgUmVmZXJlbmNlIiwicmVmZXJyZXIiOiAiUkVBRE1FLm1kIn0=&redirect=https://keen.io/docs/api/reference/)

[API Status](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBTdGF0dXMiLCJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=http://status.keen.io/)

## Support

Need a hand with something? Shoot us an email at [contact@keen.io](mailto:contact@keen.io)
