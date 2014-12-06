module.exports = function(path){
  return this.config.protocol + "://" + this.config.host + path;
};
