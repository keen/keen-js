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
  * `keenUrl` a complete URL (default: "https://api.keen.io/3.0")
  * `requestType` a string: `xhr` (default), `jsonp`, `beacon`


## Record Events

Hey, let's record some data!

Here’s a basic example for an app that tracks "purchases":

```
// Configure and instance for your project
var keen = new Keen({...});

// Create an object with the properties you want to store
var purchase = {
  item: "golden widget"
};

// Send it to the "purchases" collection
keen.addEvent("purchases", purchase);
```

Add as many events as you like. Each event will be fired off to the Keen IO servers asynchronously.

### Properties

Property names must follow these rules:

  * Cannot start with the $ character
  * Cannot contain the . character anywhere
  * Cannot be longer than 256 characters


### Dates

Dates are always handled in ISO-8601 format. 



## Track Links and Forms

Tracking user interactions for links and forms can be challenging. There’s a lot of complexity around making sure the data is recorded before the browser moves to the next page. We handle that complexity for you with the trackExternalLink method.

Method: **trackExternalLink(** element, eventCollection, properties [ , timeout, callback ] **)**

Parameters:

  * **element** - The HTML element that triggers the browser to move to a different page
  * **eventCollection** - A string containing the name of the event collection to use
  * **properties** - A JavaScript object, the event properties associated with the event
  * **timeout** - An integer indicating the amount of time in milliseconds to wait before moving on
  * **callback** - A function to override the default behavior of navigating to the next page

Here's a basic example:

```
document.getElementById("some-link").onclick = function(){
  return Keen.trackExternalLink(this, "link_clicked", {});
};

document.getElementById("some-form").onsubmit = function(){
  return Keen.trackExternalLink(this, "form_submitted", {});
}
```


### Inline link tracking

```
<a href="http://www.google.com" onclick="return Keen.trackExternalLink(this, 'visit_google', {'user_id' : 12345});">Click me!</a>
```

### Inline form tracking

```
<form action="http://foo.com" method="POST" onsubmit="return Keen.trackExternalLink(this, 'submit_form', {'form_property_1' : 12345});">
  <input type="submit" value="submit">
</form>
```

### Tracking click events with [jQuery](http://jquery.com)

```
$("a").click(function(){
  return Keen.trackExternalLink(this, "external_link_click", {});
});
```


## Set Global Properties

Global properties are sent with EVERY event. For example, you may wish to always capture browser information like the userAgent, location or referrer.

Method: **setGlobalProperties(** function **)**

Parameters:

  * **function** - A function that accepts an `eventCollection` string as an argument and returns an object containing the properties to add to that event.

```
  // Previously created instance
  var keen = new Keen({...});
  
  var myGlobalProperties = function(eventCollection) {
  
    // Create global properties
	var globalProperties = {
	  count: 42
	};
	
	// Special treatment for a specific event collection
	if (eventCollection === "purchase") {
	  globalProperties["isPurchase"] = true;
    }
    
	return globalProperties;
  };
  
  keen.setGlobalProperties(myGlobalProperties);
  
```
**Important:** This function is executed prior to uploading each event, so global properties can be overridden by simply assigning a property of the same name when recording an event.


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
