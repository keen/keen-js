var keenHelper = {
  projectId: '5235435645bf82348762',
  writeKey: '43232342f234g234234',
  readKey: '42352gkjhgj1g2424',
  protocol: 'https',
  host: 'api.keen.io/9999/3.0',
  collection: 'mocha',
  properties: { username: 'keenio', color: 'blue' },
  responses: {
    success: '{\"created\": true }',
    error: '{\"error\": true }'
  }
}

/*
KeenSpecHelper = function() {
  this.projectId = "fdjlskfjdk";
  this.writeKey = "abcdewrite";
  this.readKey = "abcderead";
  this.protocol = "http",
  this.host = "web.kn:9999/3.0",
  this.eventCollection = "jasmine";
  this.postUrl =
    this.protocol + "://" + this.host + "/projects/" + this.projectId + "/events/" + this.eventCollection;
  this.eventProperties = { username: "bob", color: "blue" };
  this.successfulResponse = "{\"created\": true }";
  this.errorResponse = "{\"error\": true }";
}

*/