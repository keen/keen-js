var getAdapterActions = require("../../helpers/getAdapterActions"),
    applyTransforms = require("../../utils/applyTransforms");

module.exports = function(){
  var actions = getAdapterActions.call(this);
  applyTransforms.call(this);
  if (!this.view._initialized) {
    this.initialize();
  }
  if (this.el() && actions.render) {
    actions.render.apply(this, arguments);
    this.view._rendered = true;
  }
  return this;
};
