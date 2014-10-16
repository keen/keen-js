Keen.prototype.url = function(path){
  return this.config.protocol + "://" + this.config.host + "/projects/" + this.projectId() + path;
};
