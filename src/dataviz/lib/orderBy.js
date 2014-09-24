Keen.Dataviz.prototype.orderBy = function(str){
  if (!arguments.length) return this.view.attributes.orderBy;
  this.view.attributes.orderBy = (str ? String(str) : Keen.Dataviz.defaults.orderBy);
  _runOrderBy.call(this);
  return this;
};

function _runOrderBy(){
  var self = this,
      root = this.dataset.meta.schema || this.dataset.meta.unpack,
      newOrder = this.orderBy().split(".").join(Keen.Dataset.defaults.delimeter);
  // Replace in schema and re-run dataset.parse()
  each(root, function(def, i){
    // update 'select' configs
    if (i === "select" && def instanceof Array) {
      each(def, function(c, j){
        if (c.path.indexOf("timeframe -> ") > -1) {
          self.dataset.meta.schema[i][j].path = newOrder;
        }
      });
    }
    // update 'unpack' configs
    else if (i === "unpack" && typeof def === "object") {
      self.dataset.meta.schema[i]['index'].path = newOrder;
    }
  });
  this.dataset.parse();
}
