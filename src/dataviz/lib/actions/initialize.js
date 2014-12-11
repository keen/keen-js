var getAdapterActions = require("../../helpers/getAdapterActions"),
    Dataviz = require("../../dataviz");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  var loader = Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
  if (this.view._prepared) {
    if (loader.destroy) loader.destroy.apply(this, arguments);
  } else {
    if (this.el()) this.el().innerHTML = "";
  }
  if (actions.initialize) actions.initialize.apply(this, arguments);
  this.view._initialized = true;
  return this;
};
