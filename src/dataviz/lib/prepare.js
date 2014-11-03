Keen.Dataviz.prototype.prepare = function(){
  var loader;
  if (this.view._rendered) {
    this.destroy();
  }
  if (this.el()) {
    this.el().innerHTML = "";
    loader = Keen.Dataviz.libraries[this.view.loader.library][this.view.loader.chartType];
    if (loader.initialize) {
      loader.initialize.apply(this, arguments);
    }
    if (loader.render) {
      loader.render.apply(this, arguments);
    }
    this.view._prepared = true;
  }
  return this;
};
