var KeenBase = require('keen-tracking');
KeenBase.extendLibrary(KeenBase, require('keen-analysis'));
KeenBase.Dataviz = require('keen-dataviz');
KeenBase.Dataset = require('keen-dataviz/lib/dataset');
KeenBase.version = require('../package.json').version;

KeenBase.prototype.draw = function(query, el, attributes){
  var chart = KeenBase.Dataviz()
    .attributes(attributes)
    .el(el)
    .prepare();

  this.run(query, function(err, res){
    if (err) {
      chart.message(err.message);
    }
    else {
      chart.data(res).render();
    }
  });
  return chart;
};

module.exports = KeenBase;
