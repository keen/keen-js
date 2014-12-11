var each = require("../../core/utils/each");

module.exports = {
  "removeColumn": removeColumn,
  "removeRow": removeRow
};

function removeColumn(q){
  var self = this,
  index = (!isNaN(parseInt(q))) ? q : this.output()[0].indexOf(q);

  if (index > -1) {
    each(self.data.output, function(row, i){
      self.data.output[i].splice(index, 1);
    });
  }
  return self;
}

function removeRow(q){
  var index = (!isNaN(parseInt(q))) ? q : this.selectColumn(0).indexOf(q);
  if (index > -1) {
    this.data.output.splice(index, 1);
  }
  return this;
}
