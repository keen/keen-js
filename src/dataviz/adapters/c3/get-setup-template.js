var extend = require('../../../core/utils/extend');
var clone = require('../../../core/utils/clone');

module.exports = function (type) {
  var chartOptions = clone(this.chartOptions());
  var setup = extend({
    axis: {},
    color: {},
    data: {},
    size: {}
  }, chartOptions);

  // Enforced options
  setup.bindto = this.el();
  setup.color.pattern = this.colors();
  setup.data.columns = [];
  setup.size.height = this.height();
  setup.size.width = this.width();

  // Enforce type, sorry no overrides here
  setup['data']['type'] = type;

  if (type === 'gauge') {}
  else if (type === 'pie' || type === 'donut') {
    setup[type] = { title: this.title() };
  }
  else {
    if (this.dataType().indexOf('chron') > -1) {
      setup['data']['x'] = 'x';

      if (chartOptions['axis'] && chartOptions['axis']['x']) {
        setup['axis']['x'] = chartOptions['axis']['x'];
      }
      else {
        setup['axis']['x'] = {
          type: 'timeseries',
          tick: {
            format: this.dateFormat() || getDateFormatDefault(this.data()[1][0], this.data()[2][0])
          }
        };
      }
    }

    else {
      if (this.dataType() === 'cat-ordinal') {
        if (chartOptions['axis'] && chartOptions['axis']['x']) {
          setup['axis']['x'] = chartOptions['axis']['x'];
        }
        else {
          setup['axis']['x'] = {
            type: 'category',
            categories: this.labels()
          };
        }
      }
    }

    if (this.title()) {
      setup['axis']['y'] = { label: this.title() };
    }
  }
  return setup;
}

function getDateFormatDefault(a, b){
  var d = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  var months = [
    'Jan', 'Feb', 'Mar',
    'Apr', 'May', 'June',
    'July', 'Aug', 'Sept',
    'Oct', 'Nov', 'Dec'
  ];

  // Yearly (31536000000) + Monthly
  if (d >= 2419200000) {
    return function(ms){
      var date = new Date(ms);
      return months[date.getMonth()] + ' ' + date.getFullYear();
    };
  }
  // Daily
  else if (d >= 86400000) {
    return function(ms){
      var date = new Date(ms);
      return months[date.getMonth()] + ' ' + date.getDate();
    };
  }
  // Hourly
  else if (d >= 3600000) {
    return '%I:%M %p';
  }
  // Minutely
  else {
    return '%I:%M:%S %p';
  }
}
