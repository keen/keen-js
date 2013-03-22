describe("keen", function() {
  
  describe("addEvent", function() {
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
      
      //must go after fake server
      //this test targets CORS-only browsers
      window.XMLHttpRequest.prototype.withCredentials = false;

      this.projectId = "fdjlskfjdk";
      this.keenUrl = "http://web.kn:9999";
      this.eventCollection = "jasmine";
      this.postUrl =
        this.keenUrl + "/3.0/projects/" + this.projectId + "/events/" + this.eventCollection;

      Keen.configure(this.projectId, this.apiKey, {
        keenUrl: this.keenUrl
      });
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should post to the API using xhr where CORS is supported", function() {

      var callback = sinon.spy();
      var response = "{\"created\": true }";

      this.server.respondWith("POST", this.postUrl,
        [200, { "Content-Type": "application/json"}, response]);

      Keen.addEvent(this.eventCollection, {
        username: "bob", color: "blue"
      }, callback);

      this.server.respond();

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(JSON.parse(response));
    });

    it("should call the error callback on error", function() {

      window.XMLHttpRequest.prototype.withCredentials = false;

      var errback = sinon.spy();
      var response = "{\"error\": true }";

      this.server.respondWith("POST", this.postUrl,
          [500, { "Content-Type": "application/json"}, response]);

      Keen.addEvent(this.eventCollection, {
        username: "bob",
        color: "blue"
      }, null, errback);

      this.server.respond();

      expect(errback).toHaveBeenCalledOnce();
    });
  });

});
