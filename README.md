# keen-js v2.1.2 (stable)

This is the latest stable version of the Keen IO JS Library (2012-2013). Get started with the [usage guide](https://keen.io/docs/clients/javascript/usage-guide/), or check out [version 3](https://github.com/keenlabs/keen-js/).

### v2.1.2 min/gzipped

```
https://d26b395fwzu5fz.cloudfront.net/2.1.2/keen.min.js
```

### Install

Copy and paste the following code into your HTML page in the <head/> section of your page:

```
var Keen=Keen||{configure:function(e){this._cf=e},addEvent:function(e,t,n,i){this._eq=this._eq||[],this._eq.push([e,t,n,i])},setGlobalProperties:function(e){this._gp=e},onChartsReady:function(e){this._ocrq=this._ocrq||[],this._ocrq.push(e)}};(function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src=("https:"==document.location.protocol?"https://":"http://")+"d26b395fwzu5fz.cloudfront.net/2.1.2/keen.min.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();

// Configure the Keen object with your Project ID and (optional) access keys.
Keen.configure({
  projectId: "your_project_id",
  writeKey: "your_write_key", // required for sending events
  readKey: "your_read_key"    // required for doing analysis
});
```

If you’re configuring the SDK in a closure, make sure to export the Keen object to window:

```
window.Keen = Keen;
```

