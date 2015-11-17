var Dataset = require('../../dataset'),
    Dataviz = require('../dataviz'),
    each = require('../../core/utils/each');

module.exports = function(str){
  if (!arguments.length) return this.view['attributes'].indexBy;
  this.view['attributes'].indexBy = (str ? String(str) : Dataviz.defaults.indexBy);
  indexBy.call(this);
  return this;
};

function indexBy(){
  var parser, options;
  if (this.dataset.output().length > 1
    && !isNaN(new Date(this.dataset.output()[1][0]).getTime())) {
    // Parser is known and should be re-used
    if (this.dataset.parser
      && this.dataset.parser.name
        && this.dataset.parser.options) {
      if (this.dataset.parser.options.length === 1) {
        parser = Dataset.parser(this.dataset.parser.name, this.indexBy());
        this.dataset.parser.options[0] = this.indexBy();
      }
      else {
        parser = Dataset.parser(this.dataset.parser.name, this.dataset.parser.options[0], this.indexBy());
        this.dataset.parser.options[1] = this.indexBy();
      }
    }
    // Parser is unknown and should be inferred (optimistic)
    else if (this.dataset.output()[0].length === 2) {
      parser = Dataset.parser('interval', this.indexBy());
      this.dataset.parser = {
        name: 'interval',
        options: [this.indexBy()]
      };
    }
    else {
      parser = Dataset.parser('grouped-interval', this.indexBy());
      this.dataset.parser = {
        name: 'grouped-interval',
        options: [this.indexBy()]
      };
    }
    this.dataset = parser(this.dataset.input());
    this.dataset.updateColumn(0, function(value){
      return (typeof value === 'string') ? new Date(value) : value;
    });
  }
}
