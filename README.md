# Keen IO JavaScript SDK (v4)

This is v4 of the Keen IO JS SDK. Previous versions and their documentation are available as [branches](https://github.com/keen/keen-js/branches) of this repo.

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
<link href="https://d26b395fwzu5fz.cloudfront.net/4.3.0/keen.min.css" rel="stylesheet" />
<script src="https://d26b395fwzu5fz.cloudfront.net/4.3.0/keen.min.js"></script>
```

Under the hood, this is simply a bundled release of the following packages:

* [keen-tracking.js](https://github.com/keen/keen-tracking.js)
* [keen-analysis.js](https://github.com/keen/keen-analysis.js)
* [keen-dataviz.js](https://github.com/keen/keen-dataviz.js)

When **keen-js** is loaded as a global, these packages will be assigned to a shared `Keen` namespace. We recommend using the standalone packages that best suit your needs.

---

## Getting started

The following examples are intended to help you get up and running quickly with keen-js:

* [Setup and Pageview Tracking](#setup-and-pageview-tracking)
* [Running a Query](#running-a-query)
* [Rendering a Chart](#rendering-a-chart)

---

## Stream

**What is an event?** An event is a record of something important happening in the life of your app or service: like a click, a purchase, or a device activation.

This package contains [keen-tracking.js](https://github.com/keen/keen-tracking.js) as-is, and can be used interchangeably. If you only need tracking functionality, we recommend using the standalone package.

[Full documentation is available in the keen-tracking.js repo](https://github.com/keen/keen-tracking.js/blob/master/docs/README.md).


### Automated Event Tracking (browser-only)

Automatically record `pageviews`, `clicks`, and `form_submissions` events with robust data models:

```html
<link href="https://d26b395fwzu5fz.cloudfront.net/4.3.0/keen.min.css" rel="stylesheet" />
<script src="https://d26b395fwzu5fz.cloudfront.net/4.3.0/keen.min.js"></script>
<script>
Keen.ready(function(){
  var client = new Keen({
    projectId: 'YOUR_PROJECT_ID',
    writeKey: 'YOUR_WRITE_KEY'
  });
  client.initAutoTracking();
});
</script>
```

[Learn how to configure and customize this functionality here](https://github.com/keen/keen-tracking.js/blob/master/docs/auto-tracking.md)


### Pageview Tracking

First, let's create a new `client` instance with your Project ID and Write Key, and use the `.extendEvents()` method to define a solid baseline data model that will be applied to every single event that is recorded. Consistent data models and property names make life much easier later on, when analyzing and managing several event streams. This setup also includes our [data enrichment add-ons](https://keen.io/docs/streams/data-enrichment-overview/), which will populate additional information when an event is received on our end.

```javascript
import Keen from 'keen-js';
// import Keen from 'keen-tracking';

const client = new Keen({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});
const helpers = Keen.helpers;
const utils = Keen.utils;

const sessionCookie = utils.cookie('rename-this-example-cookie');
if (!sessionCookie.get('guest_id')) {
  sessionCookie.set('guest_id', helpers.getUniqueId());
}

client.extendEvents(() => {
  return {
    geo: {
      info: { /* Enriched */ },
      ip_address: '${keen.ip}',
    },
    page: {
      info: { /* Enriched */ },
      title: document.title,
      url: document.location.href
    },
    referrer: {
      info: { /* Enriched */ },
      url: document.referrer
    },
    tech: {
      browser: getBrowserProfile(),
      info: { /* Enriched */ },
      user_agent: '${keen.user_agent}'
    },
    time: helpers.getDatetimeIndex(),
    visitor: {
      guest_id: sessionCookie.get('guest_id')
      /* Include additional visitor info here */
    },
    keen: {
      addons: [
        {
          name: 'keen:ip_to_geo',
          input: {
            ip: 'geo.ip_address'
          },
          output : 'geo.info'
        },
        {
          name: 'keen:ua_parser',
          input: {
            ua_string: 'tech.user_agent'
          },
          output: 'tech.info'
        },
        {
          name: 'keen:url_parser',
          input: {
            url: 'page.url'
          },
          output: 'page.info'
        },
        {
          name: 'keen:referrer_parser',
          input: {
            referrer_url: 'referrer.url',
            page_url: 'page.url'
          },
          output: 'referrer.info'
        }
      ]
    }
  }
});

client.recordEvent('pageview', {});
```

Every event that is recorded will inherit this baseline data model. Additional properties defined in `client.recordEvent()` will be applied before the event is finally recorded.

Want to get up and running faster? This can also be achieved in the browser with [automated event tracking](https://github.com/keen/keen-tracking.js/blob/master/docs/auto-tracking.md).

**More examples:**

* [Record clicks and form submissions](https://github.com/keen/keen-tracking.js#click-and-form-submit-tracking)
* [Block bots and improve device recognition](https://github.com/keen/keen-tracking.js#block-bots-and-improve-device-recognition)

**What else can this SDK do?**

* [Automated tracking (browser-only)](https://github.com/keen/keen-tracking.js/blob/master/docs/auto-tracking.md)
* [Record multiple events in batches](https://github.com/keen/keen-tracking.js/blob/master/docs/record-events.md)
* [Extend event data models for a single event stream](https://github.com/keen/keen-tracking.js/blob/master/docs/extend-events.md)
* [Queue events to be recorded at a given time interval](https://github.com/keen/keen-tracking.js/blob/master/docs/defer-events.md)

**React Examples**

* [React Flux Logger](https://github.com/keen/keen-tracking.js/tree/master/docs/examples/react-flux): How to instrument a Flux ReduceStore
* [React Redux Middleware](https://github.com/keen/keen-tracking.js/tree/master/docs/examples/react-redux-middleware): How to instrument a Redux Store

**Documentation:** [Full documentation is available in the keen-tracking.js repo](https://github.com/keen/keen-tracking.js/blob/master/docs/README.md).

---


## Compute

Keen's powerful Compute API gives you fast answers to the questions that matter.

This package contains [keen-analysis.js](https://github.com/keen/keen-analysis.js) as-is, and can be used interchangeably. If you only need compute functionality, we recommend using the standalone package.

[Full documentation is available in the keen-analysis.js repo](https://github.com/keen/keen-analysis.js#getting-started).


### Running a Query

Create a new `client` instance with your Project ID and Read Key, and use the `.query()` method to execute an ad-hoc query. This client instance is the core of the library and will be required for all API-related functionality.

```javascript
import Keen from 'keen-js';
// import Keen from 'keen-analysis';

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

**What else can this SDK do?**

* [Saved and Cached Queries](https://github.com/keen/keen-analysis.js/blob/master/README.md#saved-and-cached-queries)
* [Cached Datasets](https://github.com/keen/keen-analysis.js/blob/master/README.md#cached-datasets)
* [All other API resources](https://github.com/keen/keen-analysis.js/blob/master/README.md#api-resources)

**Documentation:** [Full documentation is available in the keen-analysis.js repo](https://github.com/keen/keen-analysis.js#getting-started).

---


## Visualize

This package contains [keen-dataviz.js](https://github.com/keen/keen-analysis.js) as-is, and can be used interchangeably.

**Examples:** [keen.github.io/keen-dataviz.js](https://keen.github.io/keen-dataviz.js).

**Documentation:** [Full documentation is available in the keen-dataviz.js repo](https://github.com/keen/keen-dataviz.js).

### Rendering a Chart

```html
<html>
  <head>
    <meta charset="utf-8">
    <link href="https://d26b395fwzu5fz.cloudfront.net/4.3.0/keen.min.css" rel="stylesheet" />
    <script src="https://d26b395fwzu5fz.cloudfront.net/4.3.0/keen.min.js"></script>
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

---

### Contributing

This is an open source project and we love involvement from the community! Hit us up with pull requests and issues.

[Learn more about contributing to this project](./CONTRIBUTING.md).

---

### Support

Need a hand with something? Shoot us an email at [team@keen.io](mailto:team@keen.io). We're always happy to help, or just hear what you're building! Here are a few other resources worth checking out:

* [API status](http://status.keen.io/)
* [API reference](https://keen.io/docs/api)
* [How-to guides](https://keen.io/guides)
* [Data modeling guide](https://keen.io/guides/data-modeling-guide/)
* [Slack (public)](http://slack.keen.io/)
