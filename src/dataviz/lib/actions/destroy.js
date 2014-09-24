Keen.Dataviz.prototype.destroy = function(){
  var actions = _getAdapterActions.call(this);
  if (actions.destroy) actions.destroy.apply(this, arguments);
  // clear rendered artifats, state bin
  if (this.el()) this.el().innerHTML = "";
  this.view._prepared = false;
  this.view._initialized = false;
  this.view._rendered = false;
  this.view._artifacts = {};
  return this;
};
