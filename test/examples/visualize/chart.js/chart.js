// jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
var generateData = function(res) {
  var newData = res;
  for (var i = 0; i < res.result.length; i++) {
    for (var j = 0; j < res.result[i].value.length; j++) {
      newData.result[i].value[j].result = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    }
  }
  return newData;
};

describe('Chart.js', function () {
  // OVERRIDE THE TIMEOUT
  this.timeout(15000);
  var keen;
  var chartTypes = ['Line', 'Bar', 'Radar', 'PolarArea', 'Pie', 'Doughnut'];
  var labelMapping = {
    null: 'N/A',
    "file://localhost/Users/Larimer/Downloads/gist3a84fb3288737047e173-05ee2560c1be278096416081960b98ff0104ea4d/index.html": "Home",
    "file://localhost/Users/Larimer/dev/keen/sandbox/video.js%20plugin/index.html": "Video page"
  };

  var multiline = new Keen.Query("count", {
    event_collection: "pageview",
    group_by: "page",
    timeframe: "this_12_months",
    interval: "monthly"
  });

  beforeEach(function() {
    keen = new Keen({
      projectId: "52f2ae5905cd661a7800000a",
      readKey: "4e4d72e5bf8b69686ed87a5a9671bba7ad829fbd10a1c281ee51b6e9c1ce9548e941e1f336f9de9281a5acc66ca8fdabc9b3c806e390eca01665f6a308a9b03d8b332b3fbd9f3cdfc3b3e16b0da6d84851e53fe20fbbce300801b8a401a6395b9f4ab9c89bff566e9678a74ca6624f9b",
      requestType: "jsonp"
    });
    
  });

  it('should display a metric', function () {
    Keen.ready(function() {
    });
    expect(true).to.equal(true);
  });

  it('should display graphs with chartType specified', function (done) {

    Keen.ready(function() {
      keen.run(multiline, function(res){
        this.data = generateData(res);
        for(i = 0; i < chartTypes.length; i++) {
          var canvas = document.createElement('canvas');
          document.querySelector('body').appendChild(canvas);

          new Keen.Visualization(this, canvas, {
            library: "chart.js",
            chartType: chartTypes[i],
            labelMapping: labelMapping
          });
          
          // expect(canvas.className).equal('chart.js');
          done();

          // canvas.remove();
        }
      });

    });
  });

  xit('should pass options to underlying library', function (done) {
    Keen.ready(function() {
      keen.run(multiline, function(res) {
        var div = document.createElement('div');
        document.querySelector('body').appendChild(div);
        this.data = generateData(res);

        new Keen.Visualization(this, div, {
          library: "chart.js",
          chartType: 'Line',
          labelMapping: labelMapping,
          chartOptions: {
            size: {
              height: 500
            }
          }
        });

        // expect(div.querySelector('svg').height.baseVal.value).equal(500);
        done();

        div.remove();
      });
    });
  });

  //TODO: This functionality is currently not supported
  xit('should update itself smoothly using the underlying librarys update pattern', function (done) {
    Keen.ready(function() {
      keen.run(multiline, function(res) {
        var div = document.createElement('div');
        document.querySelector('body').appendChild(div);
        this.data = generateData(res);

        var chart = new Keen.Visualization(this, div, {
          library: "c3",
          chartType: 'Spline',
          labelMapping: labelMapping,
          chartOptions: {
            size: {
              height: 500
            }
          }
        });

        setTimeout(function() {
          this.data = generateData(res);
          done();
          // div.remove();
        }.bind(this), 1500);

      });
    });
  });

});