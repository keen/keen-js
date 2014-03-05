KeenSpecHelper = function() {
  this.projectId = "fdjlskfjdk";
  this.writeKey = "abcdewrite";
  this.readKey = "abcderead";
  this.keenUrl = "http://web.kn:9999/3.0";
  this.eventCollection = "jasmine";
  this.postUrl =
    this.keenUrl + "/projects/" + this.projectId + "/events/" + this.eventCollection;
  this.eventProperties = { username: "bob", color: "blue" };
  this.successfulResponse = "{\"created\": true }";
  this.errorResponse = "{\"error\": true }";
}
