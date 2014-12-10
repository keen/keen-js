var chai = require("chai"),
    expect = require("chai").expect,
    JSON2 = require("JSON2"),
    spies = require("chai-spies");

chai.use(spies);

var Keen = require("../../../../../src/server"),
    keenHelper = require("../../../helpers/test-config"),
    mock = require("../../../helpers/mockServerRequests")

Keen.debug = true;

describe("Tracking (server)", function() {

  beforeEach(function(){
    this.client = new Keen({
      projectId: keenHelper.projectId,
      writeKey: keenHelper.writeKey
    });
  });

  // afterEach(function(){
  //
  // });

  describe("#addEvent", function() {

    // it("should pass",function(){
    //   expect(1).to.be.ok;
    // });

    it("should make an HTTP request",function(done){
      mock.post("/events/" + keenHelper.collection, 201, keenHelper.responses.success)
      this.client.addEvent( keenHelper.collection, keenHelper.properties, function(err, res) {
        expect(err).to.be.null;
        expect(res).to.deep.equal( JSON2.parse(keenHelper.responses.success) );
        done();
      });
    });

    it("should not make an HTTP request if Keen.enabled is set to \"false\"", function(done){
      var spy = chai.spy();
      Keen.enabled = false;
      this.client.addEvent( keenHelper.collection, keenHelper.properties, spy);
      Keen.enabled = true;
      expect(spy).to.not.have.been.called.once;
      done();
    });

    it("should return an error message if event collection is omitted", function(){
      var spy = chai.spy();
      this.client.on("error", spy);
      this.client.addEvent( keenHelper.properties, spy);
      this.client.off("error", spy);
      expect(spy).to.have.been.called.once;
    });

  });

});
