Keen.Dataviz.prototype.data = function(data){
  if (!arguments.length) return this.dataset.output();
  if (data instanceof Keen.Dataset) {
    this.dataset = data;
  } else if (data instanceof Keen.Request) {
    this.parseRequest(data);
  } else {
    this.parseRawData(data);
  }
  return this;
};
