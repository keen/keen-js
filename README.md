# Keen IO JavaScript SDK (v4)

This is v4 of the Keen IO JavaScript SDK. Previous versions and their documentation are available as branches of this repo.

### Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/login?s=gh_js). The Project ID and API Keys are available on the Access page of the Project Console. You will need these for the next steps.

### Installation

Install this package from NPM:

```ssh
npm install keen-js
```

Or load it synchronously from the CDN:

```html
<meta charset="utf-8">
<link href="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr2/keen.min.css" rel="stylesheet" />
<script src="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr2/keen.min.js"></script>
```

Under the hood, this is a bundled release of the following packages, which can each be loaded individually to suit your needs:

* [keen-tracking.js](https://github.com/keen/keen-tracking.js)
* [keen-analysis.js](https://github.com/keen/keen-analysis.js)
* [keen-dataviz.js](https://github.com/keen/keen-dataviz.js)

When **keen-js** is loaded as a global, these packages will be assigned to a shared `Keen` namespace.

---

## Stream

**What is an event?** An event is a record of something important happening in the life of your app or service: like a click, a purchase, or a device activation.

### Record an Event

The following example demonstrates how to record an event to the pageviews stream. The properties defined in the event body below are only for example and can be replaced or renamed to suit your needs.

```javascript
import Keen from 'keen-js';

const client = new Keen({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY'
});

client.recordEvent('pageviews', {
  // Define your event data model..
  // Here are a few examples to get you started:
  browser_profile: Keen.helpers.getBrowserProfile(),
  datetime_index: Keen.helpers.getDatetimeIndex(),
  device_type: 'mobile',
  page_title: document.title,
  user: {
    display_name: 'Doug Engelbart',
    id: 'f3d43412df1h23k123l23b',
    is_admin: false,
    profile_url: 'https://dougengelbart.org'
  }
});
```

This example also uses [`Keen.helpers.getBrowserProfile()`](https://github.com/keen/keen-tracking.js/blob/master/README.md#browser-profile) and [`Keen.helpers.getDatetimeIndex()`](https://github.com/keen/keen-tracking.js/blob/master/README.md#datetime-index) to help build out an insightful data model. These helpers produce useful properties like `screen.width` and `day_of_week`, which are excellent for segmenting query results.

**[Documentation](https://github.com/keen/keen-tracking.js/blob/master/README.md)**

See also:

* [Record events in batches](https://github.com/keen/keen-tracking.js/blob/master/README.md#record-multiple-events)
* [Data modeling helpers](https://github.com/keen/keen-tracking.js/blob/master/README.md#helpers)
* Data Enrichment Add-Ons

**[Examples](https://github.com/keen/keen-tracking.js/blob/master/README.md#example-setup)**

---

## Compute

Keen's powerful Compute API gives you fast answers to the questions that matter.

### Run a Query

The following example demonstrates how to query the pageviews stream created in the previous section. This query will return the total number of pageviews each day, for a rolling 14 day timeframe, segmented values found in `device_type`.

```javascript
import Keen from 'keen-js';

const client = new Keen({
  projectId: 'YOUR_PROJECT_ID',
  readKey: 'YOUR_READ_KEY'
});

client
  .query('count', {
    event_collection: 'pageviews',
    group_by: 'device_type',
    interval: 'daily',
    timeframe: 'this_14_days'
  })
  .then(res => {
    // Handle results
  })
  .catch(err => {
    // Handle errors
  });
```

**[Documentation](https://github.com/keen/keen-analysis.js/blob/master/README.md)**

See also:

* [Saved and Cached Queries](https://github.com/keen/keen-analysis.js/blob/master/README.md#saved-queries)
* [Cached Datasets](https://github.com/keen/keen-analysis.js/blob/master/README.md#cached-datasets)
* [All other API resources](https://github.com/keen/keen-analysis.js/blob/master/README.md#example-get-request)

---

# Visualize

```html
<html>
  <head>
    <meta charset="utf-8">
    <link href="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr2/keen.min.css" rel="stylesheet" />
    <script src="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr2/keen.min.js"></script>
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
        .type('area')
        .prepare();

      client
        .query('count', {
          event_collection: 'pageviews',
          timeframe: 'this_14_days',
          interval: 'daily'
        })
        .then(function(res) {
          chart
            .data(res)
            .render();
        })
        .catch(function(err) {
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
