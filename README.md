# keen-js v3.0

A JavaScript library for the Keen IO API.

## Get Project ID & Access Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. Once on a Project Details page, note the Project ID and Access Keys listed there. You’ll need them for the next steps!

## Quick Setup

```
  var keen = new Keen({
  	projectId: "your_project_id",
  	writeKey: "your_write_key",
  	readKey: "your_read_key"
  });
  
  var data = {
  	page: window.location.href,
    referrer: document.referrer,
    agent: window.navigator.userAgent,
    keen.timestamp: new Date().toISOString()
  };
  
  keen.addEvent('pageview', data);
```

### Options

  * `projectId` a string ID for your project (required)
  * `writeKey` a string (required for sending data)
  * `readKey` a string (required for querying data)
  * `globalProperties` a method for appending global properties to events prior to upload
  * `keenUrl` a complete URL (default: "https://api.keen.io/3.0")
  * `requestType` a string: `xhr` (default), `jsonp`, `beacon`

// **globalProperties** (Method)

// **requestType** xhr, jsonp, beacon

## Multiple Projects

Send events to as many projects as you need. It couldn't be much easier.

```
  var one = new Keen({
  	projectId: "your_project_id",
  	writeKey: "your_write_key",
  	readKey: "your_read_key"
  });
  
  var two = new Keen({
  	projectId: "your_project_id",
  	writeKey: "your_write_key",
  	readKey: "your_read_key"
  });
  
  one.addEvent('pageview', {key:'value'});
  two.addEvent('pageview', {key:'value'});
  two.addEvent('purchase', {amount: '25.50'});
```
