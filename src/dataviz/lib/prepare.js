Keen.Dataviz.prototype.prepare = function(el){
  if (el) this.el(el);
  if (this.view._rendered) {
    // Keen.Dataviz.libraries['keen-io']['spinner'].destroy.apply(this, arguments);
    // this.view._initialized = false;
    // this.view._rendered = false;
    this.destroy();
  }
  this.el().innerHTML = "";
  var loader = Keen.Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
  if (loader.initialize) loader.initialize.apply(this, arguments);
  if (loader.render) loader.render.apply(this, arguments);
  this.view._prepared = true;
  return this;
};
