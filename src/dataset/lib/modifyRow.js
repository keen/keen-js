Keen.Dataset.prototype.modifyRow = function(index, mod){
  if (mod instanceof Array) {
    this.data.output[index] = mod;
  } else if (typeof mod === "function") {
    this.data.output[index] = mod.call(this, this.data.output[index]);
  }
  return this;
};
