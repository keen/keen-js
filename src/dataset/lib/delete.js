var each = require("../../core/utils/each");

module.exports = {
  "deleteColumn": deleteColumn,
  "deleteRow": deleteRow
};

function deleteColumn(q){
  var self = this,
      index = (typeof q === 'number') ? q : this.data.output[0].indexOf(q);

  if (index > -1) {
    each(self.data.output, function(row, i){
      self.data.output[i].splice(index, 1);
    });
  }
  return self;
}

function deleteRow(q){
  var index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {
    this.data.output.splice(index, 1);
  }
  return this;
}
