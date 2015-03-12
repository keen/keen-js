/* globals: sinon */
var expect = require("chai").expect,
    JSON2 = require("JSON2");

var Keen = require("../../../../../src/keen"),
    keenHelper = require("../../../helpers/test-config");

describe("Keen.Request", function() {

  beforeEach(function() {
    this.client = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey,
      protocol: keenHelper.protocol,
      requestType: "xhr"
    });
    this.query = new Keen.Query("count", {
      eventCollection: "test-collection"
    });
    this.postUrl = this.client.url("/queries/count");
    this.server = sinon.fakeServer.create();
  });

  afterEach(function(){
    this.client = void 0;
    this.query = void 0;
    this.server.restore();
  });

  describe("<Client>.run method", function(){

    it("should be a method", function(){
      expect(this.client.run).to.be.a("function");
    });

    it("should throw an error when passed an invalid object", function(){
      var self = this;
      expect(function(){ self.run(null); }).to.throw(Error);
      expect(function(){ self.run({}); }).to.throw(Error);
      expect(function(){ self.run(0); }).to.throw(Error);
      expect(function(){ self.run("string"); }).to.throw(Error);
    });

    it("should return a response when successful", function(){
      var response = { result: 1 };
      this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, JSON2.stringify(response) ] );
      this.server.respond();
      this.client.run(this.query, function(err, res){
        expect(err).to.be.a("null");
        expect(res).to.deep.equal(response);
      });
    });

    it("should return an error when unsuccessful", function(){
      var response = { error_code: "ResourceNotFoundError", message: "no foo" };
      this.server.respondWith( "POST", this.postUrl, [ 500, { "Content-Type": "application/json"}, JSON2.stringify(response) ] );
      this.server.respond();
      this.client.run(this.query, function(err, res){
        expect(err).to.exist;
        expect(err["code"]).to.equal(response.error_code);
        expect(res).to.be.a("null");
      });
    });

    it("should return an error when timed out", function(){
      this.server.respondWith( "POST", this.postUrl, [ 500, { "Content-Type": "application/json"}, "" ] );
      var req = new Keen.Request(this.client, [this.query], function(err, res){
        expect(err).to.exist;
        expect(err["message"]).to.equal("timeout of 1ms exceeded");
        expect(res).to.be.a("null");
      });
      req
        .timeout(1)
        .refresh();
    });

    describe("Multiple queries", function(){
      it("should return a single response when successful", function(){
        var response = [{ result: 1 }, { result: 1 }, { result: 1 }];
        this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, JSON2.stringify(response[0]) ] );
        this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, JSON2.stringify(response[1]) ] );
        this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, JSON2.stringify(response[2]) ] );
        this.server.respond();
        this.client.run([this.query, this.query, this.query], function(err, res){
          expect(err).to.be.a("null");
          expect(res).to.be.an("array").and.to.have.length(3);
          expect(res).to.deep.equal(response);
        });
      });
      it('should return a single error when unsuccessful', function(){
        var response = { error_code: "ResourceNotFoundError", message: "no foo" };
        this.server.respondWith( "POST", this.postUrl, [ 500, { "Content-Type": "application/json"}, JSON2.stringify(response) ] );
        this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, JSON2.stringify({ result: 1 }) ] );
        this.server.respondWith( "POST", this.postUrl, [ 200, { "Content-Type": "application/json"}, JSON2.stringify({ result: 1 }) ] );
        this.client.run([this.query, this.query, this.query], function(err, res){
          expect(err).to.exist;
          expect(err["code"]).to.equal(response.error_code);
          expect(res).to.be.a("null");
        });
      });
    });

  });

});
