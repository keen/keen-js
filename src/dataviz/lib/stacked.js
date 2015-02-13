module.exports = function(bool){
  if (!arguments.length) return this.view['attributes']['stacked'];
  this.view['attributes']['stacked'] = bool ? true : false;
  return this;
};
