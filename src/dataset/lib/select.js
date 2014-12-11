var each = require("../../core/utils/each");

module.exports = {
  "selectColumn": selectColumn,
  "selectRow": selectRow
};

function selectColumn(q){
  var result = new Array(),
      index = (!isNaN(parseInt(q))) ? q : this.output()[0].indexOf(q);

  if (index > -1) {
    each(this.data.output, function(row, i){
      result.push(row[index]);
    });
  }
  return result;
}

function selectRow(q){
  var index = (!isNaN(parseInt(q))) ? q : this.selectColumn(0).indexOf(q);
  if (index > -1) {
    return this.data.output[index];
  }
}
