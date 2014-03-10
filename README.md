# keen-js v3.0

A crisp, new JS Library for the Keen IO API.

**Important:** This version is not seaworthy yet – [v2.1.2](https://github.com/keenlabs/keen-js/tree/2.1.2) is the latest stable release.

## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.


## Quick Setup

```
// drop-in script

var keen = new Keen({
 projectId: "your_project_id",
 writeKey: "your_write_key",
 readKey: "your_read_key"
});
  
var data = {
  page: window.location.href,
  referrer: document.referrer,
  agent: window.navigator.userAgent,
  keen: {
    timestamp: new Date().toISOString()
  }
};
  
keen.addEvent('pageview', data);
```


## Getting Started

Read our [Getting Started guide](https://github.com/keenlabs/keen-js/wiki/Getting-Started) to learn about connecting to projects from your Keen IO account.


## Installation

Read our [Installation guide](https://github.com/keenlabs/keen-js/wiki/Installation) to learn about all the ways this library can fit into your workflow.


## Resources

[Data Modeling Guide](https://keen.io/docs/event-data-modeling/event-data-intro/)

[API Technical Reference](https://keen.io/docs/api/reference/)

[API Status](http://status.keen.io/)


## Support

Need a hand with something? Join us in [HipChat](http://users.keen.io/), [IRC](http://webchat.freenode.net/?channels=keen-io), or shoot us an email at [contact@keen.io](mailto:contact@keen.io)