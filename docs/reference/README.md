# SDK Reference

This document contains the technical documentation of the Keen IO JavaScript SDK v1.1.0.  If you're looking for the usage guide, please [go here](https://github.com/keenlabs/keen-js/tree/2.1.2).

Quick overview of the JavaScript SDK:

* [Initialization](#initialization)
* [Data Collection](#data-collection)
* [Data Analysis](#data-analysis)
  * [Keen.Metric](#keen.metric)
  * [Keen.Series](#keen.series)
  * [Keen.Funnel](#keen.funnel)
  * [Keen.Extraction](#keen-extraction)
* [Data Visualization](#data-visualization)
  * [Keen.Number](#keen.number)
  * [Keen.LineChart](#keen.linechart)
  * [Keen.MultilineChart](#keen.multilinechart)
  * [Keen.PieChart](#keen.piechart)
  * [Keen.FunnelChart](#keen.funnelchart)

## Initialization

### Keen.configure( config )

Parameters:

* **config** - A JavaScript object whose keys are used to configure the Keen IO client. Valid values are:
* projectId - The project ID of the project you wish to associate with the Keen IO client. REQUIRED.
* writeKey - An access key used to write data (i.e. send events) to Keen IO. Optional but required for adding events.
* readKey - An access key used to read data (i.e. do analysis and charting) from Keen IO. Optional but required for doing analysis.

Configures the client to use a specific project for future collection, analysis, and visualization requests.  If you're only using the client for data collection, you don't need to include an Read Key.  That is only required for analysis and visualization.

```
//Configure the client to work with my project.
Keen.configure({
  projectId: "your_project_id",
  writeKey: "your_write_key",
  readKey: "your_read_key"
});
```

### Keen.onChartsReady( function )

* **function** - a function to be called after the charting library has been loaded.

Runs the provided function after the charting library has finished loading.  In that function is where you will call your visualization code.

> **Note:** You can use the data collection methods before the charts are ready.

```
Keen.configure({
    projectId: "your_project_id",
    writeKey: "your_write_key",
    readKey: "your_read_key"
});

Keen.onChartsReady(function(){
    var myMetric = new Keen.Metric("logins", {
    analysisType: "count"
    });

    myMetric.draw(document.getElementById("myDiv"));
});
```


## Data Collection

### Keen.addEvent( eventCollection, properties [ , success, error ] )

Parameters:

* **eventCollection** - A string containing the name of the event collection to use.
* **properties** - A JavaScript object, the event properties associated with the event.
* **success** - An optional function that is invoked on success.
* **error** - An optional function that is invoked on failure.

Sends an event to Keen IO

Example:

```
//Create a JavaScript object of properties.
var purchaseProperties = {
    item: "golden widget",
    price: 1.99
};

// add it to the "purchases" collection
Keen.addEvent("purchases", purchaseProperties);
```

### Keen.trackExternalLink( element, eventCollection, properties [ , timeout, callback ] )

A convenience method to handle the complexity of recording events when clicking external links or submitting forms.  When a link is clicked or form submitted, it will record the indicated event in Keen IO before moving on to the next page.  A timeout can be specified to prevent latency from affecting page performance and a custom callback can be provided to modify the default behavior of navigating to the next page upon success or timeout.

Parameters:

* **element** - The HTML element that triggers the browser to move to a different page
* **eventCollection** - A string containing the name of the event collection to use.
* **properties** - A JavaScript object, the event properties associated with the event
* **timeout** - An integer indicating the amount of time in milliseconds to wait before moving on
* **callback** - A function to override the default behavior of navigating to the next page

Example:

```
document.getElementById("some-link").onclick = function(){
  return Keen.trackExternalLink(this, "link_clicked", {});
};
document.getElementById("some-form").onsubmit = function(){
  return Keen.trackExternalLink(this, "form_submitted", {});
}
```

### Keen.setGlobalProperties( function )

Parameters:

* **function** - A function that returns a JavaScript object containing a set of properties to add to every event.

Example:

```
//Create a function that returns a JavaScript object of properties
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

## Data Analysis

### Keen.Metric( eventCollection [ , options , client ] )

Constructor for a `Keen.Metric` object.

Parameters:

* **eventCollection** - the name of the event collection you wish to analyze
* **options** - an JavaScript object containing options for the query
* **client** - an Keen client to use.  One is provided by default.

Valid options are:

* *analysisType* (required) - a string containing the type of analysis to perform.  Read the documentation on [Metrics](https://keen.io/docs/data-analysis/metrics/) to learn more about available analysis types.
* *filters* (optional) - An array of javascript objects that contain [filters](https://keen.io/docs/data-analysis/filters/) definitions.
* *timeframe* (optional) - a string or javascript object representing the [timeframe](https://keen.io/docs/data-analysis/timeframe) of the data you wish to analyze.
* *groupBy* (optional) - a string containing the name of the property by which you would like to group.
* *targetProperty* (optional) - a string containing the name of the property targeted in certain types of analysis.  Read the documentation for specific analysis types to learn more about the target property.

Example:

```
Keen.onChartsReady(function(){

    //Money made in the previous week: add up the "price" property on purchase events
    var moneyMadePreviousWeek = new Keen.Metric("purchases", {
        analysisType: "sum",
        timeframe: "previous_week",
        targetProperty: "price"
    });
});
```

### Keen.Metric.draw( element [ , options ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **options** - a JavaScript object of options for the visualization

A convenience method to visualize the Metric. Depending on the attributes of the query, it will choose the appropriate visualization type.

Example:

```
Keen.onChartsReady(function(){
  var totalLogins = new Keen.Metric("logins", {
    analysisType: "count"
  });

  totalLogins.draw(document.getElementById("loginDiv"), {
    label: "Total Logins"
  });
});
```

### Keen.Metric.getResponse( function )

Parameters:

* **function( response )** - a function to be ran upon successfully retrieving the result of query.

Gets the results of the query represented by the Metric object and calls the function when complete.

Example:

```
Keen.onChartsReady(function(){

    var totalLogins = new Keen.Metric("logins", {
        analysisType: "count"
    });

    //Get the result of the query and output the data to the console.
    totalLogins.getResponse(function(response){
        console.log(response.result);
    });
});
```

### Keen.Metric.analysisType( analysisType )

Parameters:

* **analysisType** - a string containing the type of analysis done in this Metric.

Sets the analysisType option on the Metric to the value provided.  Read the documentation on :doc:`Metrics </data-analysis/metrics>` to learn more about available analysis types.

Example:

```
Keen.onChartsReady(function(){

    var myMetric = new Keen.Metric("logins");
    //Set the analysisType to "count"
    myMetric.analysisType("count");
});
```

### Keen.Metric.addFilter( property, operator, value)

Parameters:

* **property** - A string containing the name of the property on which you would like to filter.
* **operator** - A string containing the operator to use in the filter operation. (eg: "eq", "gt")
* **value** - A value to compare the property to in your filter.

Adds a new filter to the "filters" option on a Metric.  View the documentation on :doc:`filters </data-analysis/filters>` to learn more.

Example:

```
Keen.onChartsReady(function(){

    var myMetric = new Keen.Metric("logins");
    //Only analyze users that are 21 years or older
    myMetric.addFilter("user.age", "gte", 21);
});
```

### Keen.Metric.timeframe( timeframe )

Parameters:

* **timeframe** - a string or JavaScript object containing a timeframe

Set the "timeframe" option on a Metric.  View the documentation on :doc:`timeframes </data-analysis/timeframe>` to learn more.

Example:

```
Keen.onChartsReady(function(){
    var myMetric = new Keen.Metric("logins");
    //Set the timeframe to "previous_7_days"
    myMetric.timeframe("previous_7_days");
});
```

### Keen.Metric.timezone( timezone )

Parameters:

* **timezone** - An Integer indicating the number of seconds offset from UTC the desired timezone is.

Set the "timezone" option on a Metric.  By default, the client uses the running machine's timezone.  This method should only be used to override that.  View the documentation on :doc:`timezones </data-analysis/timezone>` to learn more.

Example:

```
Keen.onChartsReady(function(){
    var myMetric = new Keen.Metric("logins");
    //Set the timezone to UTC -08:00
    myMetric.timezone((-8 * 60 * 60));
});
```

> **Note:** Named timezone support was added in version 2.1.2 of the SDK. They are not supported in version 2.1.0 or below.


### Keen.Metric.groupBy( groupBy )

Parameters:

* **groupBy** - a string containing the property by which you would like to group.

Set the "groupBy" option on a Metric.  View the documentation on [group by](https://keen.io/docs/data-analysis/group-by) to learn more.

Example:

```
Keen.onChartsReady(function(){

    var myMetric = new Keen.Metric("logins");
    //Set the groupBy attribute to "user.email"
    myMetric.groupBy("user.email");
});
```

### Keen.Metric.targetProperty( targetProperty )

Parameters:

* **targetProperty** - a string containing the name of a property

Set the "targetProperty" option on a Metric.  Read the documentation for specific analysis types to learn more about the target property.

Example:

```
Keen.onChartsReady(function(){

    var myMetric = new Keen.Metric("logins");
    //Set the targetProperty to "user.email"
    myMetric.targetProperty("user.email");
});
```

### Keen.Series( eventCollection [ , options , client ] )

Constructor for a [Keen.Series](https://keen.io/docs/data-analysis/series/) object.

Parameters:

* **eventCollection** - the name of the event collection you wish to analyze
* **options** - an optional JavaScript object containing options for the query
* **client** - an optional Keen client to use.  One is provided by default.

Valid options are:

* *analysisType* (required) - a string containing the type of analysis to perform. Read the documentation on [Metrics](https://keen.io/docs/data-analysis/metrics/) to learn more about available analysis types.
* *filters* (optional) - An array of javascript objects that contain [filters](https://keen.io/docs/data-analysis/filters/) definitions.
* *timeframe* (optional) - a string or javascript object representing the [timeframe](https://keen.io/docs/data-analysis/timeframe) of the data you wish to analyze.
* *interval* (optional) - a string containing the interval for the series.  Read the documentation on [interval](https://keen.io/docs/data-analysis/interval) to learn more.
* *groupBy* (optional) - a string containing the name of the property by which you would like to group.
* *targetProperty* (optional) - a string containing the name of the property targeted in certain types of analysis.  Read the documentation for specific analysis types to learn more about the target property.

Example:

```
Keen.onChartsReady(function(){
  // Find money made each day of the previous week. Add up the "price" property on purchases.
  var moneyMadeEachDayPreviousWeek = new Keen.Series("purchases", {
    analysisType: "sum",
    timeframe: "previous_week",
    interval: "daily",
    targetProperty: "price"
  });
});
```

### Keen.Series.draw( element [ , options ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **options** - a JavaScript object of options for the visualization

A convenience method to instantiate a new `Keen.LineChart` and call the draw method.

Example:

```
Keen.onChartsReady(function(){
  var totalLogins = new Keen.Series("logins", {
    analysisType: "count",
    timeframe: "previous_7_days",
    interval: "daily"
  });

  Keen.onChartsReady(function(){
    totalLogins.draw(document.getElementById("loginDiv"), {
      label: "Logins Previous 7 Days"
    });
  });
});
```

### Keen.Series.getResponse( function )

Parameters:

* **function( response )** - a function to be ran upon successfully retrieving the result of query.

Gets the results of the query represented by the Series object.

Example:

```
Keen.onChartsReady(function(){
  var loginsPreviousWeek = new Keen.Series("logins", {
    analysisType: "count",
    timeframe: "previous_7_days",
    interval: "daily"
  });

  //Get the result of the query and output the data to the console.
  loginsPreviousWeek.getResponse(function(response){
    console.log(response.result);
  });
});
```

### Keen.Series.analysisType( analysisType )

Parameters:

* **analysisType** - a string containing the type of analysis done in this Series.

Sets the analysisType option on the Series to the value provided. Read the documentation on [Metrics](https://keen.io/docs/data-analysis/metrics/) to learn more about available analysis types.

Example:
```
Keen.onChartsReady(function(){
  var mySeries = new Keen.Series("logins");
  //Set the analysisType to "count"
  mySeries.analysisType("count");
});
```

### Keen.Series.addFilter( property, operator, value)

Parameters:

* **property** - A string containing the name of the property on which you would like to filter.
* **operator** - A string containing the operator to use in the filter operation. (eg: "eq", "gt")
* **value** - A value to compare the property to in your filter.

Adds a new filter to the "filters" option on a Series.  View the documentation on [filters](https://keen.io/docs/data-analysis/filters) to learn more.

Example:

```
Keen.onChartsReady(function(){
    var mySeries = new Keen.Series("logins");
    //Only analyze users that are 21 years or older
    mySeries.addFilter("user.age", "gte", 21);
});
```

### Keen.Series.timeframe( timeframe )

Parameters:

* **timeframe** - a string or JavaScript object containing a timeframe

Set the "timeframe" option on a Series.  View the documentation on [timeframe](https://keen.io/docs/data-analysis/timeframe) to learn more.

Example:

```
Keen.onChartsReady(function(){

    var mySeries = new Keen.Series("logins");
    //Set the timeframe to "previous_7_days"
    mySeries.timeframe("previous_7_days");
});
```

### Keen.Series.timezone( timezone )

Parameters:

* **timezone** - An Integer indicating the number of seconds offset from UTC the desired timezone is.

Set the "timezone" option on a Series.  By default, the client uses the running machine's timezone.  This method should only be used to override that.  View the documentation on [timezone](https://keen.io/docs/data-analysis/timezone) to learn more.

Example:

```
Keen.onChartsReady(function(){
    var mySeries = new Keen.Series("logins");
    //Set the timezone to UTC -08:00
    mySeries.timezone((-8 * 60 * 60));
});
```

### Keen.Series.interval( interval )

Parameters:

* **interval** - a string containing the a valid interval

Set the "interval" option on a Series.  View the documentation on [interval](https://keen.io/docs/data-analysis/interval) to learn more.

Example:

```
Keen.onChartsReady(function(){
    var mySeries = new Keen.Series("logins");
    //Set the interval to "weekly"
    mySeries.timeframe("weekly");
});
```

### Keen.Series.groupBy( groupBy )

Parameters:

* **groupBy** - a string containing the property by which you would like to group. View the documentation on [group by](https://keen.io/docs/data-analysis/group-by) to learn more.

Set the "groupBy" option on a Series.

Example:

```
Keen.onChartsReady(function(){
  var mySeries = new Keen.Series("logins");
  //Set the groupBy attribute to "user.email"
  mySeries.groupBy("user.email");
});
```

### Keen.Series.targetProperty( targetProperty )

Parameters:

* **targetProperty** - a string containing the name of a property

Set the "targetProperty" option on a Series. Read the documentation for specific analysis types to learn more about the target property.

Example:

```
Keen.onChartsReady(function(){
    var mySeries = new Keen.Series("logins");
    //Set the targetProperty to "user.email"
    mySeries.targetProperty("user.email");
});
```

### Keen.Funnel( steps [ , options, client ] )

Constructor for a :ref:`javascript-keen-funnel` object.

Parameters:

* **steps** - An array of :ref:`javascript-keen-step` objects used in the funnel.
* **options** - an optional JavaScript object containing options for the funnel.
* **client** - an optional Keen Client to use.  One is provided by default.

Valid options are:

* *timeframe* (optional) - a string or javascript object representing the :doc:`timeframe </data-analysis/timeframe>` of the data you wish to analyze.  Any Keen.Step used in this funnel that does not have its own timeframe property will inherit this value.
* *actorProperty* (optional) - a string containing the name of a property.  Any Keen.Step defined without its own actorProperty will inherit this value.  Check out [steps](https://keen.io/docs/data-analysis/funnels/#steps) to learn more about actor properties.

Example:

```
Keen.onChartsReady(function(){

    //Create a set of steps for our funnel.
    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    //Instantiate a new Keen.Funnel for those steps.
    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });
});
```

### Keen.Funnel.draw( element [ , options ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **options** - a JavaScript object of options for the visualization

A convenience method to instantiate a new `Keen.FunnelChart` and call the draw method.

Example:

```
Keen.onChartsReady(function(){

    //Create a set of steps for our funnel.
    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    //Instantiate a new Keen.Funnel for those steps.
    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    myFunnel.draw(document.getElementById('myFunnelChartDiv'), {
        title: "User Conversion Funnel"
    });
});
```

### Keen.Funnel.getResponse( function )

Parameters:

* **function( response )** - a function to be ran upon successfully retrieving the result of query.

Gets the results of the query represented by the `Keen.Funnel` object.

Example:

```
Keen.onChartsReady(function(){

    //Create a set of steps for our funnel.
    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    //Instantiate a new Keen.Funnel for those steps.
    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    myFunnel.getResponse(function(response){
        console.log(response);
    });
});
```

### Keen.Funnel.addStep( step )

Parameters:

* **step** - a `Keen.Step` object to add to the funnel.

Adds a Keen.Step object to the Funnel.

Example:

```
Keen.onChartsReady(function(){

    //Instantiate a new Keen.Funnel.
    var myFunnel = new Keen.Funnel([], {});

    //Create the first step of our funnel.
    var step1 = new Keen.Step("user_signup", {
        actorProperty: "user.id",
        name: "Signup"
    });

    //Add it to myFunnel.
    myFunnel.addStep(step1);
});
```

### Keen.Funnel.actorProperty( actorProperty )

Parameters:

* **actorProperty** - a string containing the name of the property used to uniquely identify the performer of an event specified in a Step.  Any Step without an actorProperty defined will inherit this value.

Sets the default "actorProperty" for all Steps attached to a Funnel.

```
Keen.onChartsReady(function(){

    //Create a set of steps for our funnel.
    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    //Instantiate a new Keen.Funnel for those steps.
    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    //Only look at events from the last 7 days.
    myFunnel.actorProperty("user.id");
});
```

### Keen.Funnel.timeframe( timeframe )

Parameters:

* **timeframe** - a string or JavaScript object containing a timeframe

Set the default "timeframe" for all Steps attached to a Funnel.  View the documentation on [timeframe](https://keen.io/docs/data-analysis/timeframe)to learn more.

Example:

```
Keen.onChartsReady(function(){

    //Create a set of steps for our funnel.
    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    //Instantiate a new Keen.Funnel for those steps.
    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    //Only look at events from the last 7 days.
    myFunnel.timeframe("previous_7_days");
});
```

### Keen.Funnel.timezone( timezone )

Parameters:

* **timezone** - An Integer indicating the number of seconds offset from UTC the desired timezone is.

Set the "timezone" option on a Funnel.  By default, the client uses the running machine's timezone.  This method should only be used to override that.  View the documentation on [timezones](https://keen.io/docs/data-analysis/timezone) to learn more.

Example:

```
Keen.onChartsReady(function(){

    //Create a set of steps for our funnel.
    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    //Instantiate a new Keen.Funnel for those steps.
    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    //Set the timezone to Pacific time (-8:00 UTC)
    myFunnel.timezone((-8 * 60 * 60));
});
```

### Keen.Step( eventCollection [ , options ] )

Constructor for a `Keen.Step` object.

Parameters:

* **eventCollection** - An array of Keen.Step objects used in the funnel.
* **options** - an optional JavaScript object containing attributes of the funnel.

Valid options are:

* *name* (optional) - a string indicating the name of a step.  This is used when visualizing a Funnel to provide custom labels for the events specified in the steps.  If no name is provided, it will default to the name of the event collection.
* *timeframe* (optional) - a string or javascript object representing the [timeframe](https://keen.io/docs/data-analysis/timeframe) of the data you wish to analyze.  If no timeframe is specified, it will inherit a timeframe specified on the Funnel.
* *timezone* (optional) - an integer containing the number of seconds to offset the timezone by from UTC +00:00.  If none is specified, the client automatically uses the timezone of the machine executing the code.
* *actorProperty* (optional) - a string containing the name of a property used to identify unique actors performing the event.  If no actorProperty is set, it will inherit from the actorProperty on the funnel.  An actorProperty is required to be in one of those two places.
* *filters* (optional) - An array of javascript objects that contain [filters](https://keen.io/docs/data-analysis/filters/) definitions.

Example:

```
Keen.onChartsReady(function(){

    //Create a step for a funnel.
    var step = new Keen.Step("click_upgrade_button", {
        name: "Click Upgrade",
        actorProperty: "user.id",
        timeframe: "previous_7_days"
    });

});
```

### Keen.Step.name( name )

Parameters:

* **name** - A string containing the name you'd like to call a step.

Sets the name parameter on a Step.  This name is used when visualizing a Step so you can give a certain action a custom name.

Example:

```
Keen.onChartsReady(function(){

    //Create a step for a funnel.
    var step = new Keen.Step("click_upgrade_button", {
        actorProperty: "user.id",
        timeframe: "previous_7_days"
    });

    step.name("Click Upgrade");

});
```

### Keen.Step.actorProperty( actorProperty )

Parameters:

* **actorProperty** - A string containing the name of a property used to define the actor that is performing the event.

Set the "actorProperty" option on a Step.

Example:

```
Keen.onChartsReady(function(){

    //Create a step for a funnel.
    var step = new Keen.Step("click_upgrade_button", {
        name: "Click Upgrade",
        timeframe: "previous_7_days"
    });

    step.actorProperty("user.id");

});
```

### Keen.Step.addFilter( property, operator, value)

Parameters:

* **property** - A string containing the name of the property on which you would like to filter.
* **operator** - A string containing the operator to use in the filter operation. (eg: "eq", "gt")
* **value** - A value to compare the property to in your filter.

Adds a new filter to the "filters" option on a Step.  View the documentation on [filters](https://keen.io/docs/data-analysis/filters/) to learn more.

Example:

```
Keen.onChartsReady(function(){

    //Create a step for a funnel.
    var step = new Keen.Step("click_upgrade_button", {
        name: "Click Upgrade",
        timeframe: "previous_7_days"
    });

    //Only analyze users that are 21 years or older
    step.addFilter("user.age", "gte", 21);
});
```

### Keen.Step.timeframe( timeframe )

Parameters:

* **timeframe** - a string or JavaScript object containing a timeframe

Set the "timeframe" option on a Step.  View the documentation on [timeframe](https://keen.io/docs/data-analysis/timeframe/)  to learn more.

Example:

```
Keen.onChartsReady(function(){

    //Create a step for a funnel.
    var step = new Keen.Step("click_upgrade_button", {
        name: "Click Upgrade"
    });

    //Only analyze upgrade clicks in the previous 7 days.
    step.timeframe("previous_7_days");
});
```

### Keen.Step.timezone( timezone )

Parameters:

* **timezone** - An Integer indicating the number of seconds offset from UTC the desired timezone is.

Set the "timezone" option on a Step.  By default, the client uses the running machine's timezone.  This method should only be used to override that.  View the documentation on [timezone](https://keen.io/docs/data-analysis/timezone/) to learn more.

Example:

```
Keen.onChartsReady(function(){

    //Create a step for a funnel.
    var step = new Keen.Step("click_upgrade_button", {
        name: "Click Upgrade",
        timeframe: "previous_7_days"
    });

    //Set the timezone to UTC -08:00
    step.timezone((-8 * 60 * 60));
});
```

### Keen.SavedQuery( queryName [ , client ] )

Parameters:

* **queryName** - the name of the Saved Query this object will represent.
* **client** - an optional Keen client to use.  One is provided by default.

Example:

```
Keen.onChartsReady(function(){
  var signupsPreviousWeek = new Keen.SavedQuery("signups previous week");
});
```

### Keen.SavedQuery.getResponse( function )

Parameters:

* **function( response )** - a function to be ran upon successfully retrieving the result of query.

Gets the results of the query represented by the SavedQuery object and call the function when complete.

Example:

```
Keen.onChartsReady(function(){

    //Retrieve an already created Saved Query called "total logins".
    var totalLogins = new Keen.SavedQuery("total logins");

    //Get the result of the query and output the data to the console.
    totalLogins.getResponse(function(response){
        console.log(response.result);
    });
});
```

### Keen.getEventCollections( [ success, error ] )

Parameters:

* **success ( response )** - An optional callback function that takes in a JavaScript object containing the event collections object.  Invoked on success.
* **error** - An optional callback function that is invoked on failure.

Returns a JavaScript object containing the event collections and their properties for the current project.  The response will look like what is returned from a GET request to our API's [event resource](https://keen.io/docs/api/reference/#event-resource).

Example:

```
Keen.getEventCollections( function(eventCollections){
  console.log(eventCollections);
});
```

### Keen.getEventCollectionProperties( eventCollectionName, [ success, error ] )

Parameters:

* **eventCollectionName** - A string containing the name of the event collection whose properties you want to retrieve.
* **success ( response )** - An optional callback function that takes in a JavaScript object containing an object of the properties.  Invoked on success.
* **error** - An optional callback function that is invoked on failure.

Returns a JavaScript object containing the properties of the given event collection for the current project.  The response will look like what is returned from a GET request to our API's [event collection resource](https://keen.io/docs/api/reference/#event-collection-resource)

Example:

```
Keen.getEventCollectionProperties("purchases", function(properties){
    console.log(properties);
});
```

### Keen Extraction

You can use the Keen IO JavaScript library to get raw query results so that you can do custom analysis with it.
For example you might need to get an extraction of full events using the [extractions](https://keen.io/docs/data-analysis/extractions/)  query type. You can use Keen.Metric to construct your query, then use the getResponse method to get the query results. Note that the `draw` method won't work on these types of queries.

In this example we'll use the [select_unique](https://keen.io/docs/data-analysis/list/) query type to get a list of all emails addresses of people that signed up yesterday.

Example:

```
Keen.onChartsReady(function() {

  var metricZ = new Keen.Metric("create_user", {
    analysisType: "select_unique",
    targetProperty: "user.email",
    timeframe: "last_24_hours"
  });

  metricZ.getResponse(function(response){
    console.log(response.result)
    });

});
```

## Data Visualization

### Keen.Number

An object to represent a Number visualization.

Sample Usage:

```
Keen.onChartsReady(function(){

    //Find the total money made from purchases over the last 7 days
    //only count the users that that are over 21 years old.
    var myMetric = new Keen.Metric("purchases", {
        analysisType: "sum",
        targetProperty: "total_price",
        timeframe: "previous_7_days",
    });
    myMetric.addFilter("user.age", "gt", 21);

    //Draw a Number in a <div/> with an ID of "purchases"
    var myNumber = new Keen.Number(myMetric, {
        height: "500px",
        width: "200px",
        label: "Total Purchases Previous 7 Days",
        "border-radius": 5
    });
    myNumber.draw(document.getElementById("purchases"));
});
```

### Keen.Number( query [ , options ] )

Constructor for a `Keen.Number` object.

* **query** - the query object to be visualized.  Either a `Keen.Metric` or a `Keen.SavedQuery` without the groupBy attribute set.
* **options** - an optional JavaScript object containing configuration options for the visualization.

Valid options are:

* *label* - a string containing a label for the Number.  If none is provided, one is generated.
* *prefix* - a string that you would like prepended to the number being displayed (eg: "$" for currencies).
* *suffix* - a string that you would like to add to the end of the number being displayed.
* *height* - a number of pixels as a string indicating the height of the visualization. (eg: "100px")
* *width* - a number of pixels as a string indicating the width of the visualization. (eg: "100px")
* *font-family* - a CSS style value indicating the font family of the text in the visualization.
* *border-radius* - a CSS style value indicating the border-radius of the outer div of the visualization.
* *color* - an HTML color string indicating the color of the text in the visualization.
* *number-background-color* - an HTML color string indicating the background color of the number portion of the visualization.
* *label-background-color* - an HTML color string indicating the background color of the label portion of the visualization.

Example:

```
Keen.onChartsReady(function(){

    //Create a metric containing our total number of logins.
    var myMetric = new Keen.Metric("logins", {
        analysisType: "count"
    });
    //Create a Number visualization for that metric.
    var myNumberVisualization = new Keen.Number(myMetric, {
        height: "300px",
        width: "600px",
        label: "total logins"
    });
});
```

### Keen.Number.draw( element [ , response ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **response** - an optional parameter containing a response from a query. Used to pass the results of a query into a Number instead of re-running the query during the draw function.

Draws a Number visualization in the provided HTML element.

Example:

```
Keen.onChartsReady(function(){

    //Create a Metric containing our total number of logins.
    var myMetric = new Keen.Metric("logins", {
        analysisType: "count"
    });
    //Create a Number visualization for that metric.
    var myNumberVisualization = new Keen.Number(myMetric, {
        height: "300px",
        width: "600px",
        label: "total logins"
    });
    //Draw the visualization in a div
    myNumberVisualization.draw(document.getElementById("myDiv"));
});
```

### Keen.LineChart

An object to represent a LineChart visualization.

Sample Usage:

```
Keen.onChartsReady(function(){

    //Find the amount of money made from purchases each day for the last 7 days
    //only count the users that that are over 21 years old.
    var mySeries = new Keen.Series("purchases", {
        analysisType: "sum",
        targetProperty: "total_price",
        timeframe: "previous_7_days",
        interval: "daily"
    });
    mySeries.addFilter("user.age", "gt", 21);

    //Draw a line chart in a <div/> with an ID of "purchases"
    var myLineChart = new Keen.LineChart(mySeries, {
        height: 500,
        width: 200,
        lineWidth: 5,
        color: "red",
        backgroundColor: "transparent",
        title: "Purchases over Previous 7 Days",
        showLegend: false
    });
    myLineChart.draw(document.getElementById("purchases"));
});
```

### Keen.LineChart( query [ , options ] )

Constructor for a `Keen.LineChart` object.

Parameters:

* **query** - the query object to be visualized. Either a `Keen.Series` or a `Keen.SavedQuery`.
* **options** - an optional JavaScript object containing configuration options for the visualization.

Valid options are:

* *height* - a number indicating the height in pixels.
* *width* - a number indicating the width in pixels.
* *chartAreaHeight* - a number of pixels indicating the height of the chart area. (eg: 100)
* *chartAreaWidth* - a number of pixels indicating the width of the chart area. (eg: 100)
* *chartAreaTop* - the number of pixels indicating the distance from the top of the element to draw the chart. (eg: 50)
* *chartAreaLeft* - the number of pixels indicating the distance from the left of the element to draw the chart. (eg: 50)
* *lineWidth* - a number indicating the width of the line in the LineChart
* *color* - an HTML color string indicating the color of the line in the LineChart
* *backgroundColor* - an HTML color string indicating the background color of the LineChart
* *title* - a string containing the title of the chart.
* *font* - a string containing the name of the font for all the text in the chart.
* *xAxisLabel* - a string containing a label for the x-axis.
* *yAxisLabel* - a string containing a label for the y-axis.
* *xAxisLabelAngle* - a number containing the number of degrees you would like to tilt the x-axis label.
* *showLegend* - a boolean indicating if you want a legend to appear for your chart.
* *label* - a string containing a label for the data in the chart in the legend.

Example:

```
Keen.onChartsReady(function(){
    //Create a Series containing our total number of logins for each of the previous 7 days.
    var mySeries = new Keen.Series("logins", {
        analysisType: "count",
        timeframe: "previous_7_days",
        interval: "daily"
    });
    //Create a LineChart visualization for that Series.
    var myLineChart = new Keen.LineChart(mySeries, {
        height: "300",
        width: "600",
        label: "logins",
        title: "logins previous 7 days"
    });
});
```

### Keen.LineChart.draw( element [ , response ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **response** - an optional parameter containing a response from a query.  Used to pass the results of a query into a LineChart instead of re-running the query during the draw function.

Draws a LineChart visualization in the provided HTML element.

Example:

```
Keen.onChartsReady(function(){

    //Create a Series containing our total number of logins for each of the previous 7 days.
    var mySeries = new Keen.Series("logins", {
        analysisType: "count",
        timeframe: "previous_7_days",
        interval: "daily"
    });
    //Create a LineChart visualization for that Series.
    var myLineChart = new Keen.LineChart(mySeries, {
        height: "300",
        width: "600",
        label: "logins",
        title: "logins previous 7 days"
    });
    //Draw the visualization into a div
    myLineChart.draw(document.getElementById("myDiv"));
});
```

### Keen.MultiLineChart

An object to represent a MultiLineChart visualization.

Sample Usage:

```
Keen.onChartsReady(function(){

    //Find the amount of money made from purchases each day for the last 7 days
    //group the results by the mobile device of the purchaser.
    //only count the users that that are over 21 years old.
    var mySeries = new Keen.Series("purchases", {
        analysisType: "sum",
        targetProperty: "total_price",
        timeframe: "previous_7_days",
        interval: "daily",
        groupBy: "device"
    });
    mySeries.addFilter("user.age", "gt", 21);

    //Draw a multi line chart in a <div/> with an ID of "purchases"
    var myMultiLineChart = new Keen.MultiLineChart(mySeries, {
        height: 600,
        width: 300,
        lineWidth: 5,
        colors: ["red", "green", "#fef584"],
        backgroundColor: "transparent",
        title: "Purchases over Previous 7 Days By Device",
    });
    myMultiLineChart.draw(document.getElementById("purchases"));
});
```

### Keen.MultiLineChart( query [ , options ] )

Constructor for a `Keen.MultilineChart` object.

Parameters:

* **query** - the query object to be visualized.  Either a `Keen.Series` or a `Keen.SavedQuery` with a [group by](https://keen.io/docs/data-analysis/group-by/)  attribute.
* **options** - an optional JavaScript object containing configuration options for the visualization.

Valid options are:

* *height* - a number indicating the height in pixels.
* *width* - a number indicating the width in pixels.
* *chartAreaHeight* - a number of pixels indicating the height of the chart area. (eg: 100)
* *chartAreaWidth* - a number of pixels indicating the width of the chart area. (eg: 100)
* *chartAreaTop* - the number of pixels indicating the distance from the top of the element to draw the chart. (eg: 50)
* *chartAreaLeft* - the number of pixels indicating the distance from the left of the element to draw the chart. (eg: 50)
* *lineWidth* - a number indicating the width of the line in the LineChart
* *colors* - a JSON array of HTML color strings indicating the color of the lines in the MultiLineChart
* *backgroundColor* - an HTML color string indicating the background color of the MultiLineChart
* *title* - a string containing the title of the chart.
* *font* - a string containing the name of the font for all the text in the chart.
* *xAxisLabel* - a string containing a label for the x-axis.
* *yAxisLabel* - a string containing a label for the y-axis.
* *xAxisLabelAngle* - a number containing the number of degrees you would like to tilt the x-axis label.
* *showLegend* - a boolean indicating if you want a legend to appear for your chart.
* *labelMapping* - an object containing a map of data values to desired display values.

Example:

```
Keen.onChartsReady(function(){

    //Create a Series containing our total number of logins for each of the previous 7 days.
    var mySeries = new Keen.Series("logins", {
        analysisType: "count",
        timeframe: "previous_7_days",
        interval: "daily",
        groupBy: "user.email"
    });
    //Create a MultiLineChart visualization for that Series.
    var myMultiLineChart = new Keen.MultiLineChart(mySeries, {
        height: "300",
        width: "600",
        title: "logins previous 7 days by email"
    });
});
```

### Keen.MultiLineChart.draw( element [ , response ] )

This section shows you how to use group_by queries to draw a multi-line chart.

Parameters:

* **element** - an HTML element in which to draw the visualization
* **response** - an optional parameter containing a response from a query.  Used to pass the results of a query into a MultiLineChart instead of re-running the query during the draw function.

Draws a MultiLineChart visualization in the provided HTML element.

Example:

```
Keen.onChartsReady(function(){

    //Create a Series containing our total number of logins for each of the previous 7 days.
    var mySeries = new Keen.Series("logins", {
        analysisType: "count",
        timeframe: "previous_7_days",
        interval: "daily",
        groupBy: "user.email"
    });
    //Create a MultiLineChart visualization for that Series.
    var myMultiLineChart = new Keen.MultiLineChart(mySeries, {
        height: "300",
        width: "600",
        label: "logins",
        title: "logins previous 7 days by email"
    });
    //Draw the visualization into a div
    myMultiLineChart.draw(document.getElementById("myDiv"));
});
```

### Keen.PieChart

An object to represent a `PieChart` visualization.

Sample Usage:

```
Keen.onChartsReady(function(){

    //Find the total money made from purchases for the last 7 days
    //group the results by the mobile device of the purchaser.
    //only count the users that that are over 21 years old.
    var myMetric = new Keen.Metric("purchases", {
        analysisType: "sum",
        targetProperty: "total_price",
        timeframe: "previous_7_days",
        groupBy: "device"
    });
    myMetric.addFilter("user.age", "gt", 21);

    //Draw a pie chart in a <div/> with an ID of "purchases"
    var myPieChart = new Keen.PieChart(myMetric, {
        height: 300,
        width: 600,
        minimumSlicePercentage: 5,
        colors: ["orange", "green", "#fef584"],
        backgroundColor: "transparent",
        title: "Total Purchases Previous 7 Days By Device",
    });
    myPieChart.draw(document.getElementById("purchases"));
});
```

### Keen.PieChart( query [ , options ] )

Constructor for a `Keen.PieChart` object.

Parameters:

* **query** - the query object to be visualized.  Either a `Keen.Metric` or a `Keen.SavedQuery` with a groupBy attribute.
* **options** - an optional JavaScript object containing configuration options for the visualization.

Valid options are:

* *height* - a number indicating the height in pixels
* *width* - a number indicating the width in pixels
* *chartAreaHeight* - a number of pixels indicating the height of the chart area. (eg: 100)
* *chartAreaWidth* - a number of pixels indicating the width of the chart area. (eg: 100)
* *chartAreaTop* - the number of pixels indicating the distance from the top of the element to draw the chart. (eg: 50)
* *chartAreaLeft* - the number of pixels indicating the distance from the left of the element to draw the chart. (eg: 50)
* *minimumSlicePercentage* - A number indicating the minimum percentage of the chart's total value that a slice needs to be in order to be labeled.  All values falling beneath this threshold will be grouped into an "Other" slice.
* *backgroundColor* - an HTML color string indicating the background color of the chart
* *title* - a string containing the title of the chart.
* *font* - a string containing the name of the font for all the text in the chart.
* *showLegend* - a boolean indicating if you want a legend to appear for your chart.
* *colors* - an array of HTML color strings indicating the color of the slices.
* *fontColor* - an html color string indicating the color of the fonts in the chart and legend.
* *labelMapping* - an object containing a map of data values to desired display values.
* *colorMapping* - a map of label values to colors. (eg: {"Foo": "black", "Bar": "blue", "Baz": "orange"})

Example:

```
Keen.onChartsReady(function(){

    //Create a Metric for the number of logins each user has performed in the previous 7 days.
    var myMetric = new Keen.Metric("logins", {
        analysisType: "count",
        timeframe: "previous_7_days",
        groupBy: "user.email"
    });
    //Create a PieChart visualization for that Metric.
    var myPieChart = new Keen.PieChart(myMetric, {
        height: 300,
        width: 600,
        title: "logins previous 7 days",
        minimumSlicePercentage: 1
    });
});
```

### Keen.PieChart.draw( element [ , response ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **response** - an optional parameter containing a response from a query.  Used to pass the results of a query into a LineChart instead of re-running the query during the draw function.

Draws a PieChart visualization in the provided HTML element.

Example:

```
Keen.onChartsReady(function(){

    //Create a Metric for the number of logins each user has performed in the previous 7 days.
    var myMetric = new Keen.Metric("logins", {
        analysisType: "count",
        timeframe: "previous_7_days",
        groupBy: "user.email"
    });
    //Create a PieChart visualization for that Metric.
    var myPieChart = new Keen.PieChart(myMetric, {
        height: 300,
        width: 600,
        title: "logins previous 7 days",
        minimumSlicePercentage: 1
    });
    //Draw the visualization into a div
    myPieChart.draw(document.getElementById("myDiv"));
});
```

### Keen.FunnelChart( query [ , options ] )

Constructor for a `Keen.FunnelChart` object.

Parameters:

* **query** - the query object to be visualized.  Must be a `Keen.Funnel`.
* **options** - an optional JavaScript object containing configuration options for the visualization.

Valid options are:

* *height* - a number indicating the height in pixels
* *width* - a number indicating the width in pixels
* *chartAreaHeight* - a number of pixels indicating the height of the chart area. (eg: 100)
* *chartAreaWidth* - a number of pixels indicating the width of the chart area. (eg: 100)
* *chartAreaTop* - the number of pixels indicating the distance from the top of the element to draw the chart. (eg: 50)
* *chartAreaLeft* - the number of pixels indicating the distance from the left of the element to draw the chart. (eg: 50)
* *minimumSlicePercentage* - A number indicating the minimum percentage of the chart's total value that a slice needs to be in order to be labeled.  All values falling beneath this threshold will be grouped into an "Other" slice.
* *backgroundColor* - an HTML color string indicating the background color of the chart
* *title* - a string containing the title of the chart.
* *font* - a string containing the name of the font for all the text in the chart.
* *showLegend* - a boolean indicating if you want a legend to appear for your chart.
* *color* - an HTML color string indicating the color of the funnel chart.
* *fontColor* - an html color string indicating the color of the fonts in the chart and legend.

Example:

```
Keen.onChartsReady(function(){

    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    //Create a Funnel Chart visualization for that funnel.
    var myFunnelChart = new Keen.FunnelChart(myFunnel, {
        height: 300,
        width: 600,
        title: "User Conversion Funnel"
    });
});
```

### Keen.FunnelChart.draw( element [ , response ] )

Parameters:

* **element** - an HTML element in which to draw the visualization
* **response** - an optional parameter containing a response from a Funnel query.  Used to pass the results of a query into a FunnelChart instead of re-running the query during the draw function.

Draws a FunnelChart visualization in the provided HTML element.

Example:

```
Keen.onChartsReady(function(){

    var s1 = new Keen.Step("download app");
    var s2 = new Keen.Step("create account");
    var s3 = new Keen.Step("buy item");

    var myFunnel = new Keen.Funnel([s1, s2, s3], {
        actorProperty: "user.id"
    });

    //Create a Funnel Chart visualization for that funnel.
    var myFunnelChart = new Keen.FunnelChart(myFunnel, {
        height: 300,
        width: 600,
        title: "User Conversion Funnel"
    });

    //Draw the chart into a div on the page.
    myFunnelChart.draw(document.getElementById('myFunnelChartDiv'));
});
```
