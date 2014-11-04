# Installation

## Asynchronous Loading

Copy+paste this snippet of JavaScript above the `</head>` tag of your page.

```html
<script type="text/javascript">
  !function(a,b){a("Keen","https://d26b395fwzu5fz.cloudfront.net/3.1.0/keen.min.js",b)}(function(a,b,c){var d,e,f;c["_"+a]={},c[a]=function(b){c["_"+a].clients=c["_"+a].clients||{},c["_"+a].clients[b.projectId]=this,this._config=b},c[a].ready=function(b){c["_"+a].ready=c["_"+a].ready||[],c["_"+a].ready.push(b)},d=["addEvent","setGlobalProperties","trackExternalLink","on"];for(var g=0;g<d.length;g++){var h=d[g],i=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};c[a].prototype[h]=i(h)}e=document.createElement("script"),e.async=!0,e.src=b,f=document.getElementsByTagName("script")[0],f.parentNode.insertBefore(e,f)},this);
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

```html
 <script type="text/javascript" src="https://d26b395fwzu5fz.cloudfront.net/3.1.0/keen.min.js"></script>
```

**Latest build:**

```html
 <script type="text/javascript" src="https://d26b395fwzu5fz.cloudfront.net/latest/keen.min.js"></script>
```

## Bower

If you're using [Bower](http://bower.io/), you can load this library into your project with the following command:

`$ bower install keen-js`

Full and tracking-only versions of the library will be retrieved.

## AMD/CommonJS

We want to make this library AMD/CommonJS-friendly, so if you run into any conflicts or bugs with specific loaders, please let us know by opening a new issue.

**A few notes about RequireJS**

The library is loaded with an explicitly named module ID ("keen"), which presents a light configuration step, but prevents anonymous define() mismatch mayhem. To use this module, configure a `paths` record, like so:

```javascript
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
https://d26b395fwzu5fz.cloudfront.net/3.1.0/keen-tracker.min.js
```

or for the latest version:

```
https://d26b395fwzu5fz.cloudfront.net/latest/keen-tracker.min.js
```

For production implementations, we recommend sticking with a specific version of the library, rather than `latest/`, to ensure future changes won't cause unforeseen issues.


## Custom Builds

Build your own custom versions of this library with [Grunt](http://gruntjs.com/getting-started) (requires Node.js/npm).

```bash
$ git clone https://github.com/keenlabs/keen-js.git && cd keen-js
$ npm install
$ bower install
$ grunt build
```

Built files will be placed in the `dist` directory.


### Test Coverage

Fire up the test server

```bash
$ grunt dev
```

Results are available at `http://localhost:9999`
