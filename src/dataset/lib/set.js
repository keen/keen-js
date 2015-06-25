var each = require("../../core/utils/each");

var append = require('./append');
var select = require('./select');

module.exports = {
  "set": set
};

function set(coords, value){
  if (arguments.length < 2 || coords.length < 2) {
    throw Error('Incorrect arguments provided for #set method');
  }

  var colIndex = 'number' === typeof coords[0] ? coords[0] : this.data.output[0].indexOf(coords[0]),
      rowIndex = 'number' === typeof coords[1] ? coords[1] : select.selectColumn.call(this, 0).indexOf(coords[1]);

  var colResult = select.selectColumn.call(this, coords[0]), // this.data.output[0][coords[0]],
      rowResult = select.selectRow.call(this, coords[1]);

  // Column doesn't exist...
  //  Let's create it and reset colIndex
  if (colResult.length < 1) {
    append.appendColumn.call(this, coords[0]);
    colIndex = this.data.output[0].length-1;
  }

  // Row doesn't exist...
  //  Let's create it and reset rowIndex
  if (rowResult.length < 1) {
    append.appendRow.call(this, coords[1]);
    rowIndex = this.data.output.length-1;
  }

  // Set provided value
  this.data.output[ rowIndex ][ colIndex ] = value;
  return this;
}
