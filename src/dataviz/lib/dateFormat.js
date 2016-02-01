module.exports = function(val){
  if (!arguments.length) return this.view.attributes.dateFormat;
  if (typeof val === 'string' || typeof val === 'function') {
    this.view.attributes.dateFormat = val;
  }
  else {
    this.view.attributes.dateFormat = undefined;
  }
  return this;
};
