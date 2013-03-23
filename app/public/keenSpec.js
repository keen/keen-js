describe("addEvent using CORS and fake Server", function() {
  beforeEach(function() {
    jasmine.util.extend(this, new KeenSpecHelper());
    Keen.configure(this.projectId, this.apiKey, {
      keenUrl: this.keenUrl
    });
  });

  describe("when XHR is used", function() {
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
      window.XMLHttpRequest.prototype.withCredentials = false;
      var self = this;
      this.respondWith = function(code, body) {
        self.server.respondWith("POST", this.postUrl,
          [code, { "Content-Type": "application/json"}, body]);
      }
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should post to the API using xhr where CORS is supported", function() {
      var callback = sinon.spy();
      this.respondWith(200, this.successfulResponse);
      Keen.addEvent(this.eventCollection, this.eventProperties, callback)
      this.server.respond();
      expect(this.server.requests[1].requestBody).toEqual(JSON.stringify(this.eventProperties));
      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(JSON.parse(this.successfulResponse));
    });

    it("should call the error callback on error", function() {
      var errback = sinon.spy();
      this.respondWith(500, this.errorResponse);
      Keen.addEvent(this.eventCollection, this.eventProperties, null, errback)
      this.server.respond();
      expect(this.server.requests[1].requestBody).toEqual(JSON.stringify(this.eventProperties));
      expect(errback).toHaveBeenCalledOnce();
    });
  });

  describe("when JSON is used", function() {
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
      delete window.XMLHttpRequest.prototype.withCredentials
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should add a script tag with a url that has data and modified params", function() {
      Keen.addEvent(this.eventCollection, this.eventProperties)
      var jsonpScriptTag = document.getElementById("keen-jsonp");
      expect(jsonpScriptTag).not.toBeNull();
      expect(jsonpScriptTag.src).toContain("data=");
      expect(jsonpScriptTag.src).toContain("modified=");
    });
  });

});
