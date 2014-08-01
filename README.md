# JavaScript SDK v2.1.3 Usage Guide

This version is no longer supported, please use [version 3](https://github.com/keenlabs/keen-js/).

## Introduction

The Keen IO JavaScript SDK is designed to be simple to develop with, yet incredibly flexible. Our goal is to let you decide what events are important to you, use your own vocabulary to describe them, and decide when you want to send them to Keen IO.

* [Installation](#install-guide): How to include the Keen IO JavaScript SDK in your application or website.
* [Configuration](#configuration): How to configure the Keen IO JavaScript SDK with your Project ID and API Key.
* [Add Events](#add-events): How to add an event with the Keen IO JavaScript SDK.
* [Analyze and Visualize](#analyze-and-visualize): How to analyze and visualize your data with the Keen IO JavaScript SDK.

Got questions or feedback? Come hang out with us in the [Keen IO User Chat](https://users.keen.io).

If you'd like to learn more about the various methods, check out the [javascript reference](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/reference).

### Get Project ID & Access Keys

If you haven't done so already, login to Keen IO to [create a project](https://keen.io/add-project) for your app.  Once on a Project page, note the Project ID and Access Keys listed there.  You'll need them for the next steps!

## Install Guide

Installing and configuring the SDK should be a breeze. If it's not, please [let us know](mailto:team@keen.io)!

Copy and paste the following code into your HTML page in the `<head/>` section of your page:

```
<script type="text/javascript">
  var Keen=Keen||{configure:function(e){this._cf=e},addEvent:function(e,t,n,i){this._eq=this._eq||[],this._eq.push([e,t,n,i])},setGlobalProperties:function(e){this._gp=e},onChartsReady:function(e){this._ocrq=this._ocrq||[],this._ocrq.push(e)}};(function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src=("https:"==document.location.protocol?"https://":"http://")+"d26b395fwzu5fz.cloudfront.net/2.1.3/keen.min.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();

  // Configure the Keen object with your Project ID and (optional) access keys.
  Keen.configure({
    projectId: "your_project_id",
    writeKey: "your_write_key", // required for sending events
    readKey: "your_read_key"    // required for doing analysis
  });
</script>
```

If you’re configuring the SDK in a closure, make sure to export the Keen object to window:

```
window.Keen = Keen;
```

Now you're ready to configure the SDK to work with your Keen IO project!


## Configuration

The last line of the code you copy/pasted in the installation step needs to contain the Project ID and API Key of your project.  Simply replace what's in there with yours!

If you're only doing data collection, you don't need to provide a Read Key.  That is only needed to [analyze and visualize](#analyze-and-visualize-data).

```
Keen.configure({
  projectId: "your_project_id",
  writeKey: "your_write_key",
  readKey: "your_read_key"
});
```

[Keen.configure](https://github.com/keenlabs/keen-js/tree/v2/docs/reference#keen-configure) sets up the SDK to be used later. Now you're ready to do the fun stuff!


## Add Events

Now you're ready to record some data! Here's a very basic example for an app that tracks "purchases".

```
var trackPurchase = function () {
  // create an event as a JS object
  var purchase = {
    item: "golden widget"
  };

  // add it to the "purchases" collection
  Keen.addEvent("purchases", purchase);
};

// wherever the purchase happens call the function
trackPurchase();
```

The idea is to create an arbitrary JS Object of JSON-serializable values.

The JSON spec doesn't include anything about date values. At Keen IO, we know dates are important to track. Keen IO sends dates back and forth through its API in ISO-8601 format. The SDK handles this for you.

The properties of the JS Object must be valid Keen Property Names. A Keen Property Name must follow these rules:

1. Must be less than 256 characters long.
2. A dollar sign ($) cannot be the first character.
3. There cannot be any periods (.) in the name.
4. They cannot be a null value.

Add as many events as you like. The SDK will fire off each event to the Keen IO servers asynchronously.

The SDK will automatically stamp every event you track with a timestamp. If you want to override the system value with your own, use the following example. Note that the "timestamp" key is set in the *keen* properties dictionary.

```
var trackPurchase = function () {
  // create an event as a JS object
  var purchase = {
    item: "golden widget",
    keen: {
      timestamp: new Date()
    }
  };

  // add it to the "purchases" collection
  Keen.addEvent("purchases", purchase);
};

// wherever the purchase happens call the function
trackPurchase();
```

#### A note about timestamps:

> **keen.timestamp** is the time the event actually occurred. If no value is provided, it's automatically set to the time that Keen IO receives the data. To overwrite the value automatically created by Keen IO, see the above example.

> **keen.created_at** is a timestamp for when the data reaches Keen IO's servers. It's set by Keen IO and can't be overwritten.

### Tracking Links

Tracking the clicking of external links can be challenging.  There's a lot of complexity around making sure the data is recorded before the browser moves to the next page.  We handle that complexity for you with the `trackExternalLink` method.

Here's an example of using it inline with a link:

```
<a href="http://www.google.com" onclick="return Keen.trackExternalLink(this, 'visit_google', {'user_id' : 12345});">Click me!</a>
```

and inline with a form submit:

```
<form method="POST" action="http://foo.com" onsubmit="return Keen.trackExternalLink(this, 'submit_form', {'form_property_1' : 12345});">
  <input type="submit" value="submit">
</form>
```

To set it up to use with all the links on your page using jQuery, you can do something like the following:

```
$("a").click(function(){
  return Keen.trackExternalLink(this, "external_link_click", {});
});
```

### Global Properties

Now you might be thinking, "Okay, that looks pretty easy. But what if I want to send the same properties on *every* event in a particular collection? Or just *every* event, period?" We've got you covered through something we call Global Properties.

Global properties are properties which are sent with *every* event. For example, you may wish to always capture device information like OS version, handset type, orientation, etc.

To use global properties, simply set the *globalProperties* member of Keen to a function you've defined which takes in event collection as a string parameter and returns a JS object of all the global properties for that collection.

Here's an example:

```
var myGlobalProperties = function(eventCollection) {
  // setup the global properties we'll use
  var globalProperties = {
    someStandardProperty: 42
  };
  // do something extra for a specific event collection
  if (eventCollection === "purchase") {
    globalProperties["isPurchase"] = true;
  }
  return globalProperties;
};

//Set that function as the globalProperty calculator.
Keen.setGlobalProperties(myGlobalProperties);
```

> If there are two properties with the same name specified in the user-defined event *and* the global properties, the user-defined event's property will be the one used.


## Analyze and Visualize Data

**Note about timezones:** The JS library automatically converts queries and charts to local time of the machine running the code.  So your charts will always be relevant to the people reading them!

Ok, so now that you're collecting all this data, you probably want to analyze it and see the results! We'll explore a couple simple but meaningful queries around our "purchases" collection.

First let's find total revenue for the previous 7 days. To do this, we'll need to create a `Keen.Metric` object.

```
Keen.onChartsReady(function() {
  var metric = new Keen.Metric("purchases", {
    analysisType: "sum",
    targetProperty: "item.price",
    timeframe: "previous_7_days"
  });

  //Get the result of the query and alert it.
  metric.getResponse(function(response){
    alert(response.result);
  });
});
```

Now that we've defined a new metric variable, we can visualize it. You can even add style customizations, like changing the background color. Drawing visualizations requires the `Keen.onChartsReady` function. This ensures that the visualizations are drawn after the charting libraries have loaded in the background.

```
Keen.onChartsReady(function() {
  var metric = new Keen.Metric("purchases", {
    analysisType: "sum",
    targetProperty: "item.price",
    timeframe: "previous_7_days"
  });

  metric.draw(document.getElementById("myTotalRevenueDiv"), {
    label: "Total Revenue for Previous 7 Days",
    prefix: "$"
  });
});
```
![Keen.Metric Example](http://d26b395fwzu5fz.cloudfront.net/images/v2/metric_example.png)


Now, let's find out how many purchases have been made per day for the the previous 7 days. To do this, we'll need to create a `Keen.Series` object.

```
Keen.onChartsReady(function() {
  var series = new Keen.Series("purchases", {
    analysisType: "count",
    timeframe: "previous_7_days",
    interval: "daily"
  });

  //Get the result of the query and alert it.
  series.getResponse(function(response){
    alert(response.result);
  });
});
```

Let's view this Series as a line chart:

```
Keen.onChartsReady(function() {
  var series = new Keen.Series("purchases", {
    analysisType: "count",
    timeframe: "previous_7_days",
    interval: "daily"
  });

  series.draw(document.getElementById("myPurchasesOverPreviousWeekDiv"), {
    label: "Purchases per day for Previous 7 Days"
  });
});
```

![Keen.Series Example](http://d26b395fwzu5fz.cloudfront.net/images/v2/series_example.png)

If you're looking for ways to manipulate data from multiple queries and then visualize them, see our [custom visualization documentation](https://github.com/keenlabs/keen-js/tree/2.1.2/docs/visualization).

## Securing Your API Key

It's not a good idea to embed your API key in your clients.  It was only done here to make it easier to try things out.  To learn more about encrypting special API keys to make sure your clients only have access to the data you want, check out our [security documentation](https://keen.io/docs/security/).


## Filtering your Data

If you only want to analyze a subset of the data in an event collection, you simply need to apply [filters](https://keen.io/docs/data-analysis/filters/).  The `addFilter` function will help you do that for both [Keen.Metric](#keen-metric) and [Keen.Series](#keen-series).

Here's an example of adding a filter to a Keen.Metric:

```
  Keen.onChartsReady(function(){
    var metric = new Keen.Metric("signups", {
      analysisType: "count"
    });
    //Only analyze signups that were done from an iPhone
    metric.addFilter("device", "eq", "iPhone");
  });
```
