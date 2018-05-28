# Keen IO JavaScript SDK (v5)

This is v5 of the Keen IO JS SDK. Previous versions and their documentation are available as [branches](https://github.com/keen/keen-js/branches) of this repo.

### Get Project ID & API Keys

If you haven’t done so already, [login to Keen IO to create a project](https://keen.io/login?s=gh_js). The Project ID and API Keys are available on the Access page of the Project Console. You will need these for the next steps.

### Installation

Install this package from NPM:

```ssh
npm install keen-js --save
```

Under the hood, this is simply a bundled release of the following packages:

* [keen-tracking.js](https://github.com/keen/keen-tracking.js)
* [keen-analysis.js](https://github.com/keen/keen-analysis.js)
* [keen-dataviz.js](https://github.com/keen/keen-dataviz.js)

---

## Stream - Keen Tracking JS

**What is an event?** An event is a record of something important happening in the life of your app or service: like a click, a purchase, or a device activation.

[Full documentation is available in the keen-tracking.js repo](https://github.com/keen/keen-tracking.js/blob/master/docs/README.md).


### Automated Event Tracking (Browser-only)

Automatically record `pageviews`, `clicks`, and `form_submissions` events with robust data models.

[Learn how to configure and customize this functionality here](https://github.com/keen/keen-tracking.js/blob/master/docs/auto-tracking.md)


### Pageview Tracking (Browser/Front-end)

First, let's create a new `client` instance with your Project ID and Write Key, and use the `.extendEvents()` method to define a solid baseline data model that will be applied to every single event that is recorded. Consistent data models and property names make life much easier later on, when analyzing and managing several event streams. This setup also includes our [data enrichment add-ons](https://keen.io/docs/streams/data-enrichment-overview/), which will populate additional information when an event is received on our end.

```javascript
import KeenTracking from 'keen-tracking';

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});

const helpers = KeenTracking.helpers;
const utils = KeenTracking.utils;

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
      browser: helpers.getBrowserProfile(),
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

client.recordEvent('pageviews', {});
```

Every event that is recorded will inherit this baseline data model. Additional properties defined in `client.recordEvent()` will be applied before the event is finally recorded.

Want to get up and running faster? This can also be achieved in the browser with [automated event tracking](https://github.com/keen/keen-tracking.js/blob/master/docs/auto-tracking.md).

---

### Node.js Event Recording (Back-end)

```javascript
const KeenTracking = require('keen-tracking');

const client = new KeenTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});

client.recordEvent('purchases', {
  item: 'Avocado',
  price: 123
});
```

---

**More examples:**

* [Record clicks and form submissions](https://github.com/keen/keen-tracking.js#click-and-form-submit-tracking-browserfront-end)
* [Block bots and improve device recognition](https://github.com/keen/keen-tracking.js#block-bots-and-improve-device-recognition-browserfront-end)

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


## Compute - Keen Analysis JS

Keen's powerful Compute API gives you fast answers to the questions that matter.

[Full documentation is available in the keen-analysis.js repo](https://github.com/keen/keen-analysis.js).


### Running a Query

Create a new `client` instance with your Project ID and Read Key, and use the `.query()` method to execute an ad-hoc query. This client instance is the core of the library and will be required for all API-related functionality.

```javascript
import KeenAnalysis from 'keen-analysis';

const client = new KeenAnalysis({
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

**Documentation:** [Full documentation is available in the keen-analysis.js repo](https://github.com/keen/keen-analysis.js).

---


## Visualize - Keen Dataviz JS

**Examples:** [keen.github.io/keen-dataviz.js](https://keen.github.io/keen-dataviz.js).

**Documentation:** [Full documentation is available in the keen-dataviz.js repo](https://github.com/keen/keen-dataviz.js).

### Rendering a Chart

```html
<html>
  <head>
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
