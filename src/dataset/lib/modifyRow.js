Keen.Dataset.prototype.modifyRow = function(q, mod){
  var index = (typeof q === "number") ? q : this.selectColumn(0).indexOf(q);

  if (index > -1) {
    if (mod instanceof Array) {
      this.data.output[index] = mod;
    } else if (typeof mod === "function") {
      this.data.output[index] = mod.call(this, this.data.output[index]);
    }
  }
  return this;
};


// ds.modifyRow("Label", [0,1,2,3]);
// ds.modifyRow(0, [0,1,2,3]);

// ds.modifyRow("Label", function(col){});
// ds.modifyRow(0, function(col){});

// ds.modifyRow("Label", ds.getColumnSum);
// ds.modifyRow(0, ds.getColumnSum);
