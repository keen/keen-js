describe("addEvent using CORS and fake Server", function() {
  
  beforeEach(function() {
    jasmine.util.extend(this, new KeenSpecHelper());
  });

  describe("when XHR is used", function() {

    beforeEach(function() {
      this.KEEN = new Keen({
        projectId: this.projectId,
        writeKey: this.writeKey, 
        readKey: this.readKey,
        protocol: this.protocol,
        host: this.host,
        requestType: 'xhr'
      });
      this.server = sinon.fakeServer.create();
      window.XMLHttpRequest.prototype.withCredentials = false;
      var self = this;
      this.respondWith = function(code, body) {
        self.server.respondWith("POST", this.postUrl,
        [code, { "Content-Type": "application/json"}, body]);
      };
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should post to the API using xhr where CORS is supported", function() {
      var callback = sinon.spy(), errback = sinon.spy();
      this.respondWith(200, this.successfulResponse);
      this.KEEN.addEvent(this.eventCollection, this.eventProperties, callback, errback);
      this.server.respond();
      expect(this.server.requests[0].requestBody).toEqual(JSON.stringify(this.eventProperties));
      expect(callback).toHaveBeenCalledOnce();
      expect(errback).not.toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(JSON.parse(this.successfulResponse));
    });

    it("should call the error callback on error", function() {
      var callback = sinon.spy(), errback = sinon.spy();
      this.respondWith(500, this.errorResponse);
      this.KEEN.addEvent(this.eventCollection, this.eventProperties, callback, errback)
      this.server.respond();
      expect(this.server.requests[0].requestBody).toEqual(JSON.stringify(this.eventProperties));
      expect(errback).toHaveBeenCalledOnce();
      expect(callback).not.toHaveBeenCalledOnce();
    });
  });


  describe("when JSON is used", function() {
    
    beforeEach(function() {
      this.KEEN = new Keen({
        projectId: this.projectId,
        writeKey: this.writeKey, 
        readKey: this.readKey,
        protocol: this.protocol,
        host: this.host,
        requestType: 'jsonp'
      });
      this.server = sinon.fakeServer.create();
      delete window.XMLHttpRequest.prototype.withCredentials;
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should add a script tag with a url that has data and modified params", function() {
      this.KEEN.addEvent(this.eventCollection, this.eventProperties);
      var jsonpScriptTag = document.getElementById("keen-jsonp");
      expect(jsonpScriptTag).not.toBeNull();
      expect(jsonpScriptTag.src).toContain("data=");
      expect(jsonpScriptTag.src).toContain("modified=");
    });
    
  });

});
