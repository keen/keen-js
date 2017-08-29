<!--
<a name="unreleased"></a>
# Unreleased
-->
<a name="4.0.1"></a>
# 4.0.1 Fix Package Dependencies

**Fixed:**
* Removed unnecessary `browserify.transform` definition from `package.json`


<a name="4.0.0"></a>
# Hello, version 4

This release replaces all functionality found in v3 with three standalone modules, listed below, as a bundled distribution. Documentation, bug tracking, and feature development will continue to reside in each module's respective repo. [Read about getting started here](https://github.com/keen/keen-js/tree/master#getting-started).

**Stream: [keen-tracking.js](https://github.com/keen/keen-tracking.js)**
[Documentation](https://github.com/keen/keen-tracking.js/blob/master/README.md) | [Issues](https://github.com/keen/keen-tracking.js/issues) | [Upgrade guide](https://github.com/keen/keen-tracking.js/blob/master/docs/upgrade-guide.md)
_What to expect: One breaking change to a utility method, otherwise a full drop-in replacement._

**Compute: [keen-analysis.js](https://github.com/keen/keen-analysis.js)**
[Documentation](https://github.com/keen/keen-analysis.js/blob/master/README.md) | [Issues](https://github.com/keen/keen-analysis.js/issues) | [Upgrade guide](https://github.com/keen/keen-analysis.js#upgrading-from-keen-js)
_What to expect: Several breaking changes, significant rework of HTTP methods, and a much better interface for handling requests for all API resources._

**Visualize: [keen-dataviz.js](https://github.com/keen/keen-dataviz.js)**
[Documentation](https://github.com/keen/keen-dataviz.js/tree/master/docs) | [Issues](https://github.com/keen/keen-dataviz.js/issues) | [Examples](http://keen.github.io/keen-dataviz.js/) | [Upgrade guide](https://github.com/keen/keen-dataviz.js#upgrading-from-keen-js)
_What to expect: Several breaking changes, significant rework of internal props._

When **keen-js** is loaded as a global, these packages will be assigned to a shared `Keen` namespace. If you only need select functionality, we recommend using the standalone packages, which can each installed independently, via npm.
