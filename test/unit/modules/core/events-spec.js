var chai = require("chai"),
    expect = require("chai").expect,
    spies = require("chai-spies");

chai.use(spies);

var Keen = require("../../../../src/core");

describe("Keen.Events system", function(){

  describe("#on", function(){
    it("should attach custom event listeners with #on", function(){
      Keen.on("whatever", chai.spy());
      expect(Keen.listeners()).to.be.an("array");
    });
  });

  describe("#trigger", function(){
    it("should call bound functions when triggered", function(){
      var callback = chai.spy();
      Keen.on("whatever", callback);
      Keen.trigger("whatever");
      expect(callback).to.have.been.called.once;
    });

    it("should pass arguments to bound functions when triggered", function(){
      var callback = chai.spy(),
      payload = { status: "ok" };
      Keen.on("whatever", callback);
      Keen.trigger("whatever", payload);
      expect(callback).to.have.been.called.once.with(payload);
    });

    it("should call bound functions multiple when triggered multiple times", function(){
      var callback = chai.spy();
      Keen.on("whatever", callback);
      Keen.trigger("whatever");
      Keen.trigger("whatever");
      Keen.trigger("whatever");
      expect(callback).to.have.been.called.exactly(3);
    });
  });

  describe("#off", function(){
    it("should remove all listeners for an event name with #off(name)", function(){
      var callback = chai.spy();
      Keen.on("whatever", callback);
      Keen.on("whatever", callback);
      Keen.off("whatever");
      Keen.trigger("whatever");
      expect(callback).to.not.have.been.called.once;
    });

    it("should remove specified listeners with #off(name, callback)", function(){
      var callback = chai.spy(),
      fakeback = function(){
        throw Error("Don't call me!");
      };
      Keen.on("whatever", callback);
      Keen.on("whatever", fakeback);
      Keen.off("whatever", fakeback);
      Keen.trigger("whatever");
      expect(callback).to.have.been.called.once;
    });
  });

  describe("#once", function() {
    it("should call once handlers once when triggered", function(){
      var query = Keen;
      var callbackA = chai.spy();
      var callbackB = chai.spy();
      Keen.once('event', callbackA);
      Keen.once('event', callbackB);
      Keen.trigger('event');
      expect(callbackA).to.have.been.called.once;
      expect(callbackB).to.have.been.called.once;
      Keen.trigger('event');
      expect(callbackA).to.have.been.called.once;
      expect(callbackB).to.have.been.called.once;
    });
  });
});
