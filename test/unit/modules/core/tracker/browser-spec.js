/* globals: sinon */
var expect = require("chai").expect;

var Keen = require("../../../../../lib/index"),
    keenHelper = require("../../../helpers/test-config");

describe("Tracker (browser)", function() {

  describe("#recordEvent", function() {

    describe("Keen.enabled", function(){

      beforeEach(function() {
        this.client = new Keen({ projectId: "123" });
      });

      it("should not send events if set to \"false\"", function(){
        Keen.enabled = false;
        this.client.recordEvent("not-going", { test: "data" }, function(err, res){
          expect(err).to.exist;
          expect(res).to.be.null;
        });
        Keen.enabled = true;
      });

    });

    describe("enforce correct arguments for #recordEvent", function(){

      beforeEach(function() {
        this.client = new Keen({ projectId: "123" });
      });

      it("should return an error message if event collection is omitted", function(){
        this.client.recordEvent(null, { test: "data" }, function(err, res){
          expect(err).to.exist;
          expect(res).to.be.null;
        });
      });

    });

    describe("via XHR/CORS (if supported)", function(){

      beforeEach(function() {
        var self = this;
        self.client = new Keen({
          projectId: keenHelper.projectId,
          writeKey: keenHelper.writeKey,
          // host: keenHelper.host,
          requestType: "xhr"
        });
        self.postUrl = self.client.url("events", keenHelper.collection);
        self.server = sinon.fakeServer.create();
      });

      afterEach(function(){
        this.server.restore();
      });

      if ('withCredentials' in new XMLHttpRequest()) {

        it("should POST to the API using XHR", function() {
          var callback = sinon.spy();
          this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, keenHelper.responses.success ] );
          this.client.recordEvent(keenHelper.collection, keenHelper.properties, callback);
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["success"]);
          expect(callback.calledOnce).to.be.ok;
          expect(callback.calledWith( null, JSON.parse(keenHelper.responses["success"]) )).to.be.ok;
        });

        it("should call the error callback on error", function() {
          var callback = sinon.spy();
          this.client.recordEvent(keenHelper.collection, keenHelper.properties, function(err, res){
            expect(err).to.exist;
            expect(res).to.be.null;
          });
          this.server.respondWith( "POST", this.postUrl, [ 500, { "Content-Type": "application/json"}, keenHelper.responses["error"] ] );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["error"]);
          // expect(callback.calledWith(n)).not.to.be.ok;
          // expect(callbacks[1].calledOnce).to.be.ok;
          // expect(callbacks[1].calledWith(JSON.parse(keenHelper.responses["error"]))).to.be.ok;
        });

      }

    });

    // describe("via JSONP to a fake server", function(){
    //   beforeEach(function() {
    //     this.client = new Keen({
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
    //     this.client = new Keen({
    //       projectId: keenHelper.projectId,
    //       writeKey: keenHelper.writeKey,
    //       host: keenHelper.host,
    //       requestType: 'beacon'
    //     });
    //   });
    // });

  });

  describe("#recordEvents", function() {

    beforeEach(function() {
      this.client = new Keen({ projectId: "123", writeKey: "2312" });
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
      this.batchResponse = JSON.stringify({
        click: [
          { "success": true }
        ],
        pageview: [
          { "success": true },
          { "success": true }
        ]
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

    describe("via XHR/CORS (if supported)", function(){

      beforeEach(function() {
        // var self = this;
        this.postUrl = this.client.url("events");
        this.server = sinon.fakeServer.create();
      });

      afterEach(function(){
        this.server.restore();
      });

      if ('withCredentials' in new XMLHttpRequest()) {

        it("should POST to the API using XHR", function() {
          var callback = sinon.spy();
          this.client.recordEvents(this.batchData, callback);
          this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, keenHelper.responses["error"] ] );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["error"]);
          expect(callback.calledOnce).to.be.ok;
        });

        it("should call the error callback on error", function() {
          var callback = sinon.spy();
          this.client.recordEvents(this.batchData, callback);
          this.server.respondWith( "POST", this.postUrl, [ 500, { "Content-Type": "application/json"}, keenHelper.responses["error"] ] );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["error"]);
          expect(callback.calledOnce).to.be.ok;
        });

      }

    });

  });

});
