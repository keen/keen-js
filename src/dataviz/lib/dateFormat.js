module.exports = function(val){
  if (!arguments.length) return this.view.dateFormat;
  if (typeof val === 'string' || typeof val === 'function') {
    this.view.dateFormat = val;
  }
  else {
    this.view.dateFormat = undefined;
  }
  return this;
};
