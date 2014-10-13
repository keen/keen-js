Keen.Dataviz.prototype.error = function(){
  var actions = _getAdapterActions.call(this);
  if (actions['error']) {
    actions['error'].apply(this, arguments);
  } else {
    Keen.Dataviz.libraries['keen-io']['error'].render.apply(this, arguments);
  }
  return this;
};
