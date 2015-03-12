var each = require("../../core/utils/each");

module.exports = {
  "selectColumn": selectColumn,
  "selectRow": selectRow
};

function selectColumn(q){
  var result = new Array(),
      index = (typeof q === 'number') ? q : this.data.output[0].indexOf(q);

  if (index > -1) {
    each(this.data.output, function(row, i){
      result.push(row[index]);
    });
  }
  return result;
}

function selectRow(q){
  var result = new Array(),
      index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {
    result = this.data.output[index];
  }
  return  result;
}
