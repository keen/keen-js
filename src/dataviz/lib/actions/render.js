Keen.Dataviz.prototype.render = function(el){
  var actions = _getAdapterActions.call(this);
  _applyPostProcessing.call(this);
  if (el) this.el(el);
  if (!this.view._initialized) this.initialize();
  if (this.el() && actions.render) actions.render.apply(this, arguments);
  this.view._rendered = true;
  return this;
};
