Read our [Installation guide](./Installation) to learn about all the ways this library can fit into your workflow.

## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.

## Quick Setup

Install the Keen JS SDK on your page by copy/pasting this snippet of JavaScript above the `</head>` tag of your page.

```javascript
<script type="text/javascript">
  !function(a,b){if(void 0===b[a]){b["_"+a]={},b[a]=function(c){b["_"+a].clients=b["_"+a].clients||{},b["_"+a].clients[c.projectId]=this,this._config=c},b[a].ready=function(c){b["_"+a].ready=b["_"+a].ready||[],b["_"+a].ready.push(c)};for(var c=["addEvent","setGlobalProperties","trackExternalLink","on"],d=0;d<c.length;d++){var e=c[d],f=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};b[a].prototype[e]=f(e)}var g=document.createElement("script");g.type="text/javascript",g.async=!0,g.src="https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js";var h=document.getElementsByTagName("script")[0];h.parentNode.insertBefore(g,h)}}("Keen",this);
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

You can configure new instances for as many projects as necessary.

## Record Data

Create an object and use the `addEvent` method to send data to Keen IO.

```javascript
<script>
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
</script>
```
