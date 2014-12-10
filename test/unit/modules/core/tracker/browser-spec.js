/* globals: sinon */
var expect = require("chai").expect;

var Keen = require("../../../../../src/keen"),
    keenHelper = require("../../../helpers/test-config");

describe("Tracker (browser)", function() {

  describe("#addEvent", function() {

    describe("Keen.enabled", function(){

      beforeEach(function() {
        this.project = new Keen({ projectId: "123" });
      });

      it("should not send events if set to \"false\"", function(){
        var success = sinon.spy(),
            error = sinon.spy();

        Keen.enabled = false;
        this.project.addEvent("not-going", { test: "data" }, success, error);
        Keen.enabled = true;

        expect(success.calledOnce).not.to.be.ok;
        expect(error.calledOnce).not.to.be.ok;
      });

    });

    describe("enforce correct arguments for #addEvent", function(){

      beforeEach(function() {
        this.project = new Keen({ projectId: "123" });
      });

      it("should return an error message if event collection is omitted", function(){
        var success = sinon.spy(),
        error = sinon.spy();
        this.project.addEvent(null, { test: "data" }, success, error);
        expect(success.calledOnce).not.to.be.ok;
        expect(error.calledOnce).to.be.ok;
      });

    });

    describe("via XHR/CORS (if supported)", function(){

      beforeEach(function() {
        var self = this;
        self.project = new Keen({
          projectId: keenHelper.projectId,
          writeKey: keenHelper.writeKey,
          host: keenHelper.host,
          requestType: 'xhr'
        });
        self.postUrl = self.project.url("/projects/" + self.project.projectId() + "/events/" + keenHelper.collection);
        self.server = sinon.fakeServer.create();
      });

      afterEach(function(){
        this.server.restore();
      });

      if ('withCredentials' in new XMLHttpRequest()) {

        it("should POST to the API using XHR where CORS is supported", function() {
          var callbacks = [ sinon.spy(), sinon.spy() ];
          this.project.addEvent(keenHelper.collection, keenHelper.properties, callbacks[0], callbacks[1]);
          this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, keenHelper.responses.success ] );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["success"]);
          expect(callbacks[0].calledOnce).to.be.ok;
          expect(callbacks[0].calledWith(JSON.parse(keenHelper.responses["success"]))).to.be.ok;
          expect(callbacks[1].calledOnce).not.to.be.ok;
        });

        it("should call the error callback on error", function() {
          var callbacks = [ sinon.spy(), sinon.spy() ];
          this.project.addEvent(keenHelper.collection, keenHelper.properties, callbacks[0], callbacks[1]);
          this.server.respondWith( "POST", this.postUrl, [ 500, { "Content-Type": "application/json"}, keenHelper.responses["error"] ] );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["error"]);
          expect(callbacks[0].calledOnce).not.to.be.ok;
          expect(callbacks[1].calledOnce).to.be.ok;
          // expect(callbacks[1].calledWith(JSON.parse(keenHelper.responses["error"]))).to.be.ok;
        });

      }

    });

    // describe("via JSONP to a fake server", function(){
    //   beforeEach(function() {
    //     this.project = new Keen({
    //       projectId: keenHelper.projectId,
    //       writeKey: keenHelper.writeKey,
    //       host: keenHelper.host,
    //       requestType: 'jsonp'
    //     });
    //   });
    // });
    //
    // describe("via Image Beacon to a fake server", function(){
    //   beforeEach(function() {
    //     this.project = new Keen({
    //       projectId: keenHelper.projectId,
    //       writeKey: keenHelper.writeKey,
    //       host: keenHelper.host,
    //       requestType: 'beacon'
    //     });
    //   });
    // });

  });

});
