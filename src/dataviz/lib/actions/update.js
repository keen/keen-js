Keen.Dataviz.prototype.update = function(){
  var actions = _getAdapterActions.call(this);
  _applyPostProcessing.call(this);
  if (actions.update) {
    actions.update.apply(this, arguments);
  } else if (actions.render) {
    this.render();
  }
  return this;
};
