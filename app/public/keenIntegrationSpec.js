describe("addEvent integration spec", function() {
  beforeEach(function() {
    jasmine.util.extend(this, new KeenSpecHelper());

    Keen.configure("a8fa7efa70bb4cf0a7e83f3e5a05c9a3",
                   "E34DE3E7BB71C701F3C97FEACEB06E49");
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

    runs(function () {
      expect(callback).toHaveBeenCalledOnce();
    });
  });
});
