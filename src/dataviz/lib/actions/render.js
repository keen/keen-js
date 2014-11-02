Keen.Dataviz.prototype.render = function(){
  var actions = _getAdapterActions.call(this);
  _applyPostProcessing.call(this);
  if (!this.view._initialized) this.initialize();
  if (this.el() && actions.render) actions.render.apply(this, arguments);
  this.view._rendered = true;
  return this;
};
