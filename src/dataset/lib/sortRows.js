Keen.Dataset.prototype.sortRows = function(str, comp){
  var self = this,
      head = this.output().slice(0,1),
      body = this.output().slice(1),
      fn = comp || this.getRowIndex;

  body.sort(function(a, b){
    // If fn(a) > fn(b)
    var op = fn.call(self, a) > fn.call(self, b);
    if (op) {
      return (str === "asc" ? 1 : -1);
    } else if (!op) {
      return (str === "asc" ? -1 : 1);
    } else {
      return 0;
    }
  });
  self.output(head.concat(body));
  return self;
};
