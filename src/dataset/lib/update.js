var each = require("../../core/utils/each");
var createNullList = require('../utils/create-null-list');
var append = require('./append');

var appendRow = append.appendRow,
    appendColumn = append.appendColumn;

module.exports = {
  "updateColumn": updateColumn,
  "updateRow": updateRow
};

function updateColumn(q, input){
  var self = this,
      index = (typeof q === 'number') ? q : this.data.output[0].indexOf(q);

  if (index > -1) {

    if (typeof input === "function") {

      each(self.output(), function(row, i){
        var cell;
        if (i > 0) {
          cell = input.call(self, row[index], i, row);
          if (typeof cell !== "undefined") {
            self.data.output[i][index] = cell;
          }
        }
      });

    } else if (!input || input instanceof Array) {
      input = input || [];

      if (input.length <= self.output().length - 1) {
        input = input.concat( createNullList(self.output().length - 1 - input.length) );
      }
      else {
        // If this new column is longer than existing columns,
        // we need to update the rest to match ...
        each(input, function(value, i){
          if (self.data.output.length -1 < input.length) {
            appendRow.call(self, String( self.data.output.length ));
          }
        });
      }

      each(input, function(value, i){
        self.data.output[i+1][index] = value;
      });

    }

  }
  return self;
}

function updateRow(q, input){
  var self = this,
      index = (typeof q === 'number') ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {

    if (typeof input === "function") {

      each(self.output()[index], function(value, i){
        var col = self.selectColumn(i),
        cell = input.call(self, value, i, col);
        if (typeof cell !== "undefined") {
          self.data.output[index][i] = cell;
        }
      });

    } else if (!input || input instanceof Array) {
      input = input || [];

      if (input.length <= self.data.output[0].length - 1) {
        input = input.concat( createNullList( self.data.output[0].length - 1 - input.length ) );
      }
      else {
        each(input, function(value, i){
          if (self.data.output[0].length -1 < input.length) {
            appendColumn.call(self, String( self.data.output[0].length ));
          }
        });
      }

      each(input, function(value, i){
        self.data.output[index][i+1] = value;
      });
    }

  }
  return self;
}
