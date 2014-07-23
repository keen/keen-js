# keen-js v3.0.4

A crisp, new JS Library for the Keen IO API.

**Important:** v3 is now the current version. v2.1.2 documentation is located [here](https://github.com/keenlabs/keen-js/tree/2.1.2).

[![RepoStats](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/visit?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjoiUkVBRE1FLm1kIiwidmlzaXRvciI6eyJpcF9hZGRyZXNzIjoiJHtrZWVuLmlwfSIsInVzZXJfYWdlbnQiOiIke2tlZW4udXNlcl9hZ2VudH0ifSwia2VlbiI6eyJhZGRvbnMiOlt7Im5hbWUiOiJrZWVuOmlwX3RvX2dlbyIsImlucHV0Ijp7ImlwIjoidmlzaXRvci5pcF9hZGRyZXNzIn0sIm91dHB1dCI6InZpc2l0b3IuZ2VvIn0seyJuYW1lIjoia2Vlbjp1YV9wYXJzZXIiLCJpbnB1dCI6eyJ1YV9zdHJpbmciOiJ2aXNpdG9yLnVzZXJfYWdlbnQifSwib3V0cHV0IjoidmlzaXRvci50ZWNoIn1dfX0=&redirect=http://img.shields.io/badge/Stats-Keen%20IO-blue.svg)](https://github.com/keenlabs/keen-js)
[![Build Status](https://api.travis-ci.org/keenlabs/keen-js.png?branch=master)](https://travis-ci.org/keenlabs/keen-js)
[![Selenium Test Status](https://saucelabs.com/buildstatus/keenlabs-js)](https://saucelabs.com/u/keenlabs-js)

Tracking is manually tested and validated on Internet Explorer 6, 7, and 8.


## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.

Read our [Installation guide](https://github.com/keenlabs/keen-js/wiki/Installation) to learn about all the ways this library can fit into your workflow.

## Quick Setup

Install the Keen JS SDK on your page by copy/pasting this snippet of JavaScript above the `</head>` tag of your page.

```javascript
<script type="text/javascript">
  !function(a,b){if(void 0===b[a]){b["_"+a]={},b[a]=function(c){b["_"+a].clients=b["_"+a].clients||{},b["_"+a].clients[c.projectId]=this,this._config=c},b[a].ready=function(c){b["_"+a].ready=b["_"+a].ready||[],b["_"+a].ready.push(c)};for(var c=["addEvent","setGlobalProperties","trackExternalLink","on"],d=0;d<c.length;d++){var e=c[d],f=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};b[a].prototype[e]=f(e)}var g=document.createElement("script");g.type="text/javascript",g.async=!0,g.src="https://d26b395fwzu5fz.cloudfront.net/3.0.5/keen.min.js";var h=document.getElementsByTagName("script")[0];h.parentNode.insertBefore(g,h)}}("Keen",this);
</script>
```

The Keen IO JS Library is built around instances of your project(s). Once configured, these objects take on super powers, allowing you to send and query data with minimal effort.

```javascript
<script>
  var client = new Keen({
    projectId: "your_project_id",
    writeKey: "your_write_key",
    readKey: "your_read_key"
  });
</script>
```

You can configure new instances for as many projects as necessary. [Read more about configuration here](https://github.com/keenlabs/keen-js/wiki/Configuration).


## Tracking Events

Let's record some data! Here is a basic example for tracking events in your app:

```javascript
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

Read more about all the ways you can track events in our [tracking guide](https://github.com/keenlabs/keen-js/wiki/Track).

Wondering what else you should track? Browse our [data modeling guide](https://github.com/keenlabs/data-modeling-guide), and send us recommendations or pull requests if you don't find what you're looking for.


## Querying events

Queries are first-class citizens, complete with parameter getters and setters.

The `<Client>.run` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

```
var your_analysis = new Keen.Query(analysisType, params);
```

### Example Usage

```
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

Read more about advanced queries in our [query guide](https://github.com/keenlabs/keen-js/wiki/Query).

## Visualization

Building charts from queries is easier than ever.

Clients have a #draw method with accepts a query, a DOM selector, and a configuration object as arguments. You can call this directly on the client, which will execute a request and visualize its response, like so:

```
client.draw(query, selector, config);
```

Requests also have a draw method. The query is already known in this case, so you can omit the query from the method signature:

```
var request = client.run(query, function(){
  this.draw(document.getElementById("chart-wrapper"), {
    title: "Custom chart title"
  });
});
```

A future release will add the ability to plot multiple query responses on a single chart, but for the time being only the first query response will be visualized.

### Example usage

```
var count = new Keen.Query("count", {
  eventCollection: "pageviews",
  groupBy: "visitor.geo.country"
  interval: "daily",
  timeframe: "this_21_days"
});
var request = client.run(count, function(){
  this.draw(document.getElementById("chart-wrapper"), {
    chartType: "columnchart",
    title: "Custom chart title"
  });
});
```

Read more about building charts from query responses in our [visualization guide](https://github.com/keenlabs/keen-js/wiki/Visualization).

## Resources

[Data Modeling Guide](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkRhdGEgTW9kZWxpbmcgR3VpZGUiLCJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=https://github.com/keenlabs/data-modeling-guide/)

[API Technical Reference](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBUZWNobmljYWwgUmVmZXJlbmNlIiwicmVmZXJyZXIiOiAiUkVBRE1FLm1kIn0=&redirect=https://keen.io/docs/api/reference/)

[API Status](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBTdGF0dXMiLCJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=http://status.keen.io/)

## Support

Need a hand with something? Join us in [HipChat](http://users.keen.io/), [IRC](http://webchat.freenode.net/?channels=keen-io), or shoot us an email at [contact@keen.io](mailto:contact@keen.io)
