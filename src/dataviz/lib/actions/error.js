Keen.Dataviz.prototype.error = function(){
  var actions = _getAdapterActions.call(this);
  if (actions['error']) actions['error'].apply(this, arguments);
  return this;
};
