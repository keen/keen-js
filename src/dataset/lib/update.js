var each = require("../../core/utils/each");

module.exports = {
  "updateColumn": updateColumn,
  "updateRow": updateRow
};

function updateColumn(q, input){
  var self = this, index;

  index = (!isNaN(parseInt(q))) ? q : this.output()[0].indexOf(q);

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

      each(self.output(), function(row, i){
        var cell;
        if (i > 0) {
          cell = (input && typeof input[i-1] !== "undefined" ? input[i-1] : null);
          self.data.output[i][index] = cell;
        }
      });

    }

  }
  return self;
}

function updateRow(q, input){
  var self = this, index;

  index = (!isNaN(parseInt(q))) ? q : this.selectColumn(0).indexOf(q);

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

      each(self.output()[index], function(c, i){
        var cell;
        if (i > 0) {
          cell = (input && input[i-1] !== undefined) ? input[i-1] : null;
          self.data.output[index][i] = cell;
        }
      });

    }

  }
  return self;
}
