module.exports = function(fn){
  fn.call(this);
  return this;
};
