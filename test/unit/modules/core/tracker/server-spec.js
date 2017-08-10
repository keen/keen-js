var chai = require("chai"),
    expect = require("chai").expect,
    JSON2 = require("JSON2"),
    spies = require("chai-spies");

chai.use(spies);

var Keen = require("../../../../../lib/index"),
    keenHelper = require("../../../helpers/test-config"),
    mock = require("../../../helpers/mockServerRequests");

Keen.debug = true;

describe("Tracking (server)", function() {

  beforeEach(function(){
    this.client = new Keen({
      projectId: keenHelper.projectId,
      writeKey: keenHelper.writeKey,
      protocol: keenHelper.protocol
    });
  });

  // afterEach(function(){
  //
  // });

  describe("#recordEvent", function() {

    // it("should pass",function(){
    //   expect(1).to.be.ok;
    // });

    it("should make an HTTP request",function(done){
      mock.post("/events/" + keenHelper.collection, 201, keenHelper.responses.success);
      this.client.recordEvent( keenHelper.collection, keenHelper.properties, function(err, res) {
        expect(err).to.be.null;
        expect(res).to.deep.equal( JSON2.parse(keenHelper.responses.success) );
        done();
      });
    });

    it("should not make an HTTP request if Keen.enabled is set to \"false\"", function(done){
      Keen.enabled = false;
      this.client.recordEvent( keenHelper.collection, keenHelper.properties, function(err, res){
        expect(err).to.exist;
        expect(res).to.not.exist;
        done();
      });
      Keen.enabled = true;
    });

    it("should return an error message if event collection is omitted", function(done){
      // this.client.on("error", spy);
      this.client.recordEvent( null, keenHelper.properties, function(err, res){
        expect(err).to.exist;
        expect(res).to.not.exist;
        done();
      });
      // this.client.off("error", spy);
    });

  });

  describe("#recordEvents", function() {

    beforeEach(function() {
      this.batchData = {
        "pageview": [
          { page: "this one" },
          { page: "same!" }
        ],
        "click": [
          { page: "tada!" },
          { page: "same again" }
        ]
      };
      this.batchResponse = JSON2.stringify({
        click: [
          { "success": true }
        ],
        pageview: [
          { "success": true },
          { "success": true }
        ]
      });
    });

    it("should make an HTTP request",function(){
      var self = this;
      mock.post("/events", 201, self.batchResponse);
      self.client.recordEvents( self.batchData, function(err, res) {
        expect(err).to.be.null;
        expect(res).to.deep.equal( JSON2.parse(self.batchResponse) );
      });
    });

    it("should not send events if Keen.enabled is set to \"false\"", function(){
      Keen.enabled = false;
      this.client.recordEvents(this.batchData, function(err, res){
        expect(err).to.exist;
        expect(res).to.be.null;
      });
      Keen.enabled = true;
    });

    it("should return an error message if first argument is not an object", function(){
      this.client.recordEvents([], function(err, res){
        expect(err).to.exist;
        expect(res).to.be.null;
      });
    });

  });

});
