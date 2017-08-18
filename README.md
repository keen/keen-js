# Keen IO JavaScript SDK (v4)

This is v4 of the Keen IO JavaScript SDK. Previous versions and their documentation are available as branches of this repo.

### Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/login?s=gh_js). The Project ID and API Keys are available on the Access page of the Project Console. You will need these for the next steps.

### Installation

Install this package from NPM:

```ssh
npm install keen-js --save
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

This package contains [keen-tracking.js](https://github.com/keen/keen-tracking.js) as-is, and can be used interchangeably. If you only need tracking functionality, we recommend using the standalone package.

```javascript
// import Keen from 'keen-tracking';
import Keen from 'keen-js';

const client = new Keen({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY'
});

client.recordEvent('pageviews', {
  /* Data Model */
});
```

**[Examples and documentation are available in the keen-tracking.js repo](https://github.com/keen/keen-tracking.js#getting-started)**.

See also:

* [Record events in batches](https://github.com/keen/keen-tracking.js/blob/master/docs/record-events.md#record-multiple-events)
* [Data modeling helpers](https://github.com/keen/keen-tracking.js/blob/master/docs/helpers.md)
* [Data Enrichment Add-Ons](https://keen.io/docs/streams/data-enrichment-overview/)

---

## Compute

Keen's powerful Compute API gives you fast answers to the questions that matter.

This package contains [keen-analysis.js](https://github.com/keen/keen-analysis.js) as-is, and can be used interchangeably. If you only need compute functionality, we recommend using the standalone package.

```javascript
// import Keen from 'keen-analysis';
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

**[Examples and documentation are available in the keen-analysis.js repo](https://github.com/keen/keen-analysis.js#getting-started)**.

See also:

* [Saved and Cached Queries](https://github.com/keen/keen-analysis.js/blob/master/README.md#saved-and-cached-queries)
* [Cached Datasets](https://github.com/keen/keen-analysis.js/blob/master/README.md#cached-datasets)
* [All other API resources](https://github.com/keen/keen-analysis.js/blob/master/README.md#api-resources)

---

## Visualize

This package contains [keen-dataviz.js](https://github.com/keen/keen-analysis.js) as-is, and can be used interchangeably.

**[Examples and documentation are available in the keen-dataviz.js repo](https://github.com/keen/keen-dataviz.js)**.

```html
<html>
  <head>
    <meta charset="utf-8">
    <link href="https://d26b395fwzu5fz.cloudfront.net/4.0.0-pr2/keen.min.css"  rel="stylesheet" />
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

**Important:** the `<meta charset="utf-8">` charset encoding meta tag is required for this library to function properly.
