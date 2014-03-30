# keen-js v3.0

A crisp, new JS Library for the Keen IO API.

**Important:** This version is not seaworthy yet – [v2.1.2](https://github.com/keenlabs/keen-js/tree/2.1.2) is the latest stable release.

[![Build Status](https://api.travis-ci.org/keenlabs/keen-js.png?branch=master)](https://travis-ci.org/keenlabs/keen-js)
[![Selenium Test Status](https://saucelabs.com/buildstatus/keen-js)](https://saucelabs.com/u/keen-js)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/keen-js.svg)](https://saucelabs.com/u/keen-js)

Tracking is manually tested and validated on Internet Explorer 6, 7, and 8.


## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.


## Quick Setup

```
// Load the library asynchronously:
!function(a,b){if(void 0===b[a]){b["_"+a]={},b[a]=function(c){b["_"+a].clients=b["_"+a].clients||{},b["_"+a].clients[c.projectId]=this,this._config=c},b[a].ready=function(c){b["_"+a].ready=b["_"+a].ready||[],b["_"+a].ready.push(c)};for(var c=["addEvent","setGlobalProperties","trackExternalLink","on"],d=0;d<c.length;d++){var e=c[d],f=function(a){return function(){return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this}};b[a].prototype[e]=f(e)}var g=document.createElement("script");g.type="text/javascript",g.async=!0,g.src="keen-3.0.0.min.js";var h=document.getElementsByTagName("script")[0];h.parentNode.insertBefore(g,h)}}("Keen",this);

// Connect to your project(s):
var keen = new Keen({
 projectId: "your_project_id",
 writeKey: "your_write_key",
 readKey: "your_read_key"
});

// Create a data object
var data = {
  page: window.location.href,
  referrer: document.referrer,
  agent: window.navigator.userAgent,
  keen: {
    timestamp: new Date().toISOString()
  }
};

// Send it to Keen IO
keen.addEvent('pageview', data);
```


## Getting Started

Read our [Getting Started guide](https://github.com/keenlabs/keen-js/wiki/Getting-Started) to learn about connecting to projects from your Keen IO account.


## Installation

Read our [Installation guide](https://github.com/keenlabs/keen-js/wiki/Installation) to learn about all the ways this library can fit into your workflow.


## Resources

[Data Modeling Guide](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/visit?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=https://keen.io/docs/event-data-modeling/event-data-intro/)

[API Technical Reference](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/visit?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=https://keen.io/docs/api/reference/)

[API Status](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/visit?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJyZWZlcnJlciI6ICJSRUFETUUubWQifQ==&redirect=http://status.keen.io/)


## Support

Need a hand with something? Join us in [HipChat](http://users.keen.io/), [IRC](http://webchat.freenode.net/?channels=keen-io), or shoot us an email at [contact@keen.io](mailto:contact@keen.io)

[![RepoStats](https://api.keen.io/3.0/projects/5337e28273f4bb4499000000/events/visit?api_key=a0bb828de21e953a675610cb6e6b8935537b19c2f0ac33937d6d1df2cc8fddbf379a81ad398618897b70d15c6b42647c3e063a689bc367f5c32b66c18010541c0ad1cf3dbd36100dc4475c306b238cb6f5b05f082dc4071e35094a722b1f3e29fad63c933ea8e33e8b892c770df5e1bb&data=eyJwYWdlIjogIlJFQURNRS5tZCJ9&pixel)](https://github.com/keenlabs/keen-js)
