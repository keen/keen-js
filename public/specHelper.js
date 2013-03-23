KeenSpecHelper = function() {
  this.projectId = "fdjlskfjdk";
  this.keenUrl = "http://web.kn:9999";
  this.eventCollection = "jasmine";
  this.postUrl =
    this.keenUrl + "/3.0/projects/" + this.projectId + "/events/" + this.eventCollection;
  this.eventProperties = { username: "bob", color: "blue" };
  this.successfulResponse = "{\"created\": true }";
  this.errorResponse = "{\"error\": true }";
}
