# Installation

**Important:** Several of our versions have been dropped from npm and are unable to be republished.
Please see this [issue thread for more information](https://github.com/keen/keen-js/issues/355#issuecomment-156231882).

```ssh
# via npm
$ npm install keen-js

# or bower
$ bower install keen-js
```

For quick browser use, copy/paste this snippet of JavaScript above the `</head>` tag of your page:

```html
<script type="text/javascript">
!function(a,b){a("Keen","https://d26b395fwzu5fz.cloudfront.net/3.4.0-rc/keen.min.js",b)}(function(a,b,c){var d,e,f;c["_"+a]={},c[a]=function(b){c["_"+a].clients=c["_"+a].clients||{},c["_"+a].clients[b.projectId]=this,this._config=b},c[a].ready=function(b){c["_"+a].ready=c["_"+a].ready||[],c["_"+a].ready.push(b)},d=["addEvent","setGlobalProperties","trackExternalLink","on"];for(var g=0;g<d.length;g++){var h=d[g],i=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};c[a].prototype[h]=i(h)}e=document.createElement("script"),e.async=!0,e.src=b,f=document.getElementsByTagName("script")[0],f.parentNode.insertBefore(e,f)},this);
</script>
```

`addEvent`, `setGlobalProperties`, and `trackExternalLink` methods are available immediately, but data will be cached locally. Once the library has loaded, any methods you have called will be "replayed" and cached data will be sent to our service.

```javascript
// paste async code snippet here
var client = new Keen({
  projectId: "your_project_id",
  writeKey: "your_write_key"
});
client.addEvent("pageview", { key: "value" });
```

### Keen.ready(fn)

Unlike the core `Keen` object and its tracking-related methods, `Keen.Query`, `Keen.Visualization`, `Keen.Dataviz` and `Keen.Dataset` won't be available until the library has finished loading. Use our ready callback, `Keen.ready()`, to safely wrap any references to these objects.

```javascript
Keen.ready(function(){
  // runs once library has loaded
  var query = new Keen.Query("count", {
    event_collection: "pageviews"
  });
  // .. run query, visualize, etc.
});
```

**Important:** `Keen.ready()` also waits to fire until after the DOM is ready (using [domready](https://github.com/ded/domready)) and the Google Visualization library has been loaded into the page.


## Synchronous Loading

Simple, synchronous loading.

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/3.4.0-rc/keen.min.js" type="text/javascript"></script>
```

## Tracking-only

If you only need to track events, replace the URLs in your installation with this version:

```
https://d26b395fwzu5fz.cloudfront.net/3.4.0-rc/keen-tracker.min.js
```

## AMD/CommonJS

We want to make this library AMD/CommonJS-friendly, so if you run into any conflicts or bugs with specific loaders, please let us know by opening a new issue.

**A few notes about RequireJS**

The library is loaded with an explicitly named module ID ("keen"), which presents a light configuration step, but prevents anonymous define() mismatch mayhem. To use this module, configure a `paths` record, like so:

```javascript
requirejs.config({
  "paths": {
    "keen": "https://d26b395fwzu5fz.cloudfront.net/3.4.0-rc/keen"
  }
});
require([ "keen" ], function(Keen) {
  var client = new Keen({ ... });
});
```

This library uses the Google Charts API for data visualization, which imposes a few installation challenges for RequireJS usage. [Read this to learn more](https://github.com/keen/keen-js/issues/341#issuecomment-148039517).
