import KeenBase from 'keen-tracking';
import KeenAnalysis from 'keen-analysis';
import { Dataviz } from 'keen-dataviz';

KeenBase.extendLibrary(KeenBase, KeenAnalysis);
KeenBase.version = require('../package.json').version;

KeenBase.prototype.draw = function(query, el, attributes){
  var chart = Dataviz()
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

export default KeenBase;
