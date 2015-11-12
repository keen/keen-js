# Chart.js Dataviz Adapter

Chart.js is a lightweight, flexible library that renders charts with HTML5 canvas elements.This SDK includes an adapter that makes it possible to visualize your data with Chart.js by including the dependencies shown below and making a few quick modifications to a chart's configuration.

There are also several examples that use Chart.js on [jsFiddle](http://jsfiddle.net/user/keen/fiddles/). [This jsFiddle](http://jsfiddle.net/vyp0r08/f1m89naj/2/) demonstrates custom date formatting with [moment.js](http://momentjs.com/).

### Installation

```html
<!-- Load Chart.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js"></script>

<!-- Load keen.js -->
<script src="http://d26b395fwzu5fz.cloudfront.net/3.3.0/keen.min.js"></script>
```

### Configuration

Set the `libary` to "chartjs" and select a `chartType` from the list below.

```javascript
// via client.draw
client.draw(query, document.getElementById('my-chart'), {
  library: 'chartjs',
  chartType: 'line'
});

// via Keen.Dataviz()
var chart = new Keen.Dataviz()
  .el(document.getElementById('my-chart'))
  .library('chartjs')
  .chartType('line')
  .prepare();
```

**Available `chartType` values:**

* [bar](http://www.chartjs.org/docs/#bar-chart)
* [line](http://www.chartjs.org/docs/#line-chart)
* [radar](http://www.chartjs.org/docs/#radar-chart)
* [polar-area](http://www.chartjs.org/docs/#polar-area-chart)
* [doughnut](http://www.chartjs.org/docs/#doughnut-pie-chart)
* [pie](http://www.chartjs.org/docs/#doughnut-pie-chart)

### Customization

The `chartOptions` config object can be used to pass custom options into the chart prior to rendering. Learn more about Chart.js configuration options [here](http://www.chartjs.org/docs).

```javascript
// via client.draw
client.draw(query, document.getElementById('my-chart'), {
  library: 'chartjs',
  chartType: 'line',
  chartOptions: {
    scaleShowGridLines : true,
    pointDot : true,
    datasetStrokeWidth : 2,
    datasetFill : true
  }
});

// via Keen.Dataviz()
var chart = new Keen.Dataviz()
  .el(document.getElementById('my-chart'))
  .library('chartjs')
  .chartType('line')
  .chartOptions({
    scaleShowGridLines : true,
    pointDot : true,
    datasetStrokeWidth : 2,
    datasetFill : true
  })
  .prepare();
```
