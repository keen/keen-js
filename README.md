# keen-js v3.0

A JavaScript library for the Keen IO API.

## Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/add-project) for your app. The Project ID and API Keys are available on the Project Overview page. You will need these for the next steps.

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


## Record Events

## Track Links and Forms

## Set Global Properties

## Multiple Projects

Sending events to multiple projects is easier than ever!

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
