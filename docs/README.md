## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.


## Install the library

Load this library asynchronously from our CDN by copy/pasting this snippet of JavaScript above the `</head>` tag of your page.

```html
<script type="text/javascript">
  !function(a,b){if(void 0===b[a]){b["_"+a]={},b[a]=function(c){b["_"+a].clients=b["_"+a].clients||{},b["_"+a].clients[c.projectId]=this,this._config=c},b[a].ready=function(c){b["_"+a].ready=b["_"+a].ready||[],b["_"+a].ready.push(c)};for(var c=["addEvent","setGlobalProperties","trackExternalLink","on"],d=0;d<c.length;d++){var e=c[d],f=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};b[a].prototype[e]=f(e)}var g=document.createElement("script");g.type="text/javascript",g.async=!0,g.src="https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js";var h=document.getElementsByTagName("script")[0];h.parentNode.insertBefore(g,h)}}("Keen",this);
</script>
```

Alternatively, you can load the library synchronously from our CDN:

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/3.0.9/keen.min.js"></script>
```

Read our [Installation guide](./installation.md) to learn about all the ways this library can fit into your workflow.


## Configure a new Keen JS client

When instantiating a new Keen JS client, there are a number of possible configuration options. A `projectId` is required at all times, and `writeKey` and `readKey` are required for sending or querying data, respectively.

```javascript
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


## Track events

Read our [Tracking guide](./track.md) to learn how to start tracking events with Keen IO.


## Query events

Read our [Query guide](./query.md) to learn how to query your data fro, Keen IO.


## Visualize query results

Read our [Visualization guide](./visualization.md) to build charts from query responses.


## Resources

[Data Modeling Guide](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkRhdGEgTW9kZWxpbmcgR3VpZGUiLCJyZWZlcnJlciI6ICJ3aWtpL2hvbWUifQ==&redirect=https://keen.io/docs/event-data-modeling/event-data-intro/)

[API Technical Reference](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBUZWNobmljYWwgUmVmZXJlbmNlIiwicmVmZXJyZXIiOiAid2lraS9ob21lIn0=&redirect=https://keen.io/docs/api/reference/)

[API Status](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/click?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIkFQSSBTdGF0dXMiLCJyZWZlcnJlciI6ICJ3aWtpL2hvbWUifQ==&redirect=http://status.keen.io/)
