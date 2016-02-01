var getAdapterActions = require("../../helpers/getAdapterActions"),
    Dataviz = require("../../dataviz");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  if (this.el()) {
    if (actions['error']) {
      actions['error'].apply(this, arguments);
    } else {
      Dataviz.libraries['keen-io']['error'].render.apply(this, arguments);
    }
  }
  else {
    this.emit('error', 'No DOM element provided');
  }
  return this;
};
