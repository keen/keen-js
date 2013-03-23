describe("addEvent integration spec", function() {
  beforeEach(function() {
    jasmine.util.extend(this, new KeenSpecHelper());

    Keen.configure("2b3e5512f3dd47b0ae7020d93a9a2fbb",
                   "354B2FF5058361CECADBE5F2AD434418", {
                     keenUrl: "https://staging-api.keen.io"
                   });
  });

  it("should post to the API and run success callback for good data", function() {
    var callback = sinon.spy();
    var proxyCalled = false;
    var proxy = function(response) {
      proxyCalled = true;
      callback(response);
    }

    Keen.addEvent(this.eventCollection, this.eventProperties, proxy)

    waitsFor(function() { return proxyCalled; }, "Proxy never called", 1000);

    runs(function () {
      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(JSON.parse(this.successfulResponse));
    });
  });

  it("should post to the API and run error callback for bad data", function() {
    var callback = sinon.spy();
    var proxyCalled = false;
    var proxy = function(response) {
      proxyCalled = true;
      callback(response);
    }

    Keen.configure("faketastic");
    Keen.addEvent(this.eventCollection, this.eventProperties, null, proxy)

    waitsFor(function() { return proxyCalled; }, "Proxy never called", 1000);

    runs(function() {
      expect(callback).toHaveBeenCalledOnce();
    });
  });
});
