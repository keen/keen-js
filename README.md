# Keen IO JavaScript SDK (v4)

This is v4 of the Keen IO JavaScript SDK, which is actually just a bundled release of the following packages:

* [keen-tracking.js](https://github.com/keen/keen-tracking.js)
* [keen-analysis.js](https://github.com/keen/keen-analysis.js)
* [keen-dataviz.js](https://github.com/keen/keen-dataviz.js)

Previous versions and their documentation are available as branches of this repo.

### Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/login?s=gh_js). The Project ID and API Keys are available on the Access page of the Project Console. You will need these for the next steps.

## Installation

Install this package from NPM:

```ssh
npm install keen-js
```

Or load it synchronously from the CDN:

```html
<meta charset="utf-8">
<link href="https://d26b395fwzu5fz.cloudfront.net/keen-dataviz-1.1.3.min.css" rel="stylesheet" />
<script src="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr1/keen.min.js"></script>
```

The individual packages listed above can also be loaded independently.

---

## Record an Event

```javascript
var client = new Keen({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY'
});

client.recordEvent('pageviews', {
  // Define your event data model
  device_type: 'mobile',
  page_title: document.title,
  user: {
    display_name: 'Doug Engelbart',
    profile_url: 'https://dougengelbart.org',
  }
});
```

**[Documentation](https://github.com/keen/keen-tracking.js/blob/master/README.md)**

**[Examples](https://github.com/keen/keen-tracking.js/blob/master/README.md#example-setup)**

---

## Run a Query

```javascript
var client = new Keen({
  projectId: 'YOUR_PROJECT_ID',
  readKey: 'YOUR_READ_KEY'
});

client
  .query('count', {
    event_collection: 'pageviews',
    timeframe: 'this_14_days'
  })
  .then(function(res){
    // do something with the result
  })
  .catch(function(err){
    // catch and handle errors
  });
```

**[Documentation](https://github.com/keen/keen-analysis.js/blob/master/README.md)**

See also:

* [Saved and Cached Queries](https://github.com/keen/keen-analysis.js/blob/master/README.md#saved-queries)
* [Cached Datasets](https://github.com/keen/keen-analysis.js/blob/master/README.md#cached-datasets)
* [All other API resources](https://github.com/keen/keen-analysis.js/blob/master/README.md#example-get-request)

---

# Data Visualization

```html
<html>
  <head>
    <meta charset="utf-8">
    <link href="https://d26b395fwzu5fz.cloudfront.net/keen-dataviz-1.1.3.min.css" rel="stylesheet" />
    <script src="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr1/keen.min.js"></script>
  </head>
  <body>
    <!-- DOM Element -->
    <div id='my-chart-div'></div>

    <!-- Create and Render -->
    <script>
      var client = new Keen({
        projectId: 'YOUR_PROJECT_ID',
        readKey: 'YOUR_READ_KEY'
      });

      var chart = new Keen.Dataviz()
        .el('#my-chart-div')
        .height(180)
        .title('Pageviews (14d)')
        .type('metric')
        .prepare();

      client
        .query('count', {
          event_collection: 'pageviews',
          timeframe: 'this_14_days',
          interval: 'daily'
        })
        .then(function(res){
          chart
            .data(res)
            .render();
        })
        .catch(function(err){
          chart
            .message(err.message);
        });
    </script>
  </body>
</html>
```

<!-- ### Tracking

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.1.4.min.js"></script>
```

### Analysis

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/keen-analysis-1.3.0.min.js"></script>
```

### Visualization

```html
<meta charset="utf-8">
<link href="https://d26b395fwzu5fz.cloudfront.net/keen-dataviz-1.1.3.min.css" rel="stylesheet" />
<script src="https://d26b395fwzu5fz.cloudfront.net/keen-dataviz-1.1.3.min.js"></script>
``` -->
