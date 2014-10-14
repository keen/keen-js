Read our [Getting Started guide](./Getting-Started) to learn about connecting to projects from your Keen IO account.

## Asynchronous Loading

Copy+paste this snippet of JavaScript above the `</head>` tag of your page.

```html
<script type="text/javascript">
  !function(a,b){if(void 0===b[a]){b["_"+a]={},b[a]=function(c){b["_"+a].clients=b["_"+a].clients||{},b["_"+a].clients[c.projectId]=this,this._config=c},b[a].ready=function(c){b["_"+a].ready=b["_"+a].ready||[],b["_"+a].ready.push(c)};for(var c=["addEvent","setGlobalProperties","trackExternalLink","on"],d=0;d<c.length;d++){var e=c[d],f=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};b[a].prototype[e]=f(e)}var g=document.createElement("script");g.type="text/javascript",g.async=!0,g.src="https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js";var h=document.getElementsByTagName("script")[0];h.parentNode.insertBefore(g,h)}}("Keen",this);
</script>
```

`addEvent`, `setGlobalProperties`, `trackExternalLink` and `ready` methods are available immediately, but data will be cached locally. Once the library has loaded, any methods you have called will be "replayed" and cached data will be sent to our service.

```javascript
client.addEvent("pageview", { key: "value" });
```

**Important:** Additional methods and classes, such as `Keen.Query` or `Keen.Visualization` won't be available until the library has finished loading and `Keen.ready()` has been triggered.

```javascript
Keen.ready(function(){
  // runs once library has loaded
  var query = new Keen.Query("count", {
    eventCollection: "pageviews"
  });
  // .. run query, visualize, etc.
});
```


## Synchronous Loading

Simple, synchronous loading.

**Specified version:** (recommended)

```javascript
 <script src="https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js"></script>
```

**Latest build:**

```javascript
 <script src="https://d26b395fwzu5fz.cloudfront.net/latest/keen.min.js"></script>
```

## Bower

If you're using [Bower](http://bower.io/), you can load this library into your project with the following command:

`$ bower install keen-js`

Full and tracking-only versions of the library will be retrieved.

## AMD/CommonJS

We want to make this library AMD/CommonJS-friendly, so if you run into any conflicts or bugs with specific loaders, please let us know by opening a new issue.

**A few notes about RequireJS**

The library is loaded with an explicitly named module ID ("keen"), which presents a light configuration step, but prevents anonymous define() mismatch mayhem. To use this module, configure a `paths` record, like so:

```
requirejs.config({
  "paths": {
    "keen": "https://d26b395fwzu5fz.cloudfront.net/latest/keen.js"
  }
});
require([ "keen" ], function(Keen) {
  var client = new Keen({ ... });
});
```

## Tracking-only

If you only need to track events, replace the URLs in your installation with this version:

```
https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen-tracker.min.js
```

or for the latest version:

```
https://d26b395fwzu5fz.cloudfront.net/latest/keen-tracker.min.js
```

For production implementations, we recommend sticking with a specific version of the library, rather than `latest/`, to ensure future changes won't cause unforeseen issues.


## Custom Builds

Build your own custom versions of this library with [Grunt](http://gruntjs.com/getting-started) (requires Node.js/npm).

```
$  git clone https://github.com/keenlabs/keen-js.git && cd keen-js
$  npm install
$  bower install
$  grunt build
```

Built files will be placed in the `dist` directory.


### Test Coverage

Fire up the test server

```
grunt dev
```

Results are available at `http://localhost:9999`
