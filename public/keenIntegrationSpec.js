describe("addEvent integration spec", function() {
  beforeEach(function() {
    jasmine.util.extend(this, new KeenSpecHelper());

    Keen.configure({
      projectId: "2b3e5512f3dd47b0ae7020d93a9a2fbb",
      writeKey: "354B2FF5058361CECADBE5F2AD434418", 
      readKey: "354B2FF5058361CECADBE5F2AD434418",
      keenUrl: "https://staging-api.keen.io"
    });

  it("should post to the API and run success callback for good data", function() {
    var callback = sinon.spy();
    var errback = sinon.spy();

    var proxyCalled = false;
    var proxy = function(response) {
      proxyCalled = true;
      callback(response);
    }

    Keen.addEvent(this.eventCollection, this.eventProperties, proxy, errback)

    waitsFor(function() { return proxyCalled; }, "Proxy never called", 3000);

    runs(function () {
      expect(callback).toHaveBeenCalledOnce();
      expect(errback).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(JSON.parse(this.successfulResponse));
    });
  });

  it("should post to the API and run error callback for bad data", function() {
    var callback = sinon.spy();
    var errback = sinon.spy();

    var proxyCalled = false;
    var proxy = function(response) {
      proxyCalled = true;
      errback(response);
    }

    Keen.configure({
      projectId: "faketastic",
      writeKey: "", 
      keenUrl: "https://staging-api.keen.io"
    });
    Keen.addEvent(this.eventCollection, this.eventProperties, callback, proxy)

    waitsFor(function() { return proxyCalled; }, "Proxy never called", 3000);

    runs(function() {
      expect(errback).toHaveBeenCalledOnce();
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
