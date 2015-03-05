module.exports = function(){

  if (this.labelMapping()) {
    this.labelMapping(this.labelMapping());
  }

  if (this.colorMapping()) {
    this.colorMapping(this.colorMapping());
  }

  if (this.sortGroups()) {
    this.sortGroups(this.sortGroups());
  }

  if (this.sortIntervals()) {
    this.sortIntervals(this.sortIntervals());
  }

};
